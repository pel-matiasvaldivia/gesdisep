import { Module } from "@nestjs/common";
import { CredencialesService } from "./credenciales.service";
import { CredencialesController } from "./credenciales.controller";

@Module({
  providers: [CredencialesService],
  controllers: [CredencialesController],
  exports: [CredencialesService],
})
export class CredencialesModule {}
