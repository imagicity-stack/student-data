"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdmissionForm from "./AdmissionForm";
import {
  INCOME_OPTIONS,
  REASON_OPTIONS,
  SUPPORT_OPTIONS,
} from "./formConfig";

const PALETTE = [
  "#6366f1",
  "#22d3ee",
  "#f472b6",
  "#34d399",
  "#fbbf24",
  "#a78bfa",
  "#fb7185",
  "#38bdf8",
];

function countBy(students, getKey) {
  const map = new Map();
  for (const s of students) {
    const raw = getKey(s);
    const keys = Array.isArray(raw) ? raw : [raw];
    for (const k of keys) {
      const key = (k ?? "").toString().trim();
      if (!key) continue;
      map.set(key, (map.get(key) || 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function Donut({ data, size = 168 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const r = size / 2 - 16;
  const c = 2 * Math.PI * r;
  let offset = 0;

  if (!total) {
    return <p className="empty-chart">No data yet</p>;
  }

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {data.map((d, i) => {
            const len = (d.value / total) * c;
            const seg = (
              <circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth={16}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return seg;
          })}
        </g>
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          className="donut-total"
        >
          {total}
        </text>
        <text x="50%" y="60%" textAnchor="middle" className="donut-label">
          total
        </text>
      </svg>
      <ul className="legend">
        {data.map((d, i) => (
          <li key={d.label}>
            <span
              className="dot"
              style={{ background: PALETTE[i % PALETTE.length] }}
            />
            {d.label}
            <strong>{d.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BarList({ data, accent = "#6366f1" }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (!data.length) {
    return <p className="empty-chart">No data yet</p>;
  }
  return (
    <ul className="barlist">
      {data.map((d) => (
        <li key={d.label}>
          <span className="bar-label" title={d.label}>
            {d.label}
          </span>
          <span className="bar-track">
            <span
              className="bar-fill"
              style={{ width: `${(d.value / max) * 100}%`, background: accent }}
            />
          </span>
          <span className="bar-value">{d.value}</span>
        </li>
      ))}
    </ul>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
      {sub ? <span className="stat-sub">{sub}</span> : null}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Home() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/students", { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to load admissions.");
      setStudents(body.students || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showForm]);

  const analytics = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recentCount = students.filter((s) => {
      const t = new Date(s.createdAt).getTime();
      return !Number.isNaN(t) && t >= weekAgo;
    }).length;
    const transportYes = students.filter(
      (s) => s.transport?.required === "Yes"
    ).length;

    return {
      total: students.length,
      recentCount,
      transportYes,
      classes: countBy(students, (s) => s.admission?.classAppliedFor),
      gender: countBy(students, (s) => s.identity?.gender),
      category: countBy(students, (s) => s.demographics?.category),
      academicYear: countBy(students, (s) => s.admission?.academicYear),
      income: countBy(students, (s) => s.fatherDetails?.annualIncomeRange).sort(
        (a, b) => INCOME_OPTIONS.indexOf(a.label) - INCOME_OPTIONS.indexOf(b.label)
      ),
      reasons: countBy(students, (s) => s.reasonForChoosing).filter((d) =>
        REASON_OPTIONS.includes(d.label)
      ),
      support: countBy(students, (s) => s.supportAreas).filter((d) =>
        SUPPORT_OPTIONS.includes(d.label)
      ),
      recent: students.slice(0, 8),
    };
  }, [students]);

  function handleSuccess(id) {
    setShowForm(false);
    setToast(`Admission saved · Ref ${id}`);
    setTimeout(() => setToast(null), 4000);
    load();
  }

  return (
    <main className="dash">
      <header className="dash-header">
        <div>
          <h1>Admissions Dashboard</h1>
          <p>Live overview of student admission applications.</p>
        </div>
        <button className="primary-btn" onClick={() => setShowForm(true)}>
          + Create Admission
        </button>
      </header>

      {toast ? <div className="toast">{toast}</div> : null}

      {error ? (
        <div className="banner error">
          {error}
          <button className="link-btn" onClick={load}>
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="placeholder">Loading analytics…</div>
      ) : (
        <>
          <section className="stats">
            <StatCard
              label="Total Admissions"
              value={analytics.total}
              sub="all time"
            />
            <StatCard
              label="Last 7 Days"
              value={analytics.recentCount}
              sub="new applications"
            />
            <StatCard
              label="Classes Applied"
              value={analytics.classes.length}
              sub="distinct"
            />
            <StatCard
              label="Transport Needed"
              value={analytics.transportYes}
              sub="students"
            />
          </section>

          {analytics.total === 0 ? (
            <div className="placeholder">
              No admissions yet. Click <strong>Create Admission</strong> to add
              the first one.
            </div>
          ) : (
            <>
              <section className="cards">
                <div className="card">
                  <h3>Gender Distribution</h3>
                  <Donut data={analytics.gender} />
                </div>
                <div className="card">
                  <h3>Category Distribution</h3>
                  <Donut data={analytics.category} />
                </div>
                <div className="card">
                  <h3>Class Applied For</h3>
                  <BarList data={analytics.classes} accent="#6366f1" />
                </div>
                <div className="card">
                  <h3>Father's Income Range</h3>
                  <BarList data={analytics.income} accent="#34d399" />
                </div>
                <div className="card">
                  <h3>Academic Year</h3>
                  <BarList data={analytics.academicYear} accent="#38bdf8" />
                </div>
                <div className="card">
                  <h3>Top Reasons for Choosing</h3>
                  <BarList data={analytics.reasons} accent="#f472b6" />
                </div>
                <div className="card">
                  <h3>Support Areas Requested</h3>
                  <BarList data={analytics.support} accent="#fbbf24" />
                </div>
              </section>

              <section className="card recent">
                <h3>Recent Admissions</h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Academic Year</th>
                        <th>Category</th>
                        <th>Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recent.map((s) => (
                        <tr key={s.id}>
                          <td>
                            {[s.identity?.firstName, s.identity?.lastName]
                              .filter(Boolean)
                              .join(" ") || "—"}
                          </td>
                          <td>{s.admission?.classAppliedFor || "—"}</td>
                          <td>{s.admission?.academicYear || "—"}</td>
                          <td>{s.demographics?.category || "—"}</td>
                          <td>{formatDate(s.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </>
      )}

      {showForm ? (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-head">
              <h2>New Student Admission</h2>
              <button
                className="close-btn"
                aria-label="Close"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <AdmissionForm
                onSuccess={handleSuccess}
                onClose={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
