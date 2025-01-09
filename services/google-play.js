import gplay from 'google-play-scraper';

export const getAllCategoriesAndCollections = () => {
  try {
    const categories = Object.keys(gplay.category);
    const collections = Object.keys(gplay.collection);
    console.log(
      `${categories.length} categories and ${collections.length} collections each`
    );

    return { categories, collections };
  } catch (e) {
    console.log(`Error: ${e}`);
    return {
      categories: [],
      collections: [],
    };
  }
};

export const getApps = async ({ category, collection }) => {
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

    return apps;
  } catch (e) {
    console.log(`Error: ${e}`);
    return [];
  }
};

export const getAppById = async (appId) => {
  try {
    const app = await gplay.app({ appId });
    console.log(`Fetched app details for appId: ${appId}`);

    return app;
  } catch (e) {
    console.log(`Error: ${e}`);
    return null;
  }
};

export const getSimilarApps = async (appId) => {
  try {
    const similarApps = await gplay.similar({ appId });
    console.log(`Fetched similar apps for appId: ${appId}`);

    return similarApps;
  } catch (e) {
    console.log(`Error: ${e}`);
    return [];
  }
};

export const searchApps = async (term) => {
  try {
    const searchResults = await gplay.search({ term, num: 200 });
    console.log(`Fetched ${searchResults.length} search results for query: ${term}`);

    return searchResults;
  } catch (e) {
    console.log(`Error: ${e}`);
    return [];
  }
};
