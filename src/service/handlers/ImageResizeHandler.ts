import ResizeImageAdapter from "../../adapters/ResizeImageAdapter";
import { BaseHandler } from "./BaseHandler";
import { ProcessingContext } from "./HandlerInterface";
export class ImageResizeHandler extends BaseHandler {
    private readonly resizeAdapter: ResizeImageAdapter;

    constructor(
        resizeAdapter: ResizeImageAdapter,
        ...args: ConstructorParameters<typeof BaseHandler>
    ) {
        super(...args);
        this.resizeAdapter = resizeAdapter;
    }

    protected async processRequest(
        context: ProcessingContext
    ): Promise<boolean> {
        if (!context.imageBuffer) {
            this.logger.error("No image buffer to resize");
            return false;
        }

        const result = await this.resizeAdapter.resizeImage(
            context.imageBuffer,
            100,
            100
        );
        if (!result.success) {
            this.logger.error("Failed to resize image", {
                error: {
                    name: result.error?.name,
                    message: result.error?.message,
                    stack: result.error?.stack,
                },
            });
            return false;
        }
        context.resizedBuffer = result.imageBuffer;
        return true;
    }
}
