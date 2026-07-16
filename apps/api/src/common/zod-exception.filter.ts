import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { ZodError } from "zod";

/**
 * Mapea los errores de validación de Zod a HTTP 400 con el detalle de los
 * campos, en vez de un 500 genérico.
 */
@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    // getResponse() es el Response de Express (sin tipar para no depender de @types/express).
    const res = host.switchToHttp().getResponse();
    res.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      error: "Bad Request",
      message: "Datos de entrada inválidos",
      issues: exception.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }
}
