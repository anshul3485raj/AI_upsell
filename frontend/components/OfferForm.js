"use client";

import { useEffect, useMemo, useState } from "react";

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

function mergeUniqueProducts(primary, secondary) {
  const merged = new Map();

  [...primary, ...secondary].forEach((product) => {
    if (product?.productGid) {
      merged.set(product.productGid, product);
    }
  });

  return Array.from(merged.values());
}

function getShopifyProductId(product) {
  const rawValue = product?.productGid || product?.id || "";
  const segments = String(rawValue).split("/");
  return segments[segments.length - 1] || rawValue;
}

export default function OfferForm({ onSave, initialData = {}, apiFetch, isReady }) {
  const buildFormState = (source) => ({
    ...initialState,
    ...source,
    manualRecommendations: Array.isArray(source.manualRecommendations)
      ? source.manualRecommendations.join(", ")
      : source.manualRecommendations ?? "",
  });
  const [form, setForm] = useState(buildFormState(initialData));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [productOptions, setProductOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    setForm(buildFormState(initialData));
  }, [initialData]);

  useEffect(() => {
    if (!apiFetch || !isReady) {
      return;
    }

    let cancelled = false;

    const loadProducts = async () => {
      try {
        setSearchLoading(true);
        const query = searchQuery.trim();
        const endpoint = query
          ? `/shop/products?q=${encodeURIComponent(query)}&limit=20`
          : "/shop/products?limit=20";
        const products = await apiFetch(endpoint);

        if (!cancelled) {
          setProductOptions((current) => mergeUniqueProducts(products || [], current));
        }
      } catch (_err) {
        if (!cancelled) {
          setProductOptions((current) => current);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [apiFetch, isReady, searchQuery]);

  const selectedRecommendationIds = useMemo(
    () =>
      form.manualRecommendations
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [form.manualRecommendations],
  );

  const toggleRecommendation = (productId) => {
    const nextValues = new Set(selectedRecommendationIds);
    if (nextValues.has(productId)) {
      nextValues.delete(productId);
    } else {
      nextValues.add(productId);
    }
    update("manualRecommendations", Array.from(nextValues).join(", "));
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
        <select
          className="select"
          value={form.sourceProductId}
          onChange={(event) => update("sourceProductId", event.target.value)}
          disabled={form.triggerType !== "PRODUCT"}
        >
          <option value="">Any product</option>
          {productOptions.map((product) => (
            <option key={product.productGid} value={getShopifyProductId(product)}>
              {product.title}
            </option>
          ))}
        </select>
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
        <label className="small">Find products to recommend</label>
        <input
          className="input"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search products by title"
        />
        <div className="small" style={{ marginTop: 8 }}>
          {searchLoading ? "Loading products..." : `${productOptions.length} products available`}
        </div>
      </div>

      <div>
        <label className="small">Manual recommendations</label>
        <div className="surface" style={{ padding: 12, maxHeight: 280, overflowY: "auto" }}>
          {productOptions.length === 0 ? <div className="small">No products found yet.</div> : null}
          {productOptions.map((product) => {
            const productId = getShopifyProductId(product);
            const isSelected = selectedRecommendationIds.includes(productId);

            return (
              <label
                key={product.productGid}
                className="small"
                style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleRecommendation(productId)}
                />
                <span style={{ flex: 1 }}>{product.title}</span>
                <span>{product.currencyCode || ""} {Number(product.price || 0).toFixed(2)}</span>
              </label>
            );
          })}
        </div>
        <textarea
          className="textarea"
          rows={3}
          value={form.manualRecommendations}
          onChange={(event) => update("manualRecommendations", event.target.value)}
          placeholder="Selected product IDs appear here"
          style={{ marginTop: 12 }}
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
