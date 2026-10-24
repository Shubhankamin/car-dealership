import { api } from "./client";
import type { AuthResponse, User } from "../types";

export async function register(email: string, password: string): Promise<User> {
  const { data } = await api.post<{ user: User }>("/auth/register", {
    email,
    password,
  });
  return data.user;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}
