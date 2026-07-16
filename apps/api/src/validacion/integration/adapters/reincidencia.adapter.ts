import { Injectable } from "@nestjs/common";
import { Organismo } from "@gesdisep/shared";
import { BaseAdapter } from "../base.adapter";
import { VerificacionInput, VerificacionResult } from "../organismo.port";

/** Registro Nacional de Reincidencia — antecedentes penales por DNI. */
@Injectable()
export class ReincidenciaAdapter extends BaseAdapter {
  readonly organismo = Organismo.REINCIDENCIA;

  protected async real(_input: VerificacionInput): Promise<VerificacionResult> {
    return this.result("NO_DISPONIBLE", { motivo: "Integración RNR pendiente de convenio" }, "RNR");
  }

  protected async stub(input: VerificacionInput): Promise<VerificacionResult> {
    const dni = input.identificador.replace(/\D/g, "");
    const conAntecedentes = this.hash(dni + "pen") % 12 === 0; // ~8%
    return this.result(conAntecedentes ? "RECHAZO" : "OK", {
      dni,
      antecedentesPenales: conAntecedentes,
      procesosPendientesDolosos: false,
    }, "RNR (stub)");
  }
}
