import React, { useEffect, useState, useCallback, useMemo } from "react";
import { getOpportunities, deleteOpportunity } from "../../lib/api/opportunities";
import { getAccounts } from "../../lib/api/accounts";
import { Opportunity, Account } from "@repo/db";
import Drawer from "../components/Drawer";
import OpportunityForm from "../components/OpportunityForm";
import {
  DeadlineBadge,
  RagBadge,
  exportToCSV,
} from "../components/ui-utils";
import { useCurrency } from "../contexts/CurrencyContext";
import ViewManager, { ColumnDef } from "../components/ViewManager";

const ALL_COLUMNS: ColumnDef[] = [
  { key: "opp_id",        label: "Opp ID",         defaultVisible: true },
  { key: "account",       label: "Account Name",    defaultVisible: true },
  { key: "received_date", label: "Received Date",   defaultVisible: true },
  { key: "partner_name",  label: "Partner Name",    defaultVisible: true },
  { key: "title",         label: "Opportunity",     defaultVisible: true },
  { key: "driven_by",     label: "Driven By",       defaultVisible: true },
  { key: "bid_type",      label: "Bid Type",        defaultVisible: true },
  { key: "type",          label: "Opp Type",        defaultVisible: true },
  { key: "stage",         label: "Stage",           defaultVisible: true },
  { key: "priority",      label: "Priority",        defaultVisible: true },
  { key: "deal_value",    label: "Deal Value",      defaultVisible: true },
  { key: "probability",   label: "Prob.",           defaultVisible: true },
  { key: "weighted",      label: "Weighted",        defaultVisible: true },
  { key: "deadline",      label: "Deadline",        defaultVisible: true },
  { key: "owner",         label: "Owner",           defaultVisible: false },
  { key: "competitors",   label: "Competitors",     defaultVisible: false },
];

const DEFAULT_VISIBLE = new Set(
  ALL_COLUMNS.filter((c) => c.defaultVisible !== false).map((c) => c.key)
);

