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

dotenv.config();

export default class S3Adapter implements S3AdapterInterface {
    private readonly s3: S3;

    constructor() {
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
            return {
                error: `${error}`,
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
                return {
                    success: "Object uploaded successfully",
                };
            }

            return { error: "Unable to upload object" };
        } catch (error: unknown) {
            return { error: `${error}` };
        }
    }

    public async deleteImageByKey(
        bucketName: string,
        key: string
    ): Promise<void> {
        const params = {
            Bucket: bucketName,
            Key: key,
        };

        try {
            const command = new DeleteObjectCommand(params);
            await this.s3.send(command);
        } catch (error: unknown) {
            console.error({ error: `${error}` });
        }
    }
}
