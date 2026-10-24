import { PrismaClient, User } from "@prisma/client";

/** Abstraction the service depends on (Dependency Inversion). */
export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: { email: string; passwordHash: string }): Promise<User>;
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: PrismaClient) {}

  findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  create(data: { email: string; passwordHash: string }) {
    return this.db.user.create({ data });
  }
}
