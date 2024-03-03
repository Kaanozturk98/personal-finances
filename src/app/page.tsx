"use client";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [netWorth, setNetWorth] = useState({
    totalValueUSD: 0,
    totalValueTRY: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNetWorth = async () => {
      try {
        const response = await fetch("/api/calculate-holdings-value");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setNetWorth(data);
      } catch (error) {
        console.error("Error fetching net worth", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNetWorth();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex flex-col space-y-8">
      <h1 className="text-3xl font-bold leading-tight">
        Welcome to the Finance Tracker
      </h1>
      {isLoading ? (
        <p>Loading your net worth...</p>
      ) : (
        <div>
          <h2 className="text-2xl font-bold">Your Net Worth</h2>
          <p>Equivalent in USD: ${netWorth.totalValueUSD?.toFixed(2)}</p>
          <p>Equivalent in TRY: ₺{netWorth.totalValueTRY?.toFixed(2)}</p>
          <p className="text-sm text-gray-600">
            Note: The values shown are the equivalent net worth in each
            currency, not a sum of different currencies.
          </p>
        </div>
      )}
    </div>
  );
}
