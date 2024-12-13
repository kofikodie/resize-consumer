# S3 Image Resizer

## Overview

This project is a microservice designed to process images stored in AWS S3 buckets. It follows a message-driven architecture, consuming S3 object keys from an AWS SQS queue, processing the images, and managing their metadata in DynamoDB.

## Architecture

### Core Components
- **Queue Consumer**: Listens to SQS for image processing requests
- **Image Processor**: Downloads, resizes, and uploads images
- **Metadata Manager**: Tracks image status in DynamoDB
- **Storage Manager**: Handles S3 bucket operations

### Design Patterns
- **Chain of Responsibility**: For image processing pipeline
- **Adapter Pattern**: For AWS service integrations
- **Singleton**: For logging service
- **Ports and Adapters**: For clean architecture

## Features

- Asynchronous image processing via SQS
- Automatic image resizing with configurable dimensions
- Metadata tracking in DynamoDB
- Structured logging with Winston
- Error handling and retry mechanisms
- Docker containerization
- Clean architecture with dependency injection

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- AWS Account with:
  - S3 buckets (temporary and primary storage)
  - SQS queue
  - DynamoDB table
  - IAM permissions

## Configuration

### Environment Variables

```bash
cp env.dist .env
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/s3-image-resizer.git
cd s3-image-resizer
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.dist .env
# Edit .env with your configuration
```

4. Run with Docker:
```bash
docker-compose up -d
```

## Development

### Local Setup
```bash
docker compose run install
docker compose run start:consumer
```

### Testing
```bash
docker compose run test
```

### Building
```bash
docker compose build
```

## Project Structure

```
src/
├── adapters/          # Cloud service adapters
├── client/           # Cloud SDK clients
├── service/          # Business logic
│   └── handlers/     # Processing chain handlers
├── utils/            # Utilities
│   └── logger/       # Logging configuration
└── index.ts          # Application entry point
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
