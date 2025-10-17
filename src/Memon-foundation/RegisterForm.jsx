// StudentRegistrationForm.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";

const StudentRegistrationForm = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(true);
    const [agreed, setAgreed] = useState(false);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        type: "student", // hard-coded
        name: "", // student's full name -> schema "name"
        email: "",
        phone: "",
        image: "", // optional
        academicRecords: [
            {
                class: "",
                stream: "Other", // enum: Science, Commerce, Arts, Other
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
        firstName: "", // we will build name from first/middle/last to map to "name"
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
        // declaration
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

    const addAcademicRecord = () => {
        if (form.academicRecords.length >= 3) return;
        setForm((p) => ({
            ...p,
            academicRecords: [
                ...p.academicRecords,
                {
                    class: "",
                    stream: "Other",
                    schoolName: "",
                    yearOfPassing: "",
                    gradeOrPercentage: "",
                    positionOrRank: "",
                },
            ],
        }));
    };
    const removeAcademicRecord = (idx) => {
        setForm((p) => ({
            ...p,
            academicRecords: p.academicRecords.filter((_, i) => i !== idx),
        }));
    };

    const addExtracurricular = () => {
        if (form.extracurricularActivities.length >= 3) return;
        setForm((p) => ({
            ...p,
            extracurricularActivities: [
                ...p.extracurricularActivities,
                { activityName: "", role: "", timespent: "", beeninvoled: "", reciveCertificates: "" },
            ],
        }));
    };
    const removeExtracurricular = (idx) => {
        setForm((p) => ({
            ...p,
            extracurricularActivities: p.extracurricularActivities.filter((_, i) => i !== idx),
        }));
    };

    const addFamilyMember = () =>
        setForm((p) => ({ ...p, familyMembers: [...p.familyMembers, { name: "", relation: "" }] }));
    const removeFamilyMember = (i) =>
        setForm((p) => ({ ...p, familyMembers: p.familyMembers.filter((_, idx) => idx !== i) }));

    const validate = () => {
        const e = {};
        if (!form.firstName) e.firstName = "First name required";
        if (!form.lastName) e.lastName = "Last name required";
        if (!form.email) e.email = "Email required";
        if (!form.phone) e.phone = "Phone required";
        if (!form.currentSchool) e.currentSchool = "Current school required";
        if (!form.gradeClass) e.gradeClass = "Grade/Class required";

        if (!form.academicRecords || form.academicRecords.length === 0) e.academicRecords = "Add at least one academic record";
        else {
            form.academicRecords.forEach((rec, idx) => {
                if (!rec.schoolName || !rec.yearOfPassing || !rec.gradeOrPercentage) {
                    e[`academicRecords[${idx}]`] = "School, year and grade required";
                }
            });
        }

        if (!form.father.firstName) e.fatherFirstName = "Father first name required";
        if (!form.mother.firstName) e.motherFirstName = "Mother first name required";
        return e;
    };

    // ---------- submit ----------
    const handleSubmit = async (ev) => {
        ev.preventDefault();

        const composed = `${form.firstName} ${form.middleName || ""} ${form.lastName}`.trim();

        const payloadObj = {
            type: "student",
            name: composed,
            email: form.email,
            phone: form.phone,
            image: form.image || "",
            academicRecords: form.academicRecords.map((r) => ({
                class: r.class,
                stream: r.stream,
                schoolName: r.schoolName,
                yearOfPassing: r.yearOfPassing,
                gradeOrPercentage: r.gradeOrPercentage,
                positionOrRank: r.positionOrRank || "",
            })),
            extracurricularActivities: form.extracurricularActivities.map((ex) => ({
                activityName: ex.activityName,
                role: ex.role,
                timespent: ex.timespent,
                beeninvoled: ex.beeninvoled,
                reciveCertificates: ex.reciveCertificates,
            })),
            father: { ...form.father },
            mother: { ...form.mother },
            selectionNote: form.selectionNote || "",
            numberOfHouseholdMembers: Number(form.numberOfHouseholdMembers) || 0,
            familyMembers: form.familyMembers.map((fm) => ({
                name: fm.name,
                relation: fm.relation,
            })),
            financialInformation: {
                numberOfEarningMembers: Number(form.financialInformation.numberOfEarningMembers) || 0,
                earningMemberRelations: form.financialInformation.earningMemberRelations || [],
                totalMonthlyIncome: Number(form.financialInformation.totalMonthlyIncome) || 0,
            },
            personal: {
                gender: form.gender,
                dob: form.dob,
                nationality: form.nationality,
                appliedOther: form.appliedOther,
                appliedDetails: form.appliedDetails,
                currentSchool: form.currentSchool,
                schoolAddress: form.schoolAddress,
                positionAchieved: form.positionAchieved,
                gradeClass: form.gradeClass,
                monthlyFee: form.monthlyFee,
                plannedCollege: form.plannedCollege,
                examinationBoard: form.examinationBoard,
                residentialAddress: form.residentialAddress,
                declarationParentName: form.declarationParentName,
                declarationDate: form.declarationDate,
            },
        };

        // Client-side validation
        const v = validate();
        if (Object.keys(v).length > 0) {
            setErrors(v);
            window.scrollTo({ top: 0, behavior: "smooth" });
            toast.error("Please fix the errors before submitting.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/user/student`,
                payloadObj,
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.status === 200 || response.status === 201) {
                toast.success("Application submitted successfully!");
            } else {
                toast.error("Unexpected response from server.");
            }
        } catch (err) {
            console.error("Submission error:", err);
            toast.error(err.response?.data?.message || "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    return (
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
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-md border "
                            >
                                Close (Preview only)
                            </button>
                            <button
                                type="button"
                                onClick={() => { setAgreed(true); setShowModal(false); }}
                                className="px-4 py-2 rounded-md btn-primary"
                            >
                                I Agree & Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main long-scroll form */}
            {(agreed || !showModal) && (
                <div className="bg-slate-50 py-10 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div
                            className="!bg-slate-100  pt-0">
                            <div className="text-center pt-8">
                                <p>MEMON EDUCATION MONETARY FOUNDATION — STAR SCHOLARSHIP (Session 2025–26)</p>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-8 m-10">
                                {/* SECTION A: PERSONAL */}
                                <Card title={"SECTION A: PERSONAL INFORMATION"} >
                                    <div className="p-4">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium">First Name *</label>
                                                <input name="firstName" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} className={`mt-1 w-full border rounded p-2 ${errors.firstName ? "border-red-500" : "border-gray-300"}`} />
                                                {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium">Middle Name</label>
                                                <input name="middleName" value={form.middleName} onChange={(e) => setField("middleName", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium">Last Name *</label>
                                                <input name="lastName" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} className={`mt-1 w-full border rounded p-2 ${errors.lastName ? "border-red-500" : "border-gray-300"}`} />
                                                {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Gender</label>
                                                <Select
                                                    options={[
                                                        { value: "Male", label: "Male" },
                                                        { value: "Female", label: "Female" },
                                                        { value: "Other", label: "Other" },
                                                    ]}
                                                    value={
                                                        form.gender
                                                            ? { value: form.gender, label: form.gender }
                                                            : null
                                                    }
                                                    onChange={(selected) => setField("gender", selected?.value || "")}
                                                    placeholder="Select Gender"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium">Date of Birth</label>
                                                <input type="date" value={form.dob} onChange={(e) => setField("dob", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium">Nationality</label>
                                                <Select
                                                    options={countries.map((c) => ({ value: c, label: c }))}
                                                    value={form.nationality ? { value: form.nationality, label: form.nationality } : null}
                                                    onChange={(s) => setField("nationality", s?.value || "")}
                                                    placeholder="Select Country"
                                                />
                                            </div>

                                            <div className="lg:col-span-3">
                                                <label className="block text-sm font-medium">Have you applied for other scholarships?</label>
                                                <div className="mt-1 flex gap-4">
                                                    <label className="flex items-center gap-2"><input type="radio" name="appliedOther" checked={form.appliedOther === "yes"} onChange={() => setField("appliedOther", "yes")} /> Yes</label>
                                                    <label className="flex items-center gap-2"><input type="radio" name="appliedOther" checked={form.appliedOther === "no"} onChange={() => setField("appliedOther", "no")} /> No</label>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-3">
                                                <label className="block text-sm font-medium">If yes, give details</label>
                                                <input type="text" value={form.appliedDetails} onChange={(e) => setField("appliedDetails", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium">Current School / College *</label>
                                                <input value={form.currentSchool} onChange={(e) => setField("currentSchool", e.target.value)} className={`mt-1 w-full border rounded p-2 ${errors.currentSchool ? "border-red-500" : "border-gray-300"}`} />
                                                {errors.currentSchool && <p className="text-red-500 text-sm">{errors.currentSchool}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium">School / College Address</label>
                                                <input value={form.schoolAddress} onChange={(e) => setField("schoolAddress", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium">Grade / Class *</label>
                                                <input value={form.gradeClass} onChange={(e) => setField("gradeClass", e.target.value)} className={`mt-1 w-full border rounded p-2 ${errors.gradeClass ? "border-red-500" : "border-gray-300"}`} />
                                                {errors.gradeClass && <p className="text-red-500 text-sm">{errors.gradeClass}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium">Monthly Fee</label>
                                                <input type="number" value={form.monthlyFee} onChange={(e) => setField("monthlyFee", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium">Which college / why?</label>
                                                <input value={form.plannedCollege} onChange={(e) => setField("plannedCollege", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Examination Board</label>
                                                <Select
                                                    options={[
                                                        { value: "National", label: "National" },
                                                        { value: "International", label: "International" },
                                                    ]}
                                                    value={
                                                        form.examinationBoard
                                                            ? { value: form.examinationBoard, label: form.examinationBoard }
                                                            : null
                                                    }
                                                    onChange={(selected) => setField("examinationBoard", selected?.value || "")}
                                                    placeholder="Select Examination Board"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium">Residential Address</label>
                                                <input value={form.residentialAddress} onChange={(e) => setField("residentialAddress", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium">Mobile Phone *</label>
                                                <input value={form.phone} onChange={(e) => setField("phone", e.target.value)} className={`mt-1 w-full border rounded p-2 ${errors.phone ? "border-red-500" : "border-gray-300"}`} />
                                                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium">Email Address *</label>
                                                <input value={form.email} onChange={(e) => setField("email", e.target.value)} className={`mt-1 w-full border rounded p-2 ${errors.email ? "border-red-500" : "border-gray-300"}`} />
                                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                            </div>
                                        </div>

                                        {/* Previous Academic Records */}
                                        <div className="mt-6">
                                            <h5 className="font-medium mb-2">Previous Academic Record (up to 3)</h5>
                                            {form.academicRecords.map((rec, idx) => (
                                                <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end mb-2">
                                                    <div>
                                                        <label className="text-sm">Class</label>
                                                        <input value={rec.class} onChange={(e) => setField(`academicRecords[${idx}].class`, e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Stream</label>
                                                        <Select
                                                            options={[
                                                                { value: "Science", label: "Science" },
                                                                { value: "Commerce", label: "Commerce" },
                                                                { value: "Arts", label: "Arts" },
                                                                { value: "Other", label: "Other" },
                                                            ]}
                                                            isClearable={false} // 🚫 prevents user from clearing selection
                                                            value={
                                                                rec.stream
                                                                    ? { value: rec.stream, label: rec.stream }
                                                                    : { value: "Other", label: "Other" } // fallback display
                                                            }
                                                            onChange={(selected) =>
                                                                setField(`academicRecords[${idx}].stream`, selected?.value || "Other")
                                                            }
                                                            placeholder="Select Stream"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm">Name of School</label>
                                                        <input value={rec.schoolName} onChange={(e) => setField(`academicRecords[${idx}].schoolName`, e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm">Year of Passing</label>
                                                        <input value={rec.yearOfPassing} onChange={(e) => setField(`academicRecords[${idx}].yearOfPassing`, e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm">Grade / Percentage</label>
                                                        <input value={rec.gradeOrPercentage} onChange={(e) => setField(`academicRecords[${idx}].gradeOrPercentage`, e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {form.academicRecords.length > 1 && (
                                                            <button type="button" onClick={() => removeAcademicRecord(idx)} className="btn btn-light">Remove</button>
                                                        )}
                                                        {idx === form.academicRecords.length - 1 && form.academicRecords.length < 3 && (
                                                            <button type="button" onClick={addAcademicRecord} className="btn btn-primary">Add</button>
                                                        )}
                                                    </div>
                                                    {errors[`academicRecords[${idx}]`] && <p className="text-red-500 text-sm col-span-6">{errors[`academicRecords[${idx}]`]}</p>}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-12">
                                            <label className="block text-sm font-medium">Position achieved, if any, in the School / Board.</label>
                                            <input value={form.schoolAddress} onChange={(e) => setField("schoolAddress", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                        </div>

                                        {/* Extracurricular Activities */}
                                        <div className="mt-6">
                                            <h5 className="font-medium mb-2">Extracurricular Activities (up to 3)</h5>
                                            {form.extracurricularActivities.map((ex, i) => (
                                                <div key={i} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end mb-2">
                                                    <div>
                                                        <label className="text-sm">Activity</label>
                                                        <input value={ex.activityName} onChange={(e) => setField(`extracurricularActivities[${i}].activityName`, e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm">Your Role</label>
                                                        <input value={ex.role} onChange={(e) => setField(`extracurricularActivities[${i}].role`, e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm">Time Spent / Week</label>
                                                        <input value={ex.timespent} onChange={(e) => setField(`extracurricularActivities[${i}].timespent`, e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm">How long (yrs)</label>
                                                        <input value={ex.beeninvoled} onChange={(e) => setField(`extracurricularActivities[${i}].beeninvoled`, e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm">Received Certificate?</label>
                                                        <input value={ex.reciveCertificates} onChange={(e) => setField(`extracurricularActivities[${i}].reciveCertificates`, e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" placeholder="Yes/No or name of certificate" />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {form.extracurricularActivities.length > 1 && (
                                                            <button type="button" onClick={() => removeExtracurricular(i)} className="btn btn-light">Remove</button>
                                                        )}
                                                        {i === form.extracurricularActivities.length - 1 && form.extracurricularActivities.length < 3 && (
                                                            <button type="button" onClick={addExtracurricular} className="btn btn-primary">Add</button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium">Which field of study would you like to pursue and why?</label>
                                            <textarea value={form.selectionNote} onChange={(e) => setField("selectionNote", e.target.value)} rows={3} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                        </div>
                                    </div>
                                </Card>

                                {/* SECTION B: FAMILY */}
                                <Card title={"SECTION B: FAMILY INFORMATION"} >
                                    {/* <div className="bg-black p-3 mb-3 card-header ">
                  <h4 className="font-semibold text-white mb-3">SECTION B: FAMILY INFORMATION</h4>
                  </div> */}

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
                                        {/* Father */}
                                        <div className="col-span-3">
                                            <h5 className="font-medium mb-2">Father's Profile</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                                    <input placeholder="First Name" value={form.father.firstName} onChange={(e) => setField("father.firstName", e.target.value)} className={`mt-1 w-full border rounded p-2 ${errors.fatherFirstName ? "border-red-500" : "border-gray-300"}`} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                                                    <input placeholder="Middle Name" value={form.father.middleName} onChange={(e) => setField("father.middleName", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                                    <input placeholder="Last Name" value={form.father.lastName} onChange={(e) => setField("father.lastName", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">CNIC No.</label>
                                                    <input placeholder="CNIC No." value={form.father.cnicNo} onChange={(e) => setField("father.cnicNo", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Jamaat Name</label>
                                                    <input placeholder="Jamaat Name" value={form.father.jamaatName} onChange={(e) => setField("father.jamaatName", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Jamaat Membership No.</label>
                                                    <input placeholder="Jamaat Membership No." value={form.father.jamaatMembershipNo} onChange={(e) => setField("father.jamaatMembershipNo", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Profession / Occupation</label>
                                                    <input placeholder="Profession / Occupation" value={form.father.profession} onChange={(e) => setField("father.profession", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                </div><div>
                                                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                                    <input placeholder="Company Name" value={form.father.companyName} onChange={(e) => setField("father.companyName", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                </div><div>
                                                    <label className="block text-sm font-medium text-gray-700">Jamaat Name</label>
                                                    <input placeholder="Designation" value={form.father.designation} onChange={(e) => setField("father.designation", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Jamaat Name</label>
                                                    <input placeholder="Residential Address" value={form.father.residentialAddress} onChange={(e) => setField("father.residentialAddress", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                </div><div>
                                                    <label className="block text-sm font-medium text-gray-700">Jamaat Name</label>
                                                    <input placeholder="Mobile Number" value={form.father.mobileNumber} onChange={(e) => setField("father.mobileNumber", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <input placeholder="Email" value={form.father.email} onChange={(e) => setField("father.email", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                            </div>
                                        </div>

                                        {/* Mother */}
                                        <div className="col-span-3 mt-4">
                                            <h5 className="font-medium mb-2">Mother's Profile</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <input placeholder="First Name" value={form.mother.firstName} onChange={(e) => setField("mother.firstName", e.target.value)} className={`mt-1 w-full border rounded p-2 ${errors.motherFirstName ? "border-red-500" : "border-gray-300"}`} />
                                                <input placeholder="Middle Name" value={form.mother.middleName} onChange={(e) => setField("mother.middleName", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                <input placeholder="Last Name" value={form.mother.lastName} onChange={(e) => setField("mother.lastName", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                                <input placeholder="CNIC No." value={form.mother.cnicNo} onChange={(e) => setField("mother.cnicNo", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                <input placeholder="Jamaat Name" value={form.mother.jamaatName} onChange={(e) => setField("mother.jamaatName", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                <input placeholder="Jamaat Membership No." value={form.mother.jamaatMembershipNo} onChange={(e) => setField("mother.jamaatMembershipNo", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                                <input placeholder="Profession / Occupation" value={form.mother.profession} onChange={(e) => setField("mother.profession", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                <input placeholder="Company Name" value={form.mother.companyName} onChange={(e) => setField("mother.companyName", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                <input placeholder="Designation" value={form.mother.designation} onChange={(e) => setField("mother.designation", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                                <input placeholder="Residential Address" value={form.mother.residentialAddress} onChange={(e) => setField("mother.residentialAddress", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                <input placeholder="Mobile Number" value={form.mother.mobileNumber} onChange={(e) => setField("mother.mobileNumber", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                            </div>

                                            <div className="mt-3">
                                                <input placeholder="Email" value={form.mother.email} onChange={(e) => setField("mother.email", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                            </div>
                                        </div>

                                        {/* Additional Information */}
                                        <div className="lg:col-span-3 mt-4">
                                            <h5 className="font-medium mb-2">Additional Information</h5>
                                            <label className="block text-sm font-medium">Is there anything you'd like to bring to the attention of the selection committee?</label>
                                            <textarea value={form.positionAchieved} onChange={(e) => setField("positionAchieved", e.target.value)} rows={3} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                        </div>

                                        {/* family info */}
                                        <div className="lg:col-span-3 mt-4">
                                            <h5 className="font-medium mb-2">Family Information</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <input placeholder="Name of Applicant" value={`${form.firstName} ${form.middleName} ${form.lastName}`.trim()} readOnly className="mt-1 w-full border rounded p-2 border-gray-200 bg-gray-50" />
                                                <input placeholder="Number of members living with applicant" type="number" value={form.numberOfHouseholdMembers} onChange={(e) => setField("numberOfHouseholdMembers", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                            </div>

                                            <div className="mt-3">
                                                <label className="block font-medium mb-2">Relationship details</label>
                                                {form.familyMembers.map((fm, idx) => (
                                                    <div key={idx} className="flex gap-2 items-end mb-2">
                                                        <input placeholder="Name" value={fm.name} onChange={(e) => setField(`familyMembers[${idx}].name`, e.target.value)} className="w-1/2 border rounded p-2 border-gray-300" />
                                                        <input placeholder="Relation" value={fm.relation} onChange={(e) => setField(`familyMembers[${idx}].relation`, e.target.value)} className="w-1/2 border rounded p-2 border-gray-300" />
                                                        {form.familyMembers.length > 1 && <button type="button" onClick={() => removeFamilyMember(idx)} className="btn btn-light">Remove</button>}
                                                    </div>
                                                ))}
                                                <button type="button" onClick={addFamilyMember} className="btn btn-primary">Add Family Member</button>
                                            </div>

                                            {/* financial info */}
                                            <div className="mt-4">
                                                <h5 className="font-medium mb-2">Financial Information</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <input type="number" placeholder="Number of earning members" value={form.financialInformation.numberOfEarningMembers} onChange={(e) => setField("financialInformation.numberOfEarningMembers", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                    <input placeholder="Earning member relations (comma separated)" value={(form.financialInformation.earningMemberRelations || []).join(", ")} onChange={(e) => setField("financialInformation.earningMemberRelations", e.target.value.split(",").map(s => s.trim()))} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                    <input type="number" placeholder="Total monthly household income (PKR)" value={form.financialInformation.totalMonthlyIncome} onChange={(e) => setField("financialInformation.totalMonthlyIncome", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Declaration */}
                                <section className="bg-white p-4 rounded-md shadow-sm">
                                    <h4 className="font-semibold mb-3">Declaration</h4>
                                    <p className="text-sm text-gray-700 mb-3">By signing below, I declare that the information given is true & I accept the scholarship terms.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input placeholder="Parent/Guardian Name" value={form.declarationParentName} onChange={(e) => setField("declarationParentName", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                        <input type="date" value={form.declarationDate} onChange={(e) => setField("declarationDate", e.target.value)} className="mt-1 w-full border rounded p-2 border-gray-300" />
                                    </div>
                                </section>

                                {/* Submit Buttons */}
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded border">Cancel</button>
                                    <Button text={loading ? "Submitting..." : "Submit Application"} isLoading={loading} type="submit" />
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentRegistrationForm;
