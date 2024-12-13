import {
    BucketAdapterInterface,
    BucketAdapterResultType,
} from "./ports/BucketAdapterInterface";
import * as dotenv from "dotenv";
import { randomUUID } from "crypto";
import { LoggerInterface } from "../utils/logger/LoggerInterface";
import { BucketClientInterface } from "../driven/ports/BucketClientInterface";

dotenv.config();

export default class BucketAdapter implements BucketAdapterInterface {
    private readonly bucketClient: BucketClientInterface;
    private readonly logger: LoggerInterface;

    constructor(logger: LoggerInterface, bucketClient: BucketClientInterface) {
        this.logger = logger;
        this.bucketClient = bucketClient;
    }
    public async getImageByKey(
        bucketName: string,
        key: string
    ): Promise<BucketAdapterResultType> {
        const result = await this.bucketClient.getObject({
            Bucket: bucketName,
            Key: key,
        });

        if (!result.success) {
            this.logger.error("[BucketAdapter] Failed to get image", {
                bucket: bucketName,
                key,
                error: `${JSON.stringify(result.error)}`,
            });
            return { success: false };
        }
        return { success: true, result: result.result };
    }

    public async storeImage(
        buffer: Buffer,
        imageName: string,
        bucketName: string,
        key = randomUUID()
    ): Promise<BucketAdapterResultType> {
        const params = {
            Bucket: bucketName,
            Key: key,
            Name: imageName,
            Body: buffer,
        };

        const result = await this.bucketClient.putObject(params);

        if (!result.success) {
            this.logger.error("[BucketAdapter] Failed to store image", {
                bucket: bucketName,
                key,
                error: `${JSON.stringify(result.error)}`,
            });
            return { success: false };
        }
        return { success: true };
    }

    public async deleteImageByKey(
        bucketName: string,
        key: string
    ): Promise<BucketAdapterResultType> {
        const result = await this.bucketClient.deleteObject({
            Bucket: bucketName,
            Key: key,
        });

        if (!result.success) {
            this.logger.error("[BucketAdapter] Failed to delete image", {
                bucket: bucketName,
                key,
                error: `${JSON.stringify(result.error)}`,
            });
            return { success: false };
        }
        return { success: true };
    }
}
