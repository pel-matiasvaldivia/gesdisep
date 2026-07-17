import { Module } from "@nestjs/common";
import { DocumentosService } from "./documentos.service";
import { DocumentosController } from "./documentos.controller";
import { StorageService } from "./storage.service";
import { LegajosModule } from "../legajos/legajos.module";

@Module({
  imports: [LegajosModule],
  providers: [DocumentosService, StorageService],
  controllers: [DocumentosController],
  exports: [DocumentosService],
})
export class DocumentosModule {}
