import React, { useState, useEffect } from 'react';
import { Contact, Account } from '@repo/db';
import { createContact, updateContact } from '../../lib/api/contacts';
import { getAccounts } from '../../lib/api/accounts';

interface ContactFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ContactForm({ initialData, onSuccess, onCancel }: ContactFormProps) {
  const [formData, setFormData] = useState<Partial<Contact>>(
    initialData || {
      first_name: '',
      last_name: '',
      role: 'Decision Maker',
    }
  );
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAccounts().then(setAccounts).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Clean up joined data if editing
    const submitData = { ...formData };
    delete (submitData as any).accounts;

    try {
      if (initialData?.id) {
        await updateContact(initialData.id, submitData);
      } else {
        await createContact(submitData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form id="contact-form" onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-danger text-sm mb-4">{error}</div>}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">First Name</label>
          <input
            required
            type="text"
            name="first_name"
            value={formData.first_name || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Last Name</label>
          <input
            required
            type="text"
            name="last_name"
            value={formData.last_name || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted mb-1">Linked Account</label>
        <select
          required
          name="account_id"
          value={formData.account_id || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white"
        >
          <option value="">Select Account...</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Designation</label>
          <input
            type="text"
            name="designation"
            placeholder="e.g. VP of Engineering"
            value={formData.designation || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Department</label>
          <input
            type="text"
            name="department"
            placeholder="e.g. IT, Procurement"
            value={formData.department || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted mb-1">Role Type</label>
        <select
          name="role"
          value={formData.role || 'Decision Maker'}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white"
        >
          <option value="Decision Maker">Decision Maker</option>
          <option value="Technical Contact">Technical Evaluator</option>
          <option value="Finance Contact">Financial Contact</option>
          <option value="Support Contact">Support/Operations</option>
          <option value="Influencer">Influencer</option>
        </select>
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
          {loading ? 'Saving...' : 'Save Contact'}
        </button>
      </div>
    </form>
  );
}
