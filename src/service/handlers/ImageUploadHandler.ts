import BucketAdapter from "../../adapters/BucketAdapter";
import { BaseHandler } from "./BaseHandler";
import { ProcessingContext } from "./HandlerInterface";
export class ImageUploadHandler extends BaseHandler {
    private readonly s3Adapter: BucketAdapter;

    constructor(
        s3Adapter: BucketAdapter,
        ...args: ConstructorParameters<typeof BaseHandler>
    ) {
        super(...args);
        this.s3Adapter = s3Adapter;
    }

    protected async processRequest(
        context: ProcessingContext
    ): Promise<boolean> {
        if (!context.resizedBuffer) {
            this.logger.error("No resized buffer to upload", {
                imageKey: context.imageKey,
            });
            return false;
        }

        const result = await this.s3Adapter.storeImage(
            context.resizedBuffer,
            `resized_${context.imageKey}`,
            context.primaryBucketName,
            context.imageKey
        );

        if (!result.success) {
            this.logger.error("Failed to store resized image", {
                imageKey: context.imageKey,
                error: {
                    name: result.error?.name,
                    message: result.error?.message,
                    stack: result.error?.stack,
                },
            });
            return false;
        }

        return true;
    }
}
