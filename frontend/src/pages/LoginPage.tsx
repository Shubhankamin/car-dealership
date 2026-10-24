import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center  px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-2xl border border-orange-100 bg-white p-6 shadow-xl shadow-orange-950/5 sm:p-8"
      >
        {/* Brand */}
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-3"
          aria-label="AutoStock home"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-600/20">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.5 11h17v7h-17zM6.5 18v1.5M17.5 18v1.5M3.5 14h3M17.5 14h3"
              />
              <circle cx="7" cy="14" r=".7" fill="currentColor" />
              <circle cx="17" cy="14" r=".7" fill="currentColor" />
            </svg>
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-gray-900">
            Auto<span className="text-orange-600">Stock</span>
          </span>
        </Link>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Log in to explore vehicles and manage your inventory.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-.75-11a.75.75 0 0 1 1.5 0v4a.75.75 0 0 1-1.5 0V7Zm.75 7.25a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
                clipRule="evenodd"
              />
            </svg>
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-5">
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700"
          >
            Email address
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>

          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-700"
          >
            Password
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z"
                />
              </svg>
              Logging in...
            </>
          ) : (
            <>
              Log in
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14m-6-6 6 6-6 6"
                />
              </svg>
            </>
          )}
        </button>

        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-orange-600 transition hover:text-orange-700 hover:underline"
          >
            Create an account
          </Link>
        </p>

        <div className="border-t border-slate-100 pt-5 text-center">
          <p className="text-xs leading-5 text-slate-400">
            Your next drive starts here.
          </p>
        </div>
      </form>
    </main>
  );
}
