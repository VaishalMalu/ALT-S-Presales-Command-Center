import React, { useState, useEffect } from "react";
import { Opportunity, Account } from "@repo/db";
import {
  createOpportunity,
  updateOpportunity,
} from "../../lib/api/opportunities";
import { getAccounts } from "../../lib/api/accounts";
import { useCurrency } from "../contexts/CurrencyContext";
import AIFormToolbar from "./AIFormToolbar";

interface OpportunityFormProps {
  initialData?: Opportunity | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function OpportunityForm({
  initialData,
  onSuccess,
  onCancel,
}: OpportunityFormProps) {
  const { currencySymbol } = useCurrency();
  const [formData, setFormData] = useState<Partial<Opportunity>>(
    initialData || {
      title: "",
      stage: "Lead Created",
      deal_value: 0,
      probability: 0,
    },
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customEntities, setCustomEntities] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    getAccounts().then(setAccounts).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Remove joined tables before saving if they exist (e.g. accounts object)
    const submitData = { ...formData };
    delete (submitData as any).accounts;

    try {
      if (initialData?.id) {
        await updateOpportunity(initialData.id, submitData);
      } else {
        const newOpp = await createOpportunity(submitData);

        // Auto-task generation flow
        const label = newOpp.title || "(untitled opportunity)";
        const tasksToCreate = [];
        const baseTask = {
          opportunity_id: newOpp.id,
          category: "Bid Management",
          status: "Not Started" as const,
          priority: "High" as const,
        };

        if (newOpp.deadline) {
          tasksToCreate.push({
            ...baseTask,
            title: `Submit proposal / RFP — ${label}`,
            due_date: newOpp.deadline,
          });
        }
        tasksToCreate.push({
          ...baseTask,
          title: `Prepare proposal presentation — ${label}`,
          due_date: newOpp.deadline || undefined,
        });

        const { createTask } = await import("../../lib/api/tasks");
        await Promise.all(tasksToCreate.map((t) => createTask(t)));
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save opportunity");
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
    <form id="opportunity-form" onSubmit={handleSubmit} className="space-y-4">
      <AIFormToolbar formType="Opportunity" formData={formData} setFormData={setFormData} />
      {error && <div className="text-danger text-sm mb-4">{error}</div>}

      <div>
        <label className="block text-xs font-semibold text-muted mb-1">
          Opportunity ID
        </label>
        <input
          disabled
          value={initialData?.id || "Auto-assigned on save"}
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-gray-50 text-gray-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted mb-1">
          Account Name
        </label>
        <select
          name="account_id"
          value={formData.account_id || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white"
        >
          <option value="">Select...</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted mb-1">
          Opportunity Name
        </label>
        <input
          required
          name="title"
          value={formData.title || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted mb-1">
          Driven By (Entity)
        </label>
        <select
          name="driven_by"
          value={formData.driven_by || ""}
          onChange={(e) => {
            if (e.target.value === "__add_new__") {
              const newEntity = window.prompt(
                "Enter new Entity / Partner name:",
              );
              if (newEntity && newEntity.trim() !== "") {
                const trimmed = newEntity.trim();
                setCustomEntities((prev) => [...prev, trimmed]);
                setFormData((prev) => ({ ...prev, driven_by: trimmed }));
              }
            } else {
              handleChange(e);
            }
          }}
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white"
        >
          <option value="">Select...</option>
          <option value="ALT-S">ALT-S</option>
          <option value="Infodrive Analytics">Infodrive Analytics</option>
          <option value="Sifratech">Sifratech</option>
          <option value="Clover Infotech">Clover Infotech</option>
          {customEntities.map((entity) => (
            <option key={entity} value={entity}>
              {entity}
            </option>
          ))}
          <option value="__add_new__" className="font-semibold text-primary">
            + Add New Entity / Partner...
          </option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            Bid Type
          </label>
          <select
            name="bid_type"
            value={formData.bid_type || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white"
          >
            <option value="">Select...</option>
            <option value="New Account New Business">
              New Account New Business
            </option>
            <option value="Existing Account New Business">
              Existing Account New Business
            </option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            Opportunity Type
          </label>
          <select
            name="type"
            value={formData.type || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white"
          >
            <option value="">Select...</option>
            <option value="Implementation">Implementation</option>
            <option value="Resource Augmentation">Resource Augmentation</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            Stage
          </label>
          <select
            name="stage"
            value={formData.stage || "Lead Created"}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white"
          >
            <option value="Lead Created">Lead Created</option>
            <option value="Customer Qualification">
              Customer Qualification
            </option>
            <option value="Solution Design">Solution Design</option>
            <option value="Proposal/RFP Submitted">
              Proposal/RFP Submitted
            </option>
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority || "Medium"}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted mb-1">
          Owner
        </label>
        <input
          name="owner"
          value={formData.owner || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            Deal Value ({currencySymbol})
          </label>
          <input
            type="number"
            name="deal_value"
            value={formData.deal_value || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            Probability (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            name="probability"
            value={
              formData.probability !== undefined &&
              formData.probability !== null
                ? Math.round(formData.probability * 100)
                : ""
            }
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                probability: Number(e.target.value) / 100,
              }))
            }
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            Pre-Bid Kick-off Date (if any)
          </label>
          <input
            type="date"
            name="pre_bid_kickoff_date"
            value={
              formData.pre_bid_kickoff_date
                ? formData.pre_bid_kickoff_date.split("T")[0]
                : ""
            }
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            Clarification Deadline (if any)
          </label>
          <input
            type="date"
            name="clarification_deadline"
            value={
              formData.clarification_deadline
                ? formData.clarification_deadline.split("T")[0]
                : ""
            }
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted mb-1">
          RFP / Submission Deadline
        </label>
        <input
          type="date"
          name="deadline"
          value={formData.deadline ? formData.deadline.split("T")[0] : ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted mb-1">
          Competitors
        </label>
        <input
          name="competitors"
          value={formData.competitors || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted mb-1">
          Next Steps
        </label>
        <textarea
          name="next_steps"
          value={formData.next_steps || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md text-sm h-20 resize-y"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted mb-1">
          Win / Loss Reason
        </label>
        <input
          name="win_loss_reason"
          value={formData.win_loss_reason || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
      </div>

      <div className="flex gap-2 justify-end mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border border-border rounded-md text-sm text-muted hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Opportunity"}
        </button>
      </div>
    </form>
  );
}
