import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SimpleBar from "simplebar-react";
import avatar1 from "@/assets/images/avatar/av-1.svg";

import { useSelector, useDispatch } from "react-redux";
import {
  toggleMobileEmailSidebar,
  toggleEmailModal,
  setFilter,
  setSearch,
  setEmails, // <-- make sure this action exists in your email Redux slice
} from "./store";
import { ToastContainer } from "react-toastify";
import Badge from "@/components/ui/Badge";
import useWidth from "@/hooks/useWidth";
import ComposeEmail from "./ComposeEmail";
import Emails from "./Emails";
import ListLoading from "@/components/skeleton/ListLoading";
import { topFilterLists, bottomFilterLists } from "@/constant/data";
import Topfilter from "./Topfilter";
import BottomFilter from "./BottomFilter";
import EmailHeader from "./EmailHeader";
import EmailDetails from "./EmailDetails";

const EmailPage = () => {
  const { width, breakpoints } = useWidth();
  const dispatch = useDispatch();

  const { mobileEmailSidebar, search, filter, singleModal, emails } =
    useSelector((state) => state.email);

  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch emails on mount
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/student-email/get-all-emails`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ Add Bearer
            },
          }
        );

        if (res.data && res.data.data) {
          const transformedEmails = res.data.data.map((email) => ({
            id: email._id,
            title: email.subject || "No Subject",
            desc: email.message || "No message",
            image: email?.studentId?.profilePhoto || avatar1,
            isread: email.isRead || false,
            lastime: new Date(email.createdAt).toLocaleDateString(),
            studentName: email?.studentId?.name || "Unknown",
            studentEmail: email?.studentId?.email || "Unknown",
            is_checked: false,
            isfav: false,
          }));

          dispatch(setEmails(transformedEmails));
        }

        setLoading(false); // ✅ Stop loading on success
      } catch (err) {
        setError("Failed to fetch emails");
        console.error("Error fetching emails:", err);
        setLoading(false); // ✅ Stop loading on failure
      }
    };

    fetchEmails();
  }, [dispatch]);

  const filteredEmails = emails
    .filter((email) => {
      if (search) {
        return email.title?.toLowerCase().includes(search.toLowerCase());
      }
      return true;
    })
    .filter((email) => {
      switch (filter) {
        case "all":
          return true;
        case "fav":
          return email.isfav;
        case "sent":
          return email.sent;
        case "personal":
          return email.personal;
        // case "business":
        //   return email.business;
        case "drafts":
          return email.draft;
        // case "spam":
        // case "social":
        // case "promotions":
        //   return email.isspam;
        // case "trash":
        //   return email.isdelate;
        default:
          return true;
      }
    });

  const handleFilter = (filter) => {
    dispatch(setFilter(filter));
  };

  return (
    <>
      <ToastContainer />

      <div className="flex md:space-x-5 app_height overflow-hidden relative rtl:space-x-reverse">
        {/* Sidebar */}
        <div
          className={`transition-all duration-150 flex-none min-w-[260px] 
            ${width < breakpoints.lg
              ? "absolute h-full top-0 md:w-[260px] w-[200px] z-[999]"
              : "flex-none min-w-[260px]"
            }
            ${width < breakpoints.lg && mobileEmailSidebar
              ? "left-0"
              : "-left-full"
            }
          `}
        >
          <Card bodyClass="py-6 h-full flex flex-col" className="h-full">
            <div className="flex-1 h-full px-6">
              <Button
                icon="heroicons-outline:plus"
                text="Compose"
                className="btn-dark w-full block"
                onClick={() => dispatch(toggleEmailModal(true))}
              />
            </div>

            <SimpleBar className="h-full px-6">
              <ul className="list mt-6">
                {topFilterLists.map((item, i) => (
                  <Topfilter
                    key={i}
                    item={item}
                    filter={filter}
                    onClick={() => handleFilter(item.value)}
                  />
                ))}
              </ul>
              <div className="block py-4 text-slate-800 dark:text-slate-400 font-semibold text-xs uppercase">
                Tags
              </div>
              <ul>
                {bottomFilterLists.map((item, i) => (
                  <BottomFilter
                    key={i}
                    item={item}
                    filter={filter}
                    onClick={() => handleFilter(item.value)}
                  />
                ))}
              </ul>
            </SimpleBar>
          </Card>
        </div>

        {/* Mobile overlay */}
        {width < breakpoints.lg && mobileEmailSidebar && (
          <div
            className="overlay bg-slate-900 dark:bg-slate-900 dark:bg-opacity-60 bg-opacity-60 backdrop-filter
            backdrop-blur-sm absolute w-full flex-1 inset-0 z-[99] rounded-md"
          ></div>
        )}

        {/* Main content */}
        <div className="flex-1 md:w-[calc(100%-320px)]">
          <Card bodyClass="p-0 h-full relative" className="h-full">
            <EmailHeader
              onChange={(e) => dispatch(setSearch(e.target.value))}
              emails={filteredEmails}
            />

            <SimpleBar className="h-full all-todos overflow-x-hidden">
              {isLoading && <ListLoading count={5} />}

              {!isLoading && error && (
                <div className="m-6 text-danger-500 font-semibold">
                  {error}
                </div>
              )}

              {!isLoading && !error && (
                <ul className="divide-y divide-slate-100 dark:divide-slate-700 -mb-6 h-full">
                  {filteredEmails.map((email, i) => (
                    <Emails key={i} email={email} />
                  ))}
                  {filteredEmails.length === 0 && (
                    <li className="mx-6 mt-6">
                      <Badge
                        label="No Result Found"
                        className="bg-danger-500 text-white w-full block text-start"
                      />
                    </li>
                  )}
                </ul>
              )}
            </SimpleBar>

            {singleModal && <EmailDetails />}
          </Card>
        </div>
      </div>

      <ComposeEmail />
    </>
  );
};

export default EmailPage;
