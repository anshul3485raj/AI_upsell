"use client";

import { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";

export default function DashboardPage() {
  const { apiFetch, isReady } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shop, setShop] = useState(null);
  const [rules, setRules] = useState([]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [shopData, ruleData] = await Promise.all([
          apiFetch("/shop/me"),
          apiFetch("/upsell/rules"),
        ]);
        if (!active) {
          return;
        }
        setShop(shopData);
        setRules(ruleData);
      } catch (err) {
        if (!active) {
          return;
        }
        setError(err.message || "Unable to load dashboard.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [apiFetch, isReady]);

  return (
    <main className="app-shell">
      <Navigation />

      <section className="surface">
        <h1 style={{ marginTop: 0 }}>AI Upsell Dashboard</h1>
        <p className="small">
          {shop ? `Connected shop: ${shop.domain}` : "Connect your store via Shopify install flow."}
        </p>
      </section>

      <section className="surface" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Active Upsell Rules</h2>
        {loading ? <p className="small">Loading rules...</p> : null}
        {error ? <p className="small" style={{ color: "#c62828" }}>{error}</p> : null}
        {!loading && !error ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Trigger</th>
                <th>Source Product</th>
                <th>Source Tag</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rules.length ? (
                rules.map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.name}</td>
                    <td>{rule.triggerType}</td>
                    <td>{rule.sourceProductId || "-"}</td>
                    <td>{rule.sourceTag || "-"}</td>
                    <td>{rule.isActive ? "Active" : "Paused"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="small">
                    No rules yet. Create one in the Create Offer page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : null}
      </section>
    </main>
  );
}
