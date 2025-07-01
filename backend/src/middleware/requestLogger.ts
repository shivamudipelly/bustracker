import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // Log incoming request
  logger.info(`[REQUEST] ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Capture response data
  const oldJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - start;
    logger.info(`[RESPONSE] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`, {
      status: res.statusCode,
      response: data,
    });
    // @ts-ignore
    return oldJson.call(this, data);
  };

  next();
}
