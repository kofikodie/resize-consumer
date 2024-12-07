# S3 Image Resizer

## Overview

This project is a consumer application designed to process images stored in an AWS S3 bucket. It works by consuming S3 object keys from an AWS SQS queue, fetching the corresponding images from a temporary S3 bucket, resizing them, and then uploading the processed images to a primary S3 bucket.

## Features

- **SQS Consumer**: Listens to an SQS queue for incoming messages containing S3 object keys.
- **Image Processing**: Downloads the image, resizes it, and processes it according to defined configurations.
- **S3 Integration**: Fetches images from a temporary S3 bucket and stores the resized images in a primary S3 bucket.
- **Dockerized**: The application runs in a Docker container for easy deployment and isolation.

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Docker](https://www.docker.com/) (for running the application)
- AWS credentials configured (e.g., in `~/.aws/credentials` or via environment variables)
- An S3 bucket for temporary storage
- An S3 bucket for primary storage
- An SQS queue with properly configured permissions

### Environment Variables

Create a `.env` file in the project root directory and populate it with the following variables:

```bash
    cp env.dist .env
