export function validateRequest(schema) {
    return (request, _response, next) => {
        const result = schema.parse({
            body: request.body,
            params: request.params,
            query: request.query,
        });
        request.body = result.body;
        request.params = result.params;
        request.query = result.query;
        next();
    };
}