export default function OpportunitiesPage() {
  const { formatMoney } = useCurrency();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // View manager state
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(DEFAULT_VISIBLE);

  const accountMap = useMemo(() => {
    const map: Record<string, string> = {};
    accounts.forEach((acc) => { map[acc.id] = acc.name; });
    return map;
  }, [accounts]);

  // Sequential display numbers: sort by created_at asc, assign 1,2,3...
  const oppSeqMap = useMemo(() => {
    const sorted = [...opportunities].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const map: Record<string, number> = {};
    sorted.forEach((opp, i) => { map[opp.id] = i + 1; });
    return map;
  }, [opportunities]);

  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      // Stage filter supporting exact stage names and legacy synonyms
      if (stageFilter !== "ALL") {
        if (stageFilter === "Proposal/RFP Submitted") {
          if (
            opp.stage !== "Proposal/RFP Submitted" &&
            (opp.stage as string) !== "Proposal Submission" &&
            (opp.stage as string) !== "Proposal/RFP"
          ) {
            return false;
          }
        } else if (stageFilter === "Customer Qualification") {
          if (
            opp.stage !== "Customer Qualification" &&
            (opp.stage as string) !== "Qualification" &&
            (opp.stage as string) !== "Customer Requirement Analysis"
          ) {
            return false;
          }
        } else if (opp.stage !== stageFilter) {
          return false;
        }
      }

      // Priority filter
      if (priorityFilter !== "ALL" && opp.priority !== priorityFilter) return false;

      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const accName = opp.account_id ? accountMap[opp.account_id] || "" : "";
      const seqNum = oppSeqMap[opp.id] ?? 0;
      const oppDisplayId = `opp${String(seqNum).padStart(6, "0")}`;

      return (
        oppDisplayId.includes(term) ||
        (opp.title && opp.title.toLowerCase().includes(term)) ||
        (opp.id && opp.id.toLowerCase().includes(term)) ||
        (opp.partner_name && opp.partner_name.toLowerCase().includes(term)) ||
        (opp.stage && opp.stage.toLowerCase().includes(term)) ||
        (opp.driven_by && opp.driven_by.toLowerCase().includes(term)) ||
        (opp.owner && opp.owner.toLowerCase().includes(term)) ||
        (accName && accName.toLowerCase().includes(term))
      );
    });
  }, [opportunities, searchTerm, accountMap, oppSeqMap, stageFilter, priorityFilter]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [oppsData, accsData] = await Promise.all([getOpportunities(), getAccounts()]);
      setOpportunities(oppsData);
      setAccounts(accsData);
    } catch (err: any) {
      setError(err.message || "Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleViewChange = (cols: string[], viewId: string | null) => {
    setVisibleColumns(new Set(cols));
    setActiveViewId(viewId);
  };

  const handleDeleteOpportunity = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete opportunity "${title}"?`)) {
      try {
        await deleteOpportunity(id);
        fetchData();
      } catch (err: any) {
        alert(err.message || "Failed to delete opportunity");
      }
    }
  };

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
    fetchData();
  };

  const col = (key: string) => visibleColumns.has(key);

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-primary">Opportunities</h1>
          <p className="text-sm text-gray-500">Manage your pre-sales pipeline and deal stages.</p>
        </div>
        <button
          onClick={() => handleOpenDrawer()}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors shadow-sm font-medium text-sm"
        >
          + New Opportunity
        </button>
      </div>

      {/* Table card */}
      <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col min-h-0 flex-1">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-wrap gap-3 justify-between items-center shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <input
              id="opp-search"
              type="text"
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-border rounded-md px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="border border-border rounded-md px-2.5 py-1.5 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="ALL">All Stages</option>
              <option value="Lead Created">Lead Created</option>
              <option value="Customer Qualification">Customer Qualification</option>
              <option value="Solution Design">Solution Design</option>
              <option value="Proposal/RFP Submitted">Proposal/RFP Submitted</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-border rounded-md px-2.5 py-1.5 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <ViewManager
              storageKey="opp_views"
              allColumns={ALL_COLUMNS}
              activeViewId={activeViewId}
              onViewChange={handleViewChange}
            />
            <button
              onClick={() => exportToCSV(filteredOpportunities, "opportunities_export.csv")}
              className="border border-border px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 cursor-pointer"
            >
              Export
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-8 text-center text-gray-500 flex-1">Loading opportunities...</div>
        ) : error ? (
          <div className="p-8 text-center text-danger flex-1">{error}</div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex-1">No opportunities match your search.</div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 border-b border-border sticky top-0">
                <tr>
                  {col("opp_id")        && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Opp ID</th>}
                  {col("account")       && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Account Name</th>}
                  {col("received_date") && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Received Date</th>}
                  {col("partner_name")  && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Partner Name</th>}
                  {col("title")         && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Opportunity</th>}
                  {col("driven_by")     && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Driven By</th>}
                  {col("bid_type")      && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Bid Type</th>}
                  {col("type")          && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Opp Type</th>}
                  {col("stage")         && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Stage</th>}
                  {col("priority")      && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Priority</th>}
                  {col("deal_value")    && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Deal Value</th>}
                  {col("probability")   && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Prob.</th>}
                  {col("weighted")      && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Weighted</th>}
                  {col("deadline")      && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Deadline</th>}
                  {col("owner")         && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Owner</th>}
                  {col("competitors")   && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Competitors</th>}
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOpportunities.map((opp) => {
                  const weighted = (Number(opp.deal_value) || 0) * (Number(opp.probability) || 0);
                  const isClosed = opp.stage === "Closed Won" || opp.stage === "Closed Lost";
                  const isActive = !isClosed;
                  const accName = opp.account_id ? accountMap[opp.account_id] : null;
                  const seqNum = oppSeqMap[opp.id] ?? 0;
                  const oppDisplayId = `OPP${String(seqNum).padStart(6, "0")}`;

                  return (
                    <tr
                      key={opp.id}
                      className={`hover:bg-gray-50 transition-colors ${isActive ? "bg-blue-50/30" : ""}`}
                    >
                      {col("opp_id") && (
                        <td className="px-4 py-3 font-bold text-gray-800">
                          <button
                            onClick={() => handleOpenDrawer(opp)}
                            className="hover:underline text-primary text-left bg-transparent border-none p-0 cursor-pointer font-bold font-mono"
                          >
                            {oppDisplayId}
                          </button>
                        </td>
                      )}
                      {col("account") && (
                        <td className="px-4 py-3 font-medium text-gray-700">
                          {accName ? (
                            <span className="max-w-[160px] truncate block">{accName}</span>
                          ) : (
                            <span className="text-gray-400 italic">—</span>
                          )}
                        </td>
                      )}
                      {col("received_date") && (
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {opp.received_date ? (
                            new Date(opp.received_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          ) : (
                            <span className="text-gray-400 italic">—</span>
                          )}
                        </td>
                      )}
                      {col("partner_name") && (
                        <td className="px-4 py-3 text-xs font-medium text-gray-700">
                          {opp.partner_name ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              {opp.partner_name}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">—</span>
                          )}
                        </td>
                      )}
                      {col("title") && (
                        <td className="px-4 py-3 font-medium">
                          <button
                            onClick={() => handleOpenDrawer(opp)}
                            className="hover:underline text-primary text-left bg-transparent border-none p-0 cursor-pointer font-medium max-w-xs truncate block"
                          >
                            {opp.title}
                          </button>
                        </td>
                      )}

                      {col("driven_by") && (
                        <td className="px-4 py-3">
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-[11px]">
                            {opp.driven_by || "—"}
                          </span>
                        </td>
                      )}
                      {col("bid_type")    && <td className="px-4 py-3 text-xs">{opp.bid_type || "—"}</td>}
                      {col("type")        && <td className="px-4 py-3 text-xs">{opp.type || "—"}</td>}
                      {col("stage")       && <td className="px-4 py-3"><RagBadge status={opp.stage} /></td>}
                      {col("priority")    && <td className="px-4 py-3"><RagBadge status={opp.priority} /></td>}
                      {col("deal_value")  && <td className="px-4 py-3 font-mono">{formatMoney(opp.deal_value)}</td>}
                      {col("probability") && <td className="px-4 py-3 font-mono">{Math.round((Number(opp.probability) || 0) * 100)}%</td>}
                      {col("weighted")    && <td className="px-4 py-3 font-mono font-medium">{formatMoney(weighted)}</td>}
                      {col("deadline")    && (
                        <td className="px-4 py-3">
                          <DeadlineBadge dateStr={opp.deadline} isClosed={isClosed} />
                        </td>
                      )}
                      {col("owner")       && <td className="px-4 py-3 text-xs">{opp.owner || "—"}</td>}
                      {col("competitors") && <td className="px-4 py-3 text-xs max-w-[160px] truncate">{opp.competitors || "—"}</td>}
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button
                            className="px-2 py-1 border border-border rounded text-xs font-semibold text-primary hover:bg-gray-100 cursor-pointer transition-colors"
                            onClick={() => handleOpenDrawer(opp)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-2 py-1 border border-red-200 rounded text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                            onClick={() => handleDeleteOpportunity(opp.id, opp.title)}
                          >
                            Delete
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
