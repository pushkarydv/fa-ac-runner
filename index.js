import fs from 'fs';
import {
  getAllCategoriesAndCollections,
  getApps,
  getSimilarApps,
  searchApps,
} from './services/google-play.js';

import dotenv from 'dotenv';
dotenv.config();

const appsMap = new Map();
const termMatchMap = new Map();
const similarAppsMap = new Map();
const fuzzyNameMap = new Map();

const addAppsInPair = async ({ category, collection }) => {
  const apps = await getApps({ category, collection });

  apps.forEach((app) => {
    if (!appsMap.has(app.appId)) {
      appsMap.set(app.appId, app);
    }
  });
};

(async () => {
  const { categories, collections } = getAllCategoriesAndCollections();
  console.log(categories, collections);

  await Promise.all(
    categories.flatMap((category) =>
      collections.map((collection) => addAppsInPair({ category, collection }))
    )
  );

  console.log(`size of appsMap: ${appsMap.size}`);

  const batchSize = 50;
  const appEntries = Array.from(appsMap.entries());

  for (let i = 0; i < appEntries.length; i += batchSize) {
    const batch = appEntries.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async ([appId, app]) => {
        const { title } = app;
        const searchResults = await searchApps(title);

        searchResults.forEach((result) => {
          if (!appsMap.has(result.appId) || !termMatchMap.has(result.appId)) {
            termMatchMap.set(result.appId, {
              ...result,
              gotFrom: appId,
            });
          }
        });
      })
    );
  }

  console.log(`size of termMatchMap: ${termMatchMap.size}`);
  

  // run a getSimilarApps on appsMap and termMatchMap after that add to similarAppsMap

  const allAppIds = new Set([
    ...Array.from(appsMap.keys()),
    ...Array.from(termMatchMap.keys()),
  ]);

  const similarAppIds = Array.from(allAppIds);
 

  for (let i = 0; i < similarAppIds.length; i += batchSize) {
    const batch = similarAppIds.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (appId) => {
        const similarApps = await getSimilarApps(appId);
        similarApps.forEach((app) => {
          if (!appsMap.has(app.appId) || !termMatchMap.has(app.appId) || !similarAppsMap.has(app.appId)) {
            similarAppsMap.set(app.appId, app);
          }
        });
      })
    );
  }

  console.log(`size of similarAppsMap: ${similarAppsMap.size}`);

  const jsonResult = {
    apps: Object.fromEntries(appsMap),
    termMatch: Object.fromEntries(termMatchMap),
    similarApps: Object.fromEntries(similarAppsMap),
  };
  

  const date = new Date();
  const formattedDate = `${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date
    .getDate()
    .toString()
    .padStart(2, '0')}-${date.getFullYear()}`;

  fs.writeFileSync(
    `./lists/${formattedDate}-apps.json`,
    JSON.stringify(jsonResult, null, 2)
  );
})();
