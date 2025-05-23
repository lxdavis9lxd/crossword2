#!/bin/bash

# prepare_for_azure.sh
# This script prepares the Crossword application for Azure deployment with SQLite

echo "Preparing Crossword application for Azure deployment..."

# Create data directory for SQLite database
mkdir -p ./data
echo "Created data directory"

# Copy current database to data directory
cp database.sqlite ./data/database.sqlite
echo "Copied SQLite database to data directory"

# Apply configurations
cp models/index.js.new models/index.js
echo "Applied database configuration"

cp package.json.new package.json
echo "Applied package configuration"

cp app.js.azure app.js
echo "Applied Azure-optimized app.js"

# Install production dependencies
echo "Installing production dependencies..."
npm install --only=production

# Create a .deployment file
echo "[config]" > .deployment
echo "command = bash deploy.sh && npm start" >> .deployment
echo "Created .deployment file"

# Make the deployment script executable
chmod +x deploy.sh
echo "Made deploy.sh executable"

# Create a simple .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating basic .env file..."
  cp .env.example .env
  # Generate a random session secret
  SECRET=$(openssl rand -hex 32)
  sed -i "s/change_this_to_a_long_secure_random_string/$SECRET/" .env
  echo "Created .env file with random session secret"
fi

echo ""
echo "================================================================="
echo "Preparation complete! Your app is ready for Azure deployment."
echo ""
echo "Next steps:"
echo "1. Create an Azure App Service using the Azure portal or CLI"
echo "2. Set up deployment from Git or use the Azure App Service extension"
echo "3. Configure app settings in the Azure portal"
echo ""
echo "For detailed instructions, refer to AZURE_SQLITE_DEPLOYMENT_GUIDE.md"
echo "================================================================="
