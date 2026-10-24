import bcrypt from "bcryptjs";
import { ConflictError } from "../../errors/AppError";
import { RegisterInput } from "./auth.schema";
import { UserRepository } from "./auth.repository";

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
}
