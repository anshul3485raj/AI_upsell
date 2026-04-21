"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import OfferForm from "../../components/OfferForm";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";

export default function CreateOfferPage() {
  const { apiFetch, isReady } = useAuthenticatedFetch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const triggerType = searchParams.get("trigger") || "PRODUCT";
  const widgetName = searchParams.get("widget") || "";
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
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setError(err.message || "Failed to create upsell rule.");
    }
  };

  return (
    <div className="page-section">
      <div className="surface">
        <h1>Create Offer</h1>
        <p className="small">
          Configure rule-based recommendations for product pages or cart flow.
        </p>
      </div>

      <div className="surface">
        <OfferForm
          onSave={saveRule}
          initialData={{
            triggerType,
            name: widgetName ? `${widgetName} Upsell` : "",
          }}
        />
        {message ? <p className="small success-text">{message}</p> : null}
        {error ? <p className="small error-text">{error}</p> : null}
      </div>
    </div>
  );
}
