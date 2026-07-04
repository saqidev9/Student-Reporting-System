import { CheckOutlined } from "@ant-design/icons";

function SuccessToast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed top-5 right-5 z-50 bg-green-600 text-white text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
      <CheckOutlined />
      {message}
    </div>
  );
}

export default SuccessToast;
