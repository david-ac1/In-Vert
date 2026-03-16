function write(level, message, meta) {
    const payload = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...(meta ?? {}),
    };
    console[level === "info" ? "log" : level](JSON.stringify(payload));
}
export const logger = {
    info: (message, meta) => write("info", message, meta),
    warn: (message, meta) => write("warn", message, meta),
    error: (message, meta) => write("error", message, meta),
};
