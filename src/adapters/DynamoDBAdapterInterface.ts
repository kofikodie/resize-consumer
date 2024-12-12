export interface ImageMetadata {
    id: string;
    originalName: string;
    size: number;
    mimeType: string;
    createdAt: string;
    status: 'pending' | 'processed' | 'error';
}

export interface DynamoDBAdapterInterface {
    getItem(id: string): Promise<ImageMetadata | { error: string }>;
    updateStatus(id: string, status: ImageMetadata['status']): Promise<{ success: boolean } | { error: string }>;
} 