"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Mail, MapPin, User, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PortalLayout } from "@/components/portal-layout";

interface ProfileData {
  company_name: string;
  billing_company_name: string | null;
  billing_address: string | null;
  billing_tax_code: string | null;
  billing_contact_person: string | null;
  contact_name: string;
  contact_email: string | null;
  billing_email: string | null;
}

// Company Profile — CHỈ XEM, không cho khách tự sửa. Lý do: thông
// tin này phải khớp với hợp đồng/hóa đơn đã ký — nếu khách tự sửa dễ
// gây lệch dữ liệu pháp lý. Muốn đổi phải liên hệ account manager.
export default function PortalProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/portal/login");
        return;
      }

      setUserEmail(session.user.email || "");

      // Lấy thông tin từ Quote GẦN NHẤT có billing info đầy đủ nhất
      // (thường là quote mới nhất họ đã hoàn tất) — RLS đã tự lọc
      // đúng quote của khách này.
      const { data, error } = await supabase
        .from("quotes")
        .select(
          "company_name, billing_company_name, billing_address, billing_tax_code, billing_contact_person, contact_name, contact_email, billing_email",
        )
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setProfile(data as ProfileData);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <PortalLayout userEmail={userEmail}>
        <p className="text-sm text-slate-500">Loading...</p>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout userEmail={userEmail}>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Company Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your company information on file with STAFF United.
        </p>

        {/* Ghi chú rõ ràng — view-only, không cho tự sửa */}
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <FileText className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            This information is on record for your invoices and contracts. To
            make changes, please contact your account manager — we keep this
            consistent with your signed agreements.
          </span>
        </div>

        {!profile ? (
          <div className="mt-6 rounded-xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            No company information on file yet.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Building2 className="h-4 w-4 text-emerald-600" />
                Company Details
              </h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-50 pb-3">
                  <dt className="text-slate-500">Company Name</dt>
                  <dd className="font-medium text-slate-900">
                    {profile.billing_company_name ||
                      profile.company_name ||
                      "—"}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-3">
                  <dt className="text-slate-500">Tax Code / MST</dt>
                  <dd className="font-medium text-slate-900">
                    {profile.billing_tax_code || "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Billing Address</dt>
                  <dd className="max-w-xs text-right font-medium text-slate-900">
                    {profile.billing_address || "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <User className="h-4 w-4 text-emerald-600" />
                Contact Person
              </h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-50 pb-3">
                  <dt className="text-slate-500">Name</dt>
                  <dd className="font-medium text-slate-900">
                    {profile.billing_contact_person ||
                      profile.contact_name ||
                      "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Email</dt>
                  <dd className="font-medium text-slate-900">
                    {profile.billing_email || profile.contact_email || "—"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
