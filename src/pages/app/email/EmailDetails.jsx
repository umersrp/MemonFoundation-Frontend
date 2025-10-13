// components/EmailDetails.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleSingleModal } from "./store";
import Icon from "@/components/ui/Icon";
import axios from "axios";

const EmailDetails = () => {
  const dispatch = useDispatch();
  const { singleEmail } = useSelector((state) => state.email);
  const [emailDetails, setEmailDetails] = useState(null);

  useEffect(() => {
    if (!singleEmail?.id) return;  // <-- use 'id' not '_id'

    const fetch = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/student-email/get-email/${singleEmail.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEmailDetails(res.data.data);
    };

    fetch();
  }, [singleEmail]);

  if (!emailDetails) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-white z-50 p-6 overflow-y-auto">
      <div className="flex justify-between items-center border-b pb-4">
        <button onClick={() => dispatch(toggleSingleModal())}>
          <Icon icon="heroicons-outline:arrow-left" />
        </button>
        <div className="flex space-x-3">
          <Icon icon="heroicons-outline:trash" />
          <Icon icon="heroicons-outline:printer" />
        </div>
      </div>
      <div className="mt-6">
        <p className="text-sm text-slate-500 mt-2">From: {emailDetails.studentId.email}</p>
        <h3 className="text-lg font-bold">{emailDetails.subject}</h3>
        <div className="mt-4 whitespace-pre-wrap">{emailDetails.message}</div>
      </div>
    </div>
  );
};

export default EmailDetails;
