import React, { useState, useMemo, useEffect } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Dropdown from "@/components/ui/Dropdown";
import Button from "@/components/ui/Button";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/images/logo/SrpLogo.png";
import Tippy from '@tippyjs/react';
import {
    useTable,
    useRowSelect,
    useSortBy,
    useGlobalFilter,
    usePagination,
} from "react-table";
import { Menu } from "@headlessui/react";
import { useSelector } from "react-redux";
import Icons from "@/components/ui/Icon";
import Header from "@/components/partials/header";
import GlobalFilter from "@/pages/table/react-tables/GlobalFilter";
import Select from "@/components/ui/Select";

const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
        const defaultRef = React.useRef();
        const resolvedRef = ref || defaultRef;

        React.useEffect(() => {
            resolvedRef.current.indeterminate = indeterminate;
        }, [resolvedRef, indeterminate]);

        return (
            <>
                <input
                    type="checkbox"
                    ref={resolvedRef}
                    {...rest}
                    className="table-checkbox"
                />
            </>
        );
    }
);

// Office Info Modal Component
// Office Info Modal Component
const OfficeInfoModal = ({ isOpen, onClose, studentId, studentData }) => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
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
        channelOfSubmission: "Other", // Set default value
        memfOffice: {
            studentCode: "",
            assessmentDate: "",
            interviewDate: "",
            decision: "Hold", // Set default value
            category: "SEED", // Set default value
            scholarship: {
                grantedFor: [],
                totalAmount: 0,
            },
            panelComments: "",
            reviewPanelSignature: {
                name: "",
                designation: "",
                stamp: "",
            },
        },
    });

    // Load existing data if available
    useEffect(() => {
        if (studentData?.officeUseInfo) {
            const officeData = studentData.officeUseInfo;
            setForm({
                jamaatName: officeData.jamaatName || "",
                membershipNumber: officeData.membershipNumber || "",
                belongsToJamaat: officeData.belongsToJamaat || "None",
                supportProvided: officeData.supportProvided || "No Support",
                zakatDeserving: officeData.zakatDeserving || false,
                authorizedSignature: {
                    name: officeData.authorizedSignature?.name || "",
                    designation: officeData.authorizedSignature?.designation || "",
                    stamp: officeData.authorizedSignature?.stamp || "",
                },
                // Use existing value or default to "Other"
                channelOfSubmission: officeData.channelOfSubmission || "Other",
                memfOffice: {
                    studentCode: officeData.memfOffice?.studentCode || "",
                    assessmentDate: officeData.memfOffice?.assessmentDate ?
                        new Date(officeData.memfOffice.assessmentDate).toISOString().split('T')[0] : "",
                    interviewDate: officeData.memfOffice?.interviewDate ?
                        new Date(officeData.memfOffice.interviewDate).toISOString().split('T')[0] : "",
                    // Use existing value or default to "Hold"
                    decision: officeData.memfOffice?.decision || "Hold",
                    // Use existing value or default to "SEED"
                    category: officeData.memfOffice?.category || "SEED",
                    scholarship: {
                        grantedFor: officeData.memfOffice?.scholarship?.grantedFor || [],
                        totalAmount: officeData.memfOffice?.scholarship?.totalAmount || 0,
                    },
                    panelComments: officeData.memfOffice?.panelComments || "",
                    reviewPanelSignature: {
                        name: officeData.memfOffice?.reviewPanelSignature?.name || "",
                        designation: officeData.memfOffice?.reviewPanelSignature?.designation || "",
                        stamp: officeData.memfOffice?.reviewPanelSignature?.stamp || "",
                    },
                },
            });
        } else {
            // Reset to default values with proper enum defaults
            setForm({
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
                channelOfSubmission: "Other", // Default value
                memfOffice: {
                    studentCode: "",
                    assessmentDate: "",
                    interviewDate: "",
                    decision: "Hold", // Default value
                    category: "SEED", // Default value
                    scholarship: {
                        grantedFor: [],
                        totalAmount: 0,
                    },
                    panelComments: "",
                    reviewPanelSignature: {
                        name: "",
                        designation: "",
                        stamp: "",
                    },
                },
            });
        }
    }, [studentData, isOpen]);

    const setField = (path, value) => {
        if (!path.includes(".")) {
            setForm(prev => ({ ...prev, [path]: value }));
            return;
        }
        const parts = path.split(".");
        setForm(prev => {
            const copy = JSON.parse(JSON.stringify(prev));
            let cur = copy;
            for (let i = 0; i < parts.length - 1; i++) {
                cur = cur[parts[i]];
            }
            cur[parts[parts.length - 1]] = value;
            return copy;
        });
    };

    // Handle grantedFor array (convert comma-separated string to array)
    const handleGrantedForChange = (value) => {
        const grantedForArray = value.split(',').map(item => item.trim()).filter(item => item);
        setField("memfOffice.scholarship.grantedFor", grantedForArray);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Prepare data for API - ensure proper formatting with default values
            const submitData = {
                officeUseInfo: {
                    ...form,
                    // Ensure enum fields have proper values
                    channelOfSubmission: form.channelOfSubmission || "Other",
                    memfOffice: {
                        ...form.memfOffice,
                        // Ensure enum fields have proper values
                        decision: form.memfOffice.decision || "Hold",
                        category: form.memfOffice.category || "SEED",
                        assessmentDate: form.memfOffice.assessmentDate || null,
                        interviewDate: form.memfOffice.interviewDate || null,
                        scholarship: {
                            grantedFor: Array.isArray(form.memfOffice.scholarship.grantedFor)
                                ? form.memfOffice.scholarship.grantedFor
                                : [],
                            totalAmount: Number(form.memfOffice.scholarship.totalAmount) || 0,
                        }
                    }
                }
            };

            console.log('Submitting data:', JSON.stringify(submitData, null, 2));

            const response = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/installment-plans/${studentId}/office-info`,
                submitData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            toast.success("Office information updated successfully");
            onClose();
        } catch (error) {
            console.error("Failed to update office info:", error);
            console.error("Error details:", error.response?.data);
            toast.error(error?.response?.data?.message || "Failed to update office information");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-900/20 backdrop-blur-sm p-4">
            <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <Icon icon="heroicons:x-mark" className="w-6 h-6" />
                    </button>
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[70vh] overflow-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-xl font-bold">
                        Office Information - {studentData?.name || 'Student'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-red-500 hover:text-red-700"
                    >
                        <Icon icon="heroicons:x-mark" className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <Card title="SECTION C: (For Office Use)" className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            {/* Jamaat & Membership */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Jamaat Name</label>
                                <input
                                    placeholder="Jamaat Name"
                                    value={form.jamaatName}
                                    onChange={(e) => setField("jamaatName", e.target.value)}
                                    className="w-full border rounded p-2 border-gray-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Membership Number</label>
                                <input
                                    placeholder="Membership Number"
                                    value={form.membershipNumber}
                                    onChange={(e) => setField("membershipNumber", e.target.value)}
                                    className="w-full border rounded p-2 border-gray-200"
                                />
                            </div>

                            {/* Belongs To Jamaat */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Belongs To Jamaat</label>
                                <Select
                                    options={[
                                        { value: "None", label: "None" },
                                        { value: "Mother", label: "Mother" },
                                        { value: "Father", label: "Father" },
                                        { value: "Both", label: "Both" },
                                    ]}
                                    value={{
                                        value: form.belongsToJamaat,
                                        label: form.belongsToJamaat
                                    }}
                                    onChange={(selected) =>
                                        setField("belongsToJamaat", selected?.value || "None")
                                    }
                                    placeholder="Select"
                                />
                            </div>

                            {/* Support Provided */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Support Provided</label>
                                <Select
                                    options={[
                                        { value: "No Support", label: "No Support" },
                                        { value: "Course and Uniform", label: "Course and Uniform" },
                                    ]}
                                    value={{
                                        value: form.supportProvided,
                                        label: form.supportProvided
                                    }}
                                    onChange={(selected) =>
                                        setField("supportProvided", selected?.value || "No Support")
                                    }
                                    placeholder="Select"
                                />
                            </div>

                            {/* Zakat Deserving */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.zakatDeserving}
                                    onChange={(e) =>
                                        setField("zakatDeserving", e.target.checked)
                                    }
                                    className="h-5 w-5"
                                />
                                <label className="text-sm font-medium">Zakat Deserving</label>
                            </div>

                            {/* Channel of Submission */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Channel of Submission
                                </label>
                                <Select
                                    options={[
                                        {
                                            value: "All Pakistan Memon Federation",
                                            label: "All Pakistan Memon Federation",
                                        },
                                        { value: "World Memon Organization", label: "World Memon Organization" },
                                        {
                                            value: "The Pakistan Memon Educational & Welfare Society (Sir Adamjee Institute)",
                                            label: "The Pakistan Memon Educational & Welfare Society (Sir Adamjee Institute)",
                                        },
                                        { value: "Other", label: "Other" },
                                    ]}
                                    value={
                                        form.channelOfSubmission
                                            ? {
                                                value: form.channelOfSubmission,
                                                label: form.channelOfSubmission,
                                            }
                                            : { value: "Other", label: "Other" } // Default value
                                    }
                                    onChange={(selected) =>
                                        setField("channelOfSubmission", selected?.value || "Other")
                                    }
                                    placeholder="Select Channel"
                                />
                            </div>

                            {/* Authorized Signature */}
                            <div className="md:col-span-2">
                                <h4 className="font-semibold mt-4 mb-1">Authorized Signature</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name</label>
                                        <input
                                            placeholder="Name"
                                            value={form.authorizedSignature.name}
                                            onChange={(e) =>
                                                setField("authorizedSignature.name", e.target.value)
                                            }
                                            className="border rounded p-2 border-gray-200 w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Designation</label>
                                        <input
                                            placeholder="Designation"
                                            value={form.authorizedSignature.designation}
                                            onChange={(e) =>
                                                setField(
                                                    "authorizedSignature.designation",
                                                    e.target.value
                                                )
                                            }
                                            className="border rounded p-2 border-gray-200 w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Stamp</label>
                                        <input
                                            placeholder="Stamp (URL / Base64)"
                                            value={form.authorizedSignature.stamp}
                                            onChange={(e) =>
                                                setField("authorizedSignature.stamp", e.target.value)
                                            }
                                            className="border rounded p-2 border-gray-200 w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* MEMF Office Info */}
                            <div className="md:col-span-2 mt-4 border-t pt-3">
                                <h4 className="font-semibold mb-2">MEMF Office Info</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Student Code</label>
                                        <input
                                            placeholder="Student Code"
                                            value={form.memfOffice.studentCode}
                                            onChange={(e) =>
                                                setField("memfOffice.studentCode", e.target.value)
                                            }
                                            className="border rounded p-2 border-gray-200 w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Assessment Date</label>
                                        <input
                                            type="date"
                                            placeholder="Assessment Date"
                                            value={form.memfOffice.assessmentDate}
                                            onChange={(e) =>
                                                setField("memfOffice.assessmentDate", e.target.value)
                                            }
                                            className="border rounded p-2 border-gray-200 w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Interview Date</label>
                                        <input
                                            type="date"
                                            placeholder="Interview Date"
                                            value={form.memfOffice.interviewDate}
                                            onChange={(e) =>
                                                setField("memfOffice.interviewDate", e.target.value)
                                            }
                                            className="border rounded p-2 border-gray-200 w-full"
                                        />
                                    </div>

                                    {/* Decision */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Decision</label>
                                        <Select
                                            options={[
                                                { value: "Approve", label: "Approve" },
                                                { value: "Hold", label: "Hold" },
                                                { value: "Regret", label: "Regret" },
                                            ]}
                                            value={
                                                form.memfOffice.decision
                                                    ? {
                                                        value: form.memfOffice.decision,
                                                        label: form.memfOffice.decision,
                                                    }
                                                    : { value: "Hold", label: "Hold" } // Default value
                                            }
                                            onChange={(selected) =>
                                                setField("memfOffice.decision", selected?.value || "Hold")
                                            }
                                            placeholder="Select Decision"
                                        />
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Category</label>
                                        <Select
                                            options={[
                                                { value: "STAR", label: "STAR" },
                                                { value: "HOPE", label: "HOPE" },
                                                { value: "SEED", label: "SEED" },
                                            ]}
                                            value={
                                                form.memfOffice.category
                                                    ? {
                                                        value: form.memfOffice.category,
                                                        label: form.memfOffice.category,
                                                    }
                                                    : { value: "SEED", label: "SEED" } // Default value
                                            }
                                            onChange={(selected) =>
                                                setField("memfOffice.category", selected?.value || "SEED")
                                            }
                                            placeholder="Select Category"
                                        />
                                    </div>

                                    {/* Scholarship Fields */}
                                    <div className="md:col-span-2 mt-2">
                                        <h4 className="font-semibold mb-1">Scholarship</h4>
                                        <div className="space-y-2">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Granted For (comma-separated)
                                                </label>
                                                <input
                                                    placeholder="Monthly Fee, Books, Uniform, etc."
                                                    value={Array.isArray(form.memfOffice.scholarship.grantedFor)
                                                        ? form.memfOffice.scholarship.grantedFor.join(', ')
                                                        : ''}
                                                    onChange={(e) => handleGrantedForChange(e.target.value)}
                                                    className="border rounded p-2 border-gray-200 w-full"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Separate multiple items with commas
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Total Amount</label>
                                                <input
                                                    type="number"
                                                    placeholder="Total Amount"
                                                    value={form.memfOffice.scholarship.totalAmount}
                                                    onChange={(e) =>
                                                        setField(
                                                            "memfOffice.scholarship.totalAmount",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="border rounded p-2 border-gray-200 w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Panel Comments */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1">Panel Comments</label>
                                        <textarea
                                            placeholder="Panel Comments"
                                            value={form.memfOffice.panelComments}
                                            onChange={(e) =>
                                                setField("memfOffice.panelComments", e.target.value)
                                            }
                                            className="border rounded p-2 border-gray-200 w-full"
                                            rows="3"
                                        />
                                    </div>

                                    {/* Review Panel Signature */}
                                    <div className="md:col-span-2 mt-2">
                                        <h4 className="font-semibold mb-1">Review Panel Signature</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Name</label>
                                                <input
                                                    placeholder="Name"
                                                    value={form.memfOffice.reviewPanelSignature.name}
                                                    onChange={(e) =>
                                                        setField(
                                                            "memfOffice.reviewPanelSignature.name",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="border rounded p-2 border-gray-200 w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Designation</label>
                                                <input
                                                    placeholder="Designation"
                                                    value={form.memfOffice.reviewPanelSignature.designation}
                                                    onChange={(e) =>
                                                        setField(
                                                            "memfOffice.reviewPanelSignature.designation",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="border rounded p-2 border-gray-200 w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Stamp</label>
                                                <input
                                                    placeholder="Stamp (URL / Base64)"
                                                    value={form.memfOffice.reviewPanelSignature.stamp}
                                                    onChange={(e) =>
                                                        setField(
                                                            "memfOffice.reviewPanelSignature.stamp",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="border rounded p-2 border-gray-200 w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <Button
                            type="submit"
                            text={loading ? "Saving..." : "Save Office Information"}
                            className="btn-dark"
                            isLoading={loading}
                            disabled={loading}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

const StudentTable = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const user = useSelector((state) => state.auth.user);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/user/getStudentByAdmin`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                params: {
                    page: pageIndex + 1,
                    limit: pageSize,
                },
            });

            await new Promise(resolve => setTimeout(resolve, 600));

            setUserData(response.data.data.students);
            setPageCount(response.data.meta?.totalPages || 1);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pageIndex, pageSize]);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL}/user/admin-remove/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            toast.success("Sector deleted successfully");
            fetchData(pageIndex, pageSize);
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete Sector");
        }
    };

    const handleToggleStatus = async (studentId, currentStatus) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/user/update-student-status/${studentId}`,
                { isActive: !currentStatus },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            toast.success(response?.data?.message || "Status updated");
            fetchData();
        } catch (error) {
            console.error("Status toggle failed:", error);
            toast.error(error?.response?.data?.message || "Failed to update status");
        }
    };

    const handleOpenOfficeModal = (student) => {
        setSelectedStudent(student);
        setModalOpen(true);
    };

    const handleCloseOfficeModal = () => {
        setModalOpen(false);
        setSelectedStudent(null);
        fetchData(); // Refresh data to show any updates
    };

    const COLUMNS = [
        {
            Header: "Sr no",
            accessor: "id",
            Cell: ({ row, flatRows }) => {
                return <span>{flatRows.indexOf(row) + 1}</span>;
            },
        },
        {
            Header: "username",
            accessor: "username",
            Cell: (row) => <span>{row?.cell?.value}</span>,
        },
        {
            Header: "Name",
            accessor: "name",
            Cell: (row) => <span>{row?.cell?.value}</span>,
        },
        {
            Header: "phone",
            accessor: "phone"
        },
        {
            Header: "Active",
            accessor: "isActive",
            Cell: ({ value }) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                >
                    {value ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            Header: "createdAt",
            accessor: "createdAt",
            Cell: (row) => <span>{new Date(row?.cell?.value).toLocaleDateString()}</span>,
        },
        {
            Header: "updatedBy",
            accessor: "updatedAt",
            Cell: (row) => <span>{new Date(row?.cell?.value).toLocaleDateString()}</span>,
        },
        {
            Header: "Action",
            accessor: "_id",
            Cell: ({ cell, row }) => {
                const studentId = cell.value;
                const isActive = row.original.isActive;
                const studentData = row.original;

                // Check if office use scholarship is filled
                const hasOfficeInfo = studentData?.officeUseInfo?.memfOffice?.scholarship?.grantedFor?.length > 0 ||
                    studentData?.officeUseInfo?.memfOffice?.scholarship?.totalAmount > 0;

                return (
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        {/* 👁️ View */}
                        <Tippy content="View">
                            <button
                                className="action-btn"
                                onClick={() => navigate(`/StudentView/${studentId}`)}
                            >
                                <Icon className="text-green-600" icon="heroicons:eye" />
                            </button>
                        </Tippy>

                        {/* ✏️ Edit */}
                        <Tippy content="Edit">
                            <button
                                className="action-btn"
                                onClick={() => navigate(`/Student/${studentId}`)}
                            >
                                <Icon className="text-blue-600" icon="heroicons:pencil-square" />
                            </button>
                        </Tippy>

                        {/* 🏢 Office Info - Only show if scholarship is NOT filled */}
                        {!hasOfficeInfo && (
                            <Tippy content="Office Information">
                                <button
                                    className="action-btn"
                                    onClick={() => handleOpenOfficeModal(studentData)}
                                >
                                    <Icon className="text-purple-600" icon="heroicons:building-office" />
                                </button>
                            </Tippy>
                        )}

                        {/* 🗑️ Delete */}
                        <Tippy content="Delete">
                            <button className="action-btn" onClick={() => handleDelete(studentId)}>
                                <Icon className="text-red-700" icon="heroicons:trash" />
                            </button>
                        </Tippy>

                        {/* 🔁 Toggle Status */}
                        <Tippy content="Toggle Status">
                            <label className="inline-flex items-center cursor-pointer ml-2">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={() => handleToggleStatus(studentId, isActive)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:bg-green-500 relative transition-all">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-full" />
                                </div>
                            </label>
                        </Tippy>
                    </div>
                );
            },
        }
    ];

    const columns = useMemo(() => COLUMNS, []);
    const data = useMemo(() => userData, [userData]);

    const tableInstance = useTable(
        {
            columns,
            data,
            manualPagination: true,
            pageCount,
            initialState: { pageIndex: 0, pageSize: 10 },
        },
        useGlobalFilter,
        useSortBy,
        usePagination,
        useRowSelect,
        (hooks) => {
            hooks.visibleColumns.push((columns) => [
                {
                    id: "selection",
                    Header: ({ getToggleAllRowsSelectedProps }) => (
                        <div>
                            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                        </div>
                    ),
                    Cell: ({ row }) => (
                        <div>
                            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                        </div>
                    ),
                },
                ...columns,
            ]);
        }
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        nextPage,
        previousPage,
        canNextPage,
        canPreviousPage,
        pageOptions,
        state,
        gotoPage,
        pageCount: controlledPageCount,
        setGlobalFilter,
        prepareRow,
    } = tableInstance;

    const { globalFilter, pageIndex: currentPageIndex } = state;
    const handlePageChange = (pageIndex) => {
        gotoPage(pageIndex);
        setPageIndex(pageIndex);
    };

    const handlePageSizeChange = (pageSize) => {
        setPageSize(pageSize);
    };

    return (
        <>
            <Card noborder>
                <div className="md:flex pb-6 items-center">
                    <h6 className="flex-1 md:mb-0 mb-3">Student</h6>
                    <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">

                        <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
                        <Button
                            icon="heroicons-outline:plus-sm"
                            text="Add student"
                            className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
                            iconClass="text-lg"
                            onClick={() => {
                                navigate("/Student-Registration");
                            }}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto -mx-6">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden">
                            {loading ? (
                                <div className="flex justify-center items-center py-8">
                                    <img src={Logo} alt="Loading..." className="w-52 h-24" />
                                </div>) : (
                                <table
                                    className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700"
                                    {...getTableProps()}
                                >
                                    <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] dark:bg-slate-700">
                                        {headerGroups.map((headerGroup, index) => (
                                            <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                                                {headerGroup.headers.map((column) => (
                                                    <th
                                                        {...column.getHeaderProps(column.getSortByToggleProps())}
                                                        scope="col"
                                                        className="table-th text-white"
                                                        key={column.id}
                                                    >
                                                        {column.render("Header")}
                                                        <span>{column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}</span>
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody {...getTableBodyProps()}>
                                        {page.length === 0 ? (
                                            <tr>
                                                <td colSpan={columns.length + 1} className="text-center py-4">
                                                    No data available.
                                                </td>
                                            </tr>
                                        ) : (
                                            page.map((row) => {
                                                prepareRow(row);
                                                return (
                                                    <tr {...row.getRowProps()} className="even:bg-gray-50 dark:even:bg-slate-800">
                                                        {row.cells.map((cell) => (
                                                            <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap">
                                                                {cell.render("Cell")}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
                <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className="flex space-x-2 rtl:space-x-reverse items-center">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Go</span>
                            <span>
                                <input
                                    type="number"
                                    className="form-control py-2"
                                    defaultValue={currentPageIndex + 1}
                                    onChange={(e) => {
                                        const pageNumber = e.target.value ? Number(e.target.value) - 1 : 0;
                                        handlePageChange(pageNumber);
                                    }}
                                    style={{ width: "50px" }}
                                />
                            </span>
                        </span>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Page <span>{currentPageIndex + 1} of {pageOptions.length}</span>
                        </span>
                    </div>
                    <ul className="flex items-center  space-x-3  rtl:space-x-reverse">
                        <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
                            <button
                                className={` ${!canPreviousPage ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                onClick={() => gotoPage(0)}
                                disabled={!canPreviousPage}
                            >
                                <Icons icon="heroicons:chevron-double-left-solid" />
                            </button>
                        </li>
                        <li className="text-sm leading-4 text-slate-900 dark:text-white rtl:rotate-180">
                            <button
                                className={` ${!canPreviousPage ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                onClick={() => previousPage()}
                                disabled={!canPreviousPage}
                            >
                                Prev
                            </button>
                        </li>
                        {pageOptions.map((page, pageIdx) => (
                            <li key={pageIdx}>
                                <button
                                    href="#"
                                    aria-current="page"
                                    className={` ${pageIdx === pageIndex
                                        ? "bg-slate-900 dark:bg-slate-600  dark:text-slate-200 text-white font-medium "
                                        : "bg-slate-100 dark:bg-slate-700 dark:text-slate-400 text-slate-900  font-normal  "
                                        }    text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150`}
                                    onClick={() => gotoPage(pageIdx)}
                                >
                                    {page + 1}
                                </button>
                            </li>
                        ))}
                        <li className="text-sm leading-4 text-slate-900 dark:text-white rtl:rotate-180">
                            <button
                                className={` ${!canNextPage ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                onClick={() => nextPage()}
                                disabled={!canNextPage}
                            >
                                Next
                            </button>
                        </li>
                        <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
                            <button
                                onClick={() => gotoPage(pageCount - 1)}
                                disabled={!canNextPage}
                                className={` ${!canNextPage ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                            >
                                <Icon icon="heroicons:chevron-double-right-solid" />
                            </button>
                        </li>
                    </ul>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Show</span>
                        <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="form-select py-2"
                        >
                            {[10, 20, 30, 40, 50].map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Office Info Modal */}
            <OfficeInfoModal
                isOpen={modalOpen}
                onClose={handleCloseOfficeModal}
                studentId={selectedStudent?._id}
                studentData={selectedStudent}
            />
        </>
    );
};

export default StudentTable;