"use client";

import { useState } from "react";
import VerifyUser from "@/components/VerifyUser"; // ✅ use it here only
import EntrantsList from "@/components/EntrantsList";

export default function EntrantsPage() {
  const [verifiedUser, setVerifiedUser] = useState(null);

  const handleUserVerified = (userEntry) => {
    setVerifiedUser(userEntry);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="max-w-3xl w-full mx-auto bg-white p-6 mt-6 rounded-lg shadow-lg">
        <div className="mb-6">
          <div className="p-4 bg-gray-50 rounded-lg shadow">
            <VerifyUser onUserVerified={handleUserVerified} />
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            📜 Confirmed Participants
          </h2>
          <div className="overflow-hidden rounded-lg shadow-lg bg-white p-4">
            <EntrantsList verifiedUser={verifiedUser} />
          </div>
        </div>
      </div>
    </div>
  );
}
