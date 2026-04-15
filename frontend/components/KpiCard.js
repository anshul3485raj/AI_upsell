export default function KpiCard({ title, value, subtitle }) {
  return (
    <div className="surface kpi-card">
      <div className="small">{title}</div>
      <div className="kpi-value">{value}</div>
      <div className="small">{subtitle}</div>
    </div>
  );
}
