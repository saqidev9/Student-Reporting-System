import { PlusOutlined } from "@ant-design/icons";
import BatchCard from "../BatchCard";
function BatchList({
  batches,
  selectedBatch,
  expandedBatchId,
  setSelectedBatch,
  setExpandedBatchId,
  onNewBatch,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-gray-900">All batches</h3>

        <button
          onClick={onNewBatch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition"
        >
          <PlusOutlined />
          New batch
        </button>
      </div>

      <div className="space-y-3">
        {batches.map((batch) => (
          <BatchCard
            key={batch.id}
            batch={batch}
            isSelected={selectedBatch?.id === batch.id}
            isExpanded={expandedBatchId === batch.id}
            onSelect={setSelectedBatch}
            onToggleExpand={(batchId) =>
              setExpandedBatchId(expandedBatchId === batchId ? null : batchId)
            }
          />
        ))}
      </div>
    </div>
  );
}

export default BatchList;
