export function notFoundHandler(request, response) {
    return response.status(404).json({
        error: "NotFound",
        message: `Route ${request.method} ${request.path} was not found`,
    });
}
