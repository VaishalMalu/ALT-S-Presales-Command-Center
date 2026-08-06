import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  User,
  Menu,
  X,
  Command,
  LayoutDashboard,
  Briefcase,
  Building2,
  Users,
  FileSignature,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@repo/db";
import AIAssistantWidget from "./AIAssistantWidget";

import { useCurrency, Currency } from "../contexts/CurrencyContext";
import { getAccounts } from "../../lib/api/accounts";
import { getOpportunities } from "../../lib/api/opportunities";
import { getTasks } from "../../lib/api/tasks";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currency, setCurrency } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sidebar collapsed state (persisted in localStorage)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar_collapsed") === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchData, setSearchData] = useState<{ type: string; title: string; path: string }[]>([]);

  useEffect(() => {
    // Load searchable data
    Promise.all([getAccounts(), getOpportunities(), getTasks()]).then(([accs, opps, tsks]) => {
      const data = [
        ...accs.map((a) => ({ type: "Account", title: a.name, path: "/accounts" })),
        ...opps.map((o) => ({ type: "Opportunity", title: o.title, path: "/opportunities" })),
        ...tsks.map((t) => ({ type: "Task", title: t.title, path: "/tasks" })),
      ];
      setSearchData(data);
    });
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Opportunities", path: "/opportunities", icon: Briefcase },
    { name: "Accounts", path: "/accounts", icon: Building2 },
    { name: "Contacts", path: "/contacts", icon: Users },
    { name: "Bids", path: "/bids", icon: FileSignature },
    { name: "Tasks", path: "/tasks", icon: ListChecks },
    { name: "Audit Logs", path: "/audit-logs", icon: ShieldCheck },
  ];

  const searchResults = searchQuery
    ? [
        ...navItems
          .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((item) => ({ type: "Page", title: item.name, path: item.path })),
        ...searchData.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase())),
      ].slice(0, 8)
    : [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle clicking outside search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        // give time for link click to process
        setTimeout(() => setIsSearchOpen(false), 200);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const sidebarContent = (collapsed: boolean) => (
    <>
      <div className={`h-16 border-b border-border bg-gradient-to-b from-gray-50 to-white flex items-center justify-between shrink-0 ${collapsed ? 'px-3 justify-center' : 'px-5'}`}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="ALT-S Logo"
              className="h-9 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
                e.currentTarget.nextElementSibling?.classList.add("flex");
              }}
            />
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-[#2a3682] text-white hidden items-center justify-center font-bold shadow-sm">
              A
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="font-extrabold text-[14px] text-primary leading-none tracking-tight drop-shadow-sm mb-1">
                Presales
              </h1>
              <p className="text-[8px] font-bold text-gray-400 tracking-[0.1em] uppercase leading-none">
                Command Center
              </p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      <nav className={`flex-1 space-y-2 overflow-y-auto ${collapsed ? 'p-2 flex flex-col items-center' : 'p-4'}`}>
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          
          const Icon = item.icon;

          if (collapsed) {
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                title={item.name}
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors group ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="w-[20px] h-[20px]" strokeWidth={isActive ? 2.5 : 2} />
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors text-[14px] group ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-[20px] h-[20px] transition-colors ${
                isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
              }`} strokeWidth={isActive ? 2.5 : 2} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="bg-background text-primary flex absolute inset-0 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`bg-card border-r border-border flex-col hidden md:flex transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        {sidebarContent(sidebarCollapsed)}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={closeMobileMenu}
          ></div>

          {/* Sidebar */}
          <aside className="relative flex-1 flex flex-col max-w-xs w-full bg-card shadow-2xl z-50 animate-in slide-in-from-left-full duration-300">
            <div className="absolute top-0 right-0 -mr-12 pt-4">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={closeMobileMenu}
              >
                <X className="text-white w-6 h-6" />
              </button>
            </div>
            {sidebarContent(false)}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Command Bar */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 gap-4 shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              className="md:hidden text-gray-500 hover:text-primary transition-colors p-1"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="relative max-w-md w-full">
              <div
                className="flex items-center bg-gray-100 px-3 py-1.5 rounded-md text-sm text-gray-500 w-full border border-transparent focus-within:border-primary/30 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all cursor-text"
                onClick={() => {
                  searchInputRef.current?.focus();
                  setIsSearchOpen(true);
                }}
              >
                <Search className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Global Search..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 w-full min-w-0"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                />
                <kbd className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-200 rounded border border-gray-300 shrink-0">
                  <Command className="w-3 h-3" />K
                </kbd>
              </div>

              {isSearchOpen && searchQuery && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-100 z-50 overflow-hidden">
                  {searchResults.length > 0 ? (
                    <ul className="max-h-64 overflow-y-auto">
                      {searchResults.map((result, idx) => (
                        <li key={`${result.type}-${result.title}-${idx}`}>
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between group transition-colors"
                            onClick={() => {
                              navigate(result.path);
                              setSearchQuery("");
                              setIsSearchOpen(false);
                            }}
                          >
                            <span className="text-sm font-medium text-gray-800 group-hover:text-primary truncate">
                              {result.title}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                              {result.type}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-4 text-sm text-gray-500 text-center">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3 items-center shrink-0 relative">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="USD">USD ($)</option>
              <option value="AED">AED</option>
              <option value="INR">INR (₹)</option>
            </select>
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full transition-colors relative hidden sm:block"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {notificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotificationsOpen(false)}
                ></div>
                <div className="absolute top-10 right-10 w-72 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-2">
                  <div className="px-4 py-2 border-b border-gray-100 font-semibold text-gray-800 text-sm">
                    Notifications
                  </div>
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    No new notifications
                  </div>
                </div>
              </>
            )}

            <div
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              className="w-8 h-8 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <User className="w-4 h-4" />
            </div>

            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                ></div>
                <div className="absolute top-10 right-0 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">
                      Admin User
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      admin@alt-s.com
                    </p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Profile Settings
                  </button>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      navigate("/login");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Main Content scrollable area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50/30">
          <Outlet />
        </main>
      </div>

      {/* Global AI Assistant */}
      <AIAssistantWidget />
    </div>
  );
}
