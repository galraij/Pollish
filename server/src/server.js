require('dotenv').config();
const app = require('./app');

const runMigrations = require('./db/migrate');

const PORT = process.env.PORT || 3001;

runMigrations().then(() => {
  app.listen(PORT, () => {
    console.log(`🗳️  Pollish server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to run migrations. Server not started.", err);
});
