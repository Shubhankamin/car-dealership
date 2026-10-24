interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function Loader({
  message = "Loading your inventory...",
  fullScreen = false,
}: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-5 ${
        fullScreen ? "min-h-screen bg-orange-50" : "min-h-[240px] py-12"
      }`}
    >
      {/* Animated loader */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-orange-100 border-t-orange-600" />

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-8 w-8 text-orange-600"
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
        </div>
      </div>

      <div className="space-y-2 text-center">
        <p className="text-base font-semibold text-gray-900">{message}</p>
        <p className="text-sm text-slate-500">
          Please wait while we get things ready.
        </p>
      </div>

      <span className="sr-only">Loading</span>
    </div>
  );
}
