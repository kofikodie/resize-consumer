import { ClientError } from "../ClientError";

export interface BucketClientInterface {
    getObject(params: ParamsType): Promise<BucketClientResultType>;
    putObject(params: ParamsType): Promise<BucketClientResultType>;
    deleteObject(params: ParamsType): Promise<BucketClientResultType>;
}
export type ParamsType = {
    Bucket: string;
    Key: string;
};

export type BucketClientResultType = {
    success: boolean;
    error?: ClientError;
    result?: Buffer;
};