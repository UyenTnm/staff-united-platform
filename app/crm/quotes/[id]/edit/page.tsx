"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/app-layout";

// Trang Edit Quote cũ ĐÃ NGỪNG SỬ DỤNG — sửa amount/status tự do ở
// đây phá vỡ đồng bộ giữa status/proposal_status và Service Options,
// gây sai lệch số tiền thật đã tính. Toàn bộ việc chỉnh sửa giờ thực
// hiện qua trang chi tiết Quote (Add Service Options, Customer
// Market...), tự động giữ dữ liệu đồng bộ đúng.
export default function EditQuotePage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/crm/quotes/${params.id}`);
  }, [params.id, router]);

  return (
    <AppLayout>
      <div className="p-6 text-sm text-slate-500">
        Redirecting to quote details...
      </div>
    </AppLayout>
  );
}
