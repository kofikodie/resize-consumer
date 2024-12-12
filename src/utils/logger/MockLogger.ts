import { LoggerInterface } from './LoggerInterface';

export class MockLogger implements LoggerInterface {
    public logs: Array<{level: string; message: string; meta?: Record<string, unknown>}> = [];

    public info(message: string, meta?: Record<string, unknown>): void {
        this.logs.push({ level: 'info', message, meta });
    }

    public error(message: string, meta?: Record<string, unknown>): void {
        this.logs.push({ level: 'error', message, meta });
    }

    public warn(message: string, meta?: Record<string, unknown>): void {
        this.logs.push({ level: 'warn', message, meta });
    }

    public debug(message: string, meta?: Record<string, unknown>): void {
        this.logs.push({ level: 'debug', message, meta });
    }

    public logApiRequest(method: string, path: string, meta?: Record<string, unknown>): void {
        this.info(`API Request: ${method} ${path}`, meta);
    }

    public logAwsOperation(service: string, operation: string, meta?: Record<string, unknown>): void {
        this.info(`AWS Operation: ${service} ${operation}`, meta);
    }

    public logError(error: Error, context: string, meta?: Record<string, unknown>): void {
        this.error(`${context}: ${error.message}`, {
            ...meta,
            stack: error.stack,
            name: error.name
        });
    }

    public clear(): void {
        this.logs = [];
    }

    public getLogsByLevel(level: string): Array<{message: string; meta?: Record<string, unknown>}> {
        return this.logs
            .filter(log => log.level === level)
            .map(({ message, meta }) => ({ message, meta }));
    }
} 