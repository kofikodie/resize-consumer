import BucketAdapter from "../../src/adapters/BucketAdapter";
import { ClientError } from "../../src/driven/ClientError";
import { ForS3ClientMock } from "../ports/ForS3Client";

describe("BucketAdapter", () => {
    it("should be able to store an image given a valid bucket name, image name, key and buffer", async () => {
        const bucketAdapter = new BucketAdapter(new ForS3ClientMock());
        const bucketName = "test";
        const imageName = "test";
        const key = "test";
        const result = await bucketAdapter.storeImage(
            Buffer.from("test"),
            imageName,
            bucketName,
            key
        );
        expect(result.success).toBe(true);
    });

    it("should be able to get an image given a valid bucket name and key", async () => {
        const bucketAdapter = new BucketAdapter(new ForS3ClientMock());
        const bucketName = "test";
        const key = "test";
        const result = await bucketAdapter.getImageByKey(bucketName, key);
        expect(result.success).toBe(true);
    });

    it("should be able to delete an image given a valid bucket name and key", async () => {
        const bucketAdapter = new BucketAdapter(new ForS3ClientMock());
        const bucketName = "test";
        const key = "test";
        const result = await bucketAdapter.deleteImageByKey(bucketName, key);
        expect(result.success).toBe(true);
    });

    it("should NOT be able to store an image given an invalid bucket name", async () => {
        const bucketAdapter = new BucketAdapter(new ForS3ClientMock());
        const bucketName = "invalid";
        const imageName = "test";
        const key = "test";
        const result = await bucketAdapter.storeImage(
            Buffer.from("test"),
            imageName,
            bucketName,
            key
        );

        expect(result.error).toBeInstanceOf(ClientError);
        expect(result.error?.message).toBe("Failed to store object");
        expect(result.error?.name).toBe("Failed to store object");
        expect(result.error?.stack).toContain(
            "Bucket not found Error: Bucket not found"
        );
        expect(result.success).toBe(false);
    });

    it("should NOT be able to get an image given an invalid bucket name", async () => {
        const bucketAdapter = new BucketAdapter(new ForS3ClientMock());
        const bucketName = "invalid";
        const key = "test";
        const result = await bucketAdapter.getImageByKey(bucketName, key);

        expect(result.error).toBeInstanceOf(ClientError);
        expect(result.error?.message).toBe("Failed to get object");
        expect(result.error?.name).toBe("Failed to get object");
        expect(result.error?.stack).toContain(
            "Bucket not found Error: Bucket not found"
        );

        expect(result.success).toBe(false);
    });

    it("should NOT be able to delete an image given an invalid bucket name", async () => {
        const bucketAdapter = new BucketAdapter(new ForS3ClientMock());
        const bucketName = "invalid";
        const key = "test";
        const result = await bucketAdapter.deleteImageByKey(bucketName, key);

        expect(result.error).toBeInstanceOf(ClientError);
        expect(result.error?.message).toBe("Failed to delete object");
        expect(result.error?.name).toBe("Failed to delete object");
        expect(result.error?.stack).toContain(
            "Bucket not found Error: Bucket not found"
        );

        expect(result.success).toBe(false);
    });

    it("should NOT be able to get an image given an invalid key", async () => {
        const bucketAdapter = new BucketAdapter(new ForS3ClientMock());
        const bucketName = "test";
        const key = "invalid";
        const result = await bucketAdapter.getImageByKey(bucketName, key);

        expect(result.error).toBeInstanceOf(ClientError);
        expect(result.error?.message).toBe("Failed to get object");
        expect(result.error?.name).toBe("Failed to get object");
        expect(result.error?.stack).toContain(
            "Object not found Error: Object not found"
        );

        expect(result.success).toBe(false);
    });
});
