import { ErrorCode } from "../config/errors.config";

export class RouteError extends Error {
    status: string;

    constructor(status: ErrorCode, message: string = "") {
        super(message);
        this.status = status;
    }
}
