import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import '../styles/Toast.css';

export default function Toast({ message, type = 'success', onClose }) {
  const icons = {
    success: <FaCheckCircle />,
    error: <FaExclamationCircle />,
    info: <FaInfoCircle />
  };

  const colors = {
    success: '#4CAF50',
    error: '#FF4444',
    info: '#2196F3'
  };

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`toast toast-${type}`}
          style={{ borderLeftColor: colors[type] }}
        >
          <div className="toast-icon" style={{ color: colors[type] }}>
            {icons[type]}
          </div>
          <div className="toast-message">{message}</div>
          <button onClick={onClose} className="toast-close">
            <FaTimes />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
