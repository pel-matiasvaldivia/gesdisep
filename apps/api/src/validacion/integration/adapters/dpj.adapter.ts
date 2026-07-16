import { Injectable } from "@nestjs/common";
import { Organismo, normalizarCuit } from "@gesdisep/shared";
import { BaseAdapter } from "../base.adapter";
import { VerificacionInput, VerificacionResult } from "../organismo.port";

/** Dirección de Personas Jurídicas y Registro Público de Mendoza. */
@Injectable()
export class DpjAdapter extends BaseAdapter {
  readonly organismo = Organismo.DPJ;

  protected async real(_input: VerificacionInput): Promise<VerificacionResult> {
    return this.result("NO_DISPONIBLE", { motivo: "Integración DPJ pendiente de convenio" }, "DPJ");
  }

  protected async stub(input: VerificacionInput): Promise<VerificacionResult> {
    const cuit = normalizarCuit(input.identificador);
    const enQuiebra = this.hash(cuit + "q") % 20 === 0; // ~5%
    return this.result(enQuiebra ? "RECHAZO" : "OK", {
      cuit,
      inscripta: true,
      tipoSocietario: (input.extra?.tipoPersona as string) ?? "SA",
      enQuiebra,
    }, "DPJ (stub)");
  }
}
