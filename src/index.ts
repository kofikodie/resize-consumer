import { ImageProcessorService } from "./service/image-processor.service";
import { LoggerService } from "./utils/logger/LoggerService";

async function main() {
    const logger = LoggerService.getInstance();
    const processor = new ImageProcessorService(logger);

    try {
        processor.validateEnvironment();
        await processor.processImageTask();
    } catch (error) {
        logger.error("Fatal error in main process", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        process.exit(1);
    }
}

main();
