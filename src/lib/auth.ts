import { NextResponse } from "next/server";

const TOKEN_HEADER = "x-admin-token";

export function createToken(password: string): string {
  return Buffer.from(`cjs:${password}`).toString("base64");
}

export function checkPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return password === adminPassword;
}

export function verifyRequest(request: Request): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;

  const token = request.headers.get(TOKEN_HEADER);
  if (!token) return false;

  try {
    const decoded = Buffer.from(token, "base64").toString();
    return decoded === `cjs:${adminPassword}`;
  } catch {
    return false;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
