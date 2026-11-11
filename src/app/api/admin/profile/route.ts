import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface AdminRow {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export async function GET() {
  const adminSession = await getCurrentAdmin();
  if (!adminSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = db
    .prepare("SELECT id, username, email, created_at FROM admins WHERE username = ?")
    .get(adminSession.username) as Partial<AdminRow> | undefined;

  if (!admin) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, admin });
}

export async function PATCH(req: NextRequest) {
  const adminSession = await getCurrentAdmin();
  if (!adminSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword, email } = await req.json();

    const admin = db
      .prepare("SELECT * FROM admins WHERE username = ?")
      .get(adminSession.username) as AdminRow | undefined;

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Verify current password
    if (currentPassword) {
      const match = await bcrypt.compare(currentPassword, admin.password_hash);
      if (!match) {
        return NextResponse.json({ error: "Current password does not match." }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Current password is required to save changes." }, { status: 400 });
    }

    if (newPassword && newPassword.length >= 8) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(newPassword, salt);
      db.prepare("UPDATE admins SET password_hash = ? WHERE username = ?").run(
        hash,
        adminSession.username
      );
    }

    if (email && email !== admin.email) {
      db.prepare("UPDATE admins SET email = ? WHERE username = ?").run(
        email,
        adminSession.username
      );
    }

    const updated = db
      .prepare("SELECT id, username, email, created_at FROM admins WHERE username = ?")
      .get(adminSession.username);

    return NextResponse.json({ success: true, admin: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
