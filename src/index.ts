import S3Adapter from "./adapters/S3Adapter";
import SQSAdapter from "./adapters/SqsAdapter";
import ResizeImageAdapter from "./adapters/ResizeImageAdapter";

async function processImageTask() {
    const sqs = new SQSAdapter();
    const imageKey = await sqs.getMessage();

    if (
        !imageKey ||
        "error" in imageKey ||
        !imageKey.Body ||
        !imageKey.ReceiptHandle
    ) {
        if ("error" in imageKey) {
            console.error(imageKey.error);
            return;
        }
        console.log("No message found");
        return;
    }

    const s3 = new S3Adapter();

    const imageBuffer = await s3.getImageByKey(
        process.env.BUCKET_NAME_TMP ?? "",
        imageKey.Body
    );
    if ("error" in imageBuffer) {
        console.log(
            "Error downloading image",
            imageKey.Body,
            imageBuffer.error,
            imageKey
        );
        await sqs.deleteMessage(imageKey.ReceiptHandle);

        return;
    }

    const resizedBuffer = await new ResizeImageAdapter().resizeImage(
        imageBuffer,
        100,
        100
    );
    console.log(imageBuffer);
    const newKey = await s3.storeImage(
        resizedBuffer,
        `resized_${imageKey.Body}`,
        process.env.BUCKET_NAME ?? "",
        imageKey.Body
    );

    console.log(
        `Image resized and stored in ${process.env.BUCKET_NAME} with key ${newKey}`
    );

    Promise.all([
        s3.deleteImageByKey(process.env.BUCKET_NAME_TMP ?? "", imageKey.Body),
        sqs.deleteMessage(imageKey.ReceiptHandle),
    ]).then(() => {
        console.log(
            "Image deleted from tmp bucket and message deleted from queue"
        );
    });
}

async function main() {
    try {
        if (
            !process.env.QUEUE_NAME ||
            !process.env.QUEUE_URL ||
            !process.env.BUCKET_NAME ||
            !process.env.BUCKET_NAME_TMP ||
            !process.env.AWS_DEFAULT_REGION
        ) {
            console.log("MISSING Some or all env variables");
        } else {
            await processImageTask();
        }
    } catch (err) {
        console.error("Fatal error in the script:", err);
        process.exit(1); // Exit with error code
    }
}

main();
