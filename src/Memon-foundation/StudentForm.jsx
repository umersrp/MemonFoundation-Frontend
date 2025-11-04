// StudentRegistrationForm.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Icon from "@/components/ui/Icon";

/**
 * StudentRegistrationForm - Modern Stepper Version
 * Multi-step form with improved UI similar to the example
 */

const requiredFilesList = [
  { key: "birthCertificate", label: "Birth Certificate / B.Form / CNIC" },
  { key: "last3Results", label: "Last 3 Years Academic Results" },
  { key: "achievementCerts", label: "Certificates of achievement (if any)" },
  { key: "fatherCNICFile", label: "Father's CNIC (scan/photo)" },
  { key: "fatherJamaatCard", label: "Father's Jamaat Card" },
  { key: "motherCNICFile", label: "Mother's CNIC (scan/photo)" },
  { key: "motherJamaatCard", label: "Mother's Jamaat Card" },
  { key: "salarySlip", label: "Last Salary Slip / Bank Statement" },
  { key: "utilityBills", label: "Utility Bills" },
];

const steps = [
  { id: 1, title: "Personal Info", section: "A", icon: "heroicons:user" },
  { id: 2, title: "Academic Info", section: "A", icon: "heroicons:academic-cap" },
  { id: 3, title: "Family Info", section: "B", icon: "heroicons:users" },
  { id: 4, title: "Financial Info", section: "B", icon: "heroicons:currency-dollar" },
  { id: 5, title: "Documents", section: "B", icon: "heroicons:document" },
  { id: 6, title: "Office Use", section: "C", icon: "heroicons:building-office" },
  { id: 7, title: "Declaration", section: "C", icon: "heroicons:clipboard-document-check" },
];

