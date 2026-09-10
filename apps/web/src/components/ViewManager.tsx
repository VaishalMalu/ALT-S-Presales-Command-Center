import React, { useState, useEffect } from "react";
import { X, Eye, Trash2, Check, Save, ChevronDown } from "lucide-react";

export interface ColumnDef {
  key: string;
  label: string;
  defaultVisible?: boolean;
}

export interface SavedView {
  id: string;
  name: string;
  visibleColumns: string[];
  createdAt: number;
}

interface ViewManagerProps {
  storageKey: string; // e.g. "opp_views" or "acc_views"
  allColumns: ColumnDef[];
  activeViewId: string | null;
  onViewChange: (visibleColumns: string[], viewId: string | null) => void;
}

function loadViews(storageKey: string): SavedView[] {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveViews(storageKey: string, views: SavedView[]) {
  localStorage.setItem(storageKey, JSON.stringify(views));
}

export default function ViewManager({ storageKey, allColumns, activeViewId, onViewChange }: ViewManagerProps) {
  const [views, setViews] = useState<SavedView[]>(() => loadViews(storageKey));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [selectedCols, setSelectedCols] = useState<Set<string>>(
    () => new Set(allColumns.filter((c) => c.defaultVisible !== false).map((c) => c.key))
  );

  const activeView = views.find((v) => v.id === activeViewId) || null;

  const toggleCol = (key: string) => {
    setSelectedCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSaveView = () => {
    if (!newViewName.trim()) return;
    const newView: SavedView = {
      id: `view-${Date.now()}`,
      name: newViewName.trim(),
      visibleColumns: allColumns.map((c) => c.key).filter((k) => selectedCols.has(k)),
      createdAt: Date.now(),
    };
    const updated = [newView, ...views];
    setViews(updated);
    saveViews(storageKey, updated);
    onViewChange(newView.visibleColumns, newView.id);
    setCreating(false);
    setNewViewName("");
    setDropdownOpen(false);
  };

  const handleDeleteView = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = views.filter((v) => v.id !== id);
    setViews(updated);
    saveViews(storageKey, updated);
    if (activeViewId === id) {
      const defaultCols = allColumns.filter((c) => c.defaultVisible !== false).map((c) => c.key);
      onViewChange(defaultCols, null);
    }
  };

  const handleActivateView = (view: SavedView) => {
    setDropdownOpen(false);
    onViewChange(view.visibleColumns, view.id);
  };

  const handleResetDefault = () => {
    const defaultCols = allColumns.filter((c) => c.defaultVisible !== false).map((c) => c.key);
    onViewChange(defaultCols, null);
    setDropdownOpen(false);
  };

  const openCreatePanel = () => {
    if (activeView) {
      setSelectedCols(new Set(activeView.visibleColumns));
    } else {
      setSelectedCols(new Set(allColumns.filter((c) => c.defaultVisible !== false).map((c) => c.key)));
    }
    setCreating(true);
    setNewViewName("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { setDropdownOpen(!dropdownOpen); setCreating(false); }}
        className="flex items-center gap-1.5 border border-border px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 font-medium text-gray-700 transition-colors cursor-pointer"
      >
        <Eye size={14} />
        {activeView ? (
          <span className="max-w-[100px] truncate">{activeView.name}</span>
        ) : (
          "Views"
        )}
        <ChevronDown size={12} className="text-gray-400" />
      </button>

      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => { setDropdownOpen(false); setCreating(false); }} />
          <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-40 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Saved Views</span>
              <button
                type="button"
                onClick={() => { setDropdownOpen(false); setCreating(false); }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none p-0"
              >
                <X size={14} />
              </button>
            </div>

            {!creating ? (
              <>
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent ${!activeViewId ? "text-primary font-semibold" : "text-gray-700"}`}
                >
                  <span>Default View</span>
                  {!activeViewId && <Check size={14} className="text-primary" />}
                </button>

                {views.length > 0 && (
                  <div className="border-t border-gray-100">
                    {views.map((view) => (
                      <button
                        key={view.id}
                        type="button"
                        onClick={() => handleActivateView(view)}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent group ${activeViewId === view.id ? "text-primary font-semibold" : "text-gray-700"}`}
                      >
                        <span className="truncate flex-1">{view.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {activeViewId === view.id && <Check size={14} className="text-primary" />}
                          <span
                            onClick={(e) => handleDeleteView(e, view.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {views.length === 0 && (
                  <div className="px-4 py-4 text-xs text-gray-400 italic text-center">No saved views yet</div>
                )}

                <div className="border-t border-gray-100 p-2">
                  <button
                    type="button"
                    onClick={openCreatePanel}
                    className="w-full text-center py-2 text-sm font-semibold text-primary hover:bg-blue-50 rounded-md transition-colors cursor-pointer border border-dashed border-primary/30 bg-transparent"
                  >
                    + Create New View
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">View Name</label>
                  <input
                    autoFocus
                    type="text"
                    value={newViewName}
                    onChange={(e) => setNewViewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveView()}
                    placeholder="e.g. High Priority Deals"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Select Columns</label>
                  <div className="max-h-52 overflow-y-auto space-y-1 border border-gray-100 rounded-md p-2 bg-gray-50">
                    {allColumns.map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-white cursor-pointer text-sm text-gray-700 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCols.has(col.key)}
                          onChange={() => toggleCol(col.key)}
                          className="rounded text-primary focus:ring-primary/30 cursor-pointer"
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-500 hover:bg-gray-50 cursor-pointer bg-transparent"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveView}
                    disabled={!newViewName.trim()}
                    className="flex-1 px-3 py-2 bg-primary text-white rounded-md text-sm font-semibold hover:bg-opacity-90 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Save size={13} />
                    Save View
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
