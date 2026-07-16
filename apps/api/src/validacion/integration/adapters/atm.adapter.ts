import { Injectable } from "@nestjs/common";
import { Organismo, normalizarCuit } from "@gesdisep/shared";
import { BaseAdapter } from "../base.adapter";
import { VerificacionInput, VerificacionResult } from "../organismo.port";

/** ATM Mendoza — inscripción provincial, deudas exigibles y tasas. */
@Injectable()
export class AtmAdapter extends BaseAdapter {
  readonly organismo = Organismo.ATM;

  protected async real(_input: VerificacionInput): Promise<VerificacionResult> {
    return this.result("NO_DISPONIBLE", { motivo: "Integración ATM pendiente de convenio" }, "ATM");
  }

  protected async stub(input: VerificacionInput): Promise<VerificacionResult> {
    const cuit = normalizarCuit(input.identificador);
    const conDeuda = this.hash(cuit) % 5 === 0; // ~20% con deuda
    return this.result(conDeuda ? "RECHAZO" : "OK", {
      cuit,
      deudaExigible: conDeuda,
      tasaAnualPaga: !conDeuda,
    }, "ATM (stub)");
  }
}