const StudentRegistrationForm2 = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(true);
  const [agreed, setAgreed] = useState(false);

  // Countries for Select
  const [countries, setCountries] = useState([]);

  // loading / submit state
  const [loading, setLoading] = useState(false);

  // Files state
  const [files, setFiles] = useState(
    requiredFilesList.reduce((acc, f) => ({ ...acc, [f.key]: [] }), {})
  );
  const fileInputRefs = useRef({});

  // Error state
  const [errors, setErrors] = useState({});

  // Form data (keeping your existing form structure)
  const [form, setForm] = useState({
    // ... your existing form state
    type: "student",
    name: "",
    email: "",
    phone: "",
    image: "",
    academicRecords: [
      {
        class: "",
        stream: "Other",
        schoolName: "",
        yearOfPassing: "",
        gradeOrPercentage: "",
        positionOrRank: "",
      },
    ],
    extracurricularActivities: [
      {
        activityName: "",
        role: "",
        timespent: "",
        beeninvoled: "",
        reciveCertificates: "",
      },
    ],
    father: {
      firstName: "",
      middleName: "",
      lastName: "",
      cnicNo: "",
      jamaatName: "",
      jamaatMembershipNo: "",
      profession: "",
      companyName: "",
      designation: "",
      residentialAddress: "",
      mobileNumber: "",
      email: "",
    },
    mother: {
      firstName: "",
      middleName: "",
      lastName: "",
      cnicNo: "",
      jamaatName: "",
      jamaatMembershipNo: "",
      profession: "",
      companyName: "",
      designation: "",
      residentialAddress: "",
      mobileNumber: "",
      email: "",
    },
    selectionNote: "",
    numberOfHouseholdMembers: 0,
    familyMembers: [{ name: "", relation: "" }],
    financialInformation: {
      numberOfEarningMembers: 0,
      earningMemberRelations: [],
      totalMonthlyIncome: 0,
    },
    officeUseInfo: {
      jamaatName: "",
      membershipNumber: "",
      belongsToJamaat: "None",
      supportProvided: "No Support",
      zakatDeserving: false,
      authorizedSignature: {
        name: "",
        designation: "",
        stamp: "",
      },
      channelOfSubmission: "",
      memfOffice: {
        studentCode: "",
        assessmentDate: "",
        interviewDate: "",
        decision: "",
        category: "",
        scholarship: {
          grantedFor: "",
          totalAmount: "",
        },
        panelComments: "",
        reviewPanelSignature: {
          name: "",
          designation: "",
          stamp: "",
        },
      },
    },
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dob: "",
    nationality: "",
    appliedOther: "no",
    appliedDetails: "",
    currentSchool: "",
    schoolAddress: "",
    positionAchieved: "",
    gradeClass: "",
    monthlyFee: "",
    plannedCollege: "",
    examinationBoard: "National",
    residentialAddress: "",
    declarationParentName: "",
    declarationDate: "",
  });

  // Fetch countries for select
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("https://restcountries.com/v3.1/all?fields=name");
        const countryList = res.data.map((c) => c.name.common).sort();
        setCountries(countryList);
      } catch (err) {
        console.error("Failed loading countries", err);
      }
    })();
  }, []);

  // ---------- helpers ----------
  const setField = (path, value) => {
    if (!path.includes(".")) {
      setForm((p) => ({ ...p, [path]: value }));
      setErrors((prev) => ({ ...prev, [path]: null }));
      return;
    }
    const parts = path.split(".");
    setForm((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let cur = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const arrMatch = part.match(/(\w+)\[(\d+)\]/);
        if (arrMatch) {
          const arrName = arrMatch[1];
          const idx = Number(arrMatch[2]);
          cur = cur[arrName][idx];
        } else {
          cur = cur[part];
        }
      }
      const last = parts[parts.length - 1];
      const arrMatchLast = last.match(/(\w+)\[(\d+)\]/);
      if (arrMatchLast) {
        const arrName = arrMatchLast[1];
        const idx = Number(arrMatchLast[2]);
        cur[arrName][idx] = value;
      } else {
        cur[last] = value;
      }
      return copy;
    });
    setErrors((prev) => ({ ...prev, [path]: null }));
  };

  // Step navigation
  const nextStep = () => {
    // Validate current step before proceeding
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error("Please fix the errors before proceeding.");
      return;
    }

    setCompletedSteps([...completedSteps, currentStep]);
    setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step validation
  const validateStep = (step) => {
    const e = {};

    switch (step) {
      case 1: // Personal Info
        if (!form.firstName) e.firstName = "First name required";
        if (!form.lastName) e.lastName = "Last name required";
        if (!form.email) e.email = "Email required";
        if (!form.phone) e.phone = "Phone required";
        break;

      case 2: // Academic Info
        if (!form.currentSchool) e.currentSchool = "Current school required";
        if (!form.gradeClass) e.gradeClass = "Grade/Class required";
        if (!form.academicRecords || form.academicRecords.length === 0) {
          e.academicRecords = "Add at least one academic record";
        } else {
          form.academicRecords.forEach((rec, idx) => {
            if (!rec.schoolName || !rec.yearOfPassing || !rec.gradeOrPercentage) {
              e[`academicRecords[${idx}]`] = "School, year and grade required";
            }
          });
        }
        break;

      case 3: // Family Info
        if (!form.father.firstName) e.fatherFirstName = "Father first name required";
        if (!form.mother.firstName) e.motherFirstName = "Mother first name required";
        break;

      case 5: // Documents
        if (!files.birthCertificate || files.birthCertificate.length === 0) e.birthCertificate = "Upload birth certificate/B.form/CNIC";
        if (!files.last3Results || files.last3Results.length === 0) e.last3Results = "Upload last 3 years academic results";
        break;

      case 7: // Declaration
        if (!form.declarationParentName) e.declarationParentName = "Parent/Guardian name required";
        if (!form.declarationDate) e.declarationDate = "Date required";
        break;
    }

    return e;
  };

  // Modern Stepper Progress Component
  const ModernStepper = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center flex-1">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${currentStep === step.id
                  ? "bg-blue-600 border-blue-600 text-white"
                  : completedSteps.includes(step.id)
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-white border-gray-300 text-gray-500"
                }`}>
                {completedSteps.includes(step.id) ? (
                  <Icon icon="heroicons:check" className="w-6 h-6" />
                ) : (
                  <Icon icon={step.icon} className="w-6 h-6" />
                )}
              </div>
              <div className="mt-3 text-center">
                <div className={`text-sm font-medium ${currentStep === step.id ? "text-blue-600" :
                    completedSteps.includes(step.id) ? "text-green-600" : "text-gray-500"
                  }`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Section {step.section}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-4 ${completedSteps.includes(step.id) ? "bg-green-500" : "bg-gray-200"
                }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  // Step Header Component
  const StepHeader = ({ title, subtitle }) => (
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </div>
  );

  // Step 1: Personal Information (Redesigned)
  const Step1 = () => (
    <div className="max-w-4xl mx-auto">
      <StepHeader
        title="Basic Information"
        subtitle="Please provide your personal details"
      />

      <Card className="border-0 shadow-lg">
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.firstName ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Middle Name
              </label>
              <input
                value={form.middleName}
                onChange={(e) => setField("middleName", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your middle name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <Select
                options={[
                  { value: "", label: "Select Gender" },
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" },
                ]}
                value={form.gender ? { value: form.gender, label: form.gender } : null}
                onChange={(selected) => setField("gender", selected?.value || "")}
                placeholder="Select Gender"
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={form.dob}
                onChange={(e) => setField("dob", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nationality
              </label>
              <Select
                options={countries.map((c) => ({ value: c, label: c }))}
                value={
                  form.nationality
                    ? { value: form.nationality, label: form.nationality }
                    : null
                }
                onChange={(s) => setField("nationality", s?.value || "")}
                placeholder="Select Country"
                isClearable
              />

            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Phone *
              </label>
              <input
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Residential Address
              </label>
              <input
                value={form.residentialAddress}
                onChange={(e) => setField("residentialAddress", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your residential address"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Have you applied for other scholarships?
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="appliedOther"
                    checked={form.appliedOther === "yes"}
                    onChange={() => setField("appliedOther", "yes")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Yes</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="appliedOther"
                    checked={form.appliedOther === "no"}
                    onChange={() => setField("appliedOther", "no")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">No</span>
                </label>
              </div>
            </div>

            {form.appliedOther === "yes" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  If yes, give details
                </label>
                <input
                  type="text"
                  value={form.appliedDetails}
                  onChange={(e) => setField("appliedDetails", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide details about other scholarships"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  // Step 2: Academic Information (Redesigned)
  const Step2 = () => (
    <div className="max-w-4xl mx-auto">
      <StepHeader
        title="Academic Information"
        subtitle="Provide your educational background and achievements"
      />

      <Card className="border-0 shadow-lg">
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current School / College *
              </label>
              <input
                value={form.currentSchool}
                onChange={(e) => setField("currentSchool", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.currentSchool ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="Enter your current school/college"
              />
              {errors.currentSchool && (
                <p className="text-red-500 text-sm mt-1">{errors.currentSchool}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade / Class *
              </label>
              <input
                value={form.gradeClass}
                onChange={(e) => setField("gradeClass", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.gradeClass ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="Enter your grade/class"
              />
              {errors.gradeClass && (
                <p className="text-red-500 text-sm mt-1">{errors.gradeClass}</p>
              )}
            </div>

            {/* Add other academic fields here following the same pattern */}
          </div>

          {/* Academic Records Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Previous Academic Records
            </h3>
            {form.academicRecords.map((rec, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Academic record fields */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1 />;
      case 2: return <Step2 />;
      // ... other steps
      default: return <Step1 />;
    }
  };

  return (
    <Card>
      <div className="relative">
        {/* Modal: Guidelines */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 overflow-auto max-h-[85vh]">
              <h3 className="text-xl font-bold mb-3">📘 Important Guidelines & Terms</h3>
              <div className="text-sm leading-relaxed space-y-3 mb-4">
                <p>Kindly read all instructions and questions before filling out the application.</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>The scholarship is offered for O Levels, A Levels and Grade XI, XII students of MEMF-approved schools & colleges based in Karachi only.</li>
                  <li>The application must be completed in English. Please write clearly.</li>
                  <li>Bring original documents on the day of the interview. Both parents must accompany the applicant.</li>
                  <li>Attach the required supporting documents (listed below).</li>
                  <li>By clicking "I Agree & Continue" you confirm that the information provided is correct and accept the Terms & Conditions.</li>
                </ol>

                <div className="mt-3">
                  <strong>Required documents (upload in the form):</strong>
                  <ul className="list-disc pl-5 mt-2">
                    {requiredFilesList.map((f) => (
                      <li key={f.key} className="text-sm">{f.label}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => { setAgreed(true); setShowModal(false); }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  I Agree & Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main form with modern stepper */}
        {(agreed || !showModal) && (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  MEMON EDUCATION MONETARY FOUNDATION
                </h1>
                <p className="text-lg text-gray-600">
                  STAR SCHOLARSHIP (Session 2025–26)
                </p>
              </div>

              {/* Modern Stepper */}
              <ModernStepper />

              <form onSubmit={handleSubmit}>
                {/* Current Step Content */}
                {renderStep()}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-12 max-w-4xl mx-auto">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-colors ${currentStep === 1
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm'
                      }`}
                  >
                    <Icon icon="heroicons:arrow-left" className="w-5 h-5" />
                    Back
                  </button>

                  <div className="flex gap-4">
                    {currentStep < steps.length ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Next
                        <Icon icon="heroicons:arrow-right" className="w-5 h-5" />
                      </button>
                    ) : (
                      <Button
                        text={loading ? "Submitting..." : "Submit Application"}
                        isLoading={loading}
                        onClick={handleSubmit}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                      />
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StudentRegistrationForm2;