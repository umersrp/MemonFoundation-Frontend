import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const StudentEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [uploadingData, setUploadingData] = useState(false);
    const [docUploading, setDocUploading] = useState(false);
    const [error, setError] = useState("");
    const user = useSelector((state) => state.auth.user);

    const [formData, setFormData] = useState({
        username: "",
        name: "",
        email: "",
        phone: "",
        image: "",
        isActive: false,
        selectionNote: "",
        numberOfHouseholdMembers: 0,
        financialInformation: {
            numberOfEarningMembers: 0,
            earningMemberRelations: [],
            totalMonthlyIncome: 0,
        },
    });

    // 🔹 Fetch existing student
    useEffect(() => {
        const fetchStudent = async () => {
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

                const student = response.data?.data;
                if (!student) {
                    toast.error("Student not found");
                    return;
                }

                setFormData({
                    username: student.username || "",
                    name: student.name || "",
                    email: student.email || "",
                    phone: student.phone || "",
                    isActive: student.isActive || false,
                    image: student.image || "",
                    selectionNote: student.selectionNote || "",
                    numberOfHouseholdMembers: student.numberOfHouseholdMembers || 0,
                    financialInformation: {
                        numberOfEarningMembers:
                            student.financialInformation?.numberOfEarningMembers || 0,
                        earningMemberRelations:
                            student.financialInformation?.earningMemberRelations || [],
                        totalMonthlyIncome:
                            student.financialInformation?.totalMonthlyIncome || 0,
                    },
                });
            } catch (err) {
                console.error("❌ Fetch Error:", err);
                setError("Failed to load student data");
            } finally {
                setLoading(false);
            }
        };

        fetchStudent();
    }, [id]);

    // 🔹 Handle input change
    const handleInputChange = (path, value) => {
        if (!path.includes(".")) {
            setFormData((prev) => ({ ...prev, [path]: value }));
            return;
        }

        const parts = path.split(".");
        setFormData((prev) => {
            const copy = { ...prev };
            let cur = copy;
            for (let i = 0; i < parts.length - 1; i++) {
                cur[parts[i]] = cur[parts[i]] || {};
                cur = cur[parts[i]];
            }
            cur[parts[parts.length - 1]] = value;
            return copy;
        });
    };

    // 🔹 Handle file upload
    // 🔹 Handle File Upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append("documentFile", file);

        try {
            setDocUploading(true);

            const res = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/upload/upload`,
                uploadData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            console.log("📸 Upload response:", res.data);

            // ✅ since your API returns the file URL in res.data.data
            const imageUrl = res.data?.data;

            if (!imageUrl) {
                toast.error("Upload failed — no file URL returned");
                return;
            }

            // ✅ save URL to formData.image
            setFormData((prev) => ({ ...prev, image: imageUrl }));
            toast.success("Image uploaded successfully");
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("File upload failed");
        } finally {
            setDocUploading(false);
        }
    };


    // 🔹 Handle Submit (PUT update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploadingData(true);

        try {
            // 🔸 Ensure image exists before updating
            if (!formData.image) {
                toast.warning("Please upload an image before submitting");
                setUploadingData(false);
                return;
            }

            // ✅ Prepare payload
            const payload = {
                username: formData.username,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                image: formData.image, // 👈 make sure uploaded image URL is here
                isActive: formData.isActive,
                selectionNote: formData.selectionNote,
                numberOfHouseholdMembers: formData.numberOfHouseholdMembers,
                financialInformation: formData.financialInformation,
            };

            console.log("🧾 Submitting payload:", payload);

            // ✅ Update API
            const res = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/user/student-update/${id}`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            console.log("✅ Update response:", res.data);

            if (res.data?.status === 200 || res.status === 200) {
                toast.success("Student updated successfully!");
                navigate("/Student");
            } else {
                toast.error(res.data?.message || "Unexpected response from server.");
            }
        } catch (err) {
            console.error("❌ Update Error:", err);
            toast.error(
                err.response?.data?.message || "Failed to update student information."
            );
        } finally {
            setUploadingData(false);
        }
    };


    const handleCancel = () => navigate("/Student");

    // 🔹 Loading/Error UI
    if (loading && !formData.username)
        return <div className="text-center py-8">Loading...</div>;
    if (error)
        return <div className="text-center text-red-600 py-4">{error}</div>;

    return (
        <Card title="Edit Student Information">
            <div className="p-6 max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Username</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => handleInputChange("username", e.target.value)}
                                className="w-full border rounded-md px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                className="w-full border rounded-md px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                className="w-full border rounded-md px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Phone</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                className="w-full border rounded-md px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Active Checkbox */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => handleInputChange("isActive", e.target.checked)}
                        />
                        <label htmlFor="isActive" className="text-sm">
                            Active Account
                        </label>
                    </div>

                    {/* Selection Note */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Selection Note
                        </label>
                        <textarea
                            rows="3"
                            value={formData.selectionNote}
                            onChange={(e) =>
                                handleInputChange("selectionNote", e.target.value)
                            }
                            className="w-full border rounded-md px-3 py-2"
                        />
                    </div>

                    {/* Household Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Number of Household Members
                            </label>
                            <input
                                type="number"
                                value={formData.numberOfHouseholdMembers}
                                onChange={(e) =>
                                    handleInputChange(
                                        "numberOfHouseholdMembers",
                                        parseInt(e.target.value) || 0
                                    )
                                }
                                className="w-full border rounded-md px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Total Monthly Income
                            </label>
                            <input
                                type="number"
                                value={formData.financialInformation.totalMonthlyIncome}
                                onChange={(e) =>
                                    handleInputChange(
                                        "financialInformation.totalMonthlyIncome",
                                        parseInt(e.target.value) || 0
                                    )
                                }
                                className="w-full border rounded-md px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Upload File */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Upload Student Image / Document
                        </label>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFileUpload}
                            className="w-full border rounded-md px-3 py-2"
                            disabled={docUploading}
                        />
                        {docUploading && (
                            <p className="text-blue-600 text-sm mt-1">Uploading...</p>
                        )}

                        {formData.image && (
                            <div className="mt-3">
                                <p className="text-green-600 text-sm">Uploaded File:</p>
                                <a
                                    href={formData.image}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline break-all"
                                >
                                    {formData.image}
                                </a>
                                {formData.image.match(/\.(jpg|jpeg|png|gif)$/i) && (
                                    <div className="mt-2">
                                        <img
                                            src={formData.image}
                                            alt="Student"
                                            className="w-32 h-32 rounded-md border object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 border-t pt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-5 py-2 border rounded-md"
                        >
                            Cancel
                        </button>
                        <Button
                            type="submit"
                            text={uploadingData ? "Updating..." : "Update Student"}
                            className="bg-blue-600 text-white px-5 py-2 rounded-md"
                            disabled={uploadingData}
                        />
                    </div>
                </form>
            </div>
        </Card>
    );
};

export default StudentEdit;
