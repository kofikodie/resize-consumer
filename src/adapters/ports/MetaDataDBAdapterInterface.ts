import { ClientError } from "../../driven/ClientError";

export interface ImageMetadata {
    id: string;
    originalName: string;
    size: number;
    mimeType: string;
    createdAt: string;
    status: "pending" | "processed" | "error";
}

export interface MetadataDbAdapterInterface {
    getItem(id: string, tableName: string): Promise<MetadataDbAdapterResultType>;
    updateStatus(
        id: string,
        status: Pick<ImageMetadata, "status">,
        tableName: string
    ): Promise<MetadataDbAdapterResultType>;
}

export type MetadataDbAdapterResultType = {
    success: boolean;
    error?: ClientError;
    result?: ImageMetadata;
};
