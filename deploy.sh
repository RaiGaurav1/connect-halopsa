#!/bin/bash
set -e

# Check if deployment-config.sh exists
if [ ! -f "deployment-config.sh" ]; then
  echo "❌ ERROR: deployment-config.sh not found."
  echo "Please create this file using deployment-config.sh.template as a guide."
  exit 1
fi

# Source deployment configuration
source deployment-config.sh

echo "🚀 Starting deployment of Connect-HaloPSA integration..."

# 1. Create Secrets in AWS Secrets Manager
echo "📦 Creating secrets in AWS Secrets Manager..."
aws secretsmanager create-secret   --name "${HALO_SECRET_NAME}"   --description "HaloPSA API Credentials"   --secret-string "{\"apiBaseUrl\":\"${HALO_API_BASE_URL}\",\"clientId\":\"${HALO_CLIENT_ID}\",\"clientSecret\":\"${HALO_CLIENT_SECRET}\",\"tenantId\":\"${HALO_TENANT_ID}\"}"   --region "${AWS_REGION}" || aws secretsmanager update-secret   --secret-id "${HALO_SECRET_NAME}"   --secret-string "{\"apiBaseUrl\":\"${HALO_API_BASE_URL}\",\"clientId\":\"${HALO_CLIENT_ID}\",\"clientSecret\":\"${HALO_CLIENT_SECRET}\",\"tenantId\":\"${HALO_TENANT_ID}\"}"   --region "${AWS_REGION}"

echo "✅ Secrets created."

# 2. Create IAM role for Lambda functions
echo "🔒 Creating IAM role for Lambda functions..."
aws iam create-role   --role-name "${STACK_NAME}-lambda-role"   --assume-role-policy-document file://infrastructure/ambda-trust-policy.json || echo "Role already exists"

# Attach basic Lambda execution role
aws iam attach-role-policy   --role-name "${STACK_NAME}-lambda-role"   --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole || echo "Basic execution policy already attached"

# 3. Deploy base infrastructure (DynamoDB tables)
echo "🏗️ Deploying base infrastructure..."
aws cloudformation deploy   --template-file infrastructure/template.yaml   --stack-name "${STACK_NAME}-base"   --parameter-overrides     StackName="${STACK_NAME}"     Environment="${ENVIRONMENT}"   --region "${AWS_REGION}"

echo "✅ Base infrastructure deployed."

# 4. Create Lambda layer
echo "📚 Creating Lambda layer..."
mkdir -p lambda-layer-build/nodejs
cp lambda/layer/nodejs/halopsa-client.js lambda-layer-build/nodejs/

# Install dependencies for the layer
cd lambda-layer-build/nodejs
npm init -y
npm install axios axios-retry
cd ../..

# Create zip file for the layer
cd lambda-layer-build
zip -r ../halopsa-layer.zip .
cd ..

