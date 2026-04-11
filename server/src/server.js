require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3001;

// Run migrations on startup
require('./db/migrate');

app.listen(PORT, () => {
  console.log(`🗳️  Pollish server running on http://localhost:${PORT}`);
});
