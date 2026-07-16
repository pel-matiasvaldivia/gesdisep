import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ZodExceptionFilter } from "./common/zod-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? "*" });
  // La validación de entrada se realiza con Zod en cada controlador;
  // este filtro traduce los ZodError a HTTP 400.
  app.useGlobalFilters(new ZodExceptionFilter());
  const port = Number(process.env.API_PORT ?? 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`GESDISEP API escuchando en http://localhost:${port}/api`);
}
bootstrap();
