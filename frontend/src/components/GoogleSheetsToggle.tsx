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
    <div className="flex items-center space-x-4">
      <span className="text-gray-600 font-medium">Google Sheets Sync</span>
      <button
        onClick={onToggle}
        disabled={isLoading}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none ${
          isEnabled ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
            isEnabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
