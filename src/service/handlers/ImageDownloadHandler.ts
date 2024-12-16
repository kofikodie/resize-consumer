import BucketAdapter from "../../adapters/BucketAdapter";
import { BucketAdapterInterface } from "../../adapters/ports/BucketAdapterInterface";
import { BaseHandler } from "./BaseHandler";
import { ProcessingContext } from "./HandlerInterface";

export class ImageDownloadHandler extends BaseHandler {
    private readonly s3Adapter: BucketAdapterInterface;

    constructor(
        s3Adapter: BucketAdapterInterface,
        ...args: ConstructorParameters<typeof BaseHandler>
    ) {
        super(...args);
        this.s3Adapter = s3Adapter;
    }

    protected async processRequest(
        context: ProcessingContext
    ): Promise<boolean> {
        const response = await this.s3Adapter.getImageByKey(
            context.primaryBucketName,
            context.imageKey
        );

        if (!response.success) {
            this.logger.error("Failed to download image", {
                imageKey: context.imageKey,
                error: {
                    name: response.error?.name,
                    mssage: response.error?.message,
                    stack: response.error?.stack,
                },
            });

            return false;
        }

        if (response.result instanceof Buffer) {
            context.imageBuffer = response.result;
            return true;
        }

        this.logger.error("Failed to download image", {
            imageKey: context.imageKey,
            error: {
                name: "Failed to download image",
                message: "Response is not a buffer",
                stack: `ImageDownloadHandler.processRequest`,
            },
        });

        return false;
    }
}
