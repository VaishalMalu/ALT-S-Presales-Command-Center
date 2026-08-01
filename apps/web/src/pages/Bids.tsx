import React, { useEffect, useState, useCallback } from "react";
import { getBids } from "../../lib/api/bids";
import Drawer from "../components/Drawer";
import BidForm from "../components/BidForm";
import { DeadlineBadge, RagBadge, daysUntil } from "../components/ui-utils";

export default function BidsPage() {
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingBid, setEditingBid] = useState<any | null>(null);

  const fetchBids = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBids();
      setBids(data);
    } catch (err: any) {
      setError(err.message || "Failed to load bids");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  const handleOpenDrawer = (bid?: any) => {
    setEditingBid(bid || null);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingBid(null);
  };

  const handleFormSuccess = () => {
    handleCloseDrawer();
    fetchBids();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            Bids & Proposals
          </h1>
          <p className="text-sm text-gray-500">
            Track and manage your proposals and RFPs.
          </p>
        </div>
        <button
          onClick={() => handleOpenDrawer()}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors shadow-sm font-medium text-sm"
        >
          + New Bid
        </button>
      </div>

      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between bg-gray-50/50">
          <input
            type="text"
            placeholder="Search bids..."
            className="border border-border rounded-md px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <div className="flex space-x-2">
            <button className="border border-border px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 font-medium text-gray-700 transition-colors">
              Filter
            </button>
            <button className="border border-border px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 font-medium text-gray-700 transition-colors">
              Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading bids...</div>
        ) : error ? (
          <div className="p-12 text-center text-danger">{error}</div>
        ) : bids.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="mb-2 text-lg font-medium text-gray-700">
              No Bids Found
            </div>
            <p className="text-sm">
              Get started by creating a new bid to track your RFP progress.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
              <thead className="bg-gray-50 text-gray-600 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Bid ID
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Opportunity
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Approval Status
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Submission Deadline
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bids.map((bid) => {
                  return (
                    <tr
                      key={bid.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-500">
                        BID-{bid.id.substring(0, 4).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {bid.opportunities?.title || "Unknown Opportunity"}
                      </td>
                      <td className="px-4 py-3">
                        <RagBadge status={bid.status} />
                      </td>
                      <td className="px-4 py-3">
                        <RagBadge status={bid.approval_status} />
                      </td>
                      <td className="px-4 py-3">
                        <DeadlineBadge
                          days={daysUntil(bid.submission_deadline)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="px-2.5 py-1 border border-border rounded text-xs font-semibold text-primary hover:bg-primary/5 transition-colors bg-white"
                            onClick={() => handleOpenDrawer(bid)}
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
        title={editingBid ? "Edit Bid" : "Create New Bid"}
      >
        <BidForm
          initialData={editingBid}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseDrawer}
        />
      </Drawer>
    </div>
  );
}
