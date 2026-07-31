import React, { useEffect, useState, useCallback } from 'react';
import { getContacts } from '../../lib/api/contacts';
import Drawer from '../components/Drawer';
import ContactForm from '../components/ContactForm';
import { RagBadge } from '../components/ui-utils';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleOpenDrawer = (contact?: any) => {
    setEditingContact(contact || null);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingContact(null);
  };

  const handleFormSuccess = () => {
    handleCloseDrawer();
    fetchContacts();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Contacts</h1>
          <p className="text-sm text-gray-500">Manage external stakeholders and decision makers.</p>
        </div>
        <button 
          onClick={() => handleOpenDrawer()}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors shadow-sm font-medium text-sm"
        >
          + New Contact
        </button>
      </div>

      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between bg-gray-50/50">
          <input 
            type="text" 
            placeholder="Search contacts..." 
            className="border border-border rounded-md px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <div className="flex space-x-2">
            <button className="border border-border px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 font-medium text-gray-700 transition-colors">Filter</button>
            <button className="border border-border px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 font-medium text-gray-700 transition-colors">Export</button>
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading contacts...</div>
        ) : error ? (
          <div className="p-12 text-center text-danger">{error}</div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="mb-2 text-lg font-medium text-gray-700">No Contacts Found</div>
            <p className="text-sm">Get started by adding your first customer contact.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
              <thead className="bg-gray-50 text-gray-600 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Name</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Account</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Role</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Email</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Phone</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Title / Dept</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contacts.map((contact) => {
                  return (
                    <tr key={contact.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {contact.first_name} {contact.last_name}
                      </td>
                      <td className="px-4 py-3 text-secondary font-medium text-xs">
                        {contact.accounts?.name || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <RagBadge status={contact.role === 'Decision Maker' ? 'Critical' : (contact.role === 'Influencer' ? 'Medium' : 'Green')} />
                        <span className="ml-2 text-xs text-gray-500">{contact.role}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {contact.email || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {contact.phone || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-800">{contact.designation || '—'}</div>
                        <div className="text-xs text-gray-500">{contact.department || ''}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="px-2.5 py-1 border border-border rounded text-xs font-semibold text-primary hover:bg-primary/5 transition-colors bg-white"
                            onClick={() => handleOpenDrawer(contact)}
                          >
                            Edit
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
        title={editingContact ? "Edit Contact" : "Add New Contact"}
      >
        <ContactForm
          initialData={editingContact}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseDrawer}
        />
      </Drawer>
    </div>
  );
}
