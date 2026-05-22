"use client";

import { useState } from "react";

const EMPLOYMENT_OPTIONS = [
  "Government",
  "Private",
  "Business",
  "Self employed",
  "Defence",
];

const INCOME_OPTIONS = [
  "Up to 1.5 lakhs",
  "1.5 lakhs - 3 lakhs",
  "3 lakhs - 6 lakhs",
  "Above 6 lakhs",
];

const YES_NO = ["Yes", "No"];

const REASON_OPTIONS = [
  "Academic reputation",
  "Proximity to home",
  "Affordable fees",
  "Quality of teachers",
  "Infrastructure and facilities",
  "Co-curricular and sports programs",
  "Values and discipline",
  "Recommended by family / friends",
];

const SUPPORT_OPTIONS = [
  "Reading and writing",
  "Mathematics",
  "Speech and language",
  "Social and emotional skills",
  "Concentration and attention",
  "Physical / motor skills",
  "Confidence building",
  "Special learning needs",
];

// Generic sections rendered from field descriptors. Special sections (siblings,
// checkbox groups, transport) are rendered inline in the component.
const SECTIONS = [
  {
    key: "identity",
    number: 1,
    title: "Identity",
    fields: [
      { name: "firstName", label: "First name", required: true },
      { name: "lastName", label: "Last name", required: true },
      { name: "dob", label: "Date of birth", type: "date" },
      { name: "aadhaarNumber", label: "Aadhaar number" },
      { name: "gender", label: "Gender", type: "select", options: ["Male", "Female"] },
    ],
  },
  {
    key: "admission",
    number: 2,
    title: "Admission",
    fields: [
      { name: "classAppliedFor", label: "Class applied for" },
      { name: "academicYear", label: "Academic year", placeholder: "2026-2027" },
    ],
  },
  {
    key: "demographics",
    number: 3,
    title: "Demographics",
    fields: [
      { name: "nationality", label: "Nationality" },
      { name: "religion", label: "Religion" },
      { name: "category", label: "Category", type: "select", options: ["General", "OBC", "SC/ST"] },
      { name: "permanentAddress", label: "Permanent address", type: "textarea", full: true },
      { name: "city", label: "City" },
      { name: "state", label: "State" },
      { name: "pincode", label: "Pincode" },
    ],
  },
  {
    key: "birthBackground",
    number: 4,
    title: "Birth & Background",
    fields: [
      { name: "placeOfBirth", label: "Place of birth" },
      { name: "birthCertificateNumber", label: "Birth certificate number" },
      { name: "motherTongue", label: "Mother tongue" },
      { name: "languagesKnown", label: "Languages known", placeholder: "Hindi, English, ..." },
    ],
  },
  {
    key: "fatherDetails",
    number: 5,
    title: "Father's Details",
    fields: [
      { name: "fullName", label: "Full name" },
      { name: "mobileNumber", label: "Mobile number", type: "tel" },
      { name: "educationalQualification", label: "Educational qualification" },
      { name: "employmentType", label: "Employment type", type: "select", options: EMPLOYMENT_OPTIONS },
      { name: "organizationName", label: "Organization name" },
      { name: "annualIncomeRange", label: "Annual income range", type: "select", options: INCOME_OPTIONS },
    ],
  },
  {
    key: "motherDetails",
    number: 6,
    title: "Mother's Details",
    fields: [
      { name: "fullName", label: "Full name" },
      { name: "mobileNumber", label: "Mobile number", type: "tel" },
      { name: "educationalQualification", label: "Educational qualification" },
      { name: "employmentType", label: "Employment type", type: "select", options: EMPLOYMENT_OPTIONS },
      { name: "organizationName", label: "Organization name" },
      { name: "annualIncomeRange", label: "Annual income range", type: "select", options: INCOME_OPTIONS },
    ],
  },
  // 7: siblings (special)
  {
    key: "residentialAddress",
    number: 8,
    title: "Residential Address",
    fields: [
      { name: "houseAddress", label: "House address", type: "textarea", full: true },
      { name: "city", label: "City" },
      { name: "state", label: "State" },
      { name: "district", label: "District" },
      { name: "pincode", label: "Pincode" },
    ],
  },
  {
    key: "previousSchool",
    number: 9,
    title: "Previous School Information",
    fields: [
      { name: "previousSchool", label: "Previous school" },
      { name: "board", label: "Board", placeholder: "CBSE / ICSE / State / ..." },
      { name: "mediumOfInstruction", label: "Medium of instruction" },
      { name: "yearsStudied", label: "Number of years studied", type: "number" },
      { name: "reasonForLeaving", label: "Reason for leaving", type: "textarea", full: true },
    ],
  },
  {
    key: "academicPerformance",
    number: 10,
    title: "Academic Performance",
    fields: [
      { name: "lastClassPassed", label: "Last class passed" },
      { name: "passedLastClass", label: "Passed last class?", type: "select", options: YES_NO },
      { name: "percentageScored", label: "Percentage scored", placeholder: "e.g. 85%" },
      { name: "subjectsStudied", label: "Subjects studied", type: "textarea", full: true },
      { name: "subjectsFoundDifficult", label: "Subjects found difficult", type: "textarea", full: true },
      { name: "tcAvailable", label: "Transfer certificate (TC) available?", type: "select", options: YES_NO },
    ],
  },
  {
    key: "coCurricular",
    number: 11,
    title: "Co-curricular Exposure",
    fields: [
      { name: "sportsParticipation", label: "Previous participation in sports", type: "textarea", full: true },
      { name: "artsMusicParticipation", label: "Previous participation in arts or music", type: "textarea", full: true },
    ],
  },
  {
    key: "health",
    number: 12,
    title: "Health & Medical Information",
    fields: [
      { name: "bloodGroup", label: "Blood group" },
      { name: "allergies", label: "Known allergies" },
      { name: "chronicConditions", label: "Chronic medical conditions" },
      { name: "regularMedication", label: "On regular medication?", type: "select", options: YES_NO },
      { name: "specialNeeds", label: "Any special needs / disability" },
      { name: "vaccinationUpToDate", label: "Vaccinations up to date?", type: "select", options: YES_NO },
      { name: "physicianName", label: "Family physician name" },
      { name: "physicianContact", label: "Physician contact number", type: "tel" },
    ],
  },
  {
    key: "emergencyContact",
    number: 13,
    title: "Emergency Contact",
    fields: [
      { name: "contactName", label: "Contact name" },
      { name: "relationship", label: "Relationship to student" },
      { name: "primaryPhone", label: "Primary phone", type: "tel" },
      { name: "alternatePhone", label: "Alternate phone", type: "tel" },
      { name: "email", label: "Email", type: "email" },
      { name: "address", label: "Address", type: "textarea", full: true },
    ],
  },
];

function emptySection(fields) {
  return Object.fromEntries(fields.map((f) => [f.name, ""]));
}

function buildInitialState() {
  const state = {};
  for (const section of SECTIONS) {
    state[section.key] = emptySection(section.fields);
  }
  state.siblings = { numberOfSiblings: "", studyingInThisSchool: "", siblings: [] };
  state.reasonForChoosing = [];
  state.supportAreas = [];
  state.transport = { required: "", location: "" };
  return state;
}

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

export default function Home() {
  const [data, setData] = useState(buildInitialState);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [submitting, setSubmitting] = useState(false);

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

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: null, message: "" });

    if (!data.identity.firstName.trim() || !data.identity.lastName.trim()) {
      setStatus({ type: "error", message: "First name and last name are required." });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Submission failed.");
      setStatus({
        type: "success",
        message: `Admission form submitted successfully. Reference ID: ${body.id}`,
      });
      setData(buildInitialState());
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Student Admission Form</h1>
        <p>Please fill in the details below. Fields marked with * are required.</p>
      </header>

      {status.type ? (
        <div className={`banner ${status.type}`}>{status.message}</div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate>
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
          <button type="submit" className="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Admission Form"}
          </button>
        </div>
      </form>
    </main>
  );
}
