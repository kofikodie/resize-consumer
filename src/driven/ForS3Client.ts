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

export default class S3Client implements BucketClientInterface {
    public readonly s3Client: S3;

    constructor() {
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
                error,
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
                error: new Error(
                    `Upload failed with status code ${result.$metadata.httpStatusCode}`
                ),
            };
        } catch (error: unknown) {
            return {
                success: false,
                error,
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
                error,
            };
        }
    }
}
