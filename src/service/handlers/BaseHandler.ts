import { LoggerInterface } from "../../utils/logger/LoggerInterface";
import { HandlerInterface, ProcessingContext } from "./HandlerInterface";

export abstract class BaseHandler implements HandlerInterface {
    protected next: BaseHandler | null = null;
    protected readonly logger: LoggerInterface;

    constructor(logger: LoggerInterface) {
        this.logger = logger;
    }

    public setNext(handler: BaseHandler): BaseHandler {
        this.next = handler;
        return handler;
    }

    public async handle(context: ProcessingContext): Promise<boolean> {
        const result = await this.processRequest(context);
        
        if (result && this.next) {
            return await this.next.handle(context);
        }
        
        return result;
    }

    protected abstract processRequest(context: ProcessingContext): Promise<boolean>;
} 