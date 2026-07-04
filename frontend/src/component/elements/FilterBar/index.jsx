import React, { useEffect, useState } from "react";
import { Input, Select, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Option } = Select;

function FilterBar({ values, onChange, fields }) {
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const BASE_URL = "http://localhost:3000";
        const token = localStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };
        const res = await fetch(BASE_URL + "/api/students", {
          headers,
        });
        const result = await res.json();
        console.log(result);
        setStudents(result.data.students);
        if (!res.ok) console.error(result.message);
        setStudentsLoading(false);
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchStudent();
  }, []);

  return (
    <div className="bg-white border-[#e5e7eb]  border rounded-xl p-4 mb-5">
      <div className="flex s flex-wrap gap-3">
        {/* student picker */}
        <div className="min-w-[200px]" style={{ flex: 2 }}>
          <Select
            showSearch
            allowClear
            placeholder="All students — pick one to see calendar"
            value={selectedStudent}
            onChange={setSelectedStudent}
            loading={studentsLoading}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            className="w-full"
          >
            {students.map((s) => (
              <Option key={s.id} value={s.id}>
                {s.name}
              </Option>
            ))}
          </Select>
        </div>

        {fields.map((field) => (
          <div
            key={field.key}
            className="min-w-[140px]"
            style={{ flex: field.flex || 1 }}
          >
            {field.type === "search" && (
              <Input
                placeholder={field.placeholder}
                prefix={<SearchOutlined />}
                value={values[field.key]}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="w-full"
              />
            )}

            {field.type === "select" && (
              <Select
                placeholder={field.placeholder}
                value={values[field.key]}
                onChange={(value) => onChange(field.key, value)}
                className="w-full"
              >
                {field.options.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            )}

            {field.type === "multiselect" && (
              <Select
                mode="multiple"
                placeholder={field.placeholder}
                value={values[field.key]}
                onChange={(value) => onChange(field.key, value)}
                className="w-full"
                tagRender={(props) => (
                  <Tag
                    color="blue"
                    closable={props.closable}
                    onClose={props.onClose}
                  >
                    {props.label}
                  </Tag>
                )}
              >
                {field.options.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FilterBar;
