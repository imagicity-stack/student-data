"use client";

import { useState } from "react";
import {
  SECTIONS,
  REASON_OPTIONS,
  SUPPORT_OPTIONS,
  YES_NO,
  buildInitialState,
  hydrateState,
} from "./formConfig";

function Field({ field, value, onChange }) {
  const id = field.name;
  const common = {
    id,
    name: field.name,
    value: value ?? "",
    onChange: (e) => onChange(field.name, e.target.value),
  };
  return (
    <div className={`field${field.full ? " full" : ""}`}>
      <label htmlFor={id}>
        {field.label}
        {field.required ? <span className="req"> *</span> : null}
      </label>
      {field.type === "select" ? (
        <select {...common}>
          <option value="">Select...</option>
          {field.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea {...common} placeholder={field.placeholder} />
      ) : (
        <input type={field.type || "text"} {...common} placeholder={field.placeholder} />
      )}
    </div>
  );
}

function GenericSection({ section, values, onChange }) {
  return (
    <section className="section">
      <h2>
        <span className="num">{section.number}</span>
        {section.title}
      </h2>
      <div className="grid">
        {section.fields.map((field) => (
          <Field
            key={field.name}
            field={field}
            value={values[field.name]}
            onChange={(name, value) => onChange(section.key, name, value)}
          />
        ))}
      </div>
    </section>
  );
}

function CheckboxGroup({ options, selected, onToggle }) {
  return (
    <div className="checks">
      {options.map((opt) => (
        <label key={opt} className="check">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => onToggle(opt)}
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );
}

export default function AdmissionForm({ id, initial, onSaved, onClose }) {
  // The record id may not exist yet for a new admission; it is assigned after
  // the first save (draft or final) so later saves update the same record.
  const [recordId, setRecordId] = useState(id ?? null);
  const startedAsEdit = Boolean(id);
  const [data, setData] = useState(() =>
    initial ? hydrateState(initial) : buildInitialState()
  );
  const [status, setStatus] = useState({ type: null, message: "" });
  const [busy, setBusy] = useState(null); // "draft" | "complete" | null

  function updateField(sectionKey, name, value) {
    setData((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [name]: value },
    }));
  }

  function updateSiblingCount(value) {
    const count = Math.max(0, Math.min(20, parseInt(value || "0", 10) || 0));
    setData((prev) => {
      const existing = prev.siblings.siblings;
      const next = Array.from(
        { length: count },
        (_, i) => existing[i] || { name: "", className: "" }
      );
      return {
        ...prev,
        siblings: { ...prev.siblings, numberOfSiblings: value, siblings: next },
      };
    });
  }

  function updateSiblingRow(index, key, value) {
    setData((prev) => {
      const next = prev.siblings.siblings.map((s, i) =>
        i === index ? { ...s, [key]: value } : s
      );
      return { ...prev, siblings: { ...prev.siblings, siblings: next } };
    });
  }

  function toggleCheckbox(key, opt) {
    setData((prev) => {
      const list = prev[key];
      return {
        ...prev,
        [key]: list.includes(opt) ? list.filter((x) => x !== opt) : [...list, opt],
      };
    });
  }

  async function save(intent) {
    setStatus({ type: null, message: "" });

    if (
      intent === "complete" &&
      (!data.identity.firstName.trim() || !data.identity.lastName.trim())
    ) {
      setStatus({
        type: "error",
        message: "First name and last name are required to submit.",
      });
      return;
    }

    setBusy(intent);
    try {
      const res = await fetch(
        recordId ? `/api/students/${recordId}` : "/api/students",
        {
          method: recordId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, status: intent }),
        }
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Save failed.");

      const savedId = recordId || body.id;
      if (!recordId) setRecordId(savedId);

      if (intent === "draft") {
        setStatus({
          type: "success",
          message: "Progress saved as draft. You can finish it anytime.",
        });
        onSaved?.(savedId, "draft");
      } else {
        onSaved?.(savedId, "complete", startedAsEdit);
      }
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setBusy(null);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    save("complete");
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {status.type ? (
        <div className={`banner ${status.type}`}>{status.message}</div>
      ) : null}

      {SECTIONS.map((section) => (
        <div key={section.key}>
          <GenericSection
            section={section}
            values={data[section.key]}
            onChange={updateField}
          />

          {/* 7. Sibling details rendered right after Mother's Details */}
          {section.key === "motherDetails" ? (
            <section className="section">
              <h2>
                <span className="num">7</span>
                Sibling Details
              </h2>
              <div className="grid">
                <div className="field">
                  <label htmlFor="numberOfSiblings">Number of siblings</label>
                  <input
                    id="numberOfSiblings"
                    type="number"
                    min="0"
                    max="20"
                    value={data.siblings.numberOfSiblings}
                    onChange={(e) => updateSiblingCount(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="studyingInThisSchool">
                    Siblings studying in this school?
                  </label>
                  <select
                    id="studyingInThisSchool"
                    value={data.siblings.studyingInThisSchool}
                    onChange={(e) =>
                      updateField("siblings", "studyingInThisSchool", e.target.value)
                    }
                  >
                    <option value="">Select...</option>
                    {YES_NO.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {data.siblings.studyingInThisSchool === "Yes" &&
              data.siblings.siblings.length > 0 ? (
                <>
                  <p className="hint" style={{ marginTop: 14 }}>
                    Enter the name and class for each sibling studying in this school.
                  </p>
                  {data.siblings.siblings.map((s, i) => (
                    <div className="sibling-row" key={i}>
                      <span className="row-title">Sibling {i + 1}</span>
                      <div className="field">
                        <label>Name</label>
                        <input
                          value={s.name}
                          onChange={(e) => updateSiblingRow(i, "name", e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label>Class</label>
                        <input
                          value={s.className}
                          onChange={(e) =>
                            updateSiblingRow(i, "className", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : null}
            </section>
          ) : null}
        </div>
      ))}

      {/* 14. Primary reason for choosing our school */}
      <section className="section">
        <h2>
          <span className="num">14</span>
          Primary Reason for Choosing Our School
        </h2>
        <CheckboxGroup
          options={REASON_OPTIONS}
          selected={data.reasonForChoosing}
          onToggle={(opt) => toggleCheckbox("reasonForChoosing", opt)}
        />
      </section>

      {/* 15. Areas where child needs support */}
      <section className="section">
        <h2>
          <span className="num">15</span>
          Areas Where Child Needs Support
        </h2>
        <CheckboxGroup
          options={SUPPORT_OPTIONS}
          selected={data.supportAreas}
          onToggle={(opt) => toggleCheckbox("supportAreas", opt)}
        />
      </section>

      {/* 16. Transport */}
      <section className="section">
        <h2>
          <span className="num">16</span>
          Transport
        </h2>
        <div className="grid">
          <div className="field">
            <label htmlFor="transportRequired">Transport required?</label>
            <select
              id="transportRequired"
              value={data.transport.required}
              onChange={(e) => updateField("transport", "required", e.target.value)}
            >
              <option value="">Select...</option>
              {["Yes", "No", "Maybe"].map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          {data.transport.required === "Yes" ? (
            <div className="field">
              <label htmlFor="transportLocation">Pickup / drop location</label>
              <input
                id="transportLocation"
                value={data.transport.location}
                onChange={(e) => updateField("transport", "location", e.target.value)}
              />
            </div>
          ) : null}
        </div>
      </section>

      <div className="actions">
        <button type="submit" className="submit" disabled={busy !== null}>
          {busy === "complete"
            ? "Saving..."
            : startedAsEdit
            ? "Save Changes"
            : "Submit Admission"}
        </button>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => save("draft")}
          disabled={busy !== null}
        >
          {busy === "draft" ? "Saving..." : "Save Progress"}
        </button>
        <button type="button" className="ghost-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}
