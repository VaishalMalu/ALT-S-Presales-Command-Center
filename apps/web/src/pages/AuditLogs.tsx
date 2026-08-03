import React, { useEffect, useState } from "react";
import { getAuditLogs, AuditLog } from "../../lib/api/audit";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAuditLogs()
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load audit logs");
        setLoading(false);
      });
  }, []);

  function formatChanges(log: AuditLog): React.ReactNode {
    if (log.action_type === "CREATE") {
      return (
        <span className="text-gray-600">
          Created {log.entity_type.toLowerCase()}{" "}
          <strong className="text-gray-900">{log.entity_name || log.entity_id}</strong>
        </span>
      );
    }

    const diffs = log.changes;
    if (!diffs || typeof diffs !== "object") {
      return <span className="text-gray-500 italic">Updated {log.entity_type.toLowerCase()}</span>;
    }

    const changeItems: string[] = [];
    for (const field of Object.keys(diffs)) {
      const detail = diffs[field];
      if (detail && typeof detail === "object" && "old" in detail && "new" in detail) {
        // Format values nicely (limit long strings, format objects/nulls)
        const formatVal = (v: any) => {
          if (v === null || v === undefined) return "empty";
          if (typeof v === "object") return JSON.stringify(v);
          const s = String(v);
          return s.length > 60 ? s.substring(0, 57) + "..." : `'${s}'`;
        };
        changeItems.push(`${field.replace(/_/g, " ")}: changed from ${formatVal(detail.old)} to ${formatVal(detail.new)}`);
      }
    }

    if (changeItems.length === 0) {
      return <span className="text-gray-500 italic">Modified properties on {log.entity_type.toLowerCase()}</span>;
    }

    return (
      <div className="text-gray-600">
        Updated {log.entity_type.toLowerCase()}{" "}
        <strong className="text-gray-900">{log.entity_name}</strong>:
        <ul className="list-disc pl-4 mt-1 space-y-1 text-xs text-gray-500">
          {changeItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Audit Logs</h1>
        <p className="text-sm text-gray-500">
          Track real-time system changes, updates, and creation history.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden bg-white">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading audit logs...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No audit logs found. Change records will appear here as soon as you update accounts or opportunities.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
              <thead className="bg-gray-50 text-gray-600 border-b border-border">
                <tr>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Timestamp</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Entity</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Action</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">User</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Changes Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 align-top">
                    <td className="px-5 py-4 text-xs font-mono text-gray-500">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                        log.entity_type === "Account" 
                          ? "bg-blue-50 text-blue-700 border-blue-200" 
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}>
                        {log.entity_type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                        log.action_type === "CREATE"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {log.action_type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-secondary">
                      {log.changed_by || "Anonymous"}
                    </td>
                    <td className="px-5 py-4 text-xs leading-relaxed max-w-[400px] whitespace-normal">
                      {formatChanges(log)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
