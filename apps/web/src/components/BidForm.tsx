import React, { useState, useEffect } from 'react';
import { Bid, Opportunity } from '@repo/db';
import { createBid, updateBid } from '../../lib/api/bids';
import { getOpportunities } from '../../lib/api/opportunities';

interface BidFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BidForm({ initialData, onSuccess, onCancel }: BidFormProps) {
  const [formData, setFormData] = useState<Partial<Bid>>(
    initialData || {
      status: 'Qualification',
      approval_status: 'Pending',
    }
  );
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOpportunities().then(setOpportunities).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Clean up joined data if editing
    const submitData = { ...formData };
    delete (submitData as any).opportunities;

    try {
      if (initialData?.id) {
        await updateBid(initialData.id, submitData);
      } else {
        await createBid(submitData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save bid');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form id="bid-form" onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-danger text-sm mb-4">{error}</div>}
      
      <div>
        <label className="block text-xs font-semibold text-muted mb-1">Linked Opportunity</label>
        <select
          required
          name="opportunity_id"
          value={formData.opportunity_id || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white"
        >
          <option value="">Select Opportunity...</option>
          {opportunities.map(opp => (
            <option key={opp.id} value={opp.id}>{opp.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted mb-1">Status</label>
        <select
          name="status"
          value={formData.status || 'Qualification'}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white"
        >
          <option value="Qualification">Qualification</option>
          <option value="Technical Proposal">Technical Proposal</option>
          <option value="Commercial Proposal">Commercial Proposal</option>
          <option value="Submitted">Submitted</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted mb-1">Approval Status</label>
        <select
          name="approval_status"
          value={formData.approval_status || 'Pending'}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white"
        >
          <option value="Pending">Pending</option>
          <option value="In Review">In Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted mb-1">Submission Deadline</label>
        <input
          type="date"
          name="submission_deadline"
          value={formData.submission_deadline ? formData.submission_deadline.split('T')[0] : ''}
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
          {loading ? 'Saving...' : 'Save Bid'}
        </button>
      </div>
    </form>
  );
}
