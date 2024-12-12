import S3Adapter from "../../adapters/S3Adapter";
import { BaseHandler } from "./BaseHandler";
import { ProcessingContext } from "./HandlerInterface";

export class ImageDownloadHandler extends BaseHandler {
    private readonly s3Adapter: S3Adapter;

    constructor(s3Adapter: S3Adapter, ...args: ConstructorParameters<typeof BaseHandler>) {
        super(...args);
        this.s3Adapter = s3Adapter;
    }

    protected async processRequest(context: ProcessingContext): Promise<boolean> {
        const imageBuffer = await this.s3Adapter.getImageByKey(
            process.env.BUCKET_NAME_TMP ?? "",
            context.imageKey
        );

        if ("error" in imageBuffer) {
            this.logger.error("Failed to download image", {
                imageKey: context.imageKey,
                error: imageBuffer.error
            });
            return false;
        }

        context.imageBuffer = imageBuffer;
        return true;
    }
} 