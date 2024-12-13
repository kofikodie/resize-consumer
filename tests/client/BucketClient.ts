//write a mock for the bucket client that implements the BucketClientInterface

import { ClientError } from "../../src/driven/ClientError";
import {
    BucketClientInterface,
    BucketClientResultType,
    ParamsType,
} from "../../src/driven/ports/BucketClientInterface";

export class BucketClientMock implements BucketClientInterface {
    public async putObject(
        params: ParamsType
    ): Promise<BucketClientResultType> {
        if (params.Bucket === "test") {
            return Promise.resolve({ success: true });
        }
        return Promise.resolve({
            success: false,
            error: new Error("Bucket not found"),
        });
    }
    public async deleteObject(
        params: ParamsType
    ): Promise<BucketClientResultType> {
        if (params.Bucket === "test") {
            return Promise.resolve({ success: true });
        }
        return Promise.resolve({
            success: false,
            error: new Error("Bucket not found"),
        });
    }
    public async getObject(params: ParamsType): Promise<any> {
        if (params.Bucket === "test" && params.Key === "test") {
            return Promise.resolve({
                success: true,
                result: Buffer.from("test"),
            });
        }

        if (params.Bucket === "test" && params.Key === "invalid") {
            return Promise.resolve({
                success: false,
                error: new Error("Object not found"),
            });
        }

        return Promise.resolve({
            success: false,
            error: new Error("Bucket not found"),
        });
    }
}
