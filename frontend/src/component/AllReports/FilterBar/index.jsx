import { Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Option } from "antd/lib/mentions";
import { STATUS_OPTIONS, SUBMISSION_OPTIONS } from "../constants";

function FilterBar({
  filters = {},
  onChange,
  batches = [],
  courses = [],
  groups = [],
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-white border border-[#e5e7eb] rounded-xl">
      {/* Search */}
      <Input
        placeholder="Search by student name"
        prefix={<SearchOutlined className="text-gray-400" />}
        value={filters.search}
        onChange={(e) => onChange("search", e.target.value)}
        className="!w-52"
        allowClear
      />

      {/* Batches — from props, not constants */}
      <Select
        placeholder="All batches"
        value={filters.batch}
        onChange={(v) => onChange("batch", v)}
        className="!w-36"
        allowClear
      >
        {batches.map(
          (
            b, // ← props, not Batches constant
          ) => (
            <Option key={b.id ?? b._id} value={b.id ?? b._id}>
              {b.name}
            </Option>
          ),
        )}
      </Select>

      {/* Courses — from props */}
      <Select
        placeholder="All courses"
        value={filters.course}
        onChange={(v) => onChange("course", v)}
        className="!w-36"
        allowClear
      >
        {courses.map(
          (
            c, // ← props
          ) => (
            <Option key={c.id ?? c._id} value={c.id ?? c._id}>
              {c.name}
            </Option>
          ),
        )}
      </Select>

      {/* Groups — from props */}
      <Select
        placeholder="All groups"
        value={filters.group}
        onChange={(v) => onChange("group", v)}
        className="!w-36"
        allowClear
      >
        {groups.map(
          (
            g, // ← props
          ) => (
            <Option key={g.id ?? g._id} value={g.id ?? g._id}>
              {g.name}
            </Option>
          ),
        )}
      </Select>

      {/* Status */}
      <Select
        placeholder="All statuses"
        value={filters.status}
        onChange={(v) => onChange("status", v)}
        className="!w-36"
        allowClear
      >
        {STATUS_OPTIONS.map((s) => (
          <Option key={s.value} value={s.value}>
            {s.label}
          </Option>
        ))}
      </Select>

      {/* Submission */}
      <Select
        placeholder="All submissions"
        value={filters.submission}
        onChange={(v) => onChange("submission", v)}
        className="!w-40"
        allowClear
      >
        {SUBMISSION_OPTIONS.map((s) => (
          <Option key={s.value} value={s.value}>
            {s.label}
          </Option>
        ))}
      </Select>

      {/* Date range */}
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange("dateFrom", e.target.value)}
          className="!w-36 text-sm"
        />
        <span className="text-gray-400 text-sm">to</span>
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange("dateTo", e.target.value)}
          className="!w-36 text-sm"
        />
      </div>

      {/* Score range */}
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="min"
          value={filters.scoreMin}
          onChange={(e) => onChange("scoreMin", e.target.value)}
          className="!w-16 text-sm"
          min={0}
          max={5}
        />
        <span className="text-gray-400 text-sm">—</span>
        <Input
          type="number"
          placeholder="max"
          value={filters.scoreMax}
          onChange={(e) => onChange("scoreMax", e.target.value)}
          className="!w-16 text-sm"
          min={0}
          max={5}
        />
      </div>
    </div>
  );
}
export default FilterBar;
