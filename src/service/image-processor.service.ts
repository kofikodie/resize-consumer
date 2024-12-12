import { LoggerInterface } from "../utils/logger/LoggerInterface";
import { MessageReceiveHandler } from "./handlers/MessageReceiveHandler";
import { ProcessingContext } from "./handlers/HandlerInterface";

export class ImageProcessorService {
    private readonly logger: LoggerInterface;
    private readonly processingChain: MessageReceiveHandler;

    constructor(
        logger: LoggerInterface,
        processingChain: MessageReceiveHandler
    ) {
        this.logger = logger;
        this.processingChain = processingChain;
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

    public async processImageTask(): Promise<void> {
        try {
            const context: ProcessingContext = {
                imageKey: "",
                receiptHandle: "",
            };

            const success = await this.processingChain.handle(context);

            if (success) {
                this.logger.info("Image processing completed successfully", {
                    imageKey: context.imageKey,
                    destinationBucket: process.env.BUCKET_NAME,
                });
            }
        } catch (error) {
            this.logger.error("Unexpected error during image processing", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
        }
    }
}
