# Azure Deployment Guide for Crossword Application with SQLite

This guide will walk you through deploying your Crossword Puzzle application to Azure App Service while maintaining SQLite as your database.

## Prerequisites

1. Azure Account
2. Azure CLI installed locally
3. Node.js installed locally (v16+)
4. Git installed locally

## Step 1: Prepare Your Application

1. Create a `.env` file based on the `.env.example` template:
   ```
   cp .env.example .env
   ```

2. Edit the `.env` file with appropriate values:
   ```
   NODE_ENV=production
   PORT=8080
   SESSION_SECRET=your_very_secure_random_string
   SQLITE_PATH=/home/site/wwwroot/data/database.sqlite
   ```

3. Apply the configurations to use the production models/index.js file:
   ```bash
   cp models/index.js.new models/index.js
   cp package.json.new package.json
   ```

4. Install production dependencies:
   ```bash
   npm install --only=production
   ```

## Step 2: Set Up Azure App Service

1. **Create an App Service and App Service Plan**:
   ```bash
   # Login to Azure
   az login

   # Create a resource group if you don't have one
   az group create --name crossword-rg --location eastus

   # Create an App Service Plan (B1 is a good starting tier)
   az appservice plan create --name crossword-plan --resource-group crossword-rg --sku B1

   # Create the Web App
   az webapp create --name your-crossword-app --resource-group crossword-rg --plan crossword-plan --runtime "NODE|16-lts"
   ```

2. **Configure App Settings (Environment Variables)**:
   ```bash
   az webapp config appsettings set --name your-crossword-app --resource-group crossword-rg --settings NODE_ENV=production SESSION_SECRET=your_secure_random_string SQLITE_PATH=/home/site/wwwroot/data/database.sqlite
   ```

3. **Enable Always On** to keep your app running:
   ```bash
   az webapp config set --name your-crossword-app --resource-group crossword-rg --always-on true
   ```

## Step 3: Set Up Persistent Storage for SQLite

SQLite needs a persistent storage location that won't be wiped between deployments.

1. **Create a `deploy.sh` script** to set up the data directory:
   ```bash
   #!/bin/bash
   
   # Create data directory if it doesn't exist
   mkdir -p /home/site/wwwroot/data
   
   # Copy SQLite database file to persistent storage if it doesn't exist
   if [ ! -f /home/site/wwwroot/data/database.sqlite ]; then
     cp /home/site/wwwroot/database.sqlite /home/site/wwwroot/data/database.sqlite
   fi
   
   # Set permissions
   chmod 664 /home/site/wwwroot/data/database.sqlite
   ```

2. **Add this script to your deployment**

## Step 4: Deploy to Azure

1. **Initialize Git if not already done**:
   ```bash
   git init
   git add .
   git commit -m "Prepare for Azure deployment"
   ```

2. **Deploy to Azure App Service**:
   ```bash
   # Add Azure as a remote
   git remote add azure https://your-deployment-user@your-crossword-app.scm.azurewebsites.net/your-crossword-app.git

   # Push to Azure
   git push azure main
   ```

3. **Run the deployment script** via the Azure CLI or SSH:
   ```bash
   az webapp ssh --name your-crossword-app --resource-group crossword-rg
   
   # Then in the SSH session
   cd /home/site/wwwroot
   bash deploy.sh
   exit
   ```

## Step 5: Configure Session Management

For a simple deployment with SQLite, in-memory sessions might be sufficient. However, if you need session persistence across app restarts:

1. **Install Redis or Azure Table Storage**:
   ```bash
   npm install connect-redis redis
   # OR
   npm install connect-azuretables
   ```

2. **Update Configuration**:
   Update the configuration in your app to use the session store you selected.

## Step 6: Verify Your Deployment

1. **Browse to your app**:
   ```
   https://your-crossword-app.azurewebsites.net
   ```

2. **Check logs if there are issues**:
   ```bash
   az webapp log tail --name your-crossword-app --resource-group crossword-rg
   ```

## Maintenance Tips for SQLite on Azure

1. **Backups**: Set up a scheduled task to make backups of your SQLite database:
   ```bash
   # Example backup script
   cp /home/site/wwwroot/data/database.sqlite /home/site/backups/database.sqlite.$(date +%Y%m%d)
   ```

2. **Monitor Disk Usage**: Keep an eye on the size of your database.

3. **Performance Optimization**: Consider adding indexes to frequently queried fields.

## Scaling Considerations

While SQLite is good for moderate traffic, be aware that:

1. SQLite is a file-based database that doesn't support multiple concurrent writers
2. If you scale to multiple instances, you need to ensure they all access the same database file
3. For higher traffic volumes, consider migrating to Azure SQL or another database service

By following this guide, you can deploy your Crossword Puzzle application with SQLite to Azure App Service while maintaining all functionality.
