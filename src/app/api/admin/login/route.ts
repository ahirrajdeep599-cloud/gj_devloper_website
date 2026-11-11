import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { signSessionToken, COOKIE_NAME } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import { getSupabaseAdmins } from "@/lib/supabaseCatalog";

export const dynamic = "force-dynamic";

// Dummy hash for constant-time comparison when username is invalid
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting to prevent brute-force attacks
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const rateLimit = checkRateLimit({
      key: `login_attempt_${ip}`,
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please wait ${rateLimit.retryAfterSec} seconds before trying again.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.retryAfterSec.toString(),
          },
        }
      );
    }

    const body = await req.json();
    const { username, password } = body;

    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Username and password strings are required." },
        { status: 400 }
      );
    }

    // Input length sanity limit
    if (username.length > 100 || password.length > 200) {
      return NextResponse.json(
        { error: "Invalid credential length." },
        { status: 400 }
      );
    }

    const cleanUser = username.trim();

    interface AdminRow {
      id: number;
      username: string;
      email?: string;
      password_hash: string;
    }

    let admin: AdminRow | undefined;

    const sbAdmins = await getSupabaseAdmins();
    if (sbAdmins && sbAdmins.length > 0) {
      admin = sbAdmins.find((a) => a.username === cleanUser || a.email === cleanUser);
    } else {
      admin = db
        .prepare("SELECT * FROM admins WHERE username = ? OR email = ?")
        .get(cleanUser, cleanUser) as AdminRow | undefined;
    }

    // Use actual hash if admin exists, otherwise use dummy hash to avoid timing attacks
    const targetHash = admin ? admin.password_hash : DUMMY_HASH;
    const isMatch = await bcrypt.compare(password, targetHash);

    if (!admin || !isMatch) {
      console.warn(`[Security Audit] Failed login attempt for username '${username}' from IP ${ip}`);
      return NextResponse.json(
        {
          error: "Invalid username or password credentials.",
          attemptsRemaining: rateLimit.remaining,
        },
        { status: 401 }
      );
    }

    // 3. Issue signed JWT session token
    const token = await signSessionToken({
      username: admin.username,
      role: "admin",
    });

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
      username: admin.username,
    });

    // 4. Secure Cookie settings
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    console.log(`[Security Audit] Successful admin login for '${admin.username}' from IP ${ip}`);
    return response;
  } catch (err: unknown) {
    console.error("[Admin Login Security Exception]:", err);
    return NextResponse.json(
      { error: "Internal server authentication error." },
      { status: 500 }
    );
  }
}
