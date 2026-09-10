import React, { useEffect, useState, useCallback, useMemo } from "react";
import { getAccounts, deleteAccount } from "../../lib/api/accounts";
import { Account } from "@repo/db";
import Drawer from "../components/Drawer";
import AccountForm from "../components/AccountForm";
import { DeadlineBadge, RagBadge } from "../components/ui-utils";
import { useCurrency } from "../contexts/CurrencyContext";
import ViewManager, { ColumnDef } from "../components/ViewManager";

const ALL_COLUMNS: ColumnDef[] = [
  { key: "acc_id",          label: "Account ID",       defaultVisible: true },
  { key: "name",            label: "Account Name",     defaultVisible: true },
  { key: "owner",           label: "Owner",            defaultVisible: true },
  { key: "tier",            label: "Tier",             defaultVisible: true },
  { key: "country",         label: "Country",          defaultVisible: true },
  { key: "industry",        label: "Industry",         defaultVisible: false },
  { key: "region",          label: "Region",           defaultVisible: false },
  { key: "arr",             label: "ARR",              defaultVisible: true },
  { key: "renewal",         label: "Renewal",          defaultVisible: true },
  { key: "health",          label: "Health",           defaultVisible: true },
  { key: "upsell",          label: "Upsell Potential", defaultVisible: true },
  { key: "primary_contact", label: "Primary Contact",  defaultVisible: false },
  { key: "phone",           label: "Phone",            defaultVisible: false },
];

const DEFAULT_VISIBLE = new Set(
  ALL_COLUMNS.filter((c) => c.defaultVisible !== false).map((c) => c.key)
);

export default function AccountsPage() {
  const { formatMoney } = useCurrency();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // View manager state
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(DEFAULT_VISIBLE);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const accSeqMap = useMemo(() => {
    const sorted = [...accounts].sort(
      (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    );
    const map: Record<string, number> = {};
    sorted.forEach((acc, i) => { map[acc.id] = i + 1; });
    return map;
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    if (!searchTerm) return accounts;
    const term = searchTerm.toLowerCase();
    return accounts.filter((acc) => {
      const seqNum = accSeqMap[acc.id] ?? 0;
      const accDisplayId = `acc${String(seqNum).padStart(6, "0")}`;
      return (
        accDisplayId.includes(term) ||
        (acc.name && acc.name.toLowerCase().includes(term)) ||
        (acc.country && acc.country.toLowerCase().includes(term)) ||
        (acc.industry && acc.industry.toLowerCase().includes(term)) ||
        (acc.tier && acc.tier.toLowerCase().includes(term)) ||
        (acc.primary_contact && acc.primary_contact.toLowerCase().includes(term))
      );
    });
  }, [accounts, searchTerm, accSeqMap]);

  const handleViewChange = (cols: string[], viewId: string | null) => {
    setVisibleColumns(new Set(cols));
    setActiveViewId(viewId);
  };

  const handleOpenDrawer = (acc?: Account) => {
    setEditingAccount(acc || null);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingAccount(null);
  };

  const handleFormSuccess = () => {
    handleCloseDrawer();
    fetchAccounts();
  };

  const handleDeleteAccount = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete account "${name}"?`)) {
      try {
        await deleteAccount(id);
        fetchAccounts();
      } catch (err: any) {
        alert(err.message || "Failed to delete account");
      }
    }
  };

  const col = (key: string) => visibleColumns.has(key);

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-primary">Accounts</h1>
          <p className="text-sm text-gray-500">Manage your enterprise accounts here.</p>
        </div>
        <button
          onClick={() => handleOpenDrawer()}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors shadow-sm font-medium text-sm"
        >
          + New Account
        </button>
      </div>

      {/* Table card */}
      <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col min-h-0 flex-1">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex justify-between items-center shrink-0">
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-border rounded-md px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex items-center gap-2">
            <ViewManager
              storageKey="acc_views"
              allColumns={ALL_COLUMNS}
              activeViewId={activeViewId}
              onViewChange={handleViewChange}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-8 text-center text-gray-500 flex-1">Loading accounts...</div>
        ) : error ? (
          <div className="p-8 text-center text-danger flex-1">{error}</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex-1">No accounts found.</div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 border-b border-border sticky top-0">
                <tr>
                  {col("acc_id")          && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Account ID</th>}
                  {col("name")            && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Account</th>}
                  {col("owner")           && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Owner</th>}
                  {col("tier")            && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Tier</th>}
                  {col("country")         && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Country</th>}
                  {col("industry")        && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Industry</th>}
                  {col("region")          && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Region</th>}
                  {col("arr")             && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">ARR</th>}
                  {col("renewal")         && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Renewal</th>}
                  {col("health")          && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Health</th>}
                  {col("upsell")          && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Upsell Potential</th>}
                  {col("primary_contact") && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Primary Contact</th>}
                  {col("phone")           && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Phone</th>}
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAccounts.map((acc) => {
                  const healthScore = acc.health_score ?? 0;
                  const healthStr = healthScore >= 80 ? "Green" : healthScore >= 50 ? "Yellow" : "Red";
                  const seqNum = accSeqMap[acc.id] ?? 0;
                  const accDisplayId = `ACC${String(seqNum).padStart(6, "0")}`;

                  return (
                    <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                      {col("acc_id")          && <td className="px-4 py-3 font-bold font-mono text-gray-800">{accDisplayId}</td>}
                      {col("name")            && (
                        <td className="px-4 py-3 font-medium text-secondary">
                          <button
                            className="hover:underline text-primary text-left bg-transparent border-none p-0 cursor-pointer font-medium max-w-[180px] truncate block"
                            onClick={() => handleOpenDrawer(acc)}
                          >
                            {acc.name}
                          </button>
                        </td>
                      )}
                      {col("owner")           && <td className="px-4 py-3 text-xs">{acc.created_by ? "User" : "—"}</td>}
                      {col("tier")            && <td className="px-4 py-3">{acc.tier || "—"}</td>}
                      {col("country")         && <td className="px-4 py-3">{acc.country || "—"}</td>}
                      {col("industry")        && <td className="px-4 py-3">{acc.industry || "—"}</td>}
                      {col("region")          && <td className="px-4 py-3">{acc.region || "—"}</td>}
                      {col("arr")             && <td className="px-4 py-3 font-mono">{formatMoney(acc.arr)}</td>}
                      {col("renewal")         && <td className="px-4 py-3"><DeadlineBadge dateStr={acc.renewal_date} /></td>}
                      {col("health")          && <td className="px-4 py-3"><RagBadge status={healthStr} /></td>}
                      {col("upsell")          && <td className="px-4 py-3 font-mono">{formatMoney(acc.upsell_potential)}</td>}
                      {col("primary_contact") && <td className="px-4 py-3 text-xs">{acc.primary_contact || "—"}</td>}
                      {col("phone")           && <td className="px-4 py-3 text-xs">{acc.phone_number || "—"}</td>}
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button
                            className="px-2 py-1 border border-border rounded text-xs font-semibold text-primary hover:bg-gray-100 cursor-pointer transition-colors"
                            onClick={() => handleOpenDrawer(acc)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-2 py-1 border border-red-200 rounded text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                            onClick={() => handleDeleteAccount(acc.id, acc.name)}
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
        title={editingAccount ? "Edit Account" : "Add Account"}
      >
        <AccountForm
          initialData={editingAccount}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseDrawer}
        />
      </Drawer>
    </div>
  );
}
