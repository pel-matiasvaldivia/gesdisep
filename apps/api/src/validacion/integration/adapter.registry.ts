import { Injectable } from "@nestjs/common";
import { Organismo } from "@gesdisep/shared";
import { OrganismoPort } from "./organismo.port";
import { RenaperAdapter } from "./adapters/renaper.adapter";
import { AfipAdapter } from "./adapters/afip.adapter";
import { AtmAdapter } from "./adapters/atm.adapter";
import { DpjAdapter } from "./adapters/dpj.adapter";
import { ReincidenciaAdapter } from "./adapters/reincidencia.adapter";

/**
 * Registro central de adaptadores. Resuelve el puerto correspondiente a un
 * organismo. Los organismos sin adaptador devuelven undefined → verificación
 * manual.
 */
@Injectable()
export class AdapterRegistry {
  private readonly mapa = new Map<Organismo, OrganismoPort>();

  constructor(
    renaper: RenaperAdapter,
    afip: AfipAdapter,
    atm: AtmAdapter,
    dpj: DpjAdapter,
    reincidencia: ReincidenciaAdapter,
  ) {
    [renaper, afip, atm, dpj, reincidencia].forEach((a) =>
      this.mapa.set(a.organismo, a),
    );
  }

  get(organismo: Organismo): OrganismoPort | undefined {
    return this.mapa.get(organismo);
  }

  tieneAdaptador(organismo: Organismo): boolean {
    return this.mapa.has(organismo);
  }
}
