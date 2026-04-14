export function registerErrorHandlers(app: any) {
  app.setNotFoundHandler((req: any, reply: any) => {
    reply.code(404).send({
      error: { code: 'NOT_FOUND', message: 'Not Found', path: req.url },
    });
  });

  app.setErrorHandler((err: any, req: any, reply: any) => {
    const status = err?.statusCode ?? err?.status ?? (err?.validation ? 400 : 500);

    const payload: Record<string, any> = {
      error: {
        code: err?.validation
          ? 'VALIDATION_ERROR'
          : err?.code ?? (status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST'),
        message: err?.message ?? 'Server Error',
      },
    };

    if (err?.validation) payload.error.details = err.validation;
    if (err?.errors) payload.error.details = err.errors;

    if (process.env.NODE_ENV !== 'production' && err?.stack) {
      payload.error.stack = err.stack;
    }

    const errno = err?.errno ?? err?.cause?.errno;
    const sqlMessage = err?.sqlMessage ?? err?.cause?.sqlMessage;
    if (errno != null || sqlMessage) {
      payload.error.mysql = {
        ...(errno != null ? { errno: Number(errno) } : {}),
        ...(sqlMessage ? { sqlMessage: String(sqlMessage) } : {}),
        ...(err?.code ? { code: String(err.code) } : {}),
      };
    }

    req.log?.error?.(err, 'request_failed');
    reply.code(status).send(payload);
  });
}
