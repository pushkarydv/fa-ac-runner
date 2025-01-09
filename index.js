import gplay from 'google-play-scraper';
import fs from 'fs';

import dotenv from 'dotenv';
dotenv.config();

const appsMap = new Map();
const detailedAppsMap = new Map();

const getAllCategoriesAndCollections = () => {
  const categories = Object.keys(gplay.category);
  const collections = Object.keys(gplay.collection);
  console.log(
    `${categories.length} categories and ${collections.length} collections each`
  );

  return { categories, collections };
};

const addAppsInPair = async ({ category, collection }) => {
  try {
    const apps = await gplay.list({
      category: gplay.category[category],
      collection: gplay.collection[collection],
      num: 200,
      country: 'in',
    });

    console.log(
      `Fetched ${apps.length} apps for category: ${category}, collection: ${collection}`
    );

    apps.forEach((app) => {
      if (!appsMap.has(app.appId)) {
        appsMap.set(app.appId, app);
      }
    });

    console.log(`Total unique apps now: ${appsMap.size}`);
  } catch (error) {
    console.error(
      `Error fetching apps for category: ${category}, collection: ${collection}`,
      error.message
    );
  }
};

const fetchAppDetailed = async (appId) => {
  try {
    const app = await gplay.app({ appId });
    detailedAppsMap.set(appId, app);
    console.log(`detailed app size ${detailedAppsMap.size}`);
  } catch (error) {
    console.error(
      `Error fetching app details for appId: ${appId}`,
      error.message
    );
  }
};

(async () => {
  const { categories, collections } = getAllCategoriesAndCollections();
  await Promise.all(
    categories.flatMap((category) =>
      collections.map((collection) => addAppsInPair({ category, collection }))
    )
  );

  // run detail fetch
  const appIds = Array.from(appsMap.keys());
  // console.log(`Total apps to fetch details: ${appIds.length}`);
  const BATCH_SIZE = 10;
  for (let i = 0; i < appIds.length; i += BATCH_SIZE) {
    const batch = appIds.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(fetchAppDetailed));
  }

  console.log(`Total unique apps: ${appsMap.size}`);
  console.log(`Total unique detailed apps: ${detailedAppsMap.size}`);

  const date = new Date();
  const formattedDate = `${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date
    .getDate()
    .toString()
    .padStart(2, '0')}-${date.getFullYear()}`;

  fs.writeFileSync(
    `./lists/${formattedDate}-apps.json`,
    JSON.stringify(Object.fromEntries(detailedAppsMap), null, 2)
  );
})();

// 19733 apps / seconds
