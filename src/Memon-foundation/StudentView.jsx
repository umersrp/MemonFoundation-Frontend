import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const StudentView = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStudentById = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/user/user/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                if (response.data) {
                    setStudentData(response.data.data);
                } else {
                    setError("Student not found");
                }
            } catch (err) {
                setError("Failed to fetch student data");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentById();
    }, [id]);

    const handleEdit = () => {
        navigate(`/student-edit/${id}`);
    };

    const handleBack = () => {
        navigate("/Student");
    };


   const handleExportPDF = async () => {
  const element = document.getElementById("student-details-pdf");
  if (!element) return;

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(element, {
      scale: 2, // high resolution
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Calculate scale to fit everything on one page
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

    const x = (pdfWidth - imgWidth * ratio) / 2;
    const y = 0; // top aligned

    pdf.addImage(imgData, "PNG", x, y, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`${studentData.name || "student"}_details.pdf`);
  } catch (error) {
    console.error("PDF export failed:", error);
  }
};

    if (loading) return <div className="flex justify-center items-center py-8">Loading...</div>;
    if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
    if (!studentData) return <div className="text-center py-4">No student data found</div>;

    return (
        <Card title="Student Details">
            <div id="student-details-pdf" className="max-w-full mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                        <Button
                            onClick={handleBack}
                            text="Back to List"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        />
                        <Button
                            onClick={handleEdit}
                            text="Edit Student"
                            className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
                        />

                        <Button
                            onClick={handleExportPDF}
                            text="Export to PDF"
                            className="btn font-normal btn-sm bg-gradient-to-r from-[#ef5353] to-[#e23c17] text-white border-0 hover:opacity-90"
                        />

                    </div>
                </div>

                {/* Basic Information */}
                <Card title="Basic Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoField label="Username" value={studentData.username} />
                        <InfoField label="Full Name" value={studentData.name} />
                        <InfoField label="Email" value={studentData.email} />
                        <InfoField label="Phone" value={studentData.phone} />
                        <InfoField label="Student ID" value={studentData._id} />
                        <InfoField
                            label="Account Status"
                            value={studentData.isActive ? "Active" : "Inactive"}
                            className={studentData.isActive ? "text-green-600" : "text-red-600"}
                        />
                    </div>
                </Card>

                {/* Academic Information */}
                <Card title="Academic Information">
                    <div className="space-y-4">
                        <InfoField label="Selection Note" value={studentData.selectionNote} />

                        <div>
                            <h4 className="font-medium mb-2">Academic Records</h4>
                            {studentData.academicRecords?.map((record, index) => (
                                <div key={index} className="border rounded-lg p-4 mb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <InfoField label="Class" value={record.class} />
                                        <InfoField label="Stream" value={record.stream} />
                                        <InfoField label="School Name" value={record.schoolName} />
                                        <InfoField label="Marks/CGPA" value={record.marksOrCgpa} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">Extracurricular Activities</h4>
                            {studentData.extracurricularActivities?.map((activity, index) => (
                                <div key={index} className="border rounded-lg p-4 mb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <InfoField label="Activity Name" value={activity.activityName} />
                                        <InfoField label="Role" value={activity.role} />
                                        <InfoField label="Time Spent" value={activity.timespent} />
                                        <InfoField label="Achievements" value={activity.achievements} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Family Information */}
                <Card title="Family Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium mb-3">Father's Information</h4>
                            {studentData.father && (
                                <div className="space-y-2">
                                    <InfoField label="First Name" value={studentData.father.firstName} />
                                    <InfoField label="Middle Name" value={studentData.father.middleName} />
                                    <InfoField label="Last Name" value={studentData.father.lastName} />
                                    <InfoField label="CNIC" value={studentData.father.cnicNo} />
                                    <InfoField label="Email" value={studentData.father.email} />
                                    <InfoField label="Mobile" value={studentData.father.mobileNumber} />
                                    <InfoField label="Profession" value={studentData.father.profession} />
                                    <InfoField label="Company" value={studentData.father.companyName} />
                                    <InfoField label="Designation" value={studentData.father.designation} />
                                    <InfoField label="Jamaat Name" value={studentData.father.jamaatName} />
                                    <InfoField label="Membership No" value={studentData.father.jamaatMembershipNo} />
                                    <InfoField label="Address" value={studentData.father.residentialAddress} />
                                </div>
                            )}
                        </div>

                        <div>
                            <h4 className="font-medium mb-3">Mother's Information</h4>
                            {studentData.mother && (
                                <div className="space-y-2">
                                    <InfoField label="First Name" value={studentData.mother.firstName} />
                                    <InfoField label="Middle Name" value={studentData.mother.middleName} />
                                    <InfoField label="Last Name" value={studentData.mother.lastName} />
                                    <InfoField label="CNIC" value={studentData.mother.cnicNo} />
                                    <InfoField label="Email" value={studentData.mother.email} />
                                    <InfoField label="Mobile" value={studentData.mother.mobileNumber} />
                                    <InfoField label="Profession" value={studentData.mother.profession} />
                                    <InfoField label="Company" value={studentData.mother.companyName} />
                                    <InfoField label="Designation" value={studentData.mother.designation} />
                                    <InfoField label="Jamaat Name" value={studentData.mother.jamaatName} />
                                    <InfoField label="Membership No" value={studentData.mother.jamaatMembershipNo} />
                                    <InfoField label="Address" value={studentData.mother.residentialAddress} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6">
                        <h4 className="font-medium mb-3">Family Members</h4>
                        {studentData.familyMembers?.map((member, index) => (
                            <div key={index} className="border rounded-lg p-3 mb-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <InfoField label="Name" value={member.name} />
                                    <InfoField label="Relation" value={member.relation} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Financial Information */}
                <Card title="Financial Information">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InfoField
                            label="Number of Household Members"
                            value={studentData.numberOfHouseholdMembers}
                        />
                        <InfoField
                            label="Number of Earning Members"
                            value={studentData.financialInformation?.numberOfEarningMembers}
                        />
                        <InfoField
                            label="Total Monthly Income"
                            value={studentData.financialInformation?.totalMonthlyIncome}
                        />
                    </div>

                    <div className="mt-4">
                        <h4 className="font-medium mb-2">Earning Member Relations</h4>
                        <div className="flex flex-wrap gap-2">
                            {studentData.financialInformation?.earningMemberRelations?.map((relation, index) => (
                                <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                                    {relation}
                                </span>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Office Use Information */}
                <Card title="Office Use Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jamaat Name</label>
                            <input
                                type="text"
                                name="jamaatName"
                                placeholder="Enter Jamaat Name"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Membership Number</label>
                            <input
                                type="text"
                                name="membershipNumber"
                                placeholder="Enter Membership Number"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Belongs to Jamaat</label>
                            <input
                                type="text"
                                name="belongsToJamaat"
                                placeholder="Enter Belongs to Jamaat"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Support Provided</label>
                            <input
                                type="text"
                                name="supportProvided"
                                placeholder="Enter Support Provided"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Channel of Submission</label>
                            <input
                                type="text"
                                name="channelOfSubmission"
                                placeholder="Enter Channel of Submission"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Zakat Deserving</label>
                            <select
                                name="zakatDeserving"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                defaultValue=""
                            >
                                <option value="" disabled></option>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <h4 className="font-semibold mt-4 mb-1">Authorized Signature</h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="authorizedSignatureName"
                                    placeholder="Enter Name"
                                    // value={form.officeUseInfo.authorizedSignature.name}
                                    // onChange={(e) =>
                                    //     setField("officeUseInfo.authorizedSignature.name", e.target.value)
                                    // }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                                <input
                                    type="text"
                                    name="authorizedSignatureDesignation"
                                    placeholder="Enter Designation"
                                    // value={form.officeUseInfo.authorizedSignature.designation}
                                    // onChange={(e) =>
                                    //     setField("officeUseInfo.authorizedSignature.designation", e.target.value)
                                    // }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stamp (URL / Base64)</label>
                                <input
                                    type="text"
                                    name="authorizedSignatureStamp"
                                    // placeholder="Enter Stamp URL or Base64"
                                    // value={form.officeUseInfo.authorizedSignature.stamp}
                                    // onChange={(e) =>
                                    //     setField("officeUseInfo.authorizedSignature.stamp", e.target.value)
                                    // }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>



                    {/* MEMF Office Information */}
                    <div className="mt-6 border-t pt-6">
                        <h4 className="font-medium mb-4">MEMF Office Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoField label="Student Code" value={studentData.officeUseInfo?.memfOffice?.studentCode} />
                            <InfoField label="Assessment Date" value={studentData.officeUseInfo?.memfOffice?.assessmentDate} />
                            <InfoField label="Interview Date" value={studentData.officeUseInfo?.memfOffice?.interviewDate} />
                            <InfoField label="Decision" value={studentData.officeUseInfo?.memfOffice?.decision} />
                            <InfoField label="Category" value={studentData.officeUseInfo?.memfOffice?.category} />
                            <InfoField
                                label="Total Scholarship Amount"
                                value={studentData.officeUseInfo?.memfOffice?.scholarship?.totalAmount}
                            />
                        </div>

                        <div className="mt-4">
                            <InfoField
                                label="Panel Comments"
                                value={studentData.officeUseInfo?.memfOffice?.panelComments}
                            />
                        </div>
                    </div>
                </Card>

                {/* System Information */}
                <Card title="System Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoField label="Created At" value={new Date(studentData.createdAt).toLocaleString()} />
                        <InfoField label="Last Updated" value={new Date(studentData.updatedAt).toLocaleString()} />
                    </div>
                </Card>
            </div>
        </Card>
    );
};

// Reusable component for displaying information fields
const InfoField = ({ label, value, className = "" }) => {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    return (
        <div className={`mb-3 ${className}`}>
            <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                {value || "Not provided"}
            </div>
        </div>
    );
};

export default StudentView;