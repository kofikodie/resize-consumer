import MetadataDBAdapter from "./adapters/MetaDataDBAdapter";
import ResizeImageAdapter from "./adapters/ResizeImageAdapter";
import BucketAdapter from "./adapters/BucketAdapter";
import QueueAdapter from "./adapters/QueueAdapter";
import { CleanupHandler } from "./service/handlers/CleanupHandler";
import { ImageDownloadHandler } from "./service/handlers/ImageDownloadHandler";
import { ImageResizeHandler } from "./service/handlers/ImageResizeHandler";
import { ImageUploadHandler } from "./service/handlers/ImageUploadHandler";
import { MessageReceiveHandler } from "./service/handlers/MessageReceiveHandler";
import { MetadataUpdateHandler } from "./service/handlers/MetadataUpdateHandler";
import { ImageProcessorService } from "./service/ImageProcessor.service";
import { LoggerService } from "./utils/logger/LoggerService";
import ForDynamoDbClient from "./driven/ForDynamoDbClient";
import ForS3Client from "./driven/ForS3Client";
import { ForSqsClient } from "./driven/ForSqsClient";
import { SharpImageProcessor } from "./driven/SharpImageProcessor";
import { ProcessingContext } from "./service/handlers/HandlerInterface";

async function main() {
    const logger = LoggerService.getInstance();

    const sqsClient = new ForSqsClient();
    const s3Client = new ForS3Client();
    const dynamoDbClient = new ForDynamoDbClient();
    const imageProcessor = new SharpImageProcessor();

    const sqsAdapter = new QueueAdapter(sqsClient);
    const s3Adapter = new BucketAdapter(s3Client);
    const resizeImageAdapter = new ResizeImageAdapter(imageProcessor);
    const dynamoDbAdapter = new MetadataDBAdapter(dynamoDbClient);

    const imageDownloadHandler = new ImageDownloadHandler(s3Adapter, logger);
    const imageResizeHandler = new ImageResizeHandler(
        resizeImageAdapter,
        logger
    );
    const imageUploadHandler = new ImageUploadHandler(s3Adapter, logger);
    const metadataUpdateHandler = new MetadataUpdateHandler(
        dynamoDbAdapter,
        logger
    );
    const cleanupHandler = new CleanupHandler(s3Adapter, sqsAdapter, logger);

    const processingChain = new MessageReceiveHandler(sqsAdapter, logger);
    processingChain
        .setNext(imageDownloadHandler)
        .setNext(imageResizeHandler)
        .setNext(imageUploadHandler)
        .setNext(metadataUpdateHandler)
        .setNext(cleanupHandler);

    const processor = new ImageProcessorService(logger, processingChain);

    try {
        processor.validateEnvironment();

        const context: ProcessingContext = {
            queueUrl: process.env.QUEUE_URL || "",
            imageKey: "",
            receiptHandle: "",
            tableName: process.env.TABLE_NAME || "",
            primaryBucketName: process.env.BUCKET_NAME || "",
            secondaryBucketName: process.env.BUCKET_NAME_TMP || "",
        };
        const result = await processor.processImageTask(context);

        if (result.success) {
            logger.info("Image processing completed successfully", {
                imageKey: result.context.imageKey,
                destinationBucket: result.context.primaryBucketName,
            });
        }
    } catch (error) {
        logger.error("Fatal error in main process", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        process.exit(1);
    }
}

main();
