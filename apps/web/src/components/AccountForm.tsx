import React, { useState } from "react";
import { Account } from "@repo/db";
import { createAccount, updateAccount } from "../../lib/api/accounts";
import { createTask } from "../../lib/api/tasks";
import { useCurrency } from "../contexts/CurrencyContext";

interface AccountFormProps {
  initialData?: Account | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AccountForm({
  initialData,
  onSuccess,
  onCancel,
}: AccountFormProps) {
  const { currencySymbol } = useCurrency();
  const [formData, setFormData] = useState<Partial<Account>>(
    initialData || {
      name: "",
      tier: "Standard",
      health_score: 100,
      arr: 0,
    },
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (initialData?.id) {
        await updateAccount(initialData.id, formData);
      } else {
        const newAcc = await createAccount(formData);

        // Auto-task generation flow (matches HTML implementation)
        const label = newAcc.name || "(untitled account)";
        const tasksToCreate = [];
        const baseTask = {
          account_id: newAcc.id,
          category: "Account Management",
          status: "Not Started" as const,
        };

        if (newAcc.renewal_date) {
          tasksToCreate.push({
            ...baseTask,
            title: `Prepare renewal — ${label}`,
            due_date: newAcc.renewal_date,
            priority: "High" as const,
          });
        }
        if (newAcc.health_score !== null && newAcc.health_score < 50) {
          tasksToCreate.push({
            ...baseTask,
            title: `Address account health risk — ${label}`,
            priority: "High" as const,
            status: "Blocked" as const,
            bottleneck_type: "Customer",
          });
        } else if (newAcc.health_score !== null && newAcc.health_score < 80) {
          tasksToCreate.push({
            ...baseTask,
            title: `Monitor account health — ${label}`,
            priority: "Medium" as const,
          });
        }
        if (Number(newAcc.upsell_potential) > 0) {
          tasksToCreate.push({
            ...baseTask,
            title: `Pursue upsell opportunity — ${label}`,
            priority: "Medium" as const,
          });
        }
        tasksToCreate.push({
          ...baseTask,
          title: `Schedule onboarding / relationship kick-off — ${label}`,
          priority: "Medium" as const,
        });

        const { createTask } = await import("../../lib/api/tasks");
        await Promise.all(tasksToCreate.map((t) => createTask(t)));
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save account");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form id="account-form" onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          Account Name
        </label>
        <input
          required
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Industry
          </label>
          <input
            name="industry"
            value={formData.industry || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Region
          </label>
          <input
            name="region"
            value={formData.region || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Tier
          </label>
          <select
            name="tier"
            value={formData.tier || "Standard"}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white"
          >
            <option value="Strategic">Strategic</option>
            <option value="Key">Key</option>
            <option value="Standard">Standard</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            ARR ({currencySymbol})
          </label>
          <input
            type="number"
            name="arr"
            value={formData.arr || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Health Score (0-100)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            name="health_score"
            value={formData.health_score || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Renewal Date
          </label>
          <input
            type="date"
            name="renewal_date"
            value={
              formData.renewal_date ? formData.renewal_date.split("T")[0] : ""
            }
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Upsell Potential ({currencySymbol})
          </label>
          <input
            type="number"
            name="upsell_potential"
            value={formData.upsell_potential || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          Key Stakeholders
        </label>
        <textarea
          name="stakeholders"
          value={formData.stakeholders || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm h-16 resize-y"
        />
      </div>

      <div className="flex gap-2 justify-end mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-500 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-900 text-white rounded-md text-sm hover:bg-opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Account"}
        </button>
      </div>
    </form>
  );
}
