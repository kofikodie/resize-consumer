import S3Adapter from "../../adapters/S3Adapter";
import { BaseHandler } from "./BaseHandler";
import { ProcessingContext } from "./HandlerInterface";
export class ImageUploadHandler extends BaseHandler {
    private readonly s3Adapter: S3Adapter;

    constructor(s3Adapter: S3Adapter, ...args: ConstructorParameters<typeof BaseHandler>) {
        super(...args);
        this.s3Adapter = s3Adapter;
    }

    protected async processRequest(context: ProcessingContext): Promise<boolean> {
        if (!context.resizedBuffer) {
            this.logger.error("No resized buffer to upload");
            return false;
        }

        const result = await this.s3Adapter.storeImage(
            context.resizedBuffer,
            `resized_${context.imageKey}`,
            process.env.BUCKET_NAME ?? "",
            context.imageKey
        );

        if ("error" in result) {
            this.logger.error("Failed to store resized image", {
                imageKey: context.imageKey,
                error: result.error
            });
            return false;
        }

        return true;
    }
} 