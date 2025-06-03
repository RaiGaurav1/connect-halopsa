# AWS Connect CCP + HaloPSA Integration

![Version](https://img.shields.io/badge/Version-4.0-blue)
![AWS](https://img.shields.io/badge/AWS-Amazon%20Connect-orange)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![Platform](https://img.shields.io/badge/Platform-Cross--Platform-lightgrey)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Typescript](https://img.shields.io/badge/TypeScript-5.4-blue)

A production-ready integration between Amazon Connect Contact Control Panel (CCP) and HaloPSA, providing automated customer lookup, screen pops, and call logging capabilities. This solution enhances agent productivity and customer experience by delivering instant customer information during calls and automating post-call documentation.

![Architecture Diagram](https://raw.githubusercontent.com/RaiGaurav1/connect-halopsa/main/docs/architecture.png)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
  - [macOS Setup](#macos-setup)
  - [Windows Setup](#windows-setup)
  - [Linux Setup](#linux-setup)
- [AWS Deployment](#aws-deployment)
- [Amazon Connect Configuration](#amazon-connect-configuration)
- [HaloPSA Integration](#halopsa-integration)
- [Project Structure](#project-structure)
- [Security Best Practices](#security-best-practices)
- [Performance Optimization](#performance-optimization)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Version History](#version-history)
- [FAQs](#faqs)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## Overview

This project integrates Amazon Connect's Contact Control Panel (CCP) with HaloPSA's customer management and ticketing system. When a call connects in Amazon Connect, the integration automatically:

1. Identifies the caller by phone number
2. Searches for matching customer records in HaloPSA
3. Displays customer information to the agent in real-time
4. Logs call details as tickets in HaloPSA after call completion

**Business Value:**
- Reduce average handle time by eliminating manual customer lookups
- Improve first call resolution with instant access to customer history
- Ensure accurate call documentation with automated ticket creation
- Enhance customer experience with personalized service

**Use Cases:**
- IT Service Desks using HaloPSA for ticket management
- Customer Support Centers handling inbound support calls
- Technical Support teams requiring customer history during troubleshooting
- Any team using both Amazon Connect and HaloPSA

## Features

- **Embedded Amazon Connect CCP**: Seamlessly integrate the Contact Control Panel in your application
- **Automatic Customer Lookup**: Instant lookup of customer data from HaloPSA when calls connect
- **Ticket Creation**: Automatic call logging in HaloPSA as tickets
- **Real-time Screen Pop**: Customer information display on incoming calls
- **Caching Layer**: DynamoDB caching to minimize API calls and improve performance
- **VPC Security**: Lambda functions running in private subnets with least-privilege permissions
- **Cross-Platform**: Works on macOS, Windows, and Linux
- **Comprehensive Monitoring**: CloudWatch metrics and logs for all components
- **Offline Development Mode**: Mock backend for development without AWS dependencies
- **TypeScript Support**: Full type safety with TypeScript definitions
- **Responsive UI**: Material UI components for desktop and mobile views

## Architecture

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Agent Browser   │◄─────▶│ Amazon Connect │◄────▶│ HaloPSA        │
│ (React App)     │ │ CCP            │ │ (API & PSA)    │
└─────────────────┘ └────────┬────────┘ └─────────┬───────┘
                             │                    │
                             ▼                    │
┌─────────────────────────────────────────────────────────────────────────┐
│ AWS VPC                                                                  │
│                                                                          │
│ ┌──────────────────┐ ┌───────────────────────┐ ┌────────────────────┐   │
│ │ API Gateway      │ │ Lambda Functions      │ │ DynamoDB Tables    │   │
│ │                  │─▶│ • Customer Lookup    │─▶│ • CustomerCache    │   │
│ │                  │ │ • Call Logging       │ │ • CallLogs         │   │
│ │                  │ │ • Screen Pop         │ │                    │   │
│ └──────────────────┘ └───────────────────────┘ └────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**Data Flow:**
1. Agent receives call in Amazon Connect CCP
2. React application detects new call and extracts caller's phone number
3. Application calls Lambda function through API Gateway
4. Lambda function checks DynamoDB cache for existing customer data
5. If not cached, Lambda calls HaloPSA API to look up customer
6. Customer data is returned to the frontend and displayed to agent
7. On call completion, call details are logged to HaloPSA via another Lambda

## Prerequisites

Before you begin, ensure you have the following:

- **AWS Account** with permissions to create:
  - Lambda functions
  - DynamoDB tables
  - API Gateway
  - CloudFormation stacks
  - IAM roles
  - VPC resources

- **Amazon Connect Instance** with:
  - Admin access
  - API access enabled
  - Contact flows access
  - Phone number claimed and assigned

- **HaloPSA Instance** with:
  - API access credentials
  - OAuth 2.0 client ID and secret
  - Permission to create tickets
  - Access to customer data

- **Development Environment**:
  - Node.js v20.x or higher
  - npm v10.x or higher
  - AWS CLI v2 configured with your credentials
  - Git

## Local Development Setup

### macOS Setup

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js and other dependencies
brew install node@20 git aws-cli

# Clone the repository
git clone https://github.com/RaiGaurav1/connect-halopsa.git
cd connect-halopsa

# Install frontend dependencies
cd frontend
npm install

# Set up environment variables
cat > .env << EOF
VITE_CONNECT_INSTANCE_URL=https://your-instance.my.connect.aws/connect/ccp-v2/
VITE_CONNECT_REGION=ap-southeast-2
VITE_API_URL=http://localhost:3000/api
EOF

# Start the development server
npm run dev
```

### Windows Setup

```powershell
# Install Node.js from https://nodejs.org/
# Install Git from https://git-scm.com/download/win
# Install AWS CLI from https://aws.amazon.com/cli/

# Clone the repository using PowerShell
git clone https://github.com/RaiGaurav1/connect-halopsa.git
cd connect-halopsa

# Install frontend dependencies
cd frontend
npm install

# Create environment file
$env_content = @"
VITE_CONNECT_INSTANCE_URL=https://your-instance.my.connect.aws/connect/ccp-v2/
VITE_CONNECT_REGION=ap-southeast-2
VITE_API_URL=http://localhost:3000/api
"@
$env_content | Out-File -FilePath .env -Encoding utf8

# Start the development server
npm run dev
```

### Linux Setup

```bash
# Install Node.js using NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Clone the repository
git clone https://github.com/RaiGaurav1/connect-halopsa.git
cd connect-halopsa

# Install frontend dependencies
cd frontend
npm install

# Set up environment variables
cat > .env << EOF
VITE_CONNECT_INSTANCE_URL=https://your-instance.my.connect.aws/connect/ccp-v2/
VITE_CONNECT_REGION=ap-southeast-2
VITE_API_URL=http://localhost:3000/api
EOF

# Start the development server
npm run dev
```

### Set Up Mock Backend (Optional)

For local development without AWS, set up a mock backend:

```bash
# From the project root
mkdir -p backend
cd backend
npm init -y
npm install express cors

# Create a simple mock server
cat > index.js << 'EOF'
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mock customer database
const mockCustomers = {
  '+61400123456': {
    id: 'CUST-001',
    name: 'John Smith',
    email: 'john.smith@example.com',
    company: 'Tech Corp',
    status: 'Active',
    priority: 'High'
  },
  '+18005551234': {
    id: 'CUST-002',
    name: 'Test User',
    email: 'test@example.com',
    company: 'Test Company',
    status: 'Active',
    priority: 'Normal'
  }
};

app.post('/api/customer-lookup-public', (req, res) => {
  const { phoneNumber } = req.body;
  console.log(`Looking up customer with phone: ${phoneNumber}`);
  
  const customer = mockCustomers[phoneNumber];
  if (customer) {
    console.log(`Found customer: ${customer.name}`);
    res.json({
      CustomerFound: 'true',
      CustomerId: customer.id,
      CustomerName: customer.name,
      CustomerEmail: customer.email,
      CustomerCompany: customer.company,
      CustomerStatus: customer.status,
      Priority: customer.priority
    });
  } else {
    console.log(`No customer found for: ${phoneNumber}`);
    res.json({ CustomerFound: 'false' });
  }
});

app.listen(PORT, () => {
  console.log(`Mock backend running at http://localhost:${PORT}`);
  console.log('Available phone numbers:', Object.keys(mockCustomers).join(', '));
});
EOF

# Create package.json script
npm pkg set scripts.start="node index.js"
```

### Running the Application Locally

```bash
# Terminal 1: Start the mock backend (if using)
cd backend
npm start

# Terminal 2: Start the frontend development server
cd frontend
npm run dev
```

Your application will be available at: http://localhost:5173

## AWS Deployment

### 1. Configure Deployment Settings

Update the `deployment-config.sh` file with your AWS and HaloPSA settings:

```bash
nano deployment-config.sh
```

Required configuration variables:

```bash
# AWS region and account
export AWS_REGION="ap-southeast-2"
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Amazon Connect settings
export CONNECT_INSTANCE_ID="YOUR_CONNECT_INSTANCE_ID"
export CONNECT_INSTANCE_URL="https://your-instance.my.connect.aws/connect/ccp-v2/"

# HaloPSA credentials
export HALO_API_BASE_URL="https://your-instance.halopsa.com/api/v2"
export HALO_CLIENT_ID="YOUR_CLIENT_ID"
export HALO_CLIENT_SECRET="YOUR_CLIENT_SECRET"
export HALO_TENANT_ID="YOUR_TENANT_ID"

# Deployment-specific
export STACK_NAME="connect-halopsa-integration"
export ENVIRONMENT="production"

# VPC CIDR blocks
export VPC_CIDR="10.0.0.0/16"
export PRIVATE_SUBNET_A_CIDR="10.0.1.0/24"
export PRIVATE_SUBNET_B_CIDR="10.0.2.0/24"

# Secrets Manager
export HALO_SECRET_NAME="HaloPSACredentials"
```

### 2. Deploy Infrastructure

The deployment script automates the creation of AWS resources:

```bash
# Make the deployment script executable
chmod +x scripts/deploy-all.sh

# Run the deployment
./scripts/deploy-all.sh
```

This script deploys:
- VPC with private subnets for Lambda functions
- DynamoDB tables for caching and call logs
- Lambda functions for customer lookup and call logging
- API Gateway for frontend communication
- IAM roles with least-privilege permissions
- Secrets Manager for storing HaloPSA credentials

### 3. Deploy Frontend to S3 (Production)

```bash
# Build the frontend
cd frontend
npm run build

# Create S3 bucket (if not exists)
aws s3 mb s3://connect-halopsa-frontend-${AWS_ACCOUNT_ID}

# Upload the build files
aws s3 sync build/ s3://connect-halopsa-frontend-${AWS_ACCOUNT_ID} --delete

# Enable static website hosting
aws s3 website s3://connect-halopsa-frontend-${AWS_ACCOUNT_ID} \
  --index-document index.html \
  --error-document index.html
```

### 4. Set Up CloudFront Distribution (Optional)

For HTTPS and better performance:

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name connect-halopsa-frontend-${AWS_ACCOUNT_ID}.s3-website-${AWS_REGION}.amazonaws.com \
  --default-root-object index.html \
  --enabled \
  --query "Distribution.DomainName" \
  --output text
```

## Amazon Connect Configuration

### 1. Add Origin to Approved List

In the Amazon Connect console:
1. Navigate to your instance → "Application integration"
2. Under "Approved origins", click "Add origin"
3. Add the following URLs:
   - For local development: `http://localhost:5173`
   - For S3 website: `http://<bucket-name>.s3-website-<region>.amazonaws.com`
   - For CloudFront: `https://<distribution-id>.cloudfront.net`

### 2. Import Contact Flows

1. In Amazon Connect console, go to "Routing" → "Contact flows"
2. Click "Create contact flow" → "Import flow" (upper-right corner)
3. Upload the JSON files from the `contactflows` directory:
   - `inbound-flow.json` - Main inbound call flow
   - `transfer-flow.json` - For agent transfers
   - `outbound-flow.json` - For outbound calls (if used)

### 3. Configure Contact Flow

The inbound contact flow should:
1. Invoke the "Customer Lookup" Lambda function
2. Store the result in contact attributes
3. Display customer info to agent via screen pop
4. Invoke "Call Logging" Lambda function after call ends

### 4. Assign Phone Numbers

1. Go to "Channels" → "Phone numbers"
2. Claim a new number or edit an existing one
3. Select the imported inbound flow
4. Save the configuration

## HaloPSA Integration

### 1. Create API Client

In your HaloPSA instance:
1. Navigate to System → Integrations → API Clients
2. Click "Add API Client"
3. Configure the following:
   - **Name**: AWS Connect Integration
   - **Client Type**: Confidential
   - **Authentication Flow**: Client Credentials
   - **Access Token Lifetime**: 3600 (1 hour)
   - **Refresh Token Lifetime**: 86400 (24 hours)
   - **Permissions**:
     - Customers: Read
     - Tickets: Read/Write
     - Calls: Read/Write
4. Save and note the Client ID and Client Secret

### 2. Configure Webhook (Optional)

For real-time updates:
1. Navigate to System → Integrations → Webhooks
2. Click "Add Webhook"
3. Configure:
   - **Event Type**: customer.updated
   - **URL**: Your API Gateway webhook endpoint
   - **HTTP Method**: POST
   - **Content Type**: application/json
   - **Authentication**: Choose appropriate method
4. Save the webhook configuration

### 3. Create Ticket Types (Optional)

For better call categorization:
1. Navigate to System → Tickets → Types
2. Create a dedicated type for call logs
3. Note the type ID for configuration

## Project Structure

```
connect-halopsa/
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── CCPContainer.tsx     # Amazon Connect CCP container
│   │   │   └── CustomerDetails.tsx  # Customer info display
│   │   ├── services/          # Service layer
│   │   │   └── connectService.ts    # Connect API integration
│   │   ├── types/             # TypeScript definitions
│   │   └── App.tsx            # Main application component
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   └── vite.config.ts         # Vite configuration
├── lambda/                    # AWS Lambda functions
│   ├── customerLookup/        # Customer lookup function
│   ├── callLogging/           # Call logging function
│   └── layer/nodejs/          # Shared Lambda layer
├── infrastructure/            # CloudFormation/SAM templates
│   ├── template.yaml          # Main infrastructure template
│   └── vpc-template.yaml      # VPC configuration
├── contactflows/              # Amazon Connect contact flows
│   ├── inbound-flow.json      # Inbound call flow
│   └── transfer-flow.json     # Transfer flow
├── scripts/                   # Deployment and utility scripts
│   └── deploy-all.sh          # Main deployment script
├── docs/                      # Documentation and images
├── deployment-config.sh       # Deployment configuration
├── README.md                  # This documentation
└── .gitignore                 # Git ignore rules
```

## Security Best Practices

This implementation follows AWS security best practices:

1. **Least Privilege Permissions**:
   - IAM roles with minimal permissions
   - Each Lambda has only the permissions it needs

2. **Network Security**:
   - Lambda functions run in private subnets
   - VPC endpoints for AWS services
   - No direct internet access for Lambda functions

3. **Secrets Management**:
   - HaloPSA credentials stored in AWS Secrets Manager
   - No hardcoded secrets in code or configuration files
   - Automatic rotation of secrets (optional)

4. **Data Protection**:
   - All data in transit is encrypted (HTTPS/TLS)
   - DynamoDB tables use encryption at rest
   - Customer data cached with TTL

5. **Access Control**:
   - API Gateway endpoints secured with IAM authentication
   - Amazon Connect instance access limited to authorized users
   - Cross-origin resource sharing (CORS) properly configured

## Performance Optimization

### Frontend Optimization

- **Code Splitting**: React components are loaded on demand
- **Caching Strategy**: Browser caching for static assets
- **Bundle Size**: Optimized with Vite production build
- **Lazy Loading**: Components loaded only when needed

### Backend Optimization

- **DynamoDB Caching**: Customer data cached to reduce API calls
- **Lambda Configuration**: Memory and timeout tuned for performance
- **Connection Reuse**: HTTP keep-alive for external API calls
- **Response Compression**: API Gateway responses compressed

### Monitoring and Scaling

- **CloudWatch Metrics**: Key performance indicators tracked
- **X-Ray Tracing**: Request tracing for latency analysis
- **Auto Scaling**: Lambda functions scale automatically
- **DynamoDB Capacity**: On-demand capacity for unpredictable loads

## Testing

### Test Frontend Locally

```bash
# Start the development server
cd frontend
npm run dev
```

1. Open http://localhost:5173 in your browser
2. Log in to the Amazon Connect CCP
3. Test with simulated calls or use the test interface

### Test Lambda Functions

```bash
# Test Customer Lookup Lambda
aws lambda invoke \
  --function-name ${STACK_NAME}-customer-lookup \
  --payload '{"phoneNumber": "+18005551234"}' \
  response.json

# Test Call Logging Lambda
aws lambda invoke \
  --function-name ${STACK_NAME}-call-logging \
  --payload '{"contactId": "12345", "phoneNumber": "+18005551234", "agentId": "agent-1", "startTimestamp": "2023-01-01T00:00:00Z", "endTimestamp": "2023-01-01T00:05:00Z"}' \
  response.json
```

### End-to-End Testing

1. Make a test call to your Amazon Connect phone number
2. Verify the agent sees the customer information screen pop
3. Complete the call and check for a new ticket in HaloPSA
4. Verify all contact attributes are correctly populated

## Troubleshooting

### Frontend Issues

- **CCP Not Loading**
  - **Problem**: Amazon Connect CCP iframe doesn't appear
  - **Solution**: 
    1. Check browser console for errors
    2. Verify CONNECT_INSTANCE_URL is correct
    3. Ensure domain is in Connect's approved origins
    4. Try clearing browser cache or using incognito mode

- **Customer Data Not Displaying**
  - **Problem**: No customer data appears on calls
  - **Solution**:
    1. Check browser network tab for API errors
    2. Verify Lambda function is accessible
    3. Test Lambda directly with test phone number
    4. Check CloudWatch logs for Lambda errors

### AWS Deployment Issues

- **CloudFormation Stack Creation Failures**
  - **Problem**: Stack creation fails during deployment
  - **Solution**:
    1. Check CloudFormation events for specific error
    2. Verify IAM permissions for deployment
    3. Ensure resource names don't conflict with existing resources
    4. Try deploying resources individually for better error isolation

- **Lambda Execution Errors**
  - **Problem**: Lambda functions fail to execute
  - **Solution**:
    1. Check CloudWatch logs for error details
    2. Verify VPC configuration and networking
    3. Ensure Lambda has access to required services
    4. Test Lambda permissions with simplified test code

### Integration Issues

- **HaloPSA Authentication Failures**
  - **Problem**: Cannot authenticate with HaloPSA API
  - **Solution**:
    1. Verify client ID and secret are correct
    2. Check HaloPSA API access is enabled
    3. Ensure correct OAuth 2.0 grant type is used
    4. Verify network connectivity to HaloPSA

- **Call Logging Failures**
  - **Problem**: Calls not being logged as tickets
  - **Solution**:
    1. Check CloudWatch logs for call logging Lambda
    2. Verify contact attributes are correctly passed
    3. Ensure ticket creation permissions in HaloPSA
    4. Test ticket creation directly via HaloPSA API

## Version History

### v4.0 (June 2025)
- Cross-platform support (macOS, Windows, Linux)
- Enhanced security with VPC isolation
- TypeScript conversion for better type safety
- Improved error handling and monitoring
- Performance optimizations for faster lookups

### v3.0 (February 2025)
- Added call logging to HaloPSA
- DynamoDB caching for improved performance
- API Gateway integration
- Contact flow improvements

### v2.0 (October 2024)
- React frontend with Material UI
- Customer lookup integration
- Basic Amazon Connect CCP embedding

### v1.0 (June 2024)
- Initial proof of concept
- Basic CCP integration
- Simple customer lookup

## FAQs

**Q: Can I use this with other PSA systems besides HaloPSA?**  
A: The architecture is designed to be adaptable. You would need to modify the Lambda functions to integrate with your specific PSA's API, but the core architecture would remain the same.

**Q: Does this work with Amazon Connect Chat?**  
A: The current implementation focuses on voice calls. Chat integration would require additional components for handling chat contacts and sessions.

**Q: How do I handle multiple languages or regions?**  
A: The frontend supports internationalization through i18n libraries. For multiple regions, deploy the stack in each AWS region where you have Amazon Connect instances.

**Q: What is the average latency for customer lookups?**  
A: With DynamoDB caching, customer lookups typically complete in under 300ms. First-time lookups that need to query HaloPSA may take 1-2 seconds.

**Q: How much does it cost to run this integration?**  
A: AWS costs are primarily based on usage. For a small contact center (10 agents, 500 calls/day), expect costs around $50-100/month for Lambda, DynamoDB, and API Gateway.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows our coding standards and includes appropriate tests.

## Support

For questions, issues, or contributions, please:

- Open an [Issue](https://github.com/RaiGaurav1/connect-halopsa/issues) on GitHub
- Submit a [Pull Request](https://github.com/RaiGaurav1/connect-halopsa/pulls) with fixes or improvements
- Contact the maintainer directly for urgent matters

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ by [Gaurav Rai](https://github.com/RaiGaurav1)
