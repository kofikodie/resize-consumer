import { ClientError } from "../../driven/ClientError";

export interface ResizeImageAdapterInterface {
    resizeImage(
        imageBuffer: Buffer,
        width: number,
        height: number
    ): Promise<ResizeImageAdapterResult>;
}

export type ResizeImageAdapterResult = {
    success: boolean;
    imageBuffer?: Buffer;
    error?: ClientError;
};
