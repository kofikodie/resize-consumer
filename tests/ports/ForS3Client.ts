import {
    BucketClientInterface,
    BucketClientResultType,
    ParamsType,
} from "../../src/driven/ports/BucketClientInterface";

export class ForS3ClientMock implements BucketClientInterface {
    public async putObject(
        params: ParamsType
    ): Promise<BucketClientResultType> {
        if (params.Bucket === "valid-bucket") {
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
        if (params.Bucket === "valid-bucket") {
            return Promise.resolve({ success: true });
        }
        return Promise.resolve({
            success: false,
            error: new Error("Bucket not found"),
        });
    }
    public async getObject(params: ParamsType): Promise<any> {
        if (params.Bucket === "valid-bucket" && params.Key === "valid-key") {
            return Promise.resolve({
                success: true,
                result: Buffer.from("test-image-data"),
            });
        }

        if (params.Bucket === "valid-bucket" && params.Key === "invalid-key") {
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
