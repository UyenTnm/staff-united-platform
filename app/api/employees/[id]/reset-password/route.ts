import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateTemporaryPassword } from "@/lib/auth/password";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Load employee
    const { data: employee, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found.",
        },
        { status: 404 },
      );
    }

    if (!employee.auth_user_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee does not have an account.",
        },
        { status: 400 },
      );
    }

    const temporaryPassword = generateTemporaryPassword();

    const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
      employee.auth_user_id,
      {
        password: temporaryPassword,
      },
    );

    if (resetError) {
      return NextResponse.json(
        {
          success: false,
          message: resetError.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      email: employee.email,
      temporaryPassword,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
