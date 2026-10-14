import { ensureInitialized, getPool } from './mysql';

/**
 * Legacy dbConnect compatibility wrapper.
 * Connects to MySQL pool and ensures database tables exist.
 */
async function dbConnect() {
  await ensureInitialized();
  return getPool();
}

export default dbConnect;
export { dbConnect as connectDB };
