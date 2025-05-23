// Configuration for databases with environment variable support
// Keeping SQLite as the database of choice
const config = {
  development: {
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: console.log
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  },
  production: {
    dialect: 'sqlite',
    // In production, we'll use a path that works well with Azure App Service
    storage: process.env.SQLITE_PATH || 'database.sqlite',
    logging: false
  }
};

module.exports = config;
