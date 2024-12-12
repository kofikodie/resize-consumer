import sharp from "sharp";
import { LoggerInterface } from "../utils/logger/LoggerInterface";

export default class ResizeImageAdapter implements ResizeImageAdapterInterface {
    private readonly logger: LoggerInterface;

    constructor(logger: LoggerInterface) {
        this.logger = logger;
    }

    resizeImage(imageBuffer: Buffer, width: number, height: number) {
        this.logger.info("Resizing image", { width, height });
        try {
            return sharp(imageBuffer).resize(width, height).toBuffer();
        } catch (error) {
            this.logger.error("Error resizing image", {
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
}

export interface ResizeImageAdapterInterface {
    resizeImage(
        imageBuffer: Buffer,
        width: number,
        height: number
    ): Promise<Buffer>;
}
