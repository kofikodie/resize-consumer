//write a mock for the bucket client that implements the BucketClientInterface

import { ClientError } from "../../src/driven/ClientError";
import {
    BucketClientInterface,
    BucketClientResultType,
    ParamsType,
} from "../../src/driven/ports/BucketClientInterface";

export class BucketClientMock implements BucketClientInterface {
    putObject(params: ParamsType): Promise<BucketClientResultType> {
        if (params.Bucket === "test") {
            return Promise.resolve({ success: true });
        }
        return Promise.resolve({
            success: false,
            error: new ClientError("Bucket not found", {
                name: "BucketClientError",
                stack: "BucketClientMock.putObject",
            }),
        });
    }
    deleteObject(params: ParamsType): Promise<BucketClientResultType> {
        if (params.Bucket === "test") {
            return Promise.resolve({ success: true });
        }
        return Promise.resolve({
            success: false,
            error: new ClientError("Bucket not found", {
                name: "BucketClientError",
                stack: "BucketClientMock.deleteObject",
            }),
        });
    }
    public async getObject(params: ParamsType): Promise<any> {
        if (params.Bucket === "test") {
            return Promise.resolve({
                success: true,
                result: Buffer.from("test"),
            });
        }
        return Promise.resolve({
            success: false,
            error: new ClientError("Bucket not found", {
                name: "BucketClientError",
                stack: "BucketClientMock.getObject",
            }),
        });
    }
}
