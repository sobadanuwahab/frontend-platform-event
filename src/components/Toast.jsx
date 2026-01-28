import { useState, useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

const Toast = ({ message, type, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor =
    type === "success"
      ? "bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200"
      : "bg-gradient-to-r from-red-50 to-red-100 border-red-200";

  const textColor = type === "success" ? "text-teal-800" : "text-red-800";
  const iconColor = type === "success" ? "text-teal-600" : "text-red-600";
  const Icon = type === "success" ? CheckCircle : XCircle;

  return (
    <div
      className={`fixed top-4 right-4 z-50 border rounded-xl shadow-lg p-4 ${bgColor} animate-slide-in`}>
      <div className="flex items-center gap-3">
        <Icon size={20} className={iconColor} />
        <div className="flex-1">
          <p className={`font-medium ${textColor}`}>
            {type === "success" ? "Sukses!" : "Error!"}
          </p>
          <p className={`text-sm ${textColor}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`p-1 rounded-full ${type === "success" ? "hover:bg-teal-200" : "hover:bg-red-200"}`}>
          <X size={16} className={iconColor} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
