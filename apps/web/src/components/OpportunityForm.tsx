import React, { useState, useEffect } from "react";
import { Opportunity, Account, supabase } from "@repo/db";
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

  // Bid Type dropdown constraint state
  const [hasWonOpportunity, setHasWonOpportunity] = useState(false);

  // Local state for actions
  const [actions, setActions] = useState<{ action: string; date: string }[]>(() => {
    if (initialData?.next_steps) {
      try {
        const parsed = JSON.parse(initialData.next_steps);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        if (initialData.next_steps.trim() !== "") {
          return [{ action: initialData.next_steps, date: "" }];
        }
      }
    }
    return [];
  });

  const [newActionText, setNewActionText] = useState("");
  const [newActionDate, setNewActionDate] = useState("");

  useEffect(() => {
    getAccounts().then(setAccounts).catch(console.error);
  }, []);

  useEffect(() => {
    const checkWonOpportunities = async () => {
      if (!formData.account_id) {
        setHasWonOpportunity(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("opportunities")
          .select("id")
          .eq("account_id", formData.account_id)
          .eq("stage", "Closed Won")
          .limit(1);

        if (error) throw error;
        setHasWonOpportunity(data && data.length > 0);
      } catch (err) {
        console.error("Error checking won opportunities:", err);
        setHasWonOpportunity(false);
      }
    };

    checkWonOpportunities();
  }, [formData.account_id]);

  const handleAddAction = () => {
    if (!newActionText.trim()) return;
    const newAction = {
      action: newActionText.trim(),
      date: newActionDate || new Date().toISOString().split("T")[0],
    };
    const updated = [...actions, newAction];
    setActions(updated);
    setFormData((prev) => ({ ...prev, next_steps: JSON.stringify(updated) }));
    setNewActionText("");
    setNewActionDate("");
  };

  const handleRemoveAction = (idx: number) => {
    const updated = actions.filter((_, i) => i !== idx);
    setActions(updated);
    setFormData((prev) => ({ ...prev, next_steps: JSON.stringify(updated) }));
  };

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
            {!hasWonOpportunity && (
              <option value="New Account New Business">
                New Account New Business
              </option>
            )}
            <option value="Existing Account New Business">
              Existing Account New Business
            </option>
            <option value="Existing Account Change Request">
              Existing Account Change Request
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
            <option value="Proposal Submission">
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

      {/* Next Steps dynamic actions with dates list */}
      <div className="border-t border-gray-100 pt-4">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Next Steps / Action Items
        </label>
        
        {actions.length > 0 ? (
          <div className="space-y-2 mb-3">
            {actions.map((act, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-md p-2 text-xs">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-semibold text-gray-800 break-words">{act.action}</p>
                  {act.date && (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Target Date: {new Date(act.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAction(idx)}
                  className="text-red-500 hover:text-red-700 font-bold bg-transparent border-none cursor-pointer px-1.5 py-0.5 text-[11px]"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic mb-3">No next steps recorded yet.</p>
        )}

        <div className="bg-gray-50/50 border border-gray-200 rounded-md p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Action Description</label>
              <input
                type="text"
                placeholder="e.g. Schedule solution demo"
                value={newActionText}
                onChange={(e) => setNewActionText(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-xs bg-white text-gray-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Target Date</label>
              <input
                type="date"
                value={newActionDate}
                onChange={(e) => setNewActionDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-xs bg-white text-gray-800"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddAction}
            className="w-full py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
          >
            + Add Action Item
          </button>
        </div>
      </div>

      {/* Win / Loss Reason - conditionally triggered */}
      {(formData.stage === "Closed Won" || formData.stage === "Closed Lost") && (
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
      )}

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
