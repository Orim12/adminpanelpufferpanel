// MongoDB connection utility for SvelteKit endpoints
import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'; // fallback for dev
const dbName = process.env.MONGODB_DB || 'minecraftpanel';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!globalThis._mongoClientPromise) {
  client = new MongoClient(uri);
  globalThis._mongoClientPromise = client.connect();
}
// eslint-disable-next-line prefer-const
clientPromise = globalThis._mongoClientPromise;

export async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}
