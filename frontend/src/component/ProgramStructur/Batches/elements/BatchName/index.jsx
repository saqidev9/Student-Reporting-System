function BatchNameField({ value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Batch name
        <span className="text-red-500">*</span>
      </label>

      <input
        type="text"
        placeholder="e.g. Batch"
        value={value}
        onChange={onChange}
        className={`w-full border rounded-lg px-4 py-2.5 text-sm ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      />

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default BatchNameField;
