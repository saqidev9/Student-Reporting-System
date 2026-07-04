import { useState } from "react";
import { CloseOutlined, DownOutlined, CheckOutlined } from "@ant-design/icons";
function NewBatchModal({ batches, onClose, onSubmit }) {
  const [batchName, setBatchName] = useState("");
  const [description, setDescription] = useState("");
  const [copyFromId, setCopyFromId] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const selectedCopyBatch = batches.find((b) => b.id === Number(copyFromId));

  const copyOptions = [
    { label: "Don't copy — start empty", value: "" },
    ...batches.map((b) => ({
      label: `${b.name} (${b.courses.length} courses)`,
      value: b.id,
    })),
  ];

  const selectedOptionLabel =
    copyOptions.find((o) => String(o.value) === String(copyFromId))?.label ||
    "Don't copy — start empty";

  function validate() {
    const errs = {};
    if (!batchName.trim()) errs.batchName = "Batch name is required.";
    else if (batchName.trim().length < 2)
      errs.batchName = "Name must be at least 2 characters.";
    return errs;
  }

  async function handleSubmit() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = {
      name: batchName,
      description,
      copyFromBatchId: copyFromId || null,
    };

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/program/batches",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const newBatch = await response.json();
      console.log(newBatch);
      console.log();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }

    const newBatch = {
      id: Date.now(),
      name: batchName.trim(),
      startDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      description: description.trim() || "No description provided.",
      courses: selectedCopyBatch ? [...selectedCopyBatch.courses] : [],
    };

    setLoading(false);
    onSubmit(newBatch);
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">New batch</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition rounded-lg p-1 hover:bg-gray-100"
          >
            <CloseOutlined />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Batch name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Batch"
              value={batchName}
              onChange={(e) => {
                setBatchName(e.target.value);
                if (errors.batchName)
                  setErrors((p) => ({ ...p, batchName: "" }));
              }}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${
                errors.batchName
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"
              }`}
            />
            {errors.batchName && (
              <p className="text-red-500 text-xs mt-1">{errors.batchName}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="What's this cohort about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition resize-none"
            />
            <p className="text-gray-400 text-xs mt-1">
              Optional. Visible to admins only.
            </p>
          </div>

          {/* Copy courses from — custom dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Copy courses from
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="w-full flex justify-between items-center border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              >
                <span
                  className={copyFromId ? "text-gray-900" : "text-gray-500"}
                >
                  {selectedOptionLabel}
                </span>
                <DownOutlined
                  className={`text-gray-400 text-xs transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {copyOptions.map((opt) => {
                    const isSelected = String(opt.value) === String(copyFromId);
                    return (
                      <li
                        key={opt.value}
                        onClick={() => {
                          setCopyFromId(opt.value);
                          setDropdownOpen(false);
                        }}
                        className={`flex justify-between items-center px-4 py-3 text-sm cursor-pointer transition ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && (
                          <CheckOutlined className="text-white text-xs" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Creating…
              </>
            ) : (
              "Create batch"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewBatchModal;
