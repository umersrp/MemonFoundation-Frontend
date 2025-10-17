import React, { useState, useMemo, useEffect } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Dropdown from "@/components/ui/Dropdown";
import Button from "@/components/ui/Button";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/images/logo/SrpLogo.png"
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

// Installment Details Modal
const InstallmentDetailsModal = ({ isOpen, onClose, installmentData, onStatusUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("");

    if (!isOpen || !installmentData) return null;

    const handleStatusUpdate = async (month, newStatus) => {
        if (!installmentData.studentId) {
            toast.error("Student ID not found");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/installment-plans/${installmentData.studentId}/installment-status`,
                {
                    month: month,
                    status: newStatus
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            toast.success(`Status updated to ${newStatus} for ${month}`);
            
            // Refresh the data
            if (onStatusUpdate) {
                onStatusUpdate();
            }
            
            // Close the modal or keep it open for further updates
            // onClose(); // Uncomment if you want to close after update
            
        } catch (error) {
            console.error("Failed to update installment status:", error);
            toast.error(error?.response?.data?.message || "Failed to update installment status");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800 border-green-200';
          
            case 'unpaid':
                return 'bg-red-100 text-red-800 border-red-200';
           
        }
    };

    const getStatusOptions = (currentStatus) => {
        const allStatuses = ['paid', 'unpaid',];
        return allStatuses.filter(status => status !== currentStatus);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-900/20 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[70vh] overflow-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-xl font-bold">
                        Installment Details - {installmentData.fullName || installmentData.name}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        disabled={loading}
                    >
                        <Icon icon="heroicons:x-mark" className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    <Card title="Scholarship Information" className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Student Name</label>
                                <p className="text-gray-900 font-semibold">
                                    {installmentData.fullName || installmentData.name}
                                </p>
                                {installmentData.email && (
                                    <p className="text-gray-600 text-sm">{installmentData.email}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Total Amount</label>
                                <p className="text-gray-900 font-semibold">
                                    PKR {installmentData.totalAmount?.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Student ID</label>
                                <p className="text-gray-900 font-mono text-sm">
                                    {installmentData.studentId}
                                </p>
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium mb-1">Granted For</label>
                                <div className="flex flex-wrap gap-2">
                                    {installmentData.grantedFor?.map((item, index) => (
                                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Monthly Installments">
                        <div className="p-4">
                            <div className="mb-4 flex justify-between items-center">
                                <h4 className="text-lg font-semibold">Installment Status Management</h4>
                                <div className="text-sm text-gray-600">
                                    Total: {installmentData.monthlyInstallments?.length || 0} months
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {installmentData.monthlyInstallments?.map((installment, index) => (
                                    <div key={index} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-medium text-gray-900">{installment.month}</span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(installment.status)}`}>
                                                {installment.status || 'unpaid'}
                                            </span>
                                        </div>
                                        
                                        <p className="text-lg font-bold text-gray-900 mb-3">
                                            PKR {installment.amount?.toLocaleString()}
                                        </p>

                                        {/* Status Update Dropdown */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-700">
                                                Update Status:
                                            </label>
                                            <div className="flex flex-wrap gap-1">
                                                {getStatusOptions(installment.status).map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusUpdate(installment.month, status)}
                                                        disabled={loading}
                                                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                                            status === 'paid' 
                                                                ? 'bg-green-500 hover:bg-green-600 text-white' 
                                                                : status === 'pending'
                                                                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                                                : 'bg-red-500 hover:bg-red-600 text-white'
                                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary Statistics */}
                            {installmentData.monthlyInstallments && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h5 className="font-semibold mb-3">Payment Summary</h5>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {installmentData.monthlyInstallments.filter(i => i.status === 'paid').length}
                                            </div>
                                            <div className="text-gray-600">Paid</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-yellow-600">
                                                {installmentData.monthlyInstallments.filter(i => i.status === 'pending').length}
                                            </div>
                                            <div className="text-gray-600">Pending</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">
                                                {installmentData.monthlyInstallments.filter(i => i.status === 'overdue').length}
                                            </div>
                                            <div className="text-gray-600">Overdue</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {installmentData.monthlyInstallments.length}
                                            </div>
                                            <div className="text-gray-600">Total</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
                <div className="flex justify-between items-center p-6 border-t bg-gray-50">
                    <div className="text-sm text-gray-600">
                        {loading && (
                            <div className="flex items-center gap-2">
                                <Icon icon="heroicons:arrow-path" className="w-4 h-4 animate-spin" />
                                Updating status...
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => onStatusUpdate && onStatusUpdate()}
                            disabled={loading}
                            className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
                        >
                            Refresh Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Installment Status Modal
const InstallmentStatusModal = ({ isOpen, onClose, studentId, onStatusUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [status, setStatus] = useState("paid");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMonth) {
            toast.error("Please select a month");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/installment-plans/${studentId}/installment-status`,
                {
                    month: selectedMonth,
                    status: status
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            toast.success("Installment status updated successfully");
            onStatusUpdate();
            onClose();
        } catch (error) {
            console.error("Failed to update installment status:", error);
            toast.error(error?.response?.data?.message || "Failed to update installment status");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const months = Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-xl font-bold">Update Installment Status</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <Icon icon="heroicons:x-mark" className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Select Month</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full border rounded p-2 border-gray-300"
                                required
                            >
                                <option value="">Select Month</option>
                                {months.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full border rounded p-2 border-gray-300"
                                required
                            >
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>
                    </div>

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
                            text={loading ? "Updating..." : "Update Status"}
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

const Installment = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [selectedInstallment, setSelectedInstallment] = useState(null);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const user = useSelector((state) => state.auth.user);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/installment-plans`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                params: {
                    page: pageIndex + 1,
                    limit: pageSize,
                },
            });

            await new Promise(resolve => setTimeout(resolve, 600));
            setUserData(response.data.data);
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

    const handleViewInstallment = async (studentId) => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/installment-plans/${studentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setSelectedInstallment(response.data);
            setDetailsModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch installment details:", error);
            toast.error("Failed to load installment details");
        }
    };

    const handleOpenStatusModal = (studentId) => {
        setSelectedStudentId(studentId);
        setStatusModalOpen(true);
    };

    const handleStatusUpdate = () => {
        fetchData(); // Refresh data after status update
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
            Header: "Student Name",
            accessor: "name",
            Cell: (row) => <span>{row?.cell?.value || "N/A"}</span>,
        },
        {
            Header: "Student email",
            accessor: "email",
            Cell: (row) => <span>{row?.cell?.value || "N/A"}</span>,
        },
        {
            Header: "Total Amount",
            accessor: "totalAmount",
            Cell: (row) => <span>PKR {row?.cell?.value?.toLocaleString() || "0"}</span>,
        },
        {
            Header: "Granted For",
            accessor: "grantedFor",
            Cell: ({ value }) => (
                <div className="flex flex-wrap gap-1">
                    {value?.map((item, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {item}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            Header: "Installments",
            accessor: "monthlyInstallments",
            Cell: ({ value }) => (
                <div>
                    <span className="text-sm text-gray-600">
                        {value?.length || 0} months
                    </span>
                </div>
            ),
        },
        {
            Header: "Paid Installments",
            accessor: "paymentStatus", // This is just a placeholder, actual value is calculated in Cell
            Cell: ({ row }) => {
              const installments = row.original.monthlyInstallments || [];
              const paidCount = installments.filter(i => i.status === 'paid').length;
              const totalCount = installments.length;
          
              return (
                <div className="text-center">
                  <span className="text-sm font-medium">
                    {paidCount}/{totalCount}
                  </span>
                  {paidCount === totalCount && totalCount > 0 && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Completed
                    </span>
                  )}
                </div>
              );
            }
          },
          {
            Header: "Remaining Amount",
            accessor: "remainingAmount", // Placeholder, calculated below
            Cell: ({ row }) => {
              const installments = row.original.monthlyInstallments || [];
              const paidAmount = installments
                .filter(i => i.status === 'paid')
                .reduce((sum, i) => sum + (i.amount || 0), 0);
          
              const totalAmount = row.original.totalAmount || 0;
              const remainingAmount = totalAmount - paidAmount;
          
              return (
                <div className="text-sm font-medium text-gray-900">
                  PKR {remainingAmount.toLocaleString()}
                </div>
              );
            }
          },
          
        {
            Header: "Action",
            accessor: "studentId", // Use studentId instead of _id
            Cell: ({ cell, row }) => {
                const studentId = cell.value;
                const studentData = row.original;
        
                return (
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        {/* 👁️ View Installments */}
                        <Tippy content="View Installments">
                            <button
                                className="action-btn"
                                onClick={() => handleViewInstallment(studentId)}
                            >
                                <Icon className="text-green-600" icon="heroicons:eye" />
                            </button>
                        </Tippy>
        
                        {/* Other buttons... */}
                    </div>
                );
            },
        },
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
                    <h6 className="flex-1 md:mb-0 mb-3">Installment Plans</h6>
                    <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
                        <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />

                        {/* <Button
                            icon="heroicons-outline:plus-sm"
                            text="Generate Installments"
                            className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
                            iconClass="text-lg"
                            onClick={() => {
                                navigate("/generate-installments");
                            }}
                        /> */}
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
                                                    No installment plans available.
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

            {/* Installment Details Modal */}
            <InstallmentDetailsModal
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                installmentData={selectedInstallment}
            />

            {/* Installment Status Modal */}
            <InstallmentStatusModal
                isOpen={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                studentId={selectedStudentId}
                onStatusUpdate={handleStatusUpdate}
            />
        </>
    );
};

export default Installment;