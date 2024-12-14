export interface MetaDataDbClientInterface {
    getItem(id: string, tableName: string): Promise<MetadataDbClientResultType>;
    updateStatus(
        id: string,
        status: string,
        tableName: string
    ): Promise<MetadataDbClientResultType>;
}

export type MetadataDbClientResultType = {
    success: boolean;
    error?: unknown;
    result?: Record<string, any>;
};
