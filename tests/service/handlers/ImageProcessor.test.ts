import BucketAdapter from "../../../src/adapters/BucketAdapter";
import QueueAdapter from "../../../src/adapters/QueueAdapter";
import ResizeImageAdapter from "../../../src/adapters/ResizeImageAdapter";
import { ProcessingContext } from "../../../src/service/handlers/HandlerInterface";
import { ImageDownloadHandler } from "../../../src/service/handlers/ImageDownloadHandler";
import { ImageResizeHandler } from "../../../src/service/handlers/ImageResizeHandler";
import { ImageUploadHandler } from "../../../src/service/handlers/ImageUploadHandler";
import { MessageReceiveHandler } from "../../../src/service/handlers/MessageReceiveHandler";
import { ImageProcessorService } from "../../../src/service/ImageProcessor.service";
import { LoggerService } from "../../../src/utils/logger/LoggerService";
import { ForS3ClientMock } from "../../ports/ForS3Client";
import { ForSqsClientMock } from "../../ports/ForSqsClient";
import { SharpImageProcessorMock } from "../../ports/SharpImageProcessor";
import { SilentLogger } from "../../utils/SilentLogger";

describe("ImageProcessor Integration Tests", () => {
    let logger = new SilentLogger();
    it("should successfully receive a message from the queue given a valid queue url", async () => {
        const queueAdapter = new QueueAdapter(new ForSqsClientMock());
        const processingChain = new MessageReceiveHandler(queueAdapter, logger);

        const imageProcessorService = new ImageProcessorService(
            logger,
            processingChain
        );

        const context: ProcessingContext = {
            queueUrl: "valid-queue",
            imageKey: "",
            receiptHandle: "",
            tableName: "valid-table",
            primaryBucketName: "valid-bucket",
            secondaryBucketName: "valid-bucket-tmp",
        };
        const result = await imageProcessorService.processImageTask(context);

        expect(result.success).toBe(true);
        expect(result.context.imageKey).toBeDefined();
        expect(result.context.queueUrl).toBeDefined();
        expect(result.context.receiptHandle).toBeDefined();
        expect(result.context.tableName).toBeDefined();
    });

    it("should NOT be able to receive a message from the queue given an invalid queue url", async () => {
        process.env.QUEUE_URL = "invalid";

        const queueAdapter = new QueueAdapter(new ForSqsClientMock());
        const processingChain = new MessageReceiveHandler(queueAdapter, logger);

        const imageProcessorService = new ImageProcessorService(
            logger,
            processingChain
        );

        const context: ProcessingContext = {
            queueUrl: "not-existing-queue",
            imageKey: "",
            receiptHandle: "",
            tableName: "valid-table",
            primaryBucketName: "valid-bucket",
            secondaryBucketName: "valid-bucket-tmp",
        };

        const result = await imageProcessorService.processImageTask(context);

        expect(result.success).toBe(false);
        expect(result.context.imageKey).toBe("");
        expect(result.context.queueUrl).toBe("not-existing-queue");
        expect(result.context.receiptHandle).toBe("");
        expect(result.context.tableName).toBe("valid-table");
    });

    it("should be able to download an image from the bucket given a valid image key", async () => {
        const bucketAdapter = new BucketAdapter(new ForS3ClientMock());
        const processingChain = new ImageDownloadHandler(bucketAdapter, logger);

        const context: ProcessingContext = {
            queueUrl: "valid-queue",
            imageKey: "valid-key",
            receiptHandle: "valid-receipt-handle",
            tableName: "valid-table",
            primaryBucketName: "valid-bucket",
            secondaryBucketName: "valid-bucket-tmp",
        };

        const imageProcessorService = new ImageProcessorService(
            logger,
            processingChain
        );

        const result = await imageProcessorService.processImageTask(context);

        expect(result.success).toBe(true);
        expect(result.context.imageBuffer).toBeDefined();
    });

    it("should NOT be able to download an image from the bucket given an invalid image key", async () => {
        const bucketAdapter = new BucketAdapter(new ForS3ClientMock());
        const processingChain = new ImageDownloadHandler(bucketAdapter, logger);

        const context: ProcessingContext = {
            queueUrl: "valid-queue",
            imageKey: "invalid-key",
            receiptHandle: "valid-receipt-handle",
            tableName: "valid-table",
            primaryBucketName: "valid-bucket",
            secondaryBucketName: "valid-bucket-tmp",
        };

        const imageProcessorService = new ImageProcessorService(
            logger,
            processingChain
        );

        const result = await imageProcessorService.processImageTask(context);

        expect(result.success).toBe(false);
        expect(result.context.imageBuffer).toBeUndefined();
    });

    it("should be able to resize an image given a valid image buffer", async () => {
        const imageProcessor = new SharpImageProcessorMock();
        const resizeImageAdapter = new ResizeImageAdapter(imageProcessor);

        const processingChain = new ImageResizeHandler(
            resizeImageAdapter,
            logger
        );

        const context: ProcessingContext = {
            queueUrl: "valid-queue",
            imageKey: "valid-key",
            receiptHandle: "valid-receipt-handle",
            tableName: "valid-table",
            primaryBucketName: "valid-bucket",
            secondaryBucketName: "valid-bucket-tmp",
            imageBuffer: Buffer.from("valid-image-buffer"),
        };

        const imageProcessorService = new ImageProcessorService(
            logger,
            processingChain
        );

        const result = await imageProcessorService.processImageTask(context);

        expect(result.success).toBe(true);
        expect(result.context.imageBuffer).toBeDefined();
    });

    it("should NOT be able to resize an image given an invalid image buffer", async () => {
        const imageProcessor = new SharpImageProcessorMock();
        const resizeImageAdapter = new ResizeImageAdapter(imageProcessor);

        const processingChain = new ImageResizeHandler(
            resizeImageAdapter,
            logger
        );

        const context: ProcessingContext = {
            queueUrl: "valid-queue",
            imageKey: "valid-key",
            receiptHandle: "valid-receipt-handle",
            tableName: "valid-table",
            primaryBucketName: "valid-bucket",
            secondaryBucketName: "valid-bucket-tmp",
            imageBuffer: undefined,
        };

        const imageProcessorService = new ImageProcessorService(
            logger,
            processingChain
        );

        const result = await imageProcessorService.processImageTask(context);

        expect(result.success).toBe(false);
        expect(result.context.imageBuffer).toBeUndefined();
    });

    it("should be able to upload an image to the bucket given a valid image buffer", async () => {
        const realLogger = LoggerService.getInstance();
        const bucketAdapter = new BucketAdapter(new ForS3ClientMock());
        const processingChain = new ImageUploadHandler(
            bucketAdapter,
            realLogger
        );

        const context: ProcessingContext = {
            queueUrl: "valid-queue",
            imageKey: "valid-key",
            receiptHandle: "valid-receipt-handle",
            tableName: "valid-table",
            primaryBucketName: "valid-bucket",
            secondaryBucketName: "valid-bucket-tmp",
            imageBuffer: Buffer.from("valid-image-buffer"),
            resizedBuffer: Buffer.from("valid-image-buffer"),
        };

        const imageProcessorService = new ImageProcessorService(
            logger,
            processingChain
        );

        const result = await imageProcessorService.processImageTask(context);

        expect(result.success).toBe(true);
        expect(result.context.imageBuffer).toBeDefined();
    });

    it("should NOT be able to upload an image to the bucket given an invalid image buffer", async () => {
        const bucketAdapter = new BucketAdapter(new ForS3ClientMock());
        const processingChain = new ImageUploadHandler(bucketAdapter, logger);

        const context: ProcessingContext = {
            queueUrl: "valid-queue",
            imageKey: "valid-key",
            receiptHandle: "valid-receipt-handle",
            tableName: "valid-table",
            primaryBucketName: "valid-bucket",
            secondaryBucketName: "valid-bucket-tmp",
            imageBuffer: Buffer.from("valid-image-buffer"),
            resizedBuffer: undefined,
        };

        const imageProcessorService = new ImageProcessorService(
            logger,
            processingChain
        );

        const result = await imageProcessorService.processImageTask(context);

        expect(result.success).toBe(false);
        expect(result.context.resizedBuffer).toBeUndefined();
    });


    
});
