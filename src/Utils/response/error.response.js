export const errorResponse = (message ="Error", statusCode = 400, extra = undefined) => {
    const error = new Error(typeof message === "string" ? message : message?.message);
    error.statusCode = statusCode;
    error.extra = extra;
    throw error;
};

export const badRequest = (message = "Bad Request", extra) => {
    return errorResponse(message, 400, extra);
};
export const conflict = (message = "Conflict", extra) => {
    return errorResponse(message, 409, extra);
}
export const notFound = (message = "Not Found", extra) => {
    return errorResponse(message, 404, extra);
}
export const forbidden = (message = "Forbidden", extra) => {
    return errorResponse(message, 403, extra);
}
export const unauthorized = (message = "Unauthorized", extra) => {
    return errorResponse(message, 401, extra);
}
export const serverError = (message = "Server Error", extra) => {
    return errorResponse(message, 500, extra);
}

export const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const extra = err.extra || undefined;
    return res.status(statusCode).json({  message: err.message, stack: err.stack , extra });
};

