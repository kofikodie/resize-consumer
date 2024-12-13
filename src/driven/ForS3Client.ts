import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3,
} from "@aws-sdk/client-s3";
import {
    BucketClientInterface,
    BucketClientResultType,
    ParamsType,
} from "./ports/BucketClientInterface";
import { StreamHelper } from "../stream-helpler";
import { Readable } from "node:stream";
import { LoggerInterface } from "../utils/logger/LoggerInterface";
import { ClientError } from "./ClientError";

export default class S3Client implements BucketClientInterface {
    public readonly s3Client: S3;
    private readonly logger: LoggerInterface;

    constructor(logger: LoggerInterface) {
        this.logger = logger;
        if (process.env.NODE_ENV === "development") {
            this.s3Client = new S3({
                region: process.env.AWS_DEFAULT_REGION ?? "eu-west-1",
            });
        } else {
            this.s3Client = new S3({
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
    public async deleteObject(
        params: ParamsType
    ): Promise<BucketClientResultType> {
        try {
            const command = new DeleteObjectCommand(params);
            await this.s3Client.send(command);

            return { success: true };
        } catch (error: unknown) {
            return {
                success: false,
                error: new ClientError("Failed to delete object", {
                    name: "Failed to delete object",
                    stack: `${JSON.stringify(error)}`,
                }),
            };
        }
    }
    public async putObject(
        params: ParamsType
    ): Promise<BucketClientResultType> {
        try {
            const command = new PutObjectCommand(params);
            const result = await this.s3Client.send(command);

            if (result.$metadata.httpStatusCode === 200) {
                return { success: true };
            }

            return {
                success: false,
                error: new ClientError("Upload failed", {
                    name: "Upload failed",
                    stack: `${JSON.stringify(params)}`,
                }),
            };
        } catch (error: unknown) {
            return {
                success: false,
                error: new ClientError("Failed to upload object", {
                    name: "Failed to upload object",
                    stack: `${JSON.stringify(error)}`,
                }),
            };
        }
    }

    public async getObject(
        params: ParamsType
    ): Promise<BucketClientResultType> {
        try {
            const command = new GetObjectCommand(params);
            const result = await this.s3Client.send(command);
            return {
                success: true,
                result: await StreamHelper.streamToBuffer(
                    result.Body as Readable
                ),
            };
        } catch (error: unknown) {
            return {
                success: false,
                error: new ClientError("Failed to get object", {
                    name: "Failed to get object",
                    stack: `${JSON.stringify(error)}`,
                }),
            };
        }
    }
}
