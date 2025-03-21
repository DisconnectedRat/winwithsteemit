"use client";
import { useState } from "react";
import VerifyUser from "@/components/VerifyUser";
import EntrantsList from "@/components/EntrantsList";

export default function EntrantsPage() {
  // State to store the verified user (if needed)
  const [verifiedUser, setVerifiedUser] = useState(null);

  // This function will be passed to VerifyUser as onUserVerified
  const handleUserVerified = (userEntry) => {
    console.log("User verified:", userEntry);
    setVerifiedUser(userEntry);
    // You can add additional logic here (e.g., update a list, trigger notifications, etc.)
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="max-w-3xl w-full mx-auto bg-white p-6 mt-6 rounded-lg shadow-lg">
        {/* 🔹 Username Verification UI */}
        <div className="mb-6">
          <div className="p-4 bg-gray-50 rounded-lg shadow">
            <VerifyUser onUserVerified={handleUserVerified} />
          </div>
        </div>

        {/* 🔹 Display Confirmed Entrants */}
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
