import { Body, Controller, Post } from "@nestjs/common";
import { z } from "zod";
import { AuthService } from "./auth.service";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const registroSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  nombre: z.string().min(2),
});

@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post("login")
  login(@Body() body: unknown) {
    const { email, password } = loginSchema.parse(body);
    return this.auth.login(email, password);
  }

  @Post("registro")
  registro(@Body() body: unknown) {
    const { email, password, nombre } = registroSchema.parse(body);
    return this.auth.registrarEmpresa(email, password, nombre);
  }
}
