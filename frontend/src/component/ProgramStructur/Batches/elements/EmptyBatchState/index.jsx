import { FileTextOutlined } from "@ant-design/icons";

function EmptyBatchState() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center text-gray-400">
      <FileTextOutlined className="text-5xl mb-4" />

      <p className="text-base font-medium text-gray-500">No batch selected</p>

      <p className="text-sm mt-1">
        Click a batch on the left to view its details.
      </p>
    </div>
  );
}

export default EmptyBatchState;
