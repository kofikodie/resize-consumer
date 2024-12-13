export class ClientError extends Error {
    constructor(message: string, options: ErrorOptions) {
        super(message);
        this.name = options.name;
        this.stack = options.stack;
    }
}

export type ErrorOptions = {
    name: string;
    stack: string;
};
