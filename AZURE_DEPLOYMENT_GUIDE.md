# Azure Deployment Guide for Crossword Application

This guide walks through the steps to deploy the Crossword application to Azure App Service with an Azure SQL Database.

## Prerequisites

1. Azure Account with active subscription
2. Azure CLI installed locally (or use Azure Cloud Shell)
3. Node.js 16.x or later
4. Git

## Step 1: Prepare Your Application

Before deploying to Azure, make sure you've made these changes:

1. Rename `app.js.production` to `app.js` or merge changes into your existing app.js
2. Update `models/index.js` with the new Azure-ready version
3. Install the required dependencies:

```bash
npm install dotenv connect-redis tedious mysql2 pg pg-hstore
# If using Azure Table Storage for sessions
npm install connect-azuretables
```

4. Create a `.env` file based on `.env.example` (do not commit this to source control)

## Step 2: Set Up Azure Resources Using Azure Portal

### Create a Resource Group

1. Go to the Azure Portal (portal.azure.com)
2. Click "Create a resource" > "Resource group"
3. Provide a name (e.g., "crossword-rg")
4. Select a region close to your users
5. Click "Review + create" > "Create"

### Create an Azure SQL Database

1. In your resource group, click "Add" > search for "SQL Database"
2. Create a new server or select an existing one
3. Set up admin credentials (remember these for your app)
4. Choose a pricing tier (Basic for development/testing)
5. Configure Network settings to allow Azure services
6. Click "Review + create" > "Create"

### Create an Azure App Service

1. In your resource group, click "Add" > search for "Web App"
2. Choose Node.js runtime stack
3. Select a pricing plan (Free or Basic for testing)
4. Click "Review + create" > "Create"

## Step 3: Configure App Settings in Azure

1. In your App Service, go to "Settings" > "Configuration"
2. Add the following Application settings:
   - `NODE_ENV`: production
   - `SESSION_SECRET`: [generate a secure random string]
   - `DB_HOST`: [your-sql-server].database.windows.net
   - `DB_NAME`: [your-database-name]
   - `DB_USER`: [your-sql-username]
   - `DB_PASSWORD`: [your-sql-password]
   - `WEBSITE_NODE_DEFAULT_VERSION`: ~16

3. Click "Save"

## Step 4: Deploy Your Application

### Option 1: Deploy from Local Git

1. In App Service, go to "Deployment" > "Deployment Center"
2. Select "Local Git" as the source
3. Set up deployment credentials if needed
4. Click "Save"
5. Copy the Git remote URL provided
6. In your local repository:

```bash
# Add Azure as a remote
git remote add azure [git-remote-url]

# Push to Azure
git push azure main
```

### Option 2: Deploy Using GitHub Actions

1. Push your code to GitHub if not already there
2. In App Service, go to "Deployment" > "Deployment Center"
3. Select "GitHub" as the source
4. Follow the prompts to authenticate and select your repository
5. Configure the workflow if needed
6. Click "Save"

## Step 5: Initialize the Database

You'll need to run your database migrations on the Azure SQL Database:

1. Install and set up Azure CLI:

```bash
# Login to Azure
az login

# Open a web SSH session to your App Service
az webapp ssh --name [your-app-name] --resource-group [your-resource-group]
```

2. Inside the SSH session:

```bash
# Navigate to your app's directory (usually /home/site/wwwroot)
cd /home/site/wwwroot

# Run migration script
node run_migration.js
```

## Step 6: Verify Deployment

1. Visit your app's URL: https://[your-app-name].azurewebsites.net
2. Test logging in and basic functionality
3. Check logs in App Service > "Monitoring" > "Log stream"

## Troubleshooting

### Database Connection Issues

1. Verify connection strings in App Settings
2. Check that Azure SQL firewall allows connections from Azure services
3. Review application logs for specific error messages

### Application Crashes

1. Check App Service logs in "Monitoring" > "Log stream"
2. Make sure all dependencies are installed properly in package.json
3. Verify Node.js version matches your application requirements

## Scaling Up

When your application user base grows, consider:

1. Upgrading App Service Plan for better performance
2. Implementing Azure Redis Cache for session storage
3. Setting up Azure CDN for static content
4. Configuring autoscaling for your App Service
5. Setting up Application Insights for monitoring and analytics

## Maintenance

1. Regularly update Node.js and npm dependencies
2. Set up automatic backups for your database
3. Implement a CI/CD workflow for easy deployments
4. Monitor application performance and logs
