"use client";

interface GoogleSheetsToggleProps {
  isEnabled: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

export default function GoogleSheetsToggle({
  isEnabled,
  isLoading,
  onToggle,
}: GoogleSheetsToggleProps) {
  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed ${
        isEnabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
      }`}
      aria-label="Toggle Google Sheets Sync"
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
          isEnabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
}
