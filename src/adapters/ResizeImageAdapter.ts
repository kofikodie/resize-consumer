import {
    ResizeImageAdapterInterface,
    ResizeImageAdapterResult,
} from "./ports/ResizeImageAdapterInterface";
import { ImageProcessorInterface } from "../driven/ports/ImageProcessorInterface";
import { ClientError } from "../driven/ClientError";

export default class ResizeImageAdapter implements ResizeImageAdapterInterface {
    private readonly imageProcessor: ImageProcessorInterface;

    constructor(imageProcessor: ImageProcessorInterface) {
        this.imageProcessor = imageProcessor;
    }

    async resizeImage(
        imageBuffer: Buffer,
        width: number,
        height: number
    ): Promise<ResizeImageAdapterResult> {
        try {
            const result = await this.imageProcessor.resize(
                imageBuffer,
                width,
                height
            );
            if (!result.success) {
                return {
                    success: false,
                    error: new ClientError("Failed to resize image", {
                        name: "Failed to resize image",
                        stack:
                            result.error instanceof Error
                                ? `${result.error.message} ${result.error.stack} ${result.error.name}`
                                : String(result.error),
                    }),
                };
            }
            return { success: true, imageBuffer: result.imageBuffer };
        } catch (error) {
            return {
                success: false,
                error: new ClientError("Failed to resize image", {
                    name: "Failed to resize image",
                    stack:
                        error instanceof Error
                            ? `${error.message} ${error.stack} ${error.name}`
                            : String(error),
                }),
            };
        }
    }
}
