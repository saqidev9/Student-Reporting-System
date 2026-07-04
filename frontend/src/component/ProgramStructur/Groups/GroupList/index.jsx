// GroupList.jsx
import { UsergroupAddOutlined, TeamOutlined } from "@ant-design/icons";

function GroupList({ groups, selectBatch, selectCourse, batches }) {
  // Nothing selected yet
  if (!selectBatch) {
    return (
      <div className="w-full bg-white border border-gray-200 mt-4 rounded-xl p-8 flex flex-col items-center justify-center h-60">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
          <TeamOutlined className="text-blue-400 text-xl" />
        </div>
        <p className="text-sm font-medium text-gray-600">
          Select a batch to view groups
        </p>
        <p className="text-xs text-gray-400 mt-1">
          You can also filter by course after selecting a batch.
        </p>
      </div>
    );
  }

  const batchName =
    batches.find((b) => b.id === selectBatch)?.name || "this batch";
  const courseName = selectBatch
    ? batches
        .find((b) => b.id === selectBatch)
        ?.courses?.find((c) => c.id === selectCourse)?.name
    : null;

  // Selection made but no groups
  if (groups.length === 0) {
    return (
      <div className="w-full bg-white border border-gray-200 mt-4 rounded-xl p-8 flex flex-col items-center justify-center h-60">
        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
          <UsergroupAddOutlined className="text-orange-400 text-xl" />
        </div>
        <p className="text-sm font-medium text-gray-700">No groups found</p>
        <p className="text-xs text-gray-400 mt-1 text-center">
          {courseName ? (
            <>
              There are no groups in{" "}
              <span className="font-semibold text-gray-600">{batchName}</span>{" "}
              for course{" "}
              <span className="font-semibold text-gray-600">{courseName}</span>.
            </>
          ) : (
            <>
              There are no groups in{" "}
              <span className="font-semibold text-gray-600">{batchName}</span>{" "}
              yet.
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-200 mt-4 rounded-xl overflow-hidden">
      {/* Context header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {courseName ? (
              <>
                <span className="text-blue-600">{batchName}</span> ·{" "}
                <span className="text-blue-600">{courseName}</span>
              </>
            ) : (
              <span className="text-blue-600">{batchName}</span>
            )}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {groups.length} group{groups.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      {/* Group rows */}
      <div className="divide-y divide-gray-100">
        {groups.map((group) => (
          <div
            key={group.id}
            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors duration-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <TeamOutlined className="text-blue-500 text-sm" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {group.name}
                </p>
                {group.description && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {group.description}
                  </p>
                )}
              </div>
            </div>
            {group.memberCount !== undefined && (
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {group.memberCount} members
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GroupList;
