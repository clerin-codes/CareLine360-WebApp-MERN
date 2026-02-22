export default function AppointmentFilters({ filters, onChange }) {
  const handleChange = (e) => {
    onChange({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4 mb-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select
            name="status"
            value={filters.status || ""}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
          <input
            type="date"
            name="dateFrom"
            value={filters.dateFrom || ""}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
          <input
            type="date"
            name="dateTo"
            value={filters.dateTo || ""}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Sort</label>
          <select
            name="sort"
            value={filters.sort || "-date"}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
          >
            <option value="-date">Newest First</option>
            <option value="date">Oldest First</option>
            <option value="-priority">Highest Priority</option>
          </select>
        </div>
      </div>
    </div>
  );
}
