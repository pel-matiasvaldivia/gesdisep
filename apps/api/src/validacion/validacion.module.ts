import { Module } from "@nestjs/common";
import { ValidacionService } from "./validacion.service";
import { ValidacionController } from "./validacion.controller";
import { AdapterRegistry } from "./integration/adapter.registry";
import { RenaperAdapter } from "./integration/adapters/renaper.adapter";
import { AfipAdapter } from "./integration/adapters/afip.adapter";
import { AtmAdapter } from "./integration/adapters/atm.adapter";
import { DpjAdapter } from "./integration/adapters/dpj.adapter";
import { ReincidenciaAdapter } from "./integration/adapters/reincidencia.adapter";

@Module({
  providers: [
    ValidacionService,
    AdapterRegistry,
    RenaperAdapter,
    AfipAdapter,
    AtmAdapter,
    DpjAdapter,
    ReincidenciaAdapter,
  ],
  controllers: [ValidacionController],
  exports: [ValidacionService, AdapterRegistry],
})
export class ValidacionModule {}
