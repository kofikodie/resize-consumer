import DynamoDBAdapter from "./adapters/DynamoDBAdapter";
import ResizeImageAdapter from "./adapters/ResizeImageAdapter";
import S3Adapter from "./adapters/S3Adapter";
import SQSAdapter from "./adapters/SqsAdapter";
import { CleanupHandler } from "./service/handlers/CleanupHandler";
import { ImageDownloadHandler } from "./service/handlers/ImageDownloadHandler";
import { ImageResizeHandler } from "./service/handlers/ImageResizeHandler";
import { ImageUploadHandler } from "./service/handlers/ImageUploadHandler";
import { MessageReceiveHandler } from "./service/handlers/MessageReceiveHandler";
import { MetadataUpdateHandler } from "./service/handlers/MetadataUpdateHandler";
import { ImageProcessorService } from "./service/image-processor.service";
import { LoggerService } from "./utils/logger/LoggerService";

async function main() {
    const logger = LoggerService.getInstance();

    const sqsAdapter = new SQSAdapter(logger);
    const s3Adapter = new S3Adapter(logger);
    const processingChain = new MessageReceiveHandler(sqsAdapter, logger);
    const imageDownloadHandler = new ImageDownloadHandler(s3Adapter, logger);
    const resizeImageAdapter = new ResizeImageAdapter(logger);
    const dynamoDbAdapter = new DynamoDBAdapter(logger, "image_metadata");

    processingChain
        .setNext(imageDownloadHandler)
        .setNext(new ImageResizeHandler(resizeImageAdapter, logger))
        .setNext(new ImageUploadHandler(s3Adapter, logger))
        .setNext(new MetadataUpdateHandler(dynamoDbAdapter, logger))
        .setNext(new CleanupHandler(s3Adapter, sqsAdapter, logger));

    const processor = new ImageProcessorService(logger, processingChain);

    try {
        processor.validateEnvironment();
        await processor.processImageTask();
    } catch (error) {
        logger.error("Fatal error in main process", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        process.exit(1);
    }
}

main();
