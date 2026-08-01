import React, { useEffect, useState, useCallback } from "react";
import { getOpportunities } from "../../lib/api/opportunities";
import { Opportunity } from "@repo/db";
import Drawer from "../components/Drawer";
import OpportunityForm from "../components/OpportunityForm";
import {
  fmtMoney,
  DeadlineBadge,
  RagBadge,
  daysUntil,
  exportToCSV,
} from "../components/ui-utils";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] =
    useState<Opportunity | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredOpportunities = opportunities.filter((opp) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (opp.title && opp.title.toLowerCase().includes(term)) ||
      (opp.id && opp.id.toLowerCase().includes(term)) ||
      (opp.stage && opp.stage.toLowerCase().includes(term)) ||
      (opp.driven_by && opp.driven_by.toLowerCase().includes(term)) ||
      (opp.owner && opp.owner.toLowerCase().includes(term))
    );
  });

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOpportunities();
      setOpportunities(data);
    } catch (err: any) {
      setError(err.message || "Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleOpenDrawer = (opp?: Opportunity) => {
    setEditingOpportunity(opp || null);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingOpportunity(null);
  };

  const handleFormSuccess = () => {
    handleCloseDrawer();
    fetchOpportunities();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Opportunities</h1>
          <p className="text-sm text-gray-500">
            Manage your pre-sales pipeline and deal stages.
          </p>
        </div>
        <button
          onClick={() => handleOpenDrawer()}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors shadow-sm"
        >
          + New Opportunity
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between">
          <input
            id="opp-search"
            type="text"
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-border rounded-md px-3 py-1.5 text-sm w-64"
          />
          <div className="flex space-x-2">
            <button
              onClick={() => document.getElementById("opp-search")?.focus()}
              className="border border-border px-3 py-1.5 rounded-md text-sm hover:bg-gray-50"
            >
              Filter
            </button>
            <button
              onClick={() =>
                exportToCSV(filteredOpportunities, "opportunities_export.csv")
              }
              className="border border-border px-3 py-1.5 rounded-md text-sm hover:bg-gray-50"
            >
              Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading opportunities...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-danger">{error}</div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No opportunities match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm min-w-[800px]">
              <thead className="bg-gray-50 text-gray-600 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Opp ID
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Opportunity
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Driven By
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Bid Type
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Opp Type
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Stage
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Priority
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Deal Value
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Prob.
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Weighted $
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Deadline
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOpportunities.map((opp) => {
                  const weighted =
                    (Number(opp.deal_value) || 0) *
                    (Number(opp.probability) || 0);
                  const isActive =
                    opp.stage !== "Closed Won" && opp.stage !== "Closed Lost";

                  return (
                    <tr
                      key={opp.id}
                      className={`hover:bg-gray-50 ${isActive ? "bg-blue-50/30" : ""}`}
                    >
                      <td className="px-4 py-3 font-bold text-gray-800">
                        OPP-{opp.id.substring(0, 4).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 font-medium text-secondary">
                        {opp.title}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-[11px]">
                          {opp.driven_by || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {opp.bid_type || "-"}
                      </td>
                      <td className="px-4 py-3 text-xs">{opp.type || "-"}</td>
                      <td className="px-4 py-3">
                        <RagBadge status={opp.stage} />
                      </td>
                      <td className="px-4 py-3">
                        <RagBadge status={opp.priority} />
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {fmtMoney(opp.deal_value)}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {Math.round((Number(opp.probability) || 0) * 100)}%
                      </td>
                      <td className="px-4 py-3 font-mono font-medium">
                        {fmtMoney(weighted)}
                      </td>
                      <td className="px-4 py-3">
                        <DeadlineBadge days={daysUntil(opp.deadline)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            className="px-2 py-1 border border-border rounded text-xs font-semibold text-primary hover:bg-gray-100"
                            onClick={() => handleOpenDrawer(opp)}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={editingOpportunity ? "Edit Opportunity" : "Add Opportunity"}
      >
        <OpportunityForm
          initialData={editingOpportunity}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseDrawer}
        />
      </Drawer>
    </div>
  );
}
