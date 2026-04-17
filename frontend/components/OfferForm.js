"use client";

import { useState } from "react";

const initialState = {
  name: "",
  triggerType: "PRODUCT",
  sourceProductId: "",
  sourceCollectionId: "",
  sourceTag: "",
  manualRecommendations: "",
  discountType: "NONE",
  discountValue: "0",
  isActive: true,
};

export default function OfferForm({ onSave, initialData = {} }) {
  const [form, setForm] = useState({
    ...initialState,
    ...initialData,
    manualRecommendations: Array.isArray(initialData.manualRecommendations)
      ? initialData.manualRecommendations.join(", ")
      : initialData.manualRecommendations ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await onSave({
        name: form.name,
        triggerType: form.triggerType,
        sourceProductId: form.sourceProductId || undefined,
        sourceCollectionId: form.sourceCollectionId || undefined,
        sourceTag: form.sourceTag || undefined,
        manualRecommendations: form.manualRecommendations
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        discountType: form.discountType,
        discountValue: Number(form.discountValue || 0),
        isActive: form.isActive,
      });

      setForm(initialState);
    } catch (err) {
      setError(err.message || "Failed to save rule.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="surface grid" onSubmit={submit}>
      <div>
        <label className="small">Rule name</label>
        <input
          className="input"
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          required
        />
      </div>

      <div>
        <label className="small">Trigger</label>
        <select
          className="select"
          value={form.triggerType}
          onChange={(event) => update("triggerType", event.target.value)}
        >
          <option value="PRODUCT">Product page</option>
          <option value="CART">Cart</option>
        </select>
      </div>

      <div>
        <label className="small">Source product ID (numeric or GID)</label>
        <input
          className="input"
          value={form.sourceProductId}
          onChange={(event) => update("sourceProductId", event.target.value)}
        />
      </div>

      <div>
        <label className="small">Source collection ID (numeric or GID)</label>
        <input
          className="input"
          value={form.sourceCollectionId}
          onChange={(event) => update("sourceCollectionId", event.target.value)}
        />
      </div>

      <div>
        <label className="small">Source tag</label>
        <input
          className="input"
          value={form.sourceTag}
          onChange={(event) => update("sourceTag", event.target.value)}
          placeholder="summer"
        />
      </div>

      <div>
        <label className="small">Manual recommendations (comma-separated product IDs)</label>
        <textarea
          className="textarea"
          rows={3}
          value={form.manualRecommendations}
          onChange={(event) => update("manualRecommendations", event.target.value)}
        />
      </div>

      <div className="row">
        <div style={{ flex: 1 }}>
          <label className="small">Discount type</label>
          <select
            className="select"
            value={form.discountType}
            onChange={(event) => update("discountType", event.target.value)}
          >
            <option value="NONE">None</option>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed amount</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label className="small">Discount value</label>
          <input
            className="input"
            type="number"
            min="0"
            value={form.discountValue}
            onChange={(event) => update("discountValue", event.target.value)}
          />
        </div>
      </div>

      <label className="small">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => update("isActive", event.target.checked)}
          style={{ marginRight: 8 }}
        />
        Rule active
      </label>

      {error ? <div className="small" style={{ color: "#c62828" }}>{error}</div> : null}

      <button className="btn" type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save upsell rule"}
      </button>
    </form>
  );
}
