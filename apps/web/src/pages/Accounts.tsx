import React, { useEffect, useState, useCallback } from "react";
import { getAccounts } from "../../lib/api/accounts";
import { Account } from "@repo/db";
import Drawer from "../components/Drawer";
import AccountForm from "../components/AccountForm";
import { DeadlineBadge, RagBadge, daysUntil } from "../components/ui-utils";
import { useCurrency } from "../contexts/CurrencyContext";

export default function AccountsPage() {
  const { formatMoney } = useCurrency();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

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

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Accounts</h1>
          <p className="text-sm text-gray-500">
            Manage your enterprise accounts here.
          </p>
        </div>
        <button
          onClick={() => handleOpenDrawer()}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors shadow-sm"
        >
          + New Account
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading accounts...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-danger">{error}</div>
        ) : accounts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
              <thead className="bg-gray-50 text-gray-600 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Account ID
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Account
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Owner
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Tier
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Country
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    ARR
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Renewal
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Health
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Upsell Potential
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {accounts.map((acc) => {
                  const healthStr =
                    (acc.health_score ?? 0) >= 80
                      ? "Green"
                      : (acc.health_score ?? 0) >= 50
                        ? "Yellow"
                        : "Red";
                  return (
                    <tr key={acc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-gray-800">
                        ACC-{acc.id.substring(0, 4).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 font-medium text-secondary">
                        {acc.name}
                      </td>
                      <td className="px-4 py-3">
                        {acc.created_by ? "User" : "-"}
                      </td>
                      <td className="px-4 py-3">{acc.tier || "-"}</td>
                      <td className="px-4 py-3">{acc.country || "-"}</td>
                      <td className="px-4 py-3 font-mono">
                        {formatMoney(acc.arr)}
                      </td>
                      <td className="px-4 py-3">
                        <DeadlineBadge dateStr={acc.renewal_date} />
                      </td>
                      <td className="px-4 py-3">
                        <RagBadge status={healthStr} />
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {formatMoney(acc.upsell_potential)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            className="px-2 py-1 border border-border rounded text-xs font-semibold text-primary hover:bg-gray-100"
                            onClick={() => handleOpenDrawer(acc)}
                          >
                            Edit
                          </button>
                          {/* Future: Delete functionality can be wired up here */}
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
