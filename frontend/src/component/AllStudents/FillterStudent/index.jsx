import React from "react";
import { Input, Select, Tag, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Option } = Select;

function FilterStudent({ filters, setFilters, batches, courses, groups }) {
  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="bg-white border rounded-xl p-4 mb-5">
      <Space size="middle" wrap className="w-full">
        {/* Search */}
        <Input
          placeholder="Search by name or email"
          prefix={<SearchOutlined />}
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
          style={{
            width: 260,
          }}
        />

        {/* Batch */}
        <Select
          placeholder="All batches"
          value={filters.batch}
          onChange={(value) => handleChange("batch", value)}
          style={{
            width: 160,
          }}
        >
          <Option value="all">All batches</Option>

          {batches.map((batch) => (
            <Option key={batch.id} value={batch.id}>
              {batch.name}
            </Option>
          ))}
        </Select>

        {/* Course */}
        <Select
          placeholder="All courses"
          value={filters.course}
          onChange={(value) => handleChange("course", value)}
          style={{
            width: 160,
          }}
        >
          <Option value="all">All courses</Option>

          {courses.map((course) => (
            <Option key={course.id} value={course.id}>
              {course.name}
            </Option>
          ))}
        </Select>

        {/* Group */}
        <Select
          placeholder="All groups"
          value={filters.group}
          onChange={(value) => handleChange("group", value)}
          style={{
            width: 160,
          }}
        >
          <Option value="all">All groups</Option>

          {groups.map((group) => (
            <Option key={group.id} value={group.id}>
              {group.name}
            </Option>
          ))}
        </Select>

        {/* Status */}
        <Select
          placeholder="All statuses"
          value={filters.status}
          onChange={(value) => handleChange("status", value)}
          style={{
            width: 160,
          }}
        >
          <Option value="all">All statuses</Option>

          <Option value="active">Active</Option>

          <Option value="inactive">Inactive</Option>
        </Select>

        {/* Tags Multi Select */}
        <Select
          mode="multiple"
          placeholder="All tags"
          value={filters.tags}
          onChange={(value) => handleChange("tags", value)}
          style={{
            width: 200,
          }}
          tagRender={(props) => (
            <Tag color="blue" closable={props.closable} onClose={props.onClose}>
              {props.label}
            </Tag>
          )}
        >
          <Option value="mentor">Peer Mentor</Option>

          <Option value="atrisk">At Risk</Option>

          <Option value="support">Needs Support</Option>
        </Select>
      </Space>
    </div>
  );
}

export default FilterStudent;
