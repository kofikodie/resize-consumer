// src/adapters/implementations/SharpImageProcessor.ts
import sharp from "sharp";
import { ImageProcessorInterface, ImageProcessorResult } from "./ports/ImageProcessorInterface";

export class SharpImageProcessor implements ImageProcessorInterface {
    async resize(
        imageBuffer: Buffer,
        width: number,
        height: number
    ): Promise<ImageProcessorResult> {
        try {
            const resizedImage = await sharp(imageBuffer).resize(width, height).toBuffer();
            return { success: true, imageBuffer: resizedImage };
        } catch (error) {
            return { success: false, error };
        }
    }
}
