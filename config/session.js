// Session configuration with environment variable support
const session = require('express-session');

// In production, we'll need a better session store
// For Azure, recommended options include:
// - connect-redis with Azure Redis Cache
// - connect-azuretables for Azure Table Storage

// This is just the configuration setup code.
// You would need to install additional packages based on which store you choose.
function getSessionConfig() {
  const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  };

  // In production, use a proper session store
  if (process.env.NODE_ENV === 'production') {
    // Example for Redis (requires 'connect-redis' package)
    if (process.env.REDIS_URL) {
      const RedisStore = require('connect-redis').default;
      const { createClient } = require('redis');
      
      const redisClient = createClient({
        url: process.env.REDIS_URL
      });
      
      redisClient.connect().catch(console.error);
      
      sessionConfig.store = new RedisStore({
        client: redisClient
      });
      
      console.log('Using Redis session store');
    } 
    // Example for Azure Table Storage (requires 'connect-azuretables' package)
    else if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
      const AzureTablesStoreFactory = require('connect-azuretables')(session);
      
      sessionConfig.store = AzureTablesStoreFactory.create({
        sessionTimeOut: 60 * 60 * 24, // 1 day in seconds
        storageAccount: process.env.AZURE_STORAGE_ACCOUNT,
        accessKey: process.env.AZURE_STORAGE_ACCESS_KEY,
        tableName: 'sessions',
        // Or use connection string
        connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING
      });
      
      console.log('Using Azure Table Storage session store');
    }
  }

  return sessionConfig;
}

module.exports = getSessionConfig;
