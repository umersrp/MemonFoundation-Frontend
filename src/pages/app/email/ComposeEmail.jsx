import React, { useState, useEffect } from "react";
import Select, { components } from "react-select";
import Modal from "@/components/ui/Modal";
import { useSelector, useDispatch } from "react-redux";
import { toggleEmailModal } from "./store";
import Textinput from "@/components/ui/Textinput";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import avatar1 from "@/assets/images/avatar/av-1.svg";
import { toast } from "react-toastify";

const FormValidationSchema = yup.object({
  title: yup.string().required("Subject is required"),
  assign: yup
    .array()
    .min(1, "At least one student is required")
    .required("Recipients are required"),
});

const styles = {
  multiValue: (base, state) => {
    return state.data.isFixed ? { ...base, opacity: "0.5" } : base;
  },
  multiValueLabel: (base, state) => {
    return state.data.isFixed
      ? { ...base, color: "#626262", paddingRight: 6 }
      : base;
  },
  multiValueRemove: (base, state) => {
    return state.data.isFixed ? { ...base, display: "none" } : base;
  },
  option: (provided) => ({
    ...provided,
    fontSize: "14px",
  }),
};

const OptionComponent = ({ data, ...props }) => {
  return (
    <components.Option {...props}>
      <span className="flex items-center space-x-4">
        <div className="flex-none">
          <div className="h-7 w-7 rounded-full overflow-hidden">
            <img
              src={data.image}
              alt="avatar"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
        <span className="flex-1">{data.label}</span>
      </span>
    </components.Option>
  );
};

const ComposeEmail = () => {
  const { emailModal } = useSelector((state) => state.email);
  const dispatch = useDispatch();

  const [studentOptions, setStudentOptions] = useState([]);
  const [message, setMessage] = useState("Hello! Please set your password using the link sent.");

  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({
    resolver: yupResolver(FormValidationSchema),
    mode: "all",
  });

  // Fetch students when modal opens
  useEffect(() => {
    if (emailModal) {
      axios
        .get(`${process.env.REACT_APP_BASE_URL}/user/getStudentByAdmin`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          const students = res.data?.data.students || [];
          const options = students.map((student) => ({
            value: student.email,
            label: `${student.name || "No Name"} - ${student.email}`,
            image: student.profilePhoto || avatar1,
          }));
          setStudentOptions(options);
        })
        .catch((err) => {
          console.error("Failed to fetch students", err);
          toast.error("Failed to load student list.");
        });
    }
  }, [emailModal]);

  const onSubmit = async (data) => {
    try {
      const selectedEmails = data.assign.map((item) => item.value); // extract email strings

      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/user/send-password-setup-link`,
        { email: selectedEmails },
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Password setup links sent successfully!");
      dispatch(toggleEmailModal(false));
      reset();
    } catch (error) {
      console.error("Failed to send emails", error);
      toast.error(error.response?.data?.message || "Failed to send email");
    }
  };

  return (
    <Modal
      title="Send Password Setup Link"
      activeModal={emailModal}
      onClose={() => dispatch(toggleEmailModal(false))}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* To */}
        <div className={errors.assign ? "has-error" : ""}>
          <label className="form-label" htmlFor="assign">
            To (Students)
          </label>
          <Controller
            name="assign"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={studentOptions}
                styles={styles}
                isMulti
                className="react-select"
                classNamePrefix="select"
                components={{ Option: OptionComponent }}
                placeholder="Select students..."
                id="assign"
              />
            )}
          />
          {errors.assign && (
            <div className="mt-2 text-danger-500 block text-sm">
              {errors.assign.message}
            </div>
          )}
        </div>

        {/* Subject */}
        <Textinput
          name="title"
          label="Subject"
          type="text"
          placeholder="Enter email subject"
          register={register}
          error={errors.title}
        />

        {/* Optional Body Message */}
        <div>
          <label className="form-label">Message (optional)</label>
          <ReactQuill value={message} onChange={setMessage} theme="snow" />
        </div>

        {/* Submit */}
        <div className="text-right">
          <button type="submit" className="btn btn-dark">
            Send Link
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ComposeEmail;
