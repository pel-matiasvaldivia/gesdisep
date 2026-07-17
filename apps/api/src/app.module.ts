import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { PrestadoresModule } from "./prestadores/prestadores.module";
import { LegajosModule } from "./legajos/legajos.module";
import { ValidacionModule } from "./validacion/validacion.module";
import { CredencialesModule } from "./credenciales/credenciales.module";
import { DocumentosModule } from "./documentos/documentos.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PrestadoresModule,
    LegajosModule,
    ValidacionModule,
    CredencialesModule,
    DocumentosModule,
  ],
})
export class AppModule {}
