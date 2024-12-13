import {
    MetadataDbAdapterInterface,
    ImageMetadata,
    MetadataDbAdapterResultType,
} from "./ports/MetaDataDBAdapterInterface";
import * as dotenv from "dotenv";
import { MetaDataDbClientInterface } from "../driven/ports/MetadataDbClientInterface";
import { ClientError } from "../driven/ClientError";

dotenv.config();

export default class MetadataDBAdapter implements MetadataDbAdapterInterface {
    private readonly metadataDb: MetaDataDbClientInterface;

    constructor(
        metadataDb: MetaDataDbClientInterface
    ) {
        this.metadataDb = metadataDb;
    }
    public async getItem(
        id: string,
        tableName: string
    ): Promise<MetadataDbAdapterResultType> {
        const result = await this.metadataDb.getItem(id, tableName);
        if (!result.success) {
            return {
                success: false,
                error: new ClientError("Failed to get item", {
                    name: "Failed to get item",
                    stack:
                        result.error instanceof Error
                            ? `${result.error.message} ${result.error.stack} ${result.error.name}`
                            : String(result.error),
                }),
            };
        }
        return { success: true, result: result.result as ImageMetadata };
    }
    public async updateStatus(
        id: string,
        imageStatus: Pick<ImageMetadata, "status">,
        tableName: string
    ): Promise<MetadataDbAdapterResultType> {
        const result = await this.metadataDb.updateStatus(
            id,
            imageStatus.status,
            tableName
        );
        if (!result.success) {
            return {
                success: false,
                error: new ClientError("Failed to update status", {
                    name: "Failed to update status",
                    stack:
                        result.error instanceof Error
                            ? `${result.error.message} ${result.error.stack} ${result.error.name}`
                            : String(result.error),
                }),
            };
        }

        return { success: true };
    }
}
