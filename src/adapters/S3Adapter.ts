import AWS, {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3,
} from "@aws-sdk/client-s3";
import { S3AdapterInterface } from "./S3AdapterInterface";
import * as dotenv from "dotenv";
import { randomUUID } from "crypto";
import { StreamHelper } from "../stream-helpler";
import { Readable } from "node:stream";
import { LoggerService } from "../utils/logger/LoggerService";
import { LoggerInterface } from "../utils/logger/LoggerInterface";

dotenv.config();

export default class S3Adapter implements S3AdapterInterface {
    private readonly s3: S3;
    private readonly logger: LoggerInterface;

    constructor(logger: LoggerInterface) {
        this.logger = logger;

        if (process.env.RUNNING_ENV) {
            this.s3 = new S3({
                region: process.env.AWS_DEFAULT_REGION ?? "eu-west-1",
            });
        } else {
            this.s3 = new S3({
                endpoint: process.env.AWS_SERVICES_ENDPOINT ?? "",
                region: process.env.AWS_DEFAULT_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
                },
                forcePathStyle: true,
            });
        }
    }
    public async getImageByKey(
        bucketName: string,
        key: string
    ): Promise<Buffer | { error: string }> {
        const params = {
            Bucket: bucketName,
            Key: key,
        };
        try {
            const command = new GetObjectCommand(params);
            const result = await this.s3.send(command);

            return await StreamHelper.streamToBuffer(result.Body as Readable);
        } catch (error: unknown) {
            this.logger.error("[S3Adapter] Failed to get image", {
                bucket: bucketName,
                key,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            return {
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    public async storeImage(
        buffer: Buffer,
        imageName: string,
        bucketName: string,
        key = randomUUID()
    ): Promise<{ success: string } | { error: string }> {
        const params = {
            Bucket: bucketName,
            Key: key,
            Name: imageName,
            Body: buffer,
        };

        try {
            const command = new PutObjectCommand(params);
            const result = await this.s3.send(command);

            if (result.$metadata.httpStatusCode === 200) {
                this.logger.info("[S3Adapter] Successfully uploaded image", {
                    bucket: bucketName,
                    key,
                    imageName,
                });
                return {
                    success: "Object uploaded successfully",
                };
            }

            throw new Error(
                `Upload failed with status code: ${result.$metadata.httpStatusCode}`
            );
        } catch (error: unknown) {
            this.logger.error("[S3Adapter] Failed to store image", {
                bucket: bucketName,
                key,
                imageName,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            return {
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    public async deleteImageByKey(
        bucketName: string,
        key: string
    ): Promise<{ success: boolean; error?: string }> {
        const params = {
            Bucket: bucketName,
            Key: key,
        };

        try {
            const command = new DeleteObjectCommand(params);
            await this.s3.send(command);
            this.logger.info("[S3Adapter] Successfully deleted image", {
                bucket: bucketName,
                key,
            });
            return { success: true };
        } catch (error: unknown) {
            this.logger.error("[S3Adapter] Failed to delete image", {
                bucket: bucketName,
                key,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
}
