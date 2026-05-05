"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import OfferForm from "../../../components/OfferForm";
import { useAuthenticatedFetch } from "../../../hooks/useAuthenticatedFetch";

export default function EditOfferPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const embeddedParams = searchParams.toString();
  const { apiFetch, isReady } = useAuthenticatedFetch();
  const [rule, setRule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isReady) return;

    const loadRule = async () => {
      try {
        const data = await apiFetch(`/upsell/rules/${id}`);
        setRule(data);
      } catch (err) {
        setError(err.message || "Failed to load rule.");
      } finally {
        setLoading(false);
      }
    };

    loadRule();
  }, [id, apiFetch, isReady]);

  const updateRule = async (payload) => {
    setMessage("");
    setError("");
    try {
      await apiFetch(`/upsell/rules/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setMessage("Upsell rule updated successfully.");
      setTimeout(() => router.push(embeddedParams ? `/dashboard?${embeddedParams}` : "/dashboard"), 1500);
    } catch (err) {
      setError(err.message || "Failed to update upsell rule.");
    }
  };

  if (loading) return <div className="page-section"><p>Loading rule...</p></div>;
  if (error && !rule) return <div className="page-section"><p className="error-text">{error}</p></div>;

  return (
    <div className="page-section">
      <div className="surface">
        <h1>Edit Offer</h1>
        <p className="small">Modify your upsell rule configurations.</p>
      </div>

      <div className="surface">
        {rule && (
          <OfferForm
            onSave={updateRule}
            apiFetch={apiFetch}
            isReady={isReady}
            initialData={rule}
          />
        )}
        {message ? <p className="small success-text">{message}</p> : null}
        {error ? <p className="small error-text">{error}</p> : null}
      </div>
    </div>
  );
}
