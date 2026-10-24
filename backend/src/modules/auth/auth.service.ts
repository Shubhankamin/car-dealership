import bcrypt from "bcryptjs";
import { ConflictError } from "../../errors/AppError";
import { RegisterInput } from "./auth.schema";
import { UserRepository } from "./auth.repository";
import { UnauthorizedError } from "../../errors/AppError";
import { LoginInput } from "./auth.schema";
import { signToken } from "./token";
export interface PublicUser {
  id: string;
  email: string;
  role: string;
}

export class AuthService {
  constructor(private readonly users: UserRepository) {}

  async register({ email, password }: RegisterInput): Promise<PublicUser> {
    if (await this.users.findByEmail(email)) {
      throw new ConflictError("Email already registered");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.create({ email, passwordHash });
    return { id: user.id, email: user.email, role: user.role };
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{ token: string; user: PublicUser }> {
    const user = await this.users.findByEmail(email);
    const valid = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;
    if (!user || !valid) {
      throw new UnauthorizedError("Invalid email or password");
    }
    return {
      token: signToken({ sub: user.id, role: user.role }),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
