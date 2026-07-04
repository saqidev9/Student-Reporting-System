function BatchDetails({ batch }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">{batch.name}</h2>

          <p className="text-gray-500 mt-2">{batch.description}</p>
        </div>

        <span className="shrink-0 bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm whitespace-nowrap">
          Started {batch.startDate}
        </span>
      </div>
    </div>
  );
}

export default BatchDetails;
