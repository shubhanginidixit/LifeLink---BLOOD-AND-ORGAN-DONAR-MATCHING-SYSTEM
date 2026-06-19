import React, { useState } from "react";
import axios from "axios";
import { Lock, Mail, ArrowRight } from "lucide-react";

const ResetPassword = () => {
    const [identifier, setIdentifier] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post(
                "http://localhost:5000/api/auth/reset-password",
                {
                    identifier,
                    newPassword,
                }
            );

            setMessage("✅ Password reset successful");
        } catch (err) {
            setMessage("❌ Password reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel p-8 md:p-12 w-full animate-slide-up">
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[rgba(225,29,72,0.15)] flex items-center justify-center mb-4">
                    <Lock className="text-primary" size={30} />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                    Reset Password
                </h2>

                <p className="text-slate-400 text-sm text-center">
                    Enter your email and choose a new password
                </p>
            </div>

            {message && (
                <div className="mb-6 p-3 rounded-lg text-center bg-white/5 border border-white/10 text-white">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="relative">
                    <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        size={18}
                    />

                    <input
                        type="email"
                        placeholder="Email Address"
                        className="glass-input w-full pl-11"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                    />
                </div>

                <div className="relative">
                    <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        size={18}
                    />

                    <input
                        type="password"
                        placeholder="New Password"
                        className="glass-input w-full pl-11"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary mt-2 flex items-center justify-center gap-2"
                >
                    {loading ? "Processing..." : "Reset Password"}
                    <ArrowRight size={18} />
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;