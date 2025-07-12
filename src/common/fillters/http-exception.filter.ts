import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // switchToHttp responsible for  handling an HTTP request, so give me access
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionRes = isHttpException ? exception.getResponse() : null;

    let message = 'Internal server error';
    let error: Record<string, any> = {};

    if (
      typeof exceptionRes === 'object' &&
      exceptionRes !== null &&
      'message' in exceptionRes
    ) {
      const responseObj = exceptionRes as Record<string, any>;

      message = responseObj.message ?? 'Internal server error';

      if ('error' in responseObj) {
        error = responseObj.error;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    res.status(status).json({
      statusCode: status,
      message,
      error: Object.keys(error).length > 0 ? error : undefined,
    });
  }
}
