import { Module } from "@nestjs/common";
import { LegajosService } from "./legajos.service";
import { LegajosController } from "./legajos.controller";

@Module({
  providers: [LegajosService],
  controllers: [LegajosController],
  exports: [LegajosService],
})
export class LegajosModule {}
