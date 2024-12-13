import { ClientError } from "../../driven/ClientError";

export interface BucketAdapterInterface {
    storeImage(
        buffer: Buffer,
        imageName: string,
        buctketName: string
    ): Promise<BucketAdapterResultType>;
    getImageByKey(
        bucketName: string,
        key: string
    ): Promise<BucketAdapterResultType>;
    deleteImageByKey(
        bucketName: string,
        key: string
    ): Promise<BucketAdapterResultType>;
}

export type BucketAdapterResultType = {
    success: boolean;
    result?: Buffer;
    error?: ClientError;
};
