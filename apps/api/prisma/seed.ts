import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { Rol } from "@gesdisep/shared";

const prisma = new PrismaClient();

/**
 * Semilla de usuarios internos por rol (RBAC) para desarrollo.
 * Contraseña común: "gesdisep123".
 */
const USUARIOS: { email: string; nombre: string; roles: Rol[] }[] = [
  { email: "admin@disep.mendoza.gob.ar", nombre: "Administrador", roles: [Rol.ADMIN] },
  { email: "mesa@disep.mendoza.gob.ar", nombre: "Mesa de Entradas", roles: [Rol.MESA_ENTRADAS] },
  { email: "analista@disep.mendoza.gob.ar", nombre: "Analista Documental", roles: [Rol.ANALISTA] },
  { email: "inspector@disep.mendoza.gob.ar", nombre: "Inspector", roles: [Rol.INSPECTOR] },
  { email: "director@disep.mendoza.gob.ar", nombre: "Director DI.SE.P.", roles: [Rol.DIRECTOR] },
  { email: "auditor@disep.mendoza.gob.ar", nombre: "Auditor", roles: [Rol.AUDITOR] },
];

async function main() {
  const passwordHash = await bcrypt.hash("gesdisep123", 10);

  for (const u of USUARIOS) {
    await prisma.usuario.upsert({
      where: { email: u.email },
      update: { roles: u.roles, nombre: u.nombre },
      create: { email: u.email, nombre: u.nombre, roles: u.roles, passwordHash },
    });
  }

  // Empresa demo + usuario empresa.
  await prisma.usuario.upsert({
    where: { email: "empresa@ejemplo.com" },
    update: {},
    create: {
      email: "empresa@ejemplo.com",
      nombre: "Empresa Demo",
      roles: [Rol.EMPRESA],
      passwordHash,
    },
  });

  // Persona demo para emitir credencial.
  await prisma.persona.upsert({
    where: { dni: "30111222" },
    update: {},
    create: {
      nombre: "Juan",
      apellido: "Pérez",
      dni: "30111222",
      cuil: "20-30111222-3",
      residenciaProv: true,
    },
  });

  // eslint-disable-next-line no-console
  console.log(`Seed completo: ${USUARIOS.length + 1} usuarios. Password: gesdisep123`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
