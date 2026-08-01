import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@repo/db";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger entrance animation on mount
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#F8FAFC] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[100px] opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[100px] opacity-60"></div>

      {/* Main Login Card with Entrance Animation */}
      <div
        className={`w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 p-8 sm:p-10 relative z-10 transition-all duration-1000 ease-out transform ${mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
      >
        <div className="flex flex-col items-center mb-10">
          <div className="h-16 flex items-center justify-center mb-6">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="ALT-S Logo"
              className="h-12 w-auto object-contain transition-transform hover:scale-105 duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
                e.currentTarget.nextElementSibling?.classList.add("flex");
              }}
            />
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-[#2a3682] text-white hidden items-center justify-center font-extrabold text-xl shadow-lg">
              A
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight text-center">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 mt-2 text-center tracking-wide uppercase font-semibold">
            Presales Command Center
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100 text-center font-medium">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              placeholder="admin@alt-s.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Password
              </label>
              <a
                href="#"
                className="text-xs font-medium text-primary hover:text-blue-700 transition-colors"
              >
                Forgot?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 bg-primary hover:bg-[#1E2761] text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform ${loading ? "opacity-80 cursor-wait scale-[0.98]" : "active:scale-[0.98]"}`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Authenticating...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Protected by enterprise-grade security.
          </p>
        </div>
      </div>
    </div>
  );
}
