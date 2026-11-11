import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { getCurrentAdmin } from "@/lib/auth";
import { getSupabaseAdmins, saveSupabaseAdmins } from "@/lib/supabaseCatalog";

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

  const sbAdmins = await getSupabaseAdmins();
  if (sbAdmins && sbAdmins.length > 0) {
    const found = sbAdmins.find((a) => a.username === adminSession.username);
    if (!found) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      admin: {
        id: found.id,
        username: found.username,
        email: found.email,
        created_at: found.created_at,
      },
    });
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

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required to save changes." },
        { status: 400 }
      );
    }

    const sbAdmins = await getSupabaseAdmins();
    if (sbAdmins && sbAdmins.length > 0) {
      const idx = sbAdmins.findIndex((a) => a.username === adminSession.username);
      if (idx === -1) {
        return NextResponse.json({ error: "Admin not found" }, { status: 404 });
      }
      const existing = sbAdmins[idx];
      const match = await bcrypt.compare(currentPassword, existing.password_hash);
      if (!match) {
        return NextResponse.json({ error: "Current password does not match." }, { status: 400 });
      }

      const updatedAdmin = { ...existing };
      if (newPassword && newPassword.length >= 8) {
        const salt = bcrypt.genSaltSync(10);
        updatedAdmin.password_hash = bcrypt.hashSync(newPassword, salt);
      }
      if (email && email !== existing.email) {
        updatedAdmin.email = email;
      }

      const nextList = [...sbAdmins];
      nextList[idx] = updatedAdmin;
      await saveSupabaseAdmins(nextList);

      return NextResponse.json({
        success: true,
        admin: {
          id: updatedAdmin.id,
          username: updatedAdmin.username,
          email: updatedAdmin.email,
          created_at: updatedAdmin.created_at,
        },
      });
    }

    const admin = db
      .prepare("SELECT * FROM admins WHERE username = ?")
      .get(adminSession.username) as AdminRow | undefined;

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const match = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!match) {
      return NextResponse.json({ error: "Current password does not match." }, { status: 400 });
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
