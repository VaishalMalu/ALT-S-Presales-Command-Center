import React, { useState, useEffect } from "react";
import { Opportunity, Account, supabase } from "@repo/db";
import {
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from "../../lib/api/opportunities";
import { getAccounts } from "../../lib/api/accounts";
import { useCurrency } from "../contexts/CurrencyContext";
import AIFormToolbar from "./AIFormToolbar";
import AccountForm from "./AccountForm";

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
      priority: "Medium",
    },
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customEntities, setCustomEntities] = useState<string[]>([]);
  const [customPartners, setCustomPartners] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Bid Type dropdown constraint state
  const [hasWonOpportunity, setHasWonOpportunity] = useState(false);

  // Partner options populated from existing partner data and custom partners
  const partnerList = React.useMemo(() => {
    const defaults = ["ALT-S", "Infodrive Analytics", "Sifratech", "Clover Infotech"];
    const set = new Set([...defaults, ...customPartners]);
    if (formData.partner_name && formData.partner_name.trim()) {
      set.add(formData.partner_name.trim());
    }
    return Array.from(set);
  }, [customPartners, formData.partner_name]);

  // Local state for actions with completed indicator support
  interface ActionItem {
    action: string;
    date: string;
    completed?: boolean;
  }

  const [actions, setActions] = useState<ActionItem[]>(() => {
    if (initialData?.next_steps) {
      try {
        const parsed = JSON.parse(initialData.next_steps);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => {
            if (typeof item === "string") return { action: item, date: "", completed: false };
            return {
              action: item.action || "",
              date: item.date || "",
              completed: Boolean(item.completed),
            };
          });
        }
      } catch (e) {
        if (initialData.next_steps.trim() !== "") {
          return [{ action: initialData.next_steps, date: "", completed: false }];
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
    const newAction: ActionItem = {
      action: newActionText.trim(),
      date: newActionDate || new Date().toISOString().split("T")[0],
      completed: false,
    };
    const updated = [...actions, newAction];
    setActions(updated);
    setFormData((prev) => ({ ...prev, next_steps: JSON.stringify(updated) }));
    setNewActionText("");
    setNewActionDate("");
  };

  const handleToggleActionComplete = (idx: number) => {
    const updated = actions.map((act, i) =>
      i === idx ? { ...act, completed: !act.completed } : act
    );
    setActions(updated);
    setFormData((prev) => ({ ...prev, next_steps: JSON.stringify(updated) }));
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

  if (isCreatingAccount) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setIsCreatingAccount(false)}
            className="text-sm font-semibold text-primary hover:underline bg-transparent border-none cursor-pointer p-0"
          >
            &larr; Back to Opportunity
          </button>
          <span className="text-gray-400">|</span>
          <h3 className="m-0 text-sm font-bold text-gray-900 uppercase tracking-wider">Create New Account</h3>
        </div>
        <AccountForm
          onSuccess={async () => {
            // Re-fetch accounts and auto-select the newest one
            try {
              const updatedAccounts = await getAccounts();
              setAccounts(updatedAccounts);
              if (updatedAccounts.length > 0) {
                setFormData((prev) => ({ ...prev, account_id: updatedAccounts[0].id }));
              }
            } catch (err) {
              console.error(err);
            }
            setIsCreatingAccount(false);
          }}
          onCancel={() => setIsCreatingAccount(false)}
        />
      </div>
    );
  }

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (window.confirm(`Are you sure you want to delete opportunity "${initialData.title}"?`)) {
      setLoading(true);
      try {
        await deleteOpportunity(initialData.id);
        onSuccess();
      } catch (err: any) {
        setError(err.message || "Failed to delete opportunity");
        setLoading(false);
      }
    }
  };

  return (
    <form id="opportunity-form" onSubmit={handleSubmit} className="space-y-4">
      <AIFormToolbar formType="Opportunity" formData={formData} setFormData={setFormData} />
      {error && <div className="text-danger text-sm mb-4">{error}</div>}

      {/* 1. Opportunity ID */}
      <div>
        <label className="block text-xs font-semibold text-muted mb-1">
          Opportunity ID
        </label>
        <input
          disabled
          value={initialData?.id || "Auto-assigned on save"}
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-gray-50 text-gray-500 font-mono"
        />
      </div>

      {/* 2. Account */}
      <div>
        <label className="block text-xs font-semibold text-muted mb-1">
          Account <span className="text-red-500">*</span>
        </label>
        <select
          required
          name="account_id"
          value={formData.account_id || ""}
          onChange={(e) => {
            if (e.target.value === "__add_new__") {
              setIsCreatingAccount(true);
            } else {
              handleChange(e);
            }
          }}
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white"
        >
          <option value="">Select Account...</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
          <option value="__add_new__" className="font-semibold text-primary">
            + Create New Account...
          </option>
        </select>
      </div>

      {/* 3. Received Date */}
      <div>
        <label className="block text-xs font-semibold text-muted mb-1">
          Received Date
        </label>
        <input
          type="date"
          name="received_date"
          value={
            formData.received_date
              ? formData.received_date.split("T")[0]
              : ""
          }
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white"
        />
      </div>

      {/* 4. Partner Name */}
      <div>
        <label className="block text-xs font-semibold text-muted mb-1">
          Partner Name
        </label>
        <select
          name="partner_name"
          value={formData.partner_name || ""}
          onChange={(e) => {
            if (e.target.value === "__add_new_partner__") {
              const newPartner = window.prompt("Enter new Partner name:");
              if (newPartner && newPartner.trim() !== "") {
                const trimmed = newPartner.trim();
                setCustomPartners((prev) => [...prev, trimmed]);
                setFormData((prev) => ({ ...prev, partner_name: trimmed }));
              }
            } else {
              handleChange(e);
            }
          }}
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white"
        >
          <option value="">Select Partner...</option>
          {partnerList.map((partner) => (
            <option key={partner} value={partner}>
              {partner}
            </option>
          ))}
          <option value="__add_new_partner__" className="font-semibold text-primary">
            + Add New Partner...
          </option>
        </select>
      </div>

      {/* 5. Opportunity Name */}
      <div>
        <label className="block text-xs font-semibold text-muted mb-1">
          Opportunity Name <span className="text-red-500">*</span>
        </label>
        <input
          required
          name="title"
          value={formData.title || ""}
          onChange={handleChange}
          placeholder="e.g. Enterprise Cloud Migration"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
      </div>

      {/* 6. Driven By (Entity) */}
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

      {/* 7. Bid Type & Opportunity Type */}
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
            <option value="Managed Services">Managed Services</option>
            <option value="Resource Augmentation">Resource Augmentation</option>
            <option value="CR">CR</option>
          </select>
        </div>
      </div>

      {/* 8. Stage & Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            Stage
          </label>
          <select
            name="stage"
            value={
              formData.stage === "Proposal Submission"
                ? "Proposal/RFP Submitted"
                : (formData.stage || "Lead Created")
            }
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

      {/* 9. Owner */}
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

      {/* 10. Deal Value & Probability */}
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

      {/* 11. Pre-Bid Kick-off Date & Clarification Deadline */}
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

      {/* 12. RFP / Submission Deadline */}
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

      {/* 13. Competitors */}
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

      {/* 14. Next Steps / Action Items with Completed Indicator */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Next Steps / Action Items
          </label>
          {actions.length > 0 && (
            <span className="text-[11px] text-gray-500">
              {actions.filter((a) => a.completed).length} of {actions.length} completed
            </span>
          )}
        </div>
        
        {actions.length > 0 ? (
          <div className="space-y-2 mb-3">
            {actions.map((act, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-2.5 rounded-md border text-xs transition-colors ${
                  act.completed
                    ? "bg-green-50/60 border-green-200 text-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0 pr-2">
                  <input
                    type="checkbox"
                    checked={act.completed || false}
                    onChange={() => handleToggleActionComplete(idx)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    title={act.completed ? "Mark as Incomplete" : "Mark as Completed"}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`font-semibold break-words m-0 ${
                          act.completed ? "line-through text-gray-500" : "text-gray-800"
                        }`}
                      >
                        {act.action}
                      </p>
                      {act.completed && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 border border-green-300">
                          <span>✓</span> Completed
                        </span>
                      )}
                    </div>
                    {act.date && (
                      <p className="text-[10px] text-gray-400 mt-0.5 m-0">
                        Target Date: {new Date(act.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
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

      <div className="flex gap-2 justify-between items-center mt-6 border-t border-gray-100 pt-4">
        {initialData?.id ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-3 py-2 border border-red-200 text-red-600 rounded-md text-xs font-semibold hover:bg-red-50 disabled:opacity-50 cursor-pointer"
          >
            Delete Opportunity
          </button>
        ) : (
          <div />
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-border rounded-md text-sm text-muted hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Saving..." : "Save Opportunity"}
          </button>
        </div>
      </div>
    </form>
  );
}
