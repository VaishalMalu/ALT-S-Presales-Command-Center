import React from "react";
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem("auth") === "true";
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <CurrencyProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
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
