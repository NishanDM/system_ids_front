import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/**
 * Reusable right-side sliding alert component
 *
 * Props:
 * - show: boolean (controls visibility)
 * - onClose: function (called when alert is closed)
 * - title: string
 * - message: string | JSX
 * - type: 'success' | 'error' | 'warning' | 'info'
 * - autoClose: boolean (optional)
 * - duration: number (ms, optional)
 */
export default function SideAlert({
  show,
  onClose,
  title = "Alert",
  message,
  type = "info",
  autoClose = false,
  duration = 4000,
}) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
  }, [show]);

  useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => handleClose(), duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, visible, duration]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  const typeStyles = {
    success: "border-green-500 bg-green-50 text-green-800",
    error: "border-red-500 bg-red-50 text-red-800",
    warning: "border-yellow-500 bg-yellow-50 text-yellow-800",
    info: "border-blue-500 bg-blue-50 text-blue-800",
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`fixed top-30 right-6 z-50 w-96 border-l-4 rounded-2xl shadow-xl p-4 ${typeStyles[type]}`}
        >
          <div className="flex justify-between items-start gap-3">
            <div>
              <h4 className="text-lg font-semibold">{title}</h4>
              <div className="text-sm mt-1">{message}</div>
            </div>
            <button
              onClick={handleClose}
              className="hover:opacity-70 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ===================== USAGE EXAMPLE =====================

const [alertOpen, setAlertOpen] = useState(false);

<button onClick={() => setAlertOpen(true)}>Show Alert</button>

<SideAlert
  show={alertOpen}
  onClose={() => setAlertOpen(false)}
  title="Saved Successfully"
  message="Your data has been saved."
  type="success"
  autoClose
  duration={3000}
/>

========================================================== */
