import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Bell, Search, User, Menu, X, Command } from "lucide-react";

import { useCurrency, Currency, CURRENCY_SYMBOLS } from "../contexts/CurrencyContext";

export default function Layout() {
  const location = useLocation();
  const { currency, setCurrency } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Opportunities", path: "/opportunities" },
    { name: "Accounts", path: "/accounts" },
    { name: "Contacts", path: "/contacts" },
    { name: "Bids", path: "/bids" },
    { name: "Tasks", path: "/tasks" },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const SidebarContent = () => (
    <>
      <div className="h-16 px-5 border-b border-border bg-gradient-to-b from-gray-50 to-white flex items-center gap-3 shrink-0">
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
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={`block px-3 py-2 rounded-md font-medium transition-colors ${isActive ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="bg-background text-primary flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex-col hidden md:flex">
        <SidebarContent />
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
            <SidebarContent />
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

            <div
              className="flex items-center bg-gray-100 px-3 py-1.5 rounded-md text-sm text-gray-500 max-w-md w-full border border-transparent focus-within:border-primary/30 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all cursor-text"
              onClick={() => searchInputRef.current?.focus()}
            >
              <Search className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Global Search..."
                className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 w-full min-w-0"
              />
              <kbd className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-200 rounded border border-gray-300 shrink-0">
                <Command className="w-3 h-3" />K
              </kbd>
            </div>
          </div>

          <div className="flex space-x-3 items-center shrink-0 relative">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="USD">USD ($)</option>
              <option value="AED">AED (د.إ)</option>
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
                    onClick={() => {
                      localStorage.removeItem("auth");
                      window.location.href = "/login";
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
    </div>
  );
}
