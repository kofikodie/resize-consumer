import DynamoDBAdapter from "../adapters/DynamoDBAdapter";
import ResizeImageAdapter from "../adapters/ResizeImageAdapter";
import S3Adapter from "../adapters/S3Adapter";
import SQSAdapter from "../adapters/SqsAdapter";
import { LoggerInterface } from "../utils/logger/LoggerInterface";

export class ImageProcessorService {
    private readonly logger: LoggerInterface;
    private readonly sqsAdapter: SQSAdapter;
    private readonly s3Adapter: S3Adapter;
    private readonly dynamoDbAdapter: DynamoDBAdapter;
    private readonly resizeImageAdapter: ResizeImageAdapter;

    constructor(logger: LoggerInterface) {
        this.logger = logger;
        this.sqsAdapter = new SQSAdapter(logger);
        this.s3Adapter = new S3Adapter(logger);
        this.dynamoDbAdapter = new DynamoDBAdapter(logger);
        this.resizeImageAdapter = new ResizeImageAdapter();
    }

    public validateEnvironment(): void {
        const requiredEnvVars = [
            "QUEUE_NAME",
            "QUEUE_URL",
            "BUCKET_NAME",
            "BUCKET_NAME_TMP",
            "AWS_DEFAULT_REGION",
        ];

        const missingVars = requiredEnvVars.filter(
            (varName) => !process.env[varName]
        );

        if (missingVars.length > 0) {
            throw new Error(
                `Missing required environment variables: ${missingVars.join(
                    ", "
                )}`
            );
        }
    }

    private async cleanupResources(
        imageKey: string,
        receiptHandle: string
    ): Promise<{ success: boolean } | { error: string }> {
        try {
            await Promise.all([
                this.s3Adapter.deleteImageByKey(
                    process.env.BUCKET_NAME_TMP ?? "",
                    imageKey
                ),
                this.sqsAdapter.deleteMessage(receiptHandle),
            ]);

            this.logger.info("Cleanup completed successfully", {
                imageKey,
                tmpBucket: process.env.BUCKET_NAME_TMP,
            });

            return { success: true };
        } catch (error) {
            this.logger.error("Failed to cleanup resources", {
                error: error instanceof Error ? error.message : String(error),
                imageKey,
                tmpBucket: process.env.BUCKET_NAME_TMP,
            });

            return { error: "Failed to cleanup resources" };
        }
    }

    public async processImageTask(): Promise<void> {
        try {
            const messageResult = await this.sqsAdapter.getMessage();

            if (
                !messageResult ||
                "error" in messageResult ||
                !messageResult.Body ||
                !messageResult.ReceiptHandle
            ) {
                if ("error" in messageResult) {
                    this.logger.error("Error receiving message", {
                        error: messageResult.error,
                    });
                    return;
                }
                this.logger.info("No messages to process");
                return;
            }

            const imageKey = messageResult.Body;
            const receiptHandle = messageResult.ReceiptHandle;

            // Get image from S3
            const imageBuffer = await this.s3Adapter.getImageByKey(
                process.env.BUCKET_NAME_TMP ?? "",
                imageKey
            );

            if ("error" in imageBuffer) {
                this.logger.error("Failed to download image", {
                    imageKey,
                    error: imageBuffer.error,
                });
                await this.sqsAdapter.deleteMessage(receiptHandle); // TODO: Add retry logic
                return;
            }

            // Resize image
            const resizedBuffer = await this.resizeImageAdapter.resizeImage(
                imageBuffer,
                100,
                100
            );

            // Store resized image
            const storeResult = await this.s3Adapter.storeImage(
                resizedBuffer,
                `resized_${imageKey}`,
                process.env.BUCKET_NAME ?? "",
                imageKey
            );

            if ("error" in storeResult) {
                this.logger.error("Failed to store resized image", {
                    imageKey,
                    error: storeResult.error,
                });
                return;
            }

            // Get and update metadata
            const imageMetadata = await this.dynamoDbAdapter.getItem(imageKey);
            if ("error" in imageMetadata) {
                this.logger.error("Failed to get image metadata", {
                    imageKey,
                    error: imageMetadata.error,
                });
                return;
            }

            const updateResult = await this.dynamoDbAdapter.updateStatus(
                imageKey,
                "processed"
            );

            if ("error" in updateResult) {
                this.logger.error("Failed to update image status", {
                    imageKey,
                    error: updateResult.error,
                });
                return;
            }

            this.logger.info("Image processing completed successfully", {
                imageKey,
                destinationBucket: process.env.BUCKET_NAME,
            });

            // Cleanup
            await this.cleanupResources(imageKey, receiptHandle);
        } catch (error) {
            this.logger.error("Unexpected error during image processing", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
        }
    }
}
