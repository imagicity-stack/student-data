export const EMPLOYMENT_OPTIONS = [
  "Government",
  "Private",
  "Business",
  "Self employed",
  "Defence",
];

export const INCOME_OPTIONS = [
  "Up to 1.5 lakhs",
  "1.5 lakhs - 3 lakhs",
  "3 lakhs - 6 lakhs",
  "Above 6 lakhs",
];

export const YES_NO = ["Yes", "No"];

export const REASON_OPTIONS = [
  "Academic reputation",
  "Proximity to home",
  "Affordable fees",
  "Quality of teachers",
  "Infrastructure and facilities",
  "Co-curricular and sports programs",
  "Values and discipline",
  "Recommended by family / friends",
];

export const SUPPORT_OPTIONS = [
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
// checkbox groups, transport) are rendered inline in the form component.
export const SECTIONS = [
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

export function buildInitialState() {
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
