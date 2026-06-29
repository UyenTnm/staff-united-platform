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

    // 1. Load employee
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
        {
          status: 404,
        },
      );
    }

    const temporaryPassword = generateTemporaryPassword();

    console.log("Temporary Password:", temporaryPassword);

    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: employee.email,
        password: temporaryPassword,
        email_confirm: true,
      });

    if (authError) {
      return NextResponse.json(
        {
          success: false,
          message: authError.message,
        },
        {
          status: 400,
        },
      );
    }

    await supabase
      .from("employees")
      .update({
        auth_user_id: authUser.user.id,
        account_status: "Active",
      })
      .eq("id", employee.id);

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
      },
      {
        status: 500,
      },
    );
  }
}
