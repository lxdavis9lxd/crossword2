// Session configuration with environment variable support
const session = require('express-session');

// In production, we'll need a better session store
// - connect-redis is a recommended option for production

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
  }

  return sessionConfig;
}

module.exports = getSessionConfig;
