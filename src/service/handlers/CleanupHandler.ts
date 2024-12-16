import BucketAdapter from "../../adapters/BucketAdapter";
import QueueAdapter from "../../adapters/QueueAdapter";
import { BaseHandler } from "./BaseHandler";
import { ProcessingContext } from "./HandlerInterface";

export class CleanupHandler extends BaseHandler {
    private readonly s3Adapter: BucketAdapter;
    private readonly sqsAdapter: QueueAdapter;

    constructor(
        s3Adapter: BucketAdapter,
        sqsAdapter: QueueAdapter,
        ...args: ConstructorParameters<typeof BaseHandler>
    ) {
        super(...args);
        this.s3Adapter = s3Adapter;
        this.sqsAdapter = sqsAdapter;
    }

    protected async processRequest(
        context: ProcessingContext
    ): Promise<boolean> {
        const result = await Promise.all([
            this.s3Adapter.deleteImageByKey(
                process.env.BUCKET_NAME_TMP ?? "",
                context.imageKey
            ),
            this.sqsAdapter.deleteMessage(
                context.queueUrl,
                context.receiptHandle
            ),
        ]);

        if (result.every((r) => r.success)) {
            return true;
        }

        this.logger.error("Failed to cleanup resources", {
            name: result.find((r) => !r.success)?.error?.name,
            message: result.find((r) => !r.success)?.error?.message,
            stack: result.find((r) => !r.success)?.error?.stack,
            imageKey: context.imageKey,
        });

        return false;
    }
}
