import { LoggerInterface } from "../../src/utils/logger/LoggerInterface";

export class SilentLogger implements LoggerInterface {
    public info(): void {}
    public error(): void {}
    public warn(): void {}
    public debug(): void {}
    public logApiRequest(): void {}
    public logAwsOperation(): void {}
    public logError(): void {}
} 