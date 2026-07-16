import { Module } from "@nestjs/common";
import { PrestadoresService } from "./prestadores.service";
import { PrestadoresController } from "./prestadores.controller";

@Module({
  providers: [PrestadoresService],
  controllers: [PrestadoresController],
  exports: [PrestadoresService],
})
export class PrestadoresModule {}
