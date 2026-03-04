import { NextResponse } from "next/server";
import { checkPassword, generateToken, addToken } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured in environment variables." },
      { status: 500 }
    );
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = generateToken();
  addToken(token);

  return NextResponse.json({ token });
}
