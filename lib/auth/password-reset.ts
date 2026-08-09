import { supabase } from "@/lib/supabase";

// Gửi email chứa link đặt lại mật khẩu — dùng cơ chế built-in của
// Supabase Auth, không cần tự xây API riêng.
export async function requestPasswordReset(email: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/reset-password`,
  });

  if (error) {
    console.error(error);
    throw error;
  }
}

// đã bấm link trong email (Supabase tự xử lý phiên tạm thời qua URL).
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error(error);
    throw error;
  }
}
