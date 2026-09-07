"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { loadCurrentEmployee, updatePassword } from "@/lib/auth/auth-client";

import { updateEmployee } from "@/lib/employees/employees";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSave() {
    if (!newPassword.trim()) {
      toast.warning("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      toast.warning("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warning("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);

      const employee = await loadCurrentEmployee();

      if (!employee) {
        toast.warning("Unable to load employee.");
        return;
      }

      await updatePassword(newPassword);

      await updateEmployee(employee.id, {
        account_status: "Active",
      });

      toast.success("Your password has been updated successfully.");

      switch (employee.user_role) {
        case "Employee":
          router.replace("/performance");
          break;

        case "HR":
          router.replace("/employees");
          break;

        case "Manager":
          router.replace("/reviews?tab=pending");
          break;

        case "Admin":
          router.replace("/dashboard");
          break;

        default:
          router.replace("/");
      }
    } catch (error) {
      console.error(error);

      toast.warning("Unable to change password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-10">
        <Card className="p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Change Password</h1>

            <p className="text-slate-500 mt-2">
              Welcome to STAFF United. For security reasons, please create your
              own password before accessing the system.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">New Password</label>

            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border rounded-lg p-3 pr-12"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
              />

              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Confirm New Password</label>

            <div className="relative mt-2">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full border rounded-lg p-3 pr-12"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
              />

              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="rounded-lg border bg-slate-50 p-4">
            <h3 className="font-medium mb-2">Password Requirements</h3>

            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
              <li>At least 8 characters</li>
              <li>Use uppercase and lowercase letters</li>
              <li>Include at least one number</li>
              <li>Avoid easy-to-guess passwords</li>
            </ul>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Changing Password..." : "Change Password"}
          </Button>
        </Card>
      </div>
    </AppLayout>
  );
}
