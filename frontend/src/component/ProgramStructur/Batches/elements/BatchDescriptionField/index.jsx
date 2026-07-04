function BatchDescriptionField({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Description
      </label>

      <textarea
        rows={4}
        value={value}
        onChange={onChange}
        placeholder="What's this cohort about?"
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
      />

      <p className="text-gray-400 text-xs mt-1">
        Optional. Visible to admins only.
      </p>
    </div>
  );
}

export default BatchDescriptionField;
