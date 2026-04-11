require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('./connection');

const runMigrations = async () => {
  console.log('Running migrations...');

  const client = await db.getClient();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS polls (
        id UUID PRIMARY KEY,
        title TEXT NOT NULL,
        question TEXT NOT NULL,
        created_by TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS options (
        id UUID PRIMARY KEY,
        poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        position INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS votes (
        id UUID PRIMARY KEY,
        poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
        option_id UUID NOT NULL REFERENCES options(id) ON DELETE CASCADE,
        voter_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(poll_id, voter_id)
      );
    `);

    console.log('✅ Migrations complete.');
  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    client.release();
    process.exit();
  }
};

runMigrations();
