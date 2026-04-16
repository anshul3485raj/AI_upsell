"use client";

import { useEffect, useState } from "react";
import KpiCard from "../../components/KpiCard";
import Navigation from "../../components/Navigation";
import { formatPercent } from "../../dashboard/format";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";

export default function AnalyticsPage() {
  const { apiFetch, isReady } = useAuthenticatedFetch();

  const [summary, setSummary] = useState({
    impressions: 0,
    conversions: 0,
    conversionRate: 0,
  });

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 🚨 IMPORTANT: wait until App Bridge is ready
    if (!isReady || !apiFetch) {
      return;
    }

    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [summaryData, eventData] = await Promise.all([
          apiFetch("/analytics/summary?days=30"),
          apiFetch("/analytics/events?limit=30"),
        ]);

        if (!mounted) return;

        setSummary(summaryData || {});
        setEvents(eventData || []);
      } catch (err) {
        if (!mounted) return;

        console.error("Analytics error:", err);
        setError(err.message || "Unable to load analytics.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [apiFetch, isReady]);

  // ✅ NEW: App Bridge loading state UI
  if (!isReady) {
    return (
      <main className="app-shell">
        <Navigation />
        <h1>Analytics</h1>
        <p className="small">Initializing Shopify App Bridge...</p>
      </main>
    );
  }
  

  return (
    <main className="app-shell">
      <Navigation />
      <h1>Analytics</h1>

      <div className="row">
        <KpiCard
          title="Impressions (30d)"
          value={summary.impressions}
          subtitle="Upsell widgets displayed"
        />
        <KpiCard
          title="Conversions (30d)"
          value={summary.conversions}
          subtitle="Upsell actions completed"
        />
        <KpiCard
          title="Conversion Rate"
          value={formatPercent(summary.conversionRate)}
          subtitle="Conversions / impressions"
        />
      </div>

      <section className="surface" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Recent Events</h2>

        {loading && <p className="small">Loading events...</p>}

        {error && (
          <p className="small" style={{ color: "#c62828" }}>
            {error}
          </p>
        )}

        {!loading && !error && (
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Source Product</th>
                <th>Recommended Product</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {events.length ? (
                events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.type}</td>
                    <td>{event.sourceProductId || "-"}</td>
                    <td>{event.recommendedProductId}</td>
                    <td>
                      {new Date(event.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="small">
                    No analytics events yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}