import React, { useState, useEffect } from "react";
import { Task, Opportunity, Account } from "@repo/db";
import { createTask, updateTask } from "../../lib/api/tasks";

import { getOpportunities } from "../../lib/api/opportunities";
import { getAccounts } from "../../lib/api/accounts";

interface TaskFormProps {
  initialData?: Task | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TaskForm({
  initialData,
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const [formData, setFormData] = useState<Partial<Task>>(
    initialData || {
      title: "",
      status: "Not Started",
      priority: "Medium",
      category: "Presales Management",
    },
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    Promise.all([getOpportunities(), getAccounts()])
      .then(([opps, accs]) => {
        setOpportunities(opps);
        setAccounts(accs);
      })
      .catch((err) => console.error("Failed to load options", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (initialData?.id) {
        await updateTask(initialData.id, formData);
      } else {
        await createTask(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save task");
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

  const isBottleneck =
    formData.status === "Waiting Customer" ||
    formData.status === "Waiting Internal" ||
    formData.status === "Blocked";

  return (
    <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          Task Title
        </label>
        <input
          required
          name="title"
          value={formData.title || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category || "Presales Management"}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white"
          >
            <option value="Presales Management">Presales Management</option>
            <option value="Bid Management">Bid Management</option>
            <option value="Account Management">Account Management</option>
            <option value="Internal/Admin">Internal/Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority || "Medium"}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white"
          >
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status || "Not Started"}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white"
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting Customer">Waiting Customer</option>
            <option value="Waiting Internal">Waiting Internal</option>
            <option value="Blocked">Blocked</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Due Date
          </label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date ? formData.due_date.split("T")[0] : ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
          />
        </div>
      </div>

      {isBottleneck && (
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Bottleneck Type
          </label>
          <select
            name="bottleneck_type"
            value={formData.bottleneck_type || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white"
          >
            <option value="">Select...</option>
            <option value="Client">Client</option>
            <option value="Internal">Internal</option>
            <option value="Other">Other</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          Related Opportunity
        </label>
        <select
          name="opportunity_id"
          value={formData.opportunity_id || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              opportunity_id: e.target.value || null,
              account_id: null,
            }))
          }
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white"
        >
          <option value="">-- None --</option>
          {opportunities.map((opp) => (
            <option key={opp.id} value={opp.id}>
              {opp.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          Related Account
        </label>
        <select
          name="account_id"
          value={formData.account_id || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              account_id: e.target.value || null,
              opportunity_id: null,
            }))
          }
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white"
        >
          <option value="">-- None --</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm h-20 resize-y"
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
          {loading ? "Saving..." : "Save Task"}
        </button>
      </div>
    </form>
  );
}
