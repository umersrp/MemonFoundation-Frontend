import React, { useState, useMemo, useEffect } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Dropdown from "@/components/ui/Dropdown";
import Button from "@/components/ui/Button";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import GlobalFilter from "../table/react-tables/GlobalFilter";
import { Menu } from "@headlessui/react";
import { useSelector } from "react-redux";
import Icons from "@/components/ui/Icon";

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

const ProductPage = () => {
  const navigate = useNavigate();
  const [productData, setProductData] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const fetchData = async (pageIndex, pageSize) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/${user.type}/product/get-products`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          page: pageIndex + 1, // Backend pages are usually 1-indexed
          limit: pageSize,
        },
      });
      setProductData(response.data.products);
      console.log(response,"ooo");
      setTotal(response.data.pagination.total);
      setHasNextPage(response.data.pagination.hasNextPage);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchData(pageIndex, pageSize);
  }, [pageIndex, pageSize]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/${user.type}/product/delete-product/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Product deleted successfully");
      fetchData(pageIndex, pageSize);
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete product");
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_BASE_URL}/${user.type}/product/approve-product/${id}`, {}, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Product approved successfully");
      console.log(id,"kk");
      setProductData((prevData) =>
        prevData.map((product) =>
          product._id === id ? { ...product, approved: true } : product
        )
      );
    } catch (error) {
      console.log(error);
      toast.error("Failed to approve product");
    }
  };


  // const handleApprove = async (id) => {
  //   try {
  //     const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/${user.type}/product/approve-product/${id}`, {}, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${localStorage.getItem("token")}`,
  //       },
  //     });

  //     if (response.data.approved) {
  //       toast.success("Product approved successfully");
  //       setProductData((prevData) =>
  //         prevData.map((product) =>
  //           product._id === id ? { ...product, approved: true } : product
  //         )
  //       );
  //     } else {
  //       toast.error("Product not approved");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     toast.error("Failed to approve product");
  //   }
  // };
  const handleChangeStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/${user.type}/product/update-product-status/${id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setProductData(prevvendor =>
          prevvendor.map(product =>
            product._id === id ? { ...product, status: newStatus } : product
          )
        );
        toast.success("Product status updated");
      } else {
        console.error('Failed to update Product status');
        toast.error('Failed to update Product status');
      }
    } catch (error) {
      console.error('Error updating Product status:', error);
      toast.error('Error updating Product status');
    }
  };

  const actions = [
    { name: "view", icon: "heroicons:eye", doit: (id) => navigate(`/product-view?id=${id}`) },
    { name: "edit", icon: "heroicons:pencil-square", doit: (id) => navigate(`/product-edit?id=${id}`) },
    { name: "delete", icon: "heroicons-outline:trash", doit: (id) => handleDelete(id) },
    { name: "approve", icon: "heroicons-outline:check", doit: (id) => handleApprove(id) },
    {
      name: "change status",
      icon: "heroicons-outline:refresh",
      doit: (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        handleChangeStatus(id, newStatus);
      },
    },
  ];

  const COLUMNS = [
    {
      Header: "Sr no",
      accessor: "id",
      Cell: ({ row, flatRows }) => (
        <span>{flatRows.indexOf(row) + 1}</span>
      ),
    },
    {
      Header: "Name",
      accessor: "name",
      Cell: (row) => <span>{row?.cell?.value}</span>,
    },
    {
      Header: "Vendor",
      accessor: "vendor.name",
      Cell: (row) => <span>{row?.cell?.value}</span>,
    },
    {
      Header: "Image",
      accessor: "image",
      Cell: ({ cell: { value } }) => (
        <img src={value} alt="Product" style={{ width: "70px", height: "auto" }} />
      ),
    },
    {
      Header: "Category",
      accessor: "category.name",
      Cell: (row) => <span>{row?.cell?.value}</span>,
    },
    // {
    //   Header: "Brand",
    //   accessor: "brand.name",
    //   Cell: (row) => <span>{row?.cell?.value}</span>,
    // },
    {
      Header: "Price",
      accessor: "price",
      Cell: (row) => <span>Rs:{row?.cell?.value}</span>,
    },
    {
      Header: "Status",
      accessor: "status",
      Cell: (row) => (
        <span className="block w-full">
          <span
            className={`inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-[999px] bg-opacity-25 ${
              row?.cell?.value === "active"
                ? "text-success-500 bg-success-500"
                : row?.cell?.value === "inactive"
                ? "text-warning-500 bg-warning-500"
                : row?.cell?.value === "deleted"
                ? "text-danger-500 bg-danger-500"
                : ""
            }`}
          >
            {row?.cell?.value}
          </span>
        </span>
      ),
    },
    {
      Header: 'Is-Approved',
      accessor: 'isApproved',
      Cell: ({ cell }) => (
        <span className="block w-full">
          <span
            className={`inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-[999px] bg-opacity-25 ${
              cell.value
                ? "text-success-500 bg-success-500"
                : "text-danger-500 bg-danger-500"
            }`}
          >
            {cell.value ? 'Approved' : 'Not Approved'}
          </span>
        </span>
      ),
    },
    {
      Header: "Date Added",
      accessor: "date",
      Cell: (row) => <span>{new Date(row?.cell?.value).toLocaleDateString()}</span>,
    },
    {
      Header: "Action",
      accessor: "action",
      Cell: (row) => {
        const userStatus = row.cell.row.original.status;
        const userId = row.cell.row.original._id;

        return (
          <div>
            <Dropdown
              classMenuItems="right-0 w-[140px] top-[110%]"
              label={
                <span className="text-xl text-center block w-full">
                  <Icon icon="heroicons-outline:dots-vertical" />
                </span>
              }
            >
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {actions.map((item, i) => (
                  <Menu.Item key={i}>
                    <div
                      className={`${
                        item.name === "delete"
                          ? "bg-danger-500 text-danger-500 bg-opacity-30 hover:bg-opacity-100 hover:text-white"
                          : "hover:bg-slate-900 hover:text-white dark:hover:bg-slate-600 dark:hover:bg-opacity-50"
                      } w-full border-b border-b-gray-500 border-opacity-10 px-4 py-2 text-sm last:mb-0 cursor-pointer first:rounded-t last:rounded-b flex space-x-2 items-center rtl:space-x-reverse`}
                      onClick={() => item.name === 'change status'
                        ? item.doit(userId, userStatus)
                        : item.doit(userId)
                      }
                    >
                      <span className="text-base">
                        <Icon icon={item.icon} />
                      </span>
                      <span>{item.name === 'change status' ? (userStatus === 'active' ? 'inactive' : 'active') : item.name}</span>
                    </div>
                  </Menu.Item>
                ))}
              </div>
            </Dropdown>
          </div>
        );
      },
    },
  ];

  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => productData, [productData]);

  const tableInstance = useTable(
    {
      columns,
      data,
      manualPagination: true,
      pageCount: Math.ceil(total / pageSize),
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
    canPreviousPage,
    canNextPage,
    pageOptions,
    state,
    gotoPage,
    setGlobalFilter,
    prepareRow,
  } = tableInstance;

  const { globalFilter, pageIndex: currentPageIndex, pageSize: currentPageSize } = state;

  const handlePageChange = (pageIndex) => {
    gotoPage(pageIndex);
    setPageIndex(pageIndex);
  };

  const handlePageSizeChange = (pageSize) => {
    setPageSize(pageSize);
    setPageIndex(0); // Reset to first page whenever page size changes
  };

  return (
    <Card noborder>
      <div className="md:flex pb-6 items-center">
        <h6 className="flex-1 md:mb-0 mb-3">Products</h6>
        <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
          <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
          <Button
            icon="heroicons-outline:calendar"
            text="Select date"
            className="btn-outline-secondary dark:border-slate-700 text-slate-600 btn-sm font-normal dark:text-slate-300"
            iconClass="text-lg"
          />
          <Button
            icon="heroicons-outline:filter"
            text="Filter"
            className="btn-outline-secondary dark:border-slate-700 text-slate-600 btn-sm font-normal dark:text-slate-300"
            iconClass="text-lg"
          />
          <Button
            icon="heroicons:plus"
            text="Add Product"
            className="btn-dark font-normal btn-sm"
            iconClass="text-lg"
            onClick={() => {
              navigate("/product-add");
            }}
          />
        </div>
      </div>
      <div className="overflow-x-auto -mx-6">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table
              className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700"
              {...getTableProps()}
            >
              <thead className="bg-slate-200 dark:bg-slate-700">
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps(
                          column.getSortByToggleProps()
                        )}
                        scope="col"
                        className="table-th"
                      >
                        {column.render("Header")}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? " 🔽"
                              : " 🔼"
                            : ""}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody
                className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700"
                {...getTableBodyProps()}
              >
                {page.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} className="table-td">
                          {cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
        <ul className="flex items-center space-x-3 rtl:space-x-reverse">
          <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
            <button
              className={`${!canPreviousPage ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => handlePageChange(0)}
              disabled={!canPreviousPage}
            >
              <Icons icon="heroicons:chevron-double-left-solid" />
            </button>
          </li>
          <li className="text-sm leading-4 text-slate-900 dark:text-white rtl:rotate-180">
            <button
              className={`${!canPreviousPage ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => handlePageChange(currentPageIndex - 1)}
              disabled={!canPreviousPage}
            >
              Prev
            </button>
          </li>
          {pageOptions.map((pageIdx) => (
  <li key={pageIdx}>
    <button
      aria-current="page"
      className={`${
        pageIdx === pageIndex
          ? "bg-slate-900 dark:bg-slate-600 dark:text-slate-200 text-white font-medium"
          : "bg-slate-100 dark:bg-slate-700 dark:text-slate-400 text-slate-900 font-normal"
      } text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150`}
      onClick={() => {
        handlePageChange(pageIdx);
      }}
    >
      {pageIdx + 1}
    </button>
  </li>
))}
          <li className="text-sm leading-4 text-slate-900 dark:text-white rtl:rotate-180">
            <button
              className={`${!hasNextPage ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => handlePageChange(currentPageIndex + 1)}
              disabled={!hasNextPage}
            >
              Next
            </button>
          </li>
          <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
            <button
              onClick={() => handlePageChange(Math.ceil(total / pageSize) - 1)}
              disabled={!hasNextPage}
              className={`${!hasNextPage ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Icon icon="heroicons:chevron-double-right-solid" />
            </button>
          </li>
        </ul>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Show</span>
          <select
            value={currentPageSize}
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
  );
};

export default ProductPage;
