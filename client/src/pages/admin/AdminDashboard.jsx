import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../assets/styles/admin/admin-dashboard.css";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const STATUS_COLORS = { pickedUp: "#8b7cff", waiting: "#ff9388", preparing: "#3fc1e0" };
const LEGEND_ORDER = ["pickedUp", "waiting", "preparing"]; // same order as the design

const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat("en-IN");
const money = (n) =>
  "₹ " + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Calls the Express API. Throws an Error (with .status) carrying the server's message.
async function loadDashboard() {
  let res;
  try {
    res = await fetch("/api/admin/dashboard");
  } catch {
    throw new Error("Could not reach the server. Please try again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data.message || "Unable to load the dashboard."), { status: res.status });
  }
  return data;
}

// Picks a tidy y-axis step so the chart shows three evenly spaced gridlines above zero
function niceStep(max) {
  if (max <= 0) return 25;
  const raw = max / 3;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  const factor = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return factor * pow;
}

function SalesChart({ monthly, year }) {
  const W = 560, H = 280, L = 56, R = 16, T = 16, B = 34;
  const step = niceStep(Math.max(...monthly));
  const top = step * 3;
  const x = (i) => L + (i * (W - L - R)) / 11;
  const y = (v) => T + (H - T - B) * (1 - v / top);
  const ticks = [0, 1, 2, 3].map((k) => k * step);
  const total = monthly.reduce((sum, v) => sum + v, 0);

  return (
    <>
      <svg
        className="dash-chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Monthly sales for ${year}. Total ${money(total)}.`}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="dash-chart__grid" />
            <text x={L - 10} y={y(t) + 4} textAnchor="end" className="dash-chart__tick">
              {compact.format(t)}
            </text>
          </g>
        ))}

        {MONTHS.map((m, i) => (
          <text key={m} x={x(i)} y={H - 10} textAnchor="middle" className="dash-chart__tick">{m}</text>
        ))}

        <polyline
          className="dash-chart__line"
          points={monthly.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
        />
        {monthly.map((v, i) => (
          <circle key={MONTHS[i]} cx={x(i)} cy={y(v)} r="4" className="dash-chart__dot">
            <title>{`${MONTHS[i]} ${year}: ${money(v)}`}</title>
          </circle>
        ))}
      </svg>
      {total === 0 && <p className="dash-empty">No sales recorded for {year} yet.</p>}
    </>
  );
}

function OrderDonut({ items }) {
  const R = 80;
  const C = 2 * Math.PI * R;
  const total = items.reduce((sum, i) => sum + i.count, 0);

  let offset = 0;
  const segments = items
    .filter((i) => i.count > 0)
    .map((i) => {
      const len = (C * i.count) / total;
      const segment = { ...i, len, offset };
      offset += len;
      return segment;
    });

  const byKey = Object.fromEntries(items.map((i) => [i.key, i]));
  const summary = items.map((i) => `${i.label} ${i.count}`).join(", ");

  return (
    <>
      <svg className="dash-donut" viewBox="0 0 220 220" role="img" aria-label={`Orders by status: ${summary}.`}>
        <g transform="rotate(-90 110 110)">
          {total === 0 ? (
            <circle cx="110" cy="110" r={R} fill="none" stroke="#e5e7eb" strokeWidth="40" />
          ) : (
            segments.map((s) => (
              <circle
                key={s.key}
                cx="110"
                cy="110"
                r={R}
                fill="none"
                stroke={STATUS_COLORS[s.key]}
                strokeWidth="40"
                strokeDasharray={`${s.len} ${C - s.len}`}
                strokeDashoffset={-s.offset}
              >
                <title>{`${s.label}: ${s.count}`}</title>
              </circle>
            ))
          )}
        </g>
      </svg>

      <ul className="dash-legend">
        {LEGEND_ORDER.filter((key) => byKey[key]).map((key) => (
          <li key={key}>
            <i style={{ background: STATUS_COLORS[key] }} aria-hidden="true" />
            {byKey[key].label} <span>({byKey[key].count})</span>
          </li>
        ))}
      </ul>
      {total === 0 && <p className="dash-empty">No orders yet.</p>}
    </>
  );
}

export default function AdminDashboard() {
  const { setUser } = useAuth();
  const [data, setData] = useState(null); // null until the first load finishes
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;

    loadDashboard()
      .then((result) => {
        if (!ignore) setData(result);
      })
      .catch((err) => {
        if (ignore) return;
        if (err.status === 401) setUser(null); // session ended, RequireAuth redirects to login
        setError(err.message);
      });

    return () => {
      ignore = true;
    };
  }, [attempt, setUser]);

  function retry() {
    setError("");
    setAttempt((n) => n + 1);
  }

  if (!data) {
    return (
      <div className="dash">
        <h1 className="dash-visually-hidden">Dashboard</h1>
        {error ? (
          <div className="dash-state">
            <p role="alert">{error}</p>
            <button type="button" className="dash-btn" onClick={retry}>Try again</button>
          </div>
        ) : (
          <p className="dash-state" role="status">Loading dashboard…</p>
        )}
      </div>
    );
  }

  const { totals, monthlySales, orderStatus, bestSellers, year } = data;

  const cards = [
    { label: "Total Sales", value: `₹ ${compact.format(totals.sales)}` },
    { label: "Total Customers", value: whole.format(totals.customers) },
    { label: "Total Products", value: whole.format(totals.products) },
    { label: "Total Orders", value: whole.format(totals.orders) },
  ];

  return (
    <div className="dash">
      <h1 className="dash-visually-hidden">Dashboard</h1>

      <section className="dash-cards" aria-label="Key figures">
        {cards.map((c) => (
          <div key={c.label} className="dash-card">
            <p className="dash-card__label">{c.label}</p>
            <p className="dash-card__value">{c.value}</p>
          </div>
        ))}
      </section>

      <div className="dash-charts">
        <section className="dash-panel" aria-labelledby="sales-heading">
          <div className="dash-panel__head">
            <h2 id="sales-heading">Sales Report</h2>
            <span className="dash-key"><i aria-hidden="true" />Sales ({year})</span>
          </div>
          <SalesChart monthly={monthlySales} year={year} />
        </section>

        <section className="dash-panel dash-panel--center" aria-labelledby="status-heading">
          <h2 id="status-heading">Order Status</h2>
          <OrderDonut items={orderStatus} />
        </section>
      </div>

      <section className="dash-panel dash-panel--table" aria-labelledby="best-heading">
        <h2 id="best-heading" className="dash-panel__title-small">Best Selling Products</h2>

        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th scope="col">Product Name</th>
                <th scope="col">Category</th>
                <th scope="col" className="dash-num">Price</th>
                <th scope="col" className="dash-num">Units Sold</th>
                <th scope="col" className="dash-num">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {bestSellers.length === 0 && (
                <tr><td colSpan={5} className="dash-empty">No sales yet.</td></tr>
              )}
              {bestSellers.map((p) => (
                <tr key={`${p.name}-${p.category}`}>
                  <td>{p.name}</td>
                  <td>{p.category || "—"}</td>
                  <td className="dash-num">{p.price == null ? "—" : money(p.price)}</td>
                  <td className="dash-num">{whole.format(p.unitsSold)}</td>
                  <td className="dash-num">{money(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}