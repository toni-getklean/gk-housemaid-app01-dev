import { MeiliSearch } from 'meilisearch';

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILISEARCH_KEY = process.env.MEILISEARCH_KEY || 'masterKey';

export const meiliClient = new MeiliSearch({
    host: MEILISEARCH_HOST,
    apiKey: MEILISEARCH_KEY,
});

export const BOOKINGS_INDEX = 'bookings';
