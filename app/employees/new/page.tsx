"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";

import {
  createEmployee,
  generateEmployeeNumber,
  getManagers,
} from "@/lib/employees/employees";
import { EmployeeForm } from "@/components/employees/employee-form";
import type { UserRole } from "@/lib/auth";
import { toast } from "sonner";
import { RoleGuard } from "@/components/auth/role-guard";

function NewEmployeePageContent() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const [employeeNumber, setEmployeeNumber] = useState("");

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [department, setDepartment] = useState("");

  const [role, setRole] = useState("");

  const [managerId, setManagerId] = useState("");

  const [status, setStatus] = useState("Active");

  const [userRole, setUserRole] = useState<UserRole>("Employee");
  const [managers, setManagers] = useState<{ id: string; full_name: string }[]>(
    [],
  );

  useEffect(() => {
    async function load() {
      const [number, managerList] = await Promise.all([
        generateEmployeeNumber(),
        getManagers(),
      ]);

      setEmployeeNumber(number);
      setManagers(managerList);
    }

    load();
  }, []);

  async function handleCreate() {
    if (!fullName.trim()) {
      toast.warning("Please enter employee name.");
      return;
    }

    if (!email.trim()) {
      toast.warning("Please enter email.");
      return;
    }

    if (!department) {
      toast.warning("Please select department.");
      return;
    }

    if (!role.trim()) {
      toast.warning("Please enter position.");
      return;
    }

    if (!employeeNumber) {
      toast.error("Unable to generate employee number.");
      return;
    }

    if (!status) {
      toast.warning("Please select a status.");
      return;
    }

    try {
      setSaving(true);

      const employee = await createEmployee({
        employee_number: employeeNumber,
        full_name: fullName,
        email,
        department,
        role,
        user_role: userRole,
        manager_id: managerId || null,
        status,

        account_status: "Pending",
      });

      const response = await fetch(
        `/api/employees/${employee.id}/create-account`,
        {
          method: "POST",
        },
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      router.replace("/employees");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Unable to create employee.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between">
          <div>
            <h1 className="text-3xl font-bold">Add New Employee</h1>

            <p className="text-slate-500 mt-2">
              Create a new employee account.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/employees">Cancel</Link>
          </Button>
        </div>

        <EmployeeForm
          employeeNumber={employeeNumber}
          fullName={fullName}
          setFullName={setFullName}
          email={email}
          setEmail={setEmail}
          department={department}
          setDepartment={setDepartment}
          role={role}
          setRole={setRole}
          userRole={userRole}
          setUserRole={setUserRole}
          managerId={managerId}
          setManagerId={setManagerId}
          status={status}
          setStatus={setStatus}
          managers={managers}
          saving={saving}
          onSubmit={handleCreate}
          submitLabel="Create Employee"
        />
      </div>
    </AppLayout>
  );
}

export default function NewEmployeePage() {
  return (
    <RoleGuard allow={["Admin", "HR"]}>
      <NewEmployeePageContent />
    </RoleGuard>
  );
}
