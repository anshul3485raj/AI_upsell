"use client";

import { useState } from "react";
import Navigation from "../../components/Navigation";
import OfferForm from "../../components/OfferForm";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";

export default function CreateOfferPage() {
  const { apiFetch, isReady } = useAuthenticatedFetch();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const saveRule = async (payload) => {
    if (!isReady) {
      throw new Error("App Bridge is still initializing.");
    }
    setMessage("");
    setError("");
    try {
      await apiFetch("/upsell/rules", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setMessage("Upsell rule created successfully.");
    } catch (err) {
      setError(err.message || "Failed to create upsell rule.");
    }
  };

  return (
    <main className="app-shell">
      <Navigation />
      <h1>Create Offer</h1>
      <p className="small">
        Configure rule-based recommendations for product pages or cart flow.
      </p>
      <OfferForm onSave={saveRule} />
      {message ? <p className="small" style={{ color: "#2e7d32" }}>{message}</p> : null}
      {error ? <p className="small" style={{ color: "#c62828" }}>{error}</p> : null}
    </main>
  );
}
