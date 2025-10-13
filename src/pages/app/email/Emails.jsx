import React from "react";
import Icon from "@/components/ui/Icon";
import Checkbox from "@/components/ui/Checkbox";
import { useDispatch } from "react-redux";
import {
  toggleSingleModal,
  toggleReadMail,
  setCheck,
  setFaveCheck,
  deleteEmail,
} from "./store";

const Emails = ({ email }) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(toggleSingleModal(email)); // Open modal with email details
    dispatch(toggleReadMail(email.id)); // Mark as read
  };

  return (
    <li
      className="flex px-7 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-transparent group items-center space-x-4"
      onClick={handleClick}
    >
      <Checkbox
        value={email.is_checked}
        onChange={(e) => {
          e.stopPropagation(); // Prevent triggering modal open
          dispatch(setCheck(email.id));
        }}
      />
      
      <span
        onClick={(e) => {
          e.stopPropagation(); // Prevent modal open when clicking star
          dispatch(setFaveCheck(email.id));
        }}
        className="cursor-pointer"
      >
        <Icon
          icon={email.isfav ? "heroicons-solid:star" : "heroicons-outline:star"}
          className={`text-xl ${email.isfav ? "text-yellow-400" : "text-slate-400"}`}
        />
      </span>

      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <img src={email.image} alt="avatar" className="w-8 h-8 rounded-full" />
          <div>
            <div className={email.isread ? "font-normal" : "font-bold"}>
              {email.title}
            </div>
            <div className="text-sm text-slate-600 truncate">{email.desc}</div>
          </div>
        </div>
      </div>

      <span className="text-xs">{email.lastime}</span>

      <div
        className="ml-4 opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          dispatch(deleteEmail(email.id));
        }}
      >
        <Icon icon="heroicons-outline:trash" className="text-red-500" />
      </div>
    </li>
  );
};

export default Emails;
