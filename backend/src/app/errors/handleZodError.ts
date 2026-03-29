import { ZodError, ZodIssue } from 'zod';
import { TErrorSources, TGenericErrorResponse } from '../interface/error';

const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSources = err.issues.map((issue: ZodIssue) => {
    const rawPath = issue.path.length > 0 ? issue.path[issue.path.length - 1] : '';
    const path: string | number =
      typeof rawPath === 'symbol'
        ? rawPath.toString()
        : (rawPath as string | number);

    return {
      path,
      message: issue.message,
    };
  });

  const statusCode = 400;

  return {
    statusCode,
    message: 'Validation Error',
    errorSources,
  };
};

export default handleZodError;