"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronRight, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SERVICE_CATALOG } from "@/lib/service-catalog";

interface ServiceCatalogPickerProps {
  // Trả về danh sách các DEPARTMENT đã chọn (mỗi Department có ít
  // nhất 1 service con được tick) — sale đặt giá riêng cho từng
  // Department, bên trong (Category/Service) chỉ để mô tả chi tiết.
  onConfirm: (
    groups: { departmentName: string; description: string }[],
  ) => void;
  onClose: () => void;
  // Tên các Service đã lưu sẵn trong quote — dùng để đánh dấu ✓ xanh
  // "Already added" trên Department tương ứng, tránh sale chọn trùng.
  existingServiceNames?: string[];
}

// Checkbox 3 trạng thái — dùng cho Department/Category: rỗng (chưa
// chọn gì), đầy (icon Check, đã chọn hết), hoặc gạch ngang (icon
// Minus, chọn 1 phần bên trong).
function TriStateBox({ state }: { state: "empty" | "full" | "partial" }) {
  return (
    <span
      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
        state === "empty"
          ? "border-slate-300 bg-white"
          : "border-emerald-600 bg-emerald-600"
      }`}
    >
      {state === "full" && <Check className="h-3 w-3 text-white" />}
      {state === "partial" && <Minus className="h-3 w-3 text-white" />}
    </span>
  );
}

export function ServiceCatalogPicker({
  onConfirm,
  onClose,
  existingServiceNames = [],
}: ServiceCatalogPickerProps) {
  // Lưu các service đã chọn dưới dạng "DepartmentName::CategoryName::ServiceName"
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Mặc định THU GỌN hết — sale tự bấm mở khi cần xem, tránh mở sẵn
  // 1 Department dài gây rối ngay khi mở modal.
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

  function key(dept: string, cat: string, svc: string) {
    return `${dept}::${cat}::${svc}`;
  }

  function toggleDept(dept: (typeof SERVICE_CATALOG)[number]) {
    const allKeys = dept.categories.flatMap((cat) =>
      cat.services.map((svc) => key(dept.name, cat.name, svc.name)),
    );
    const allSelected = allKeys.every((k) => selected.has(k));

    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        allKeys.forEach((k) => next.delete(k));
      } else {
        allKeys.forEach((k) => next.add(k));
      }
      return next;
    });
  }

  function toggleCategory(
    deptName: string,
    cat: (typeof SERVICE_CATALOG)[number]["categories"][number],
  ) {
    const allKeys = cat.services.map((svc) =>
      key(deptName, cat.name, svc.name),
    );
    const allSelected = allKeys.every((k) => selected.has(k));

    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        allKeys.forEach((k) => next.delete(k));
      } else {
        allKeys.forEach((k) => next.add(k));
      }
      return next;
    });
  }

  function toggleService(deptName: string, catName: string, svcName: string) {
    const k = key(deptName, catName, svcName);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(k)) {
        next.delete(k);
      } else {
        next.add(k);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    const allKeys = SERVICE_CATALOG.flatMap((dept) =>
      dept.categories.flatMap((cat) =>
        cat.services.map((svc) => key(dept.name, cat.name, svc.name)),
      ),
    );
    const allSelected = allKeys.every((k) => selected.has(k));
    setSelected(allSelected ? new Set() : new Set(allKeys));
  }

  function deptState(
    dept: (typeof SERVICE_CATALOG)[number],
  ): "empty" | "full" | "partial" {
    const allKeys = dept.categories.flatMap((cat) =>
      cat.services.map((svc) => key(dept.name, cat.name, svc.name)),
    );
    const count = allKeys.filter((k) => selected.has(k)).length;
    if (count === 0) return "empty";
    if (count === allKeys.length) return "full";
    return "partial";
  }

  function categoryState(
    deptName: string,
    cat: (typeof SERVICE_CATALOG)[number]["categories"][number],
  ): "empty" | "full" | "partial" {
    const allKeys = cat.services.map((svc) =>
      key(deptName, cat.name, svc.name),
    );
    const count = allKeys.filter((k) => selected.has(k)).length;
    if (count === 0) return "empty";
    if (count === allKeys.length) return "full";
    return "partial";
  }

  const totalSelected = selected.size;

  function handleConfirm() {
    // Gom lại theo DEPARTMENT (5 dịch vụ lớn) — mỗi Department có ít
    // nhất 1 service được chọn sẽ thành 1 dòng giá riêng. Bên trong
    // (Category > Service) chỉ hiện dạng mô tả chi tiết, chưa tính
    // giá riêng — để dành phát triển sau.
    const groups: { departmentName: string; description: string }[] = [];

    for (const dept of SERVICE_CATALOG) {
      const lines: string[] = [];

      for (const cat of dept.categories) {
        const chosenServices = cat.services
          .filter((svc) => selected.has(key(dept.name, cat.name, svc.name)))
          .map((svc) => svc.name);

        if (chosenServices.length > 0) {
          lines.push(`${cat.name}:`);
          chosenServices.forEach((s) => lines.push(`  • ${s}`));
        }
      }

      if (lines.length > 0) {
        groups.push({
          departmentName: dept.name,
          description: lines.join("\n"),
        });
      }
    }

    onConfirm(groups);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="font-semibold text-slate-900">
            Choose from Service Catalog
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Select All — tổng toàn bộ catalog */}
        <div className="border-b border-slate-100 px-5 py-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={
                totalSelected > 0 &&
                SERVICE_CATALOG.every((d) => deptState(d) === "full")
              }
              ref={(el) => {
                if (el) {
                  el.indeterminate =
                    totalSelected > 0 &&
                    !SERVICE_CATALOG.every((d) => deptState(d) === "full");
                }
              }}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded accent-emerald-600"
            />
            Select All ({totalSelected} services selected)
          </label>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-2">
            {SERVICE_CATALOG.map((dept) => {
              const dState = deptState(dept);
              const isExpanded = expandedDepts.has(dept.name);
              const alreadyAdded = existingServiceNames.includes(dept.name);

              return (
                <div
                  key={dept.name}
                  className="rounded-xl border border-slate-200"
                >
                  <div className="flex items-center gap-2 p-3">
                    <button
                      onClick={() => toggleDept(dept)}
                      className="cursor-pointer"
                    >
                      <TriStateBox state={dState} />
                    </button>
                    <button
                      onClick={() =>
                        setExpandedDepts((prev) => {
                          const next = new Set(prev);
                          if (next.has(dept.name)) {
                            next.delete(dept.name);
                          } else {
                            next.add(dept.name);
                          }
                          return next;
                        })
                      }
                      className="flex flex-1 cursor-pointer items-center justify-between text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">
                          {dept.name}
                        </span>
                        {alreadyAdded && (
                          <span className="flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            <Check className="h-2.5 w-2.5" />
                            Already added
                          </span>
                        )}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="space-y-1 border-t border-slate-100 p-2 pl-6">
                      {dept.categories.map((cat) => {
                        const cState = categoryState(dept.name, cat);
                        return (
                          <div key={cat.name}>
                            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                              <button
                                onClick={() => toggleCategory(dept.name, cat)}
                                className="cursor-pointer"
                              >
                                <TriStateBox state={cState} />
                              </button>
                              <span className="text-sm font-medium text-slate-700">
                                {cat.name}
                              </span>
                              <span className="text-xs text-slate-400">
                                (
                                {
                                  cat.services.filter((svc) =>
                                    selected.has(
                                      key(dept.name, cat.name, svc.name),
                                    ),
                                  ).length
                                }
                                /{cat.services.length})
                              </span>
                            </div>

                            <div className="ml-6 space-y-0.5">
                              {cat.services.map((svc) => (
                                <label
                                  key={svc.name}
                                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selected.has(
                                      key(dept.name, cat.name, svc.name),
                                    )}
                                    onChange={() =>
                                      toggleService(
                                        dept.name,
                                        cat.name,
                                        svc.name,
                                      )
                                    }
                                    className="h-3.5 w-3.5 rounded accent-emerald-600"
                                  />
                                  {svc.name}
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-100 p-5">
          <Button
            onClick={handleConfirm}
            disabled={totalSelected === 0}
            className="w-full cursor-pointer"
          >
            Update Selection ({totalSelected} services)
          </Button>
        </div>
      </div>
    </div>
  );
}
