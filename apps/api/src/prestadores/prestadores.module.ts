import { Module } from "@nestjs/common";
import { PrestadoresService } from "./prestadores.service";
import { PrestadoresController } from "./prestadores.controller";
import { PublicoController } from "./publico.controller";

@Module({
  providers: [PrestadoresService],
  controllers: [PrestadoresController, PublicoController],
  exports: [PrestadoresService],
})
export class PrestadoresModule {}
