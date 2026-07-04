const Base_Api = import.meta.env.VITE_API_URL || "http://localhost:3000";
export default Base_Api;

// .env (frontend root)
VITE_API_URL = "http://localhost:3000";

// Every hook/component — replace the hardcoded string
// import Base_Api from '@/config/api';
// fetch(`${Base_Api}/api/reports`, ...);
