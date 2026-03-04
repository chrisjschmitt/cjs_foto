import { NextResponse } from "next/server";

const TOKEN_HEADER = "x-admin-token";

export function generateToken(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const validTokens: Set<string> = new Set();

export function addToken(token: string) {
  validTokens.add(token);
}

export function checkPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return password === adminPassword;
}

export function verifyRequest(request: Request): boolean {
  const token = request.headers.get(TOKEN_HEADER);
  if (!token) return false;
  return validTokens.has(token);
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
