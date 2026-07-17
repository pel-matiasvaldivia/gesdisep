import { Injectable, Logger } from "@nestjs/common";
import { mkdir, readFile, writeFile } from "fs/promises";
import * as path from "path";

/**
 * Puerto de almacenamiento de documentos. La implementación actual escribe en
 * disco local (montado como volumen en Docker). Para migrar a MinIO/S3 basta
 * con otra implementación de esta interfaz sin tocar el dominio.
 */
export interface StoragePort {
  guardar(ref: string, contenido: Buffer): Promise<void>;
  leer(ref: string): Promise<Buffer>;
}

@Injectable()
export class StorageService implements StoragePort {
  private readonly logger = new Logger(StorageService.name);
  // "||" (no "??") para que un STORAGE_DIR vacío también caiga al default.
  private readonly baseDir =
    process.env.STORAGE_DIR || path.join(process.cwd(), "storage");

  /** Resuelve la ruta absoluta impidiendo path traversal fuera del baseDir. */
  private rutaSegura(ref: string): string {
    const destino = path.resolve(this.baseDir, ref);
    if (!destino.startsWith(path.resolve(this.baseDir) + path.sep)) {
      throw new Error("Referencia de archivo inválida");
    }
    return destino;
  }

  async guardar(ref: string, contenido: Buffer): Promise<void> {
    const destino = this.rutaSegura(ref);
    await mkdir(path.dirname(destino), { recursive: true });
    await writeFile(destino, contenido);
    this.logger.log(`Documento guardado: ${ref} (${contenido.length} bytes)`);
  }

  async leer(ref: string): Promise<Buffer> {
    return readFile(this.rutaSegura(ref));
  }
}
