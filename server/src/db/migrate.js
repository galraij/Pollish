require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('./connection');

const runMigrations = async () => {
  console.log('Running migrations...');

  const client = await db.getClient();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        phone_number TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS polls (
        id UUID PRIMARY KEY,
        title TEXT,
        question TEXT NOT NULL,
        created_by TEXT,
        language TEXT NOT NULL DEFAULT 'en',
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

      -- Add language column to existing tables that don't have it yet
      ALTER TABLE polls ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en';

      -- Make title and created_by nullable since we are removing them from UI
      ALTER TABLE polls ALTER COLUMN title DROP NOT NULL;
      ALTER TABLE polls ALTER COLUMN created_by DROP NOT NULL;

      -- Add multiple choice support columns
      ALTER TABLE polls ADD COLUMN IF NOT EXISTS is_multiple_choice BOOLEAN DEFAULT FALSE;
      ALTER TABLE polls ADD COLUMN IF NOT EXISTS min_selections INTEGER DEFAULT 1;
      ALTER TABLE polls ADD COLUMN IF NOT EXISTS max_selections INTEGER DEFAULT 1;

      -- Update votes unique constraint to allow multiple votes for different options by the same user
      ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_poll_id_voter_id_key;
      ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_poll_id_option_id_voter_id_key;
      ALTER TABLE votes ADD CONSTRAINT votes_poll_id_option_id_voter_id_key UNIQUE(poll_id, option_id, voter_id);
    `);

    console.log('✅ Migrations complete.');
  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    client.release();
  }
};

if (require.main === module) {
  runMigrations().then(() => process.exit(0));
}

module.exports = runMigrations;
