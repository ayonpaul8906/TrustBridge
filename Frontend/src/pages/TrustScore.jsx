import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    ArrowUpRight,
    ArrowDownRight,
    UploadCloud,
    FileCheck2,
    Clock,
} from "lucide-react";

import Header from "../components/header"
import Footer from "../components/footer"

const paymentHistory = [
    { date: "2025-04-01", amount: 100, status: "on-time", impact: +5 },
    { date: "2025-04-15", amount: 100, status: "late", impact: -10 },
    { date: "2025-05-01", amount: 100, status: "on-time", impact: +5 },
    { date: "2025-05-05", amount: 100, status: "missed", impact: -15 },
];

const calculateTrustScore = (docs) => {
    const baseScore = 0;
    const totalImpact = paymentHistory.reduce((acc, p) => acc + p.impact, 0);
    const docBonus = docs.length * 5;
    return Math.min(100, Math.max(0, baseScore + totalImpact + docBonus));
};

const TrustScore = () => {
    const [uploadedDocs, setUploadedDocs] = useState([]);
    const [trustScore, setTrustScore] = useState(0);
    const [animatedScore, setAnimatedScore] = useState(0);

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files || []);
        const formatted = files.map((f) => ({
            name: f.name,
            type: f.type,
            uploadedAt: new Date().toLocaleDateString(),
        }));
        setUploadedDocs((prev) => [...prev, ...formatted]);
    };

    const handleCheckTrustScore = () => {
        const newScore = calculateTrustScore(uploadedDocs);
        setTrustScore(newScore);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimatedScore((prev) => {
                if (prev < trustScore) return prev + 1;
                if (prev > trustScore) return prev - 1;
                return prev;
            });
        }, 20);
        return () => clearInterval(interval);
    }, [trustScore]);

    const getStatusColor = (status) => {
        switch (status) {
            case "on-time":
                return "text-green-400";
            case "late":
                return "text-yellow-400";
            case "missed":
                return "text-red-400";
            default:
                return "text-gray-400";
        }
    };

    return (
        <div>
            <Header />
            <div className="bg-[#0f172a] text-white min-h-screen p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Trust Score Panel */}
                    <motion.div
                        className="bg-[#1e293b] rounded-3xl p-8 flex-1 shadow-xl"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-bold mb-2">Trust Score</h2>
                        <p className="text-slate-400 mb-4">
                            Build your score by uploading bills and maintaining on-time payments.
                        </p>

                        {/* Circular Meter */}
                        <div className="relative w-48 h-48 mx-auto my-8">
                            <svg className="absolute top-0 left-0 w-full h-full">
                                <circle cx="50%" cy="50%" r="70" stroke="#334155" strokeWidth="12" fill="none" />
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="70"
                                    stroke="url(#gradient)"
                                    strokeWidth="12"
                                    fill="none"
                                    strokeDasharray={440}
                                    strokeDashoffset={440 - (animatedScore / 100) * 440}
                                    strokeLinecap="round"
                                    transform="rotate(-90 120 120)"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#38bdf8" />
                                        <stop offset="100%" stopColor="#6366f1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <motion.div
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
                                animate={{ scale: [0.95, 1.05, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror" }}
                            >
                                <div className="text-5xl font-bold text-cyan-400">{animatedScore}</div>
                                <div className="text-sm text-slate-400">/ 100</div>
                            </motion.div>

                        </div>

                        {/* Score Button */}
                        <button
                            onClick={handleCheckTrustScore}
                            className="mt-6 w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2 px-4 rounded-xl transition"
                        >
                            Check Trust Score
                        </button>
                    </motion.div>

                    {/* Uploads & History Section */}
                    <div className="flex flex-col gap-6 flex-1">
                        {/* Upload Bills */}
                        <motion.div
                            className="bg-[#1e293b] p-6 rounded-3xl shadow-xl"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <UploadCloud className="text-cyan-400" />
                                <h3 className="text-lg font-bold">Upload Bills</h3>
                            </div>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                multiple
                                onChange={handleFileUpload}
                                className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-cyan-700 file:text-white hover:file:bg-cyan-600"
                            />
                            <div className="mt-4 space-y-1">
                                {uploadedDocs.map((doc, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex justify-between text-sm text-slate-300"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileCheck2 className="w-4 h-4 text-green-400" />
                                            {doc.name}
                                        </div>
                                        <span className="text-slate-500">{doc.uploadedAt}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Payment History */}
                        <motion.div
                            className="bg-[#1e293b] p-6 rounded-3xl shadow-xl"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            <h3 className="text-lg font-bold mb-4">Payment History</h3>
                            <div className="space-y-3 text-slate-300">
                                {paymentHistory.map((p, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="flex justify-between border-b border-slate-700 pb-2"
                                    >
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="w-4 h-4 text-slate-500" />
                                            {p.date}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <span>${p.amount}</span>
                                            <span className={`font-bold ${getStatusColor(p.status)}`}>
                                                {p.status.toUpperCase()}
                                            </span>
                                            {p.impact > 0 ? (
                                                <ArrowUpRight className="w-4 h-4 text-green-400" />
                                            ) : (
                                                <ArrowDownRight className="w-4 h-4 text-red-400" />
                                            )}
                                            <span>{p.impact > 0 ? `+${p.impact}` : p.impact}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TrustScore;
