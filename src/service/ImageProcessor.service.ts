import { LoggerInterface } from "../utils/logger/LoggerInterface";
import { MessageReceiveHandler } from "./handlers/MessageReceiveHandler";
import { HandlerInterface, ProcessingContext } from "./handlers/HandlerInterface";
import { ClientError } from "../driven/ClientError";

export class ImageProcessorService {
    private readonly logger: LoggerInterface;
    private readonly processingChain: HandlerInterface;

    constructor(
        logger: LoggerInterface,
        processingChain: HandlerInterface
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
            "TABLE_NAME",
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

    public async processImageTask(context: ProcessingContext): Promise<{
        success: boolean,
        context: ProcessingContext,
    }> {

        const response = await this.processingChain.handle(context);
        return {
            success: response,
            context,
        };
    }
}
