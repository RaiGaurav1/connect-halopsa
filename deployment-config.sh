#!/bin/bash

# AWS region and account
export AWS_REGION="ap-southeast-2"
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Amazon Connect settings
export CONNECT_INSTANCE_ID="0158634f-3ee1-4ed8-9ece-88e198964c30"
export CONNECT_INSTANCE_URL="https://your-instance.my.connect.aws/connect/ccp-v2/"

# HaloPSA credentials
export HALO_API_BASE_URL="https://bendigotelco.halopsa.com/api/v2"
export HALO_CLIENT_ID="demo”123
export HALO_CLIENT_SECRET="demosecrate123”
export HALO_TENANT_ID="demoid”123

# Deployment-specific
export STACK_NAME="connect-halopsa-integration"
export ENVIRONMENT="production"

# VPC CIDR blocks
export VPC_CIDR="10.0.0.0/16"
export PRIVATE_SUBNET_A_CIDR="10.0.1.0/24"
export PRIVATE_SUBNET_B_CIDR="10.0.2.0/24"

# Secrets Manager
export HALO_SECRET_NAME="HaloPSACredentials"

# Validate required variables
REQUIRED_VARS=(CONNECT_INSTANCE_ID HALO_API_BASE_URL HALO_CLIENT_ID HALO_CLIENT_SECRET AWS_ACCOUNT_ID)
for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var}" ]] || [[ "${!var}" == *"YOUR_"* ]]; then
    echo "❌ ERROR: $var is not set or contains a placeholder"
    exit 1
  fi
done

echo "✅ Configuration validated"
echo " AWS Account: $AWS_ACCOUNT_ID"
echo " Region: $AWS_REGION"
echo " Environment: $ENVIRONMENT"
echo " Connect URL: $CONNECT_INSTANCE_URL"
