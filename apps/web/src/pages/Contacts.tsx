import React, { useEffect, useState, useCallback, useMemo } from "react";
import { getContacts, deleteContact } from "../../lib/api/contacts";
import { getAccounts } from "../../lib/api/accounts";
import { Account, Contact } from "@repo/db";
import Drawer from "../components/Drawer";
import ContactForm from "../components/ContactForm";
import { exportToCSV } from "../components/ui-utils";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [contactsData, accountsData] = await Promise.all([
        getContacts(),
        getAccounts(),
      ]);
      setContacts(contactsData);
      setAccounts(accountsData);
    } catch (err: any) {
      setError(err.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const accountMap = useMemo(() => {
    const map: Record<string, string> = {};
    accounts.forEach((acc) => {
      map[acc.id] = acc.name;
    });
    return map;
  }, [accounts]);

  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts;
    const term = searchTerm.toLowerCase();
    return contacts.filter((c) => {
      const accName = c.account_id ? (accountMap[c.account_id] || "") : "";
      const fullName = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
      return (
        fullName.includes(term) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.phone && c.phone.toLowerCase().includes(term)) ||
        (c.role && c.role.toLowerCase().includes(term)) ||
        (c.designation && c.designation.toLowerCase().includes(term)) ||
        (c.department && c.department.toLowerCase().includes(term)) ||
        accName.toLowerCase().includes(term)
      );
    });
  }, [contacts, searchTerm, accountMap]);

  const handleOpenDrawer = (contact?: Contact) => {
    setEditingContact(contact || null);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingContact(null);
  };

  const handleFormSuccess = () => {
    handleCloseDrawer();
    fetchData();
  };

  const handleDeleteContact = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete contact "${name}"?`)) {
      try {
        await deleteContact(id);
        fetchData();
      } catch (err: any) {
        alert(err.message || "Failed to delete contact");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            Contacts
          </h1>
          <p className="text-sm text-gray-500">
            Manage external stakeholders and decision makers.
          </p>
        </div>
        <button
          onClick={() => handleOpenDrawer()}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors shadow-sm font-medium text-sm cursor-pointer"
        >
          + New Contact
        </button>
      </div>

      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-3 justify-between items-center bg-gray-50/50">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-border rounded-md px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <div className="flex space-x-2">
            <button
              onClick={() => exportToCSV(filteredContacts, "contacts_export.csv")}
              className="border border-border px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 font-medium text-gray-700 transition-colors cursor-pointer"
            >
              Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading contacts...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-danger">{error}</div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="mb-2 text-lg font-medium text-gray-700">
              No Contacts Found
            </div>
            <p className="text-sm">
              {searchTerm ? "No contacts match your search." : "Get started by adding your first customer contact."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
              <thead className="bg-gray-50 text-gray-600 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Name
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Account
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Role
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Email
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Phone
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Title / Dept
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredContacts.map((contact) => {
                  const accountName = contact.account_id
                    ? accountMap[contact.account_id] || (contact as any).accounts?.name || "—"
                    : (contact as any).accounts?.name || "—";

                  return (
                    <tr
                      key={contact.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {contact.first_name} {contact.last_name}
                      </td>
                      <td className="px-4 py-3 text-secondary font-medium text-xs">
                        <span className="font-semibold text-gray-800">{accountName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                          contact.role === "Decision Maker"
                            ? "bg-purple-50 text-purple-700 border-purple-200 font-semibold"
                            : contact.role === "Sponsor"
                            ? "bg-blue-50 text-blue-700 border-blue-200 font-semibold"
                            : contact.role?.includes("Influencer")
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}>
                          {contact.role || "Contact"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                        {contact.email || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {contact.phone || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-800 font-medium">
                          {contact.designation || "—"}
                        </div>
                        {contact.department && (
                          <div className="text-xs text-gray-400">
                            {contact.department}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button
                            className="px-2 py-1 border border-border rounded text-xs font-semibold text-primary hover:bg-gray-100 cursor-pointer transition-colors bg-white"
                            onClick={() => handleOpenDrawer(contact)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-2 py-1 border border-red-200 rounded text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer transition-colors bg-white"
                            onClick={() =>
                              handleDeleteContact(
                                contact.id,
                                `${contact.first_name} ${contact.last_name}`
                              )
                            }
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
