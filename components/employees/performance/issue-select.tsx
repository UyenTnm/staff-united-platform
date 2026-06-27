"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  issues: string[];
}

export function IssueSelect({ issues }: Props) {
  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select Issue" />
      </SelectTrigger>

      <SelectContent>
        {issues.map((issue) => (
          <SelectItem key={issue} value={issue}>
            {issue}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
