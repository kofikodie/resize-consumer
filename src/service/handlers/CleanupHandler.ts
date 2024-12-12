import S3Adapter from "../../adapters/S3Adapter";
import SQSAdapter from "../../adapters/SqsAdapter";
import { BaseHandler } from "./BaseHandler";
import { ProcessingContext } from "./HandlerInterface";

export class CleanupHandler extends BaseHandler {
    private readonly s3Adapter: S3Adapter;
    private readonly sqsAdapter: SQSAdapter;

    constructor(
        s3Adapter: S3Adapter, 
        sqsAdapter: SQSAdapter, 
        ...args: ConstructorParameters<typeof BaseHandler>
    ) {
        super(...args);
        this.s3Adapter = s3Adapter;
        this.sqsAdapter = sqsAdapter;
    }

    protected async processRequest(context: ProcessingContext): Promise<boolean> {
        try {
            await Promise.all([
                this.s3Adapter.deleteImageByKey(process.env.BUCKET_NAME_TMP ?? "", context.imageKey),
                this.sqsAdapter.deleteMessage(context.receiptHandle)
            ]);
            
            this.logger.info("Cleanup completed successfully", {
                imageKey: context.imageKey,
                tmpBucket: process.env.BUCKET_NAME_TMP
            });
            return true;
        } catch (error) {
            this.logger.error("Failed to cleanup resources", {
                error: error instanceof Error ? error.message : String(error),
                imageKey: context.imageKey
            });
            return false;
        }
    }
} 