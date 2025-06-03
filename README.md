# AWS Connect CCP + HaloPSA Integration

![Version](https://img.shields.io/badge/Version-4.0-blue)
![AWS](https://img.shields.io/badge/AWS-Amazon%20Connect-orange)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![Platform](https://img.shields.io/badge/Platform-Cross--Platform-lightgrey)

A production-ready integration between Amazon Connect Contact Control Panel (CCP) and HaloPSA, providing automated customer lookups, screen pops, and ticket logging.

## Features

- **Embedded Amazon Connect CCP**: Seamlessly integrate the Contact Control Panel in your application
- **Automatic Customer Lookup**: Instant lookup of customer data from HaloPSA when calls connect
- **Ticket Creation**: Automatic call logging in HaloPSA as tickets
- **Real-time Screen Pop**: Customer information display on incoming calls
- **Caching Layer**: DynamoDB caching to minimize API calls and improve performance
- **VPC Security**: Lambda functions running in private subnets with least-privilege permissions
- **Cross-Platform**: Works on macOS, Windows, and Linux
- **Comprehensive Monitoring**: CloudWatch metrics and logs for all components

## Prerequisites

Before you begin, ensure you have the following:

- AWS Account with Admin access
- Amazon Connect instance with API access enabled
- HaloPSA instance with API access (OAuth 2.0)
- Node.js v20.x or higher
- AWS CLI v2 configured with appropriate credentials

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/RaiGaurav1/connect-halopsa.git
cd connect-halopsa
```

### 2. Configure Environment

Update the `deployment-config.sh` file with your AWS and HaloPSA settings.

### 3. Deploy Infrastructure and Functions

```bash
chmod +x scripts/deploy-all.sh
./scripts/deploy-all.sh
```

## Documentation

See the complete documentation in the `docs` directory.

## License

This project is licensed under the MIT License.
