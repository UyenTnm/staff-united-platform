"use client";

import { supabase } from "@/lib/supabase";

export default function TestPage() {
  const createLead = async () => {
    const { data, error } = await supabase.from("leads").insert([
      {
        lead_number: "L-001",
        company_name: "ABC Construction",
        contact_name: "John Smith",
        email: "john@abc.com",
        phone: "+61 412 345 678",
        department: "Strategic Operations",
        source: "Website Form",
        status: "New",
        priority: "High",
      },
    ]);

    console.log(data);
    console.log(error);
  };

  return (
    <div className="p-10">
      <button
        onClick={createLead}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Create Test Lead
      </button>
    </div>
  );
}
