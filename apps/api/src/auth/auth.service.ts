import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import type { JwtPayload } from "./jwt.strategy";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.usuario.findUnique({ where: { email } });
    if (!user || !user.activo) throw new UnauthorizedException("Credenciales inválidas");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Credenciales inválidas");

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      prestadorId: user.prestadorId,
    };
    return {
      accessToken: await this.jwt.signAsync(payload),
      user: { id: user.id, email: user.email, nombre: user.nombre, roles: user.roles },
    };
  }

  async registrarEmpresa(email: string, password: string, nombre: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.usuario.create({
      data: { email, passwordHash, nombre, roles: ["EMPRESA"] },
    });
    return this.login(email, password).then((r) => ({ ...r, id: user.id }));
  }
}
