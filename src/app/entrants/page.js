"use client";
import EntrantsList from "@/components/EntrantsList";

export default function EntrantsPage() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="max-w-3xl w-full mx-auto bg-white p-6 mt-6 rounded-lg shadow-lg">
        {/* Display Confirmed Entrants */}
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            📜 Confirmed Participants
          </h2>
          <p className="mt-2 text-xs text-gray-500 text-center">
            Note: Very recent transactions might take up to 30 seconds to appear.
          </p>
          <div className="overflow-hidden rounded-lg shadow-lg bg-white p-4">
            <EntrantsList />
          </div>
        </div>
      </div>
    </div>
  );
}
