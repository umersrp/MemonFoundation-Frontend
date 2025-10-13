import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import useDarkMode from "@/hooks/useDarkMode";
import axios from "axios";

import LogoWhite from "@/assets/images/logo/logo-white.svg";
import Logo from "@/assets/images/logo/logo.svg";
import Illustration from "@/assets/images/auth/ils1.svg";
import { Icon } from "@iconify/react";
// then use <EyeIcon /> or <EyeOffIcon /> instead of the emoji


const SetPassword = () => {
    const [isDark] = useDarkMode();
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const token = params.get("token");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return setMessage({ type: "error", text: "Passwords do not match." });
        }

        setLoading(true);
        setMessage(null);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/user/set-password`,
                {
                    token,
                    newPassword,
                }
            );

            setMessage({ type: "success", text: response.data.message });
            setTimeout(() => navigate("/"), 2000); // Redirect to login after 2s
        } catch (err) {
            const errorText = err?.response?.data?.message || "Something went wrong.";
            setMessage({ type: "error", text: errorText });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="loginwrapper">
            <div className="lg-inner-column">
                {/* Left Column */}
                <div className="left-column relative z-[1]">
                    <div className="max-w-[520px] pt-20 ltr:pl-20 rtl:pr-20">
                        <Link to="/">
                            <img src={isDark ? LogoWhite : Logo} alt="logo" className="mb-10" />
                        </Link>
                        <h4>
                            Unlock your Project{" "}
                            <span className="text-slate-800 dark:text-slate-400 font-bold">
                                Performance
                            </span>
                        </h4>
                    </div>
                    <div className="absolute left-0 bottom-[-130px] h-full w-full z-[-1]">
                        <img src={Illustration} alt="" className="h-full w-full object-contain" />
                    </div>
                </div>

                {/* Right Column */}
                <div className="right-column relative">
                    <div className="inner-content h-full flex flex-col bg-white dark:bg-slate-800">
                        <div className="auth-box2 flex flex-col justify-center h-full">
                            <div className="text-center mb-6">
                                <h4 className="font-medium text-xl mb-2">Set New Password</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-base">
                                    Please enter your new password below.
                                </p>
                            </div>

                            {message && (
                                <div
                                    className={`text-sm text-center mb-4 px-4 py-2 rounded ${message.type === "error"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-green-100 text-green-600"
                                        }`}
                                >
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="form-input border-[3px] h-10 w-full mb-3 p-2 pr-10"
                                    />
                                    <span
                                        className="absolute right-3 top-2.5 cursor-pointer text-slate-500"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                    >
                                        <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} width="20" height="20" />
                                    </span>
                                </div>

                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm New Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="form-input border-[3px] h-10 w-full mb-3 p-2 pr-10"
                                    />
                                    <span
                                        className="absolute right-3 top-2.5 cursor-pointer text-slate-500"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    >
                                        <Icon icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"} width="20" height="20" />
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-dark w-full"
                                >
                                    {loading ? "Submitting..." : "Set Password"}
                                </button>
                            </form>

                            <div className="text-center mt-6 text-slate-500 dark:text-slate-400 text-sm">
                                Already have an account?{" "}
                                <Link to="/" className="text-slate-900 dark:text-white font-medium hover:underline">
                                    Sign In
                                </Link>
                            </div>
                        </div>
                        <div className="auth-footer text-center">
                            &copy; {new Date().getFullYear()}, Dashcode. All Rights Reserved.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetPassword;
