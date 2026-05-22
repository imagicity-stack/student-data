"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdmissionForm from "./AdmissionForm";
import {
  SECTIONS,
  INCOME_OPTIONS,
  REASON_OPTIONS,
  SUPPORT_OPTIONS,
} from "./formConfig";

const PALETTE = [
  "#2563eb",
  "#0891b2",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#db2777",
  "#0d9488",
  "#4f46e5",
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

function distinct(students, getKey) {
  const set = new Set();
  for (const s of students) {
    const v = (getKey(s) ?? "").toString().trim();
    if (v) set.add(v);
  }
  return [...set].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function fullName(s) {
  return (
    [s.identity?.firstName, s.identity?.lastName].filter(Boolean).join(" ") ||
    "Unnamed"
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

/* ---------- CSV export ---------- */
const CSV_COLUMNS = (() => {
  const cols = [];
  for (const sec of SECTIONS) {
    for (const f of sec.fields) {
      cols.push({
        header: `${sec.title} - ${f.label}`,
        get: (s) => s[sec.key]?.[f.name],
      });
    }
    if (sec.key === "motherDetails") {
      cols.push({
        header: "Sibling Details - Number of siblings",
        get: (s) => s.siblings?.numberOfSiblings,
      });
      cols.push({
        header: "Sibling Details - Studying in this school",
        get: (s) => s.siblings?.studyingInThisSchool,
      });
      cols.push({
        header: "Sibling Details - Siblings",
        get: (s) =>
          (s.siblings?.siblings || [])
            .map((x) => `${x.name} (${x.className})`)
            .join("; "),
      });
    }
  }
  cols.push({
    header: "Reasons for Choosing",
    get: (s) => (s.reasonForChoosing || []).join("; "),
  });
  cols.push({
    header: "Support Areas",
    get: (s) => (s.supportAreas || []).join("; "),
  });
  cols.push({ header: "Transport - Required", get: (s) => s.transport?.required });
  cols.push({ header: "Transport - Location", get: (s) => s.transport?.location });
  cols.push({ header: "Submitted At", get: (s) => s.createdAt });
  return cols;
})();

function escapeCsv(value) {
  const v = (value ?? "").toString();
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function downloadCsv(students) {
  const lines = [CSV_COLUMNS.map((c) => escapeCsv(c.header)).join(",")];
  for (const s of students) {
    lines.push(CSV_COLUMNS.map((c) => escapeCsv(c.get(s))).join(","));
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `admissions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- Charts ---------- */
function Donut({ data, size = 168 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const r = size / 2 - 16;
  const c = 2 * Math.PI * r;
  let offset = 0;

  if (!total) return <p className="empty-chart">No data</p>;

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
              />
            );
            offset += len;
            return seg;
          })}
        </g>
        <text x="50%" y="46%" textAnchor="middle" className="donut-total">
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

function BarList({ data, accent = "#2563eb" }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (!data.length) return <p className="empty-chart">No data</p>;
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

/* ---------- Student detail panel ---------- */
function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <span className="detail-label">{label}</span>
      <span className="detail-value">
        {value === 0 || value ? value : "—"}
      </span>
    </div>
  );
}

function DetailSection({ number, title, children }) {
  return (
    <div className="detail-section">
      <h4>
        <span className="detail-num">{number}</span>
        {title}
      </h4>
      {children}
    </div>
  );
}

function StudentDetails({ s }) {
  return (
    <div className="detail-panel">
      {SECTIONS.map((section) => {
        const v = s[section.key] || {};
        return (
          <div key={section.key} style={{ display: "contents" }}>
            <DetailSection number={section.number} title={section.title}>
              <div className="detail-grid">
                {section.fields.map((f) => (
                  <DetailItem key={f.name} label={f.label} value={v[f.name]} />
                ))}
              </div>
            </DetailSection>

            {section.key === "motherDetails" ? (
              <DetailSection number={7} title="Sibling Details">
                <div className="detail-grid">
                  <DetailItem
                    label="Number of siblings"
                    value={s.siblings?.numberOfSiblings}
                  />
                  <DetailItem
                    label="Studying in this school"
                    value={s.siblings?.studyingInThisSchool}
                  />
                </div>
                {s.siblings?.siblings?.length ? (
                  <ul className="detail-tags">
                    {s.siblings.siblings.map((x, i) => (
                      <li key={i}>
                        {x.name || "—"} · {x.className || "—"}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </DetailSection>
            ) : null}
          </div>
        );
      })}

      <DetailSection number={14} title="Reasons for Choosing">
        {s.reasonForChoosing?.length ? (
          <ul className="detail-tags">
            {s.reasonForChoosing.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        ) : (
          <span className="detail-value">—</span>
        )}
      </DetailSection>

      <DetailSection number={15} title="Support Areas">
        {s.supportAreas?.length ? (
          <ul className="detail-tags">
            {s.supportAreas.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        ) : (
          <span className="detail-value">—</span>
        )}
      </DetailSection>

      <DetailSection number={16} title="Transport">
        <div className="detail-grid">
          <DetailItem label="Required" value={s.transport?.required} />
          <DetailItem label="Location" value={s.transport?.location} />
        </div>
      </DetailSection>
    </div>
  );
}

/* ---------- Filter controls ---------- */
function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="filter-select">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

const EMPTY_FILTERS = {
  search: "",
  class: "",
  year: "",
  gender: "",
  category: "",
  transport: "",
};

export default function Home() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState("newest");
  const [expanded, setExpanded] = useState(() => new Set());

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
    document.body.style.overflow = showForm ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showForm]);

  const options = useMemo(
    () => ({
      classes: distinct(students, (s) => s.admission?.classAppliedFor),
      years: distinct(students, (s) => s.admission?.academicYear),
      genders: distinct(students, (s) => s.identity?.gender),
      categories: distinct(students, (s) => s.demographics?.category),
      transport: distinct(students, (s) => s.transport?.required),
    }),
    [students]
  );

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    let list = students.filter((s) => {
      if (q && !fullName(s).toLowerCase().includes(q)) return false;
      if (filters.class && s.admission?.classAppliedFor !== filters.class)
        return false;
      if (filters.year && s.admission?.academicYear !== filters.year) return false;
      if (filters.gender && s.identity?.gender !== filters.gender) return false;
      if (filters.category && s.demographics?.category !== filters.category)
        return false;
      if (filters.transport && s.transport?.required !== filters.transport)
        return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "name") return fullName(a).localeCompare(fullName(b));
      const ta = new Date(a.createdAt).getTime() || 0;
      const tb = new Date(b.createdAt).getTime() || 0;
      return sort === "oldest" ? ta - tb : tb - ta;
    });
    return list;
  }, [students, filters, sort]);

  const analytics = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recentCount = filtered.filter((s) => {
      const t = new Date(s.createdAt).getTime();
      return !Number.isNaN(t) && t >= weekAgo;
    }).length;
    const transportYes = filtered.filter(
      (s) => s.transport?.required === "Yes"
    ).length;

    return {
      total: filtered.length,
      recentCount,
      transportYes,
      classes: countBy(filtered, (s) => s.admission?.classAppliedFor),
      gender: countBy(filtered, (s) => s.identity?.gender),
      category: countBy(filtered, (s) => s.demographics?.category),
      academicYear: countBy(filtered, (s) => s.admission?.academicYear),
      income: countBy(filtered, (s) => s.fatherDetails?.annualIncomeRange).sort(
        (a, b) =>
          INCOME_OPTIONS.indexOf(a.label) - INCOME_OPTIONS.indexOf(b.label)
      ),
      reasons: countBy(filtered, (s) => s.reasonForChoosing).filter((d) =>
        REASON_OPTIONS.includes(d.label)
      ),
      support: countBy(filtered, (s) => s.supportAreas).filter((d) =>
        SUPPORT_OPTIONS.includes(d.label)
      ),
    };
  }, [filtered]);

  const activeFilters =
    Object.values(filters).filter(Boolean).length > 0;

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function toggleRow(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function expandAll() {
    setExpanded(new Set(filtered.map((s) => s.id)));
  }

  function collapseAll() {
    setExpanded(new Set());
  }

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
          {/* Filter bar */}
          <section className="filterbar">
            <input
              className="search"
              type="search"
              placeholder="Search by student name…"
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
            />
            <FilterSelect
              label="Class"
              value={filters.class}
              options={options.classes}
              onChange={(v) => setFilter("class", v)}
            />
            <FilterSelect
              label="Academic year"
              value={filters.year}
              options={options.years}
              onChange={(v) => setFilter("year", v)}
            />
            <FilterSelect
              label="Gender"
              value={filters.gender}
              options={options.genders}
              onChange={(v) => setFilter("gender", v)}
            />
            <FilterSelect
              label="Category"
              value={filters.category}
              options={options.categories}
              onChange={(v) => setFilter("category", v)}
            />
            <FilterSelect
              label="Transport"
              value={filters.transport}
              options={options.transport}
              onChange={(v) => setFilter("transport", v)}
            />
            {activeFilters ? (
              <button
                className="ghost-btn small"
                onClick={() => setFilters(EMPTY_FILTERS)}
              >
                Clear filters
              </button>
            ) : null}
          </section>

          {/* Stats */}
          <section className="stats">
            <StatCard
              label={activeFilters ? "Matching Admissions" : "Total Admissions"}
              value={analytics.total}
              sub={
                activeFilters ? `of ${students.length} total` : "all time"
              }
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

          {students.length === 0 ? (
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
                  <BarList data={analytics.classes} accent="#2563eb" />
                </div>
                <div className="card">
                  <h3>Father's Income Range</h3>
                  <BarList data={analytics.income} accent="#059669" />
                </div>
                <div className="card">
                  <h3>Academic Year</h3>
                  <BarList data={analytics.academicYear} accent="#0891b2" />
                </div>
                <div className="card">
                  <h3>Top Reasons for Choosing</h3>
                  <BarList data={analytics.reasons} accent="#7c3aed" />
                </div>
                <div className="card">
                  <h3>Support Areas Requested</h3>
                  <BarList data={analytics.support} accent="#d97706" />
                </div>
              </section>

              {/* Student list */}
              <section className="card list-card">
                <div className="list-head">
                  <h3>
                    Admissions
                    <span className="count">{filtered.length}</span>
                  </h3>
                  <div className="list-tools">
                    <label className="filter-select compact">
                      <span>Sort</span>
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                      >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="name">Name A–Z</option>
                      </select>
                    </label>
                    <button className="ghost-btn small" onClick={expandAll}>
                      Expand all
                    </button>
                    <button className="ghost-btn small" onClick={collapseAll}>
                      Collapse all
                    </button>
                    <button
                      className="ghost-btn small"
                      onClick={() => downloadCsv(filtered)}
                      disabled={!filtered.length}
                    >
                      Export CSV
                    </button>
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <p className="empty-chart">No admissions match your filters.</p>
                ) : (
                  <ul className="student-list">
                    {filtered.map((s) => {
                      const isOpen = expanded.has(s.id);
                      return (
                        <li
                          key={s.id}
                          className={`student-row${isOpen ? " open" : ""}`}
                        >
                          <button
                            className="student-summary"
                            onClick={() => toggleRow(s.id)}
                            aria-expanded={isOpen}
                          >
                            <span className={`chevron${isOpen ? " open" : ""}`}>
                              ▸
                            </span>
                            <span className="s-name">{fullName(s)}</span>
                            <span className="s-meta">
                              {s.admission?.classAppliedFor || "—"}
                            </span>
                            <span className="s-meta">
                              {s.admission?.academicYear || "—"}
                            </span>
                            <span className="s-tag">
                              {s.demographics?.category || "—"}
                            </span>
                            <span className="s-date">
                              {formatDate(s.createdAt)}
                            </span>
                          </button>
                          {isOpen ? <StudentDetails s={s} /> : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
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
