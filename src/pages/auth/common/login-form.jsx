// import React, { useEffect, useState } from "react";
// import Textinput from "@/components/ui/Textinput";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { useNavigate } from "react-router-dom";
// import Checkbox from "@/components/ui/Checkbox";
// import Button from "@/components/ui/Button";
// import { Link } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { useLoginMutation } from "@/store/api/auth/authApiSlice";
// import { setUser } from "@/store/api/auth/authSlice";
// import { toast } from "react-toastify";
// import { useSelector } from "react-redux";

// const schema = yup
//   .object({
//     email: yup.string().email("Invalid email").required("Email is Required"),
//     password: yup.string().required("Password is Required"),
//   })
//   .required();

// const LoginForm = () => {
//   const [login, { isLoading }] = useLoginMutation();
//   const dispatch = useDispatch();
//   const user = useSelector((state) => state.auth);

//   const {
//     register,
//     formState: { errors },
//     handleSubmit,
//   } = useForm({
//     resolver: yupResolver(schema),
//     mode: "all",
//   });
//   const navigate = useNavigate();


//   useEffect(() => {
//     if (user?.isAuth) {
//       navigate("/dashboard");
//     }
//   })

//   const onSubmit = async (data) => {
//     try {
//       const response = await login(data);

//       if (response?.error) {
//         console.log(response.error);
//         throw new Error(response.error.data.message);
//       }

//       if (response?.data?.error) {
//         throw new Error(response.error.data.message);
//       }

//       if (!response?.data?.token) {
//         throw new Error("Invalid credentials");
//       }

//       if (response?.data?.user?.type === "user") {
//         throw new Error("Invalid credentials");
//       }

//       const userData = await dispatch(setUser(response?.data?.user));

//       localStorage.setItem("user", JSON.stringify(response?.data?.user));
//       localStorage.setItem("token",response?.data?.token)

//       navigate("/dashboard");
//       toast.success("Login Successful");
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const [checked, setChecked] = useState(false);

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//       <Textinput
//         name="email"
//         label="Email"
//         type="email"
//         register={register}
//         error={errors.email}
//         className="h-[48px]"
//       />
//       <Textinput
//         name="password"
//         label="Password"
//         type="password"
//         register={register}
//         error={errors.password}
//         className="h-[48px]"
//       />
//       <div className="flex justify-between">
//         <Checkbox
//           value={checked}
//           onChange={() => setChecked(!checked)}
//           label="Keep me signed in"
//         />
//         <Link
//           to="/forgot-password"
//           className="text-sm text-slate-800 dark:text-slate-400 leading-6 font-medium"
//         >
//           Forgot Password?
//         </Link>
//       </div>

//       <Button
//         type="submit"
//         text="Sign in"
//         className="btn btn-dark block w-full text-center"
//         isLoading={isLoading}
//       />
//     </form>
//   );
// };

// export default LoginForm;


import React, { useEffect, useState } from "react";
import Textinput from "@/components/ui/Textinput";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "@/store/api/auth/authApiSlice";
import { setUser } from "@/store/api/auth/authSlice";
import { toast } from "react-toastify";

const schema = yup
  .object({
    email: yup.string().email("Invalid email").required("Email is Required"),
    password: yup.string().required("Password is Required"),
  })
  .required();

const LoginForm = () => {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (user?.isAuth) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    try {
      const response = await login(data);

      // Handle API or backend error
      if (response?.error) {
        throw new Error(response.error.data?.message || "Login failed");
      }

      // Extract user and token from response
      const userData = response?.data?.data;
      const user = userData?.user;
      const token = userData?.token;

      // Check for valid token
      if (!token || !user) {
        throw new Error("Invalid credentials");
      }

      // Only allow superadmin
      if (user?.type !== "superadmin") {
        throw new Error("Invalid credentials");
      }

      // Save user and token to Redux and localStorage
      dispatch(setUser({ ...user, token }));
      localStorage.setItem("user", JSON.stringify({ ...user, token }));
      localStorage.setItem("token", token);

      // Navigate and notify
      navigate("/dashboard");
      toast.success("Login Successful");

    } catch (error) {
      toast.error(error.message || "Login failed");
    }
  };



  const [checked, setChecked] = useState(false);


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Textinput
        name="email"
        label="Email"
        type="email"
        register={register}
        error={errors.email}
        className="h-[48px]"
      />
      <Textinput
        name="password"
        label="Password"
        type="password"
        register={register}
        error={errors.password}
        className="h-[48px]"
      />
      <div className="flex justify-between">
        <Checkbox
          value={checked}
          onChange={() => setChecked(!checked)}
          label="Keep me signed in"
        />
        <Link
          to="/forgot-password"
          className="text-sm text-slate-800 dark:text-slate-400 leading-6 font-medium"
        >
          Forgot Password?
        </Link>
      </div>

      <Button
        type="submit"
        text="Sign in"
        className="btn btn-dark block w-full text-center"
        isLoading={isLoading}
      />
    </form>
  );
};

export default LoginForm;

