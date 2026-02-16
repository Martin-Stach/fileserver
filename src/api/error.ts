export class BadRequestError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class UnauthorizedError extends Error {
    constructor() {
        super("401 Unauthorized");
    }
}

export class ForbiddenError extends Error {
    constructor() {
        super("403 Forbidden");
    }
}

export class NotFoundError extends Error {
    constructor() {
        super("404 Not Found");
    }
}