# Publish the layer
LAYER_VERSION=$(aws lambda publish-layer-version   --layer-name "${STACK_NAME}-halopsa-client"   --description "HaloPSA Client Library"   --zip-file fileb://halopsa-layer.zip   --compatible-runtimes nodejs20.x   --region "${AWS_REGION}"   --query 'Version'   --output text)

echo "✅ Lambda layer published. Version: ${LAYER_VERSION}"

# 5. Deploy Lambda functions
echo "⚙️ Deploying Lambda functions..."

# Customer Lookup Lambda
echo "  📞 Deploying customer-lookup Lambda..."
cd lambda/customerLookup
npm install
zip -r ../../customer-lookup.zip .
cd ../..

LOOKUP_ARN=$(aws lambda create-function   --function-name "${STACK_NAME}-customer-lookup"   --runtime nodejs20.x   --handler index.handler   --role "arn:aws:iam::${AWS_ACCOUNT_ID}:role/${STACK_NAME}-lambda-role"   --zip-file fileb://customer-lookup.zip   --environment "Variables={CACHE_TABLE_NAME=${STACK_NAME}-customer-cache-${ENVIRONMENT},HALO_SECRET_NAME=${HALO_SECRET_NAME}}"   --timeout 30   --memory-size 256   --region "${AWS_REGION}"   --query 'FunctionArn'   --output text 2>/dev/null) || LOOKUP_ARN=$(aws lambda update-function-code   --function-name "${STACK_NAME}-customer-lookup"   --zip-file fileb://customer-lookup.zip   --region "${AWS_REGION}"   --query 'FunctionArn'   --output text)

# Call Logging Lambda
echo "  📝 Deploying call-logging Lambda..."
cd lambda/callLogging
npm install
zip -r ../../call-logging.zip .
cd ../..

LOGGING_ARN=$(aws lambda create-function   --function-name "${STACK_NAME}-call-logging"   --runtime nodejs20.x   --handler index.handler   --role "arn:aws:iam::${AWS_ACCOUNT_ID}:role/${STACK_NAME}-lambda-role"   --zip-file fileb://call-logging.zip   --environment "Variables={CALL_LOGS_TABLE_NAME=${STACK_NAME}-call-logs-${ENVIRONMENT},HALO_SECRET_NAME=${HALO_SECRET_NAME}}"   --timeout 30   --memory-size 256   --layers "arn:aws:lambda:${AWS_REGION}:${AWS_ACCOUNT_ID}:layer:${STACK_NAME}-halopsa-client:${LAYER_VERSION}"   --region "${AWS_REGION}"   --query 'FunctionArn'   --output text 2>/dev/null) || LOGGING_ARN=$(aws lambda update-function-code   --function-name "${STACK_NAME}-call-logging"   --zip-file fileb://call-logging.zip   --region "${AWS_REGION}"   --query 'FunctionArn'   --output text)

aws lambda update-function-configuration   --function-name "${STACK_NAME}-call-logging"   --layers "arn:aws:lambda:${AWS_REGION}:${AWS_ACCOUNT_ID}:layer:${STACK_NAME}-halopsa-client:${LAYER_VERSION}"   --region "${AWS_REGION}"

# Screen Pop Lambda
echo "  🖥️ Deploying screen-pop Lambda..."
cd lambda/screenPop
zip -r ../../screen-pop.zip index.js
cd ../..

SCREENPOP_ARN=$(aws lambda create-function   --function-name "${STACK_NAME}-screen-pop"   --runtime nodejs20.x   --handler index.handler   --role "arn:aws:iam::${AWS_ACCOUNT_ID}:role/${STACK_NAME}-lambda-role"   --zip-file fileb://screen-pop.zip   --timeout 10   --memory-size 128   --region "${AWS_REGION}"   --query 'FunctionArn'   --output text 2>/dev/null) || SCREENPOP_ARN=$(aws lambda update-function-code   --function-name "${STACK_NAME}-screen-pop"   --zip-file fileb://screen-pop.zip   --region "${AWS_REGION}"   --query 'FunctionArn'   --output text)

# Webhook Handler Lambda
echo "  🔔 Deploying webhook-handler Lambda..."
cd lambda/webhookHandler
npm install
zip -r ../../webhook-handler.zip .
cd ../..

WEBHOOK_ARN=$(aws lambda create-function   --function-name "${STACK_NAME}-webhook-handler"   --runtime nodejs20.x   --handler index.handler   --role "arn:aws:iam::${AWS_ACCOUNT_ID}:role/${STACK_NAME}-lambda-role"   --zip-file fileb://webhook-handler.zip   --environment "Variables={HALO_CACHE_TABLE_NAME=${STACK_NAME}-customer-cache-${ENVIRONMENT},WEBHOOK_API_KEY=${WEBHOOK_API_KEY}}"   --timeout 30   --memory-size 256   --region "${AWS_REGION}"   --query 'FunctionArn'   --output text 2>/dev/null) || WEBHOOK_ARN=$(aws lambda update-function-code   --function-name "${STACK_NAME}-webhook-handler"   --zip-file fileb://webhook-handler.zip   --region "${AWS_REGION}"   --query 'FunctionArn'   --output text)

aws lambda update-function-configuration   --function-name "${STACK_NAME}-webhook-handler"   --environment "Variables={HALO_CACHE_TABLE_NAME=${STACK_NAME}-customer-cache-${ENVIRONMENT},WEBHOOK_API_KEY=${WEBHOOK_API_KEY}}"   --region "${AWS_REGION}"

echo "✅ Lambda functions deployed."

# 6. Create contact flow templates with actual values
echo "📝 Creating Connect contact flow templates with actual values..."
mkdir -p dist
cat contactflows/ScreenPopFlow.json | sed "s/${AWS_REGION}/${AWS_REGION}/g" | sed "s/${AWS_ACCOUNT_ID}/${AWS_ACCOUNT_ID}/g" | sed "s/${CONNECT_INSTANCE_ID}/${CONNECT_INSTANCE_ID}/g" | sed "s/${STACK_NAME}/${STACK_NAME}/g" > dist/ScreenPopFlow.json
cat contactflows/transferflow.json | sed "s/${AWS_REGION}/${AWS_REGION}/g" | sed "s/${AWS_ACCOUNT_ID}/${AWS_ACCOUNT_ID}/g" | sed "s/${CONNECT_INSTANCE_ID}/${CONNECT_INSTANCE_ID}/g" | sed "s/${STACK_NAME}/${STACK_NAME}/g" > dist/transferflow.json

echo "✅ Contact flow templates created in dist/ directory."
echo "   Import these into Amazon Connect Admin console."

# 7. Deploy frontend
echo "🌐 Building frontend..."
cd frontend

# Create .env file with required variables
echo "Creating .env file..."
cat > .env << EOL
VITE_CONNECT_INSTANCE_URL=${CONNECT_INSTANCE_URL}
VITE_CONNECT_REGION=${AWS_REGION}
VITE_API_URL=https://$(aws cloudformation describe-stacks --stack-name ${STACK_NAME}-api --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text --region ${AWS_REGION})
EOL

# Install dependencies
npm install

# Build for production
npm run build

echo "✅ Frontend built. Files in frontend/build/ directory."
echo "   Upload these files to your web hosting service or S3 bucket."

cd ..

echo "🎉 Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Import the contact flows from the dist/ directory into Amazon Connect"
echo "2. Host the frontend files from frontend/build/"
echo "3. Set up webhook in HaloPSA pointing to the webhook endpoint with the API key"
echo ""
echo "Webhook URL: https://$(aws cloudformation describe-stacks --stack-name ${STACK_NAME}-api --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text --region ${AWS_REGION})/webhook"
echo "Webhook API Key: ${WEBHOOK_API_KEY}"
