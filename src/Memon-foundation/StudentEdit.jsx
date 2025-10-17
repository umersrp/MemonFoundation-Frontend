import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Select from "react-select";
import Button from "@/components/ui/Button";

const StudentEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        // ... other fields ...

        // Office Use Information
        officeUseInfo: {
            jamaatName: "",
            membershipNumber: "",
            belongsToJamaat: "None",
            supportProvided: "No Support",
            zakatDeserving: false,
            authorizedSignature: {
                name: "",
                designation: "",
                stamp: ""
            },
            channelOfSubmission: "",
            memfOffice: {  // Ensure this exists in initial state
                studentCode: "",
                assessmentDate: "",
                interviewDate: "",
                decision: "Hold",
                category: "SEED",
                scholarship: {
                    grantedFor: [],
                    totalAmount: 0
                },
                panelComments: "",
                reviewPanelSignature: {
                    name: "",
                    designation: "",
                    stamp: ""
                }
            }
        }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const user = useSelector((state) => state.auth.user);

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
                    const studentData = response.data.data;

                    // Safe access for all nested objects
                    const financialInfo = studentData.financialInformation || {};
                    const officeUseInfo = studentData.officeUseInfo || {};

                    setFormData({
                        username: studentData.username || "",
                        name: studentData.name || "",
                        email: studentData.email || "",
                        phone: studentData.phone || "",
                        type: studentData.type || "student",
                        isActive: studentData.isActive || false,
                        image: studentData.image || "",
                        academicRecords: studentData.academicRecords || [],
                        extracurricularActivities: studentData.extracurricularActivities || [],
                        selectionNote: studentData.selectionNote || "",
                        familyMembers: studentData.familyMembers || [],
                        numberOfHouseholdMembers: studentData.numberOfHouseholdMembers || 0,
                        financialInformation: {
                            numberOfEarningMembers: financialInfo.numberOfEarningMembers || 0,
                            earningMemberRelations: financialInfo.earningMemberRelations || [],
                            totalMonthlyIncome: financialInfo.totalMonthlyIncome || 0
                        },
                        officeUseInfo: {
                            jamaatName: officeUseInfo.jamaatName || "",
                            membershipNumber: officeUseInfo.membershipNumber || "",
                            belongsToJamaat: officeUseInfo.belongsToJamaat || "None",
                            supportProvided: officeUseInfo.supportProvided || "No Support",
                            zakatDeserving: officeUseInfo.zakatDeserving || false,
                            authorizedSignature: officeUseInfo.authorizedSignature || {
                                name: "",
                                designation: "",
                                stamp: ""
                            },
                            channelOfSubmission: officeUseInfo.channelOfSubmission || "",
                            memfOffice: officeUseInfo.memfOffice || {
                                studentCode: "",
                                assessmentDate: "",
                                interviewDate: "",
                                decision: "Hold",
                                category: "SEED",
                                scholarship: {
                                    grantedFor: [],
                                    totalAmount: 0
                                },
                                panelComments: "",
                                reviewPanelSignature: {
                                    name: "",
                                    designation: "",
                                    stamp: ""
                                }
                            }
                        }
                    });
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

    const handleInputChange = (path, value) => {
        if (!path.includes(".")) {
            setFormData(prev => ({ ...prev, [path]: value }));
            return;
        }

        const parts = path.split(".");
        setFormData(prev => {
            const copy = JSON.parse(JSON.stringify(prev));
            let cur = copy;
            for (let i = 0; i < parts.length - 1; i++) {
                cur = cur[parts[i]];
            }
            cur[parts[parts.length - 1]] = value;
            return copy;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const submitData = {
                username: formData.username,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                isActive: formData.isActive,
                image: formData.image,
                selectionNote: formData.selectionNote,
                numberOfHouseholdMembers: formData.numberOfHouseholdMembers,
                financialInformation: formData.financialInformation,
                officeUseInfo: formData.officeUseInfo
            };

            await axios.put(
                `${process.env.REACT_APP_BASE_URL}/user/student-update/${id}`,
                submitData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            toast.success("Student updated successfully");
            navigate("/Student");
        } catch (err) {
            toast.error("Failed to update student");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/Student");
    };

    if (loading) return <div className="flex justify-center items-center py-8">Loading...</div>;
    if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

    return (
        <Card title="Edit Student Information">
        <div className="max-w-full mx-auto p-6">
           
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Username</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.username}
                                onChange={(e) => handleInputChange("username", e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Phone</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Account Status */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => handleInputChange("isActive", e.target.checked)}
                            className="w-4 h-4"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium">
                            Active Account
                        </label>
                    </div>

                    {/* Selection Note */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Selection Note</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            value={formData.selectionNote}
                            onChange={(e) => handleInputChange("selectionNote", e.target.value)}
                            placeholder="Additional notes or comments..."
                        />
                    </div>

                    {/* Household Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Number of Household Members</label>
                            <input
                                type="number"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.numberOfHouseholdMembers}
                                onChange={(e) => handleInputChange("numberOfHouseholdMembers", parseInt(e.target.value) || 0)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Total Monthly Income</label>
                            <input
                                type="number"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.financialInformation?.totalMonthlyIncome || 0}
                                onChange={(e) => handleInputChange("financialInformation.totalMonthlyIncome", parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    {/* Office Use Information */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">Office Use Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Jamaat Name</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.officeUseInfo.jamaatName}
                                    onChange={(e) => handleInputChange("officeUseInfo.jamaatName", e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Membership Number</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.officeUseInfo.membershipNumber}
                                    onChange={(e) => handleInputChange("officeUseInfo.membershipNumber", e.target.value)}
                                />
                            </div>

                            {/* <div>
                                <label className="block text-sm font-medium mb-2">Student Code</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.officeUseInfo.memfOffice.studentCode}
                                    onChange={(e) => handleInputChange("officeUseInfo.memfOffice.studentCode", e.target.value)}
                                />
                            </div> */}

                            <div>
                                <label className="block text-sm font-medium mb-2">Total Scholarship Amount</label>
                                <input
                                    type="number"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.officeUseInfo.memfOffice?.scholarship?.totalAmount || 0}
                                    onChange={(e) => handleInputChange("officeUseInfo.memfOffice.scholarship.totalAmount", parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        {/* Panel Comments */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">Panel Comments</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                value={formData.officeUseInfo.memfOffice.panelComments}
                                onChange={(e) => handleInputChange("officeUseInfo.memfOffice.panelComments", e.target.value)}
                                placeholder="Panel comments and recommendations..."
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <Button
                            type="submit"
                            text={loading ? "Updating..." : "Update Student"}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            isLoading={loading}
                            disabled={loading}
                        />
                    </div>
                </form>
        </div>
    </Card>
    );
};

export default StudentEdit;