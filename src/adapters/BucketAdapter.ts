import {
    BucketAdapterInterface,
    BucketAdapterResultType,
} from "./ports/BucketAdapterInterface";
import * as dotenv from "dotenv";
import { randomUUID } from "crypto";
import { LoggerInterface } from "../utils/logger/LoggerInterface";
import { BucketClientInterface } from "../driven/ports/BucketClientInterface";
import { ClientError } from "../driven/ClientError";

dotenv.config();

export default class BucketAdapter implements BucketAdapterInterface {
    private readonly bucketClient: BucketClientInterface;

    constructor(bucketClient: BucketClientInterface) {
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
            return {
                success: false,
                error: new ClientError("Failed to get object", {
                    name: "Failed to get object",
                    stack:
                        result.error instanceof Error
                            ? `${result.error.message} ${result.error.stack} ${result.error.name}`
                            : String(result.error),
                }),
            };
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
            return {
                success: false,
                error: new ClientError("Failed to store object", {
                    name: "Failed to store object",
                    stack:
                        result.error instanceof Error
                            ? `${result.error.message} ${result.error.stack} ${result.error.name}`
                            : String(result.error),
                }),
            };
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
            return {
                success: false,
                error: new ClientError("Failed to delete object", {
                    name: "Failed to delete object",
                    stack:
                        result.error instanceof Error
                            ? `${result.error.message} ${result.error.stack} ${result.error.name}`
                            : String(result.error),
                }),
            };
        }
        return { success: true };
    }
}
