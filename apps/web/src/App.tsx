import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import Layout from "./components/Layout";
import DashboardPage from "./pages/Dashboard";
import OpportunitiesPage from "./pages/Opportunities";
import AccountsPage from "./pages/Accounts";
import BidsPage from "./pages/Bids";
import ContactsPage from "./pages/Contacts";
import TasksPage from "./pages/Tasks";
import LoginPage from "./pages/Login";
import { supabase } from "@repo/db";
import { Session } from "@supabase/supabase-js";

function ProtectedRoute({ children, session }: { children: React.ReactNode, session: Session | null }) {
  const location = useLocation();
  
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <CurrencyProvider>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute session={session}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="opportunities" element={<OpportunitiesPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="bids" element={<BidsPage />} />
          <Route path="tasks" element={<TasksPage />} />
        </Route>
      </Routes>
    </CurrencyProvider>
  );
}
