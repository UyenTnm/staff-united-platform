"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { EmployeeForm } from "@/components/employees/employee-form";

import {
  getEmployee,
  getManagers,
  updateEmployee,
} from "@/lib/employees/employees";
import type { UserRole } from "@/lib/auth";

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [employeeNumber, setEmployeeNumber] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  // const [userRole, setUserRole] = useState("Employee");
  const [userRole, setUserRole] = useState<UserRole>("Employee");
  const [managerId, setManagerId] = useState("");
  const [status, setStatus] = useState("Active");

  const [managers, setManagers] = useState<{ id: string; full_name: string }[]>(
    [],
  );

  useEffect(() => {
    async function load() {
      const [employee, managerList] = await Promise.all([
        getEmployee(params.id as string),
        getManagers(),
      ]);

      if (!employee) {
        alert("Employee not found.");
        router.push("/employees");
        return;
      }

      setEmployeeNumber(employee.employee_number);
      setFullName(employee.full_name);
      setEmail(employee.email);
      setDepartment(employee.department);
      setRole(employee.role);
      setManagerId(employee.manager_id ?? "");
      setStatus(employee.status);

      setManagers(managerList);

      setLoading(false);
    }

    load();
  }, [params.id, router]);

  async function handleSave() {
    if (!fullName.trim()) {
      alert("Please enter employee name.");
      return;
    }

    if (!email.trim()) {
      alert("Please enter email.");
      return;
    }

    if (!department) {
      alert("Please select department.");
      return;
    }

    if (!role.trim()) {
      alert("Please enter position.");
      return;
    }

    try {
      setSaving(true);

      await updateEmployee(params.id as string, {
        full_name: fullName,
        email,
        department,
        role,
        user_role: userRole,
        manager_id: managerId || null,
        status,
      });

      router.replace(`/employees/${params.id}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Unable to update employee.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">Loading employee...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit Employee</h1>

            <p className="text-slate-500 mt-2">Update employee information.</p>
          </div>

          <Button asChild variant="outline">
            <Link href={`/employees/${params.id}`}>Cancel</Link>
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
          onSubmit={handleSave}
          submitLabel="Save Changes"
        />
      </div>
    </AppLayout>
  );
}
