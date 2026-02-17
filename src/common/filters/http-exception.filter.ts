import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
        ? (exceptionResponse as { message: string | string[] }).message
        : status === 500
          ? 'Internal server error'
          : 'Unexpected error';

    const error =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'error' in exceptionResponse
        ? String((exceptionResponse as { error: unknown }).error)
        : HttpStatus[status];

    if (!(exception instanceof HttpException)) {
      // Keep unexpected runtime errors visible in server logs for local debugging.
      // eslint-disable-next-line no-console
      console.error(exception);
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
