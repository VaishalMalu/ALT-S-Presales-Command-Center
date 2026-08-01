import React from "react";

export function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export function fmtMoney(n?: number | null): string {
  if (n === undefined || n === null) return "$0";
  return "$" + Math.round(Number(n)).toLocaleString();
}

export function RagBadge({ status }: { status?: string | null }) {
  if (!status)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
        —
      </span>
    );

  let colorClass = "bg-gray-50 text-gray-700 border border-gray-200";

  const green = "bg-green-50 text-green-700 border border-green-200";
  const amber = "bg-amber-50 text-amber-700 border border-amber-200";
  const red = "bg-red-50 text-red-700 border border-red-200";
  const purple = "bg-purple-50 text-purple-700 border border-purple-200";
  const blue = "bg-blue-50 text-blue-700 border border-blue-200";
  const gray = "bg-gray-50 text-gray-700 border border-gray-200";

  const statusMap: Record<string, string> = {
    // Health / Generic
    Green: green,
    Yellow: amber,
    Red: red,
    High: red,
    Medium: amber,
    Low: green,
    Critical: red,

    // Task Status
    Completed: green,
    "Not Started": gray,
    "In Progress": blue,
    Blocked: purple,
    "Waiting Customer": purple,
    "Waiting Internal": purple,

    // Opportunity Stages
    "Closed Won": green,
    "Closed Lost": red,
    Negotiation: amber,
    Decision: amber,
    "Proposal Submission": amber,
    "Commercial Proposal": amber,
    "RFP/RFI/RFQ Management": amber,
  };

  colorClass = statusMap[status] || blue; // default to blue for most stages

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}
    >
      {status}
    </span>
  );
}

export function DeadlineBadge({ days }: { days: number | null }) {
  if (days === null)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
        —
      </span>
    );
  if (days < 0)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
        {Math.abs(days)}d overdue
      </span>
    );
  if (days <= 7)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
        {days}d
      </span>
    );
  if (days <= 14)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        {days}d
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
      {days}d
    </span>
  );
}

export function exportToCSV(data: any[], filename: string) {
  if (!data || !data.length) {
    alert("No data to export");
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);

  // Convert array of objects to CSV string
  const csvRows = [];
  csvRows.push(headers.join(",")); // Add headers row

  for (const row of data) {
    const values = headers.map((header) => {
      const val =
        row[header] === null || row[header] === undefined
          ? ""
          : String(row[header]);
      // Escape quotes and wrap in quotes if contains comma
      const escaped = val.replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
