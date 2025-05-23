#!/bin/bash
# Azure deployment script for Crossword Application
# Usage: ./deploy_to_azure.sh [resource-group-name] [location]

# Default values
RESOURCE_GROUP=${1:-"crossword-rg"}
LOCATION=${2:-"eastus"}
APP_NAME="crossword-app"
APP_SERVICE_PLAN="crossword-plan"
SQL_SERVER="crossword-sql-server"
SQL_DB="crosswordDB"
SQL_USERNAME="sqladmin"

# Generate a random SQL password
SQL_PASSWORD=$(openssl rand -base64 16)
# Generate a random session secret
SESSION_SECRET=$(openssl rand -base64 32)

echo "=== Crossword Application Azure Deployment ==="
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo "App Name: $APP_NAME"
echo "SQL Server: $SQL_SERVER"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "Azure CLI is not installed. Please install it first."
    exit 1
fi

# Login to Azure
echo "Logging in to Azure..."
az login

# Create a resource group
echo "Creating resource group..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

# Create an App Service Plan
echo "Creating App Service Plan..."
az appservice plan create \
    --name "$APP_SERVICE_PLAN" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --sku B1

# Create a SQL Server
echo "Creating SQL Server..."
az sql server create \
    --name "$SQL_SERVER" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --admin-user "$SQL_USERNAME" \
    --admin-password "$SQL_PASSWORD"

# Configure firewall rule to allow Azure services
echo "Configuring SQL firewall rules..."
az sql server firewall-rule create \
    --resource-group "$RESOURCE_GROUP" \
    --server "$SQL_SERVER" \
    --name "AllowAzureServices" \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 0.0.0.0

# Create a SQL Database
echo "Creating SQL Database..."
az sql db create \
    --resource-group "$RESOURCE_GROUP" \
    --server "$SQL_SERVER" \
    --name "$SQL_DB" \
    --service-objective Basic

# Create a Web App
echo "Creating Web App..."
az webapp create \
    --resource-group "$RESOURCE_GROUP" \
    --plan "$APP_SERVICE_PLAN" \
    --name "$APP_NAME" \
    --runtime "NODE|16-lts"

# Configure Web App settings
echo "Configuring Web App settings..."
az webapp config appsettings set \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --settings \
    NODE_ENV="production" \
    SESSION_SECRET="$SESSION_SECRET" \
    DB_HOST="$SQL_SERVER.database.windows.net" \
    DB_NAME="$SQL_DB" \
    DB_USER="$SQL_USERNAME" \
    DB_PASSWORD="$SQL_PASSWORD"

# Enable local Git deployment
echo "Enabling local Git deployment..."
az webapp deployment source config-local-git \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME"

# Get the deployment URL
DEPLOYMENT_URL=$(az webapp deployment source config-local-git \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --query url -o tsv)

echo ""
echo "=== Deployment Information ==="
echo "Resource Group: $RESOURCE_GROUP"
echo "Web App URL: https://$APP_NAME.azurewebsites.net"
echo "Git Deployment URL: $DEPLOYMENT_URL"
echo ""
echo "SQL Server: $SQL_SERVER.database.windows.net"
echo "SQL Database: $SQL_DB"
echo "SQL Username: $SQL_USERNAME"
echo "SQL Password: $SQL_PASSWORD"
echo "Session Secret: $SESSION_SECRET"
echo ""
echo "Save this information securely!"
echo ""
echo "To deploy your application, run:"
echo "git remote add azure $DEPLOYMENT_URL"
echo "git push azure main"
echo ""
echo "After deployment, SSH into your app to run migrations:"
echo "az webapp ssh --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo ""
echo "=== Deployment Setup Complete ==="

# Save deployment info to a file (but exclude sensitive information from git)
cat > ./azure-deployment-info.txt << EOL
# Azure Deployment Information - KEEP THIS SECURE
# Generated on $(date)

RESOURCE_GROUP=$RESOURCE_GROUP
LOCATION=$LOCATION
APP_NAME=$APP_NAME
APP_SERVICE_PLAN=$APP_SERVICE_PLAN
SQL_SERVER=$SQL_SERVER
SQL_DB=$SQL_DB
SQL_USERNAME=$SQL_USERNAME
SQL_PASSWORD=$SQL_PASSWORD
SESSION_SECRET=$SESSION_SECRET
DEPLOYMENT_URL=$DEPLOYMENT_URL

# Web App URL: https://$APP_NAME.azurewebsites.net
EOL

chmod 600 ./azure-deployment-info.txt
echo "Deployment information saved to ./azure-deployment-info.txt"
