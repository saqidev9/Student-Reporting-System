import React from "react";
import { Avatar } from "antd";
import { Tag } from "antd";
import { Table } from "antd";
import { Button, Dropdown } from "antd";
import { useNavigate } from "react-router-dom";
import { MoreOutlined } from "@ant-design/icons";

// const students = [
//   {
//     id: 1,
//     name: "Ahmad Reyes",
//     email: "ahmad.reyes1@tensaidevs.com",
//     avatar: "https://i.pravatar.cc/150?img=1",

//     batch: "Batch 3",
//     course: "Web Development",
//     group: "Group A",

//     status: "Active",

//     tags: ["Quiet Contributor", "At Risk"],
//   },
//   {
//     id: 2,
//     name: "Saqi",
//     email: "saqi@tensaidevs.com",
//     avatar: "https://i.pravatar.cc/150?img=2",

//     batch: "Batch 4",
//     course: "Video Editing",
//     group: "Group B",

//     status: "Active",

//     tags: ["Top Performer"],
//   },
// ];
// Maps tag.id to an AntD color — same hash logic as TagList.jsx
const ANTD_COLORS = [
  "green",
  "gold",
  "red",
  "blue",
  "purple",
  "orange",
  "magenta",
  "cyan",
];

function getAntdTagColor(tagId = "") {
  let hash = 0;
  for (let i = 0; i < tagId.length; i++) {
    hash = (hash * 31 + tagId.charCodeAt(i)) % ANTD_COLORS.length;
  }
  return ANTD_COLORS[Math.abs(hash) % ANTD_COLORS.length];
}
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#6366F1,#8B5CF6)",
  "linear-gradient(135deg,#0EA5E9,#6366F1)",
  "linear-gradient(135deg,#F59E0B,#EF4444)",
  "linear-gradient(135deg,#10B981,#0EA5E9)",
  "linear-gradient(135deg,#EC4899,#8B5CF6)",
];

function getAvatarGradient(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % AVATAR_GRADIENTS.length;
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}
function RenderdStudenList({
  students,
  BatcheMap,
  courseMap,
  groupMap,
  onDeleteStudent,
  onEditStudent,
}) {
  const navigate = useNavigate();
  const getPrgramColumn = (BatcheMap, courseMap, groupMap) => ({
    title: "Batch / Course / Group",
    key: "program",
    render: (_, record) => {
      return (
        <div className="flex items-center gap-1 text-sm">
          <span className="text-gray-600 font-medium">
            {BatcheMap[record.batchId]}
          </span>
          <span className="text-gray-400">›</span>
          <span className="text-gray-600">{courseMap[record.courseId]}</span>
          <span className="text-gray-400">›</span>
          <span className="text-gray-500">{groupMap[record.groupId]}</span>
        </div>
      );
    },
  });
  const studentColumn = {
    title: "Student",
    key: "student",

    render: (_, record) => (
      <div className="flex items-center gap-3">
        <Avatar
          src={record.avatar}
          style={{ background: getAvatarGradient(record.id) }}
        >
          {record.name[0]}
        </Avatar>

        <div>
          <p className="font-medium">{record.name}</p>
          <p className="text-gray-500 text-sm">{record.email}</p>
        </div>
      </div>
    ),
  };

  const statusColumn = {
    title: "Status",
    key: "status",
    render: (_, record) => (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          record.isActive
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-600"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            record.isActive ? "bg-green-500" : "bg-red-500"
          }`}
        />
        {record.isActive ? "Active" : "Inactive"}
      </span>
    ),
  };

  const tagsColumn = {
    title: "Tags",
    key: "tags",
    render: (_, record) => (
      <div className="flex gap-2">
        {record.tags?.length ? (
          record.tags.map((tag) => (
            <Tag key={tag.id} color={getAntdTagColor(tag.id)}>
              {tag.name}
            </Tag>
          ))
        ) : (
          <span className="text-gray-400">No Tags</span>
        )}
      </div>
    ),
  };
  const ActionColumn = {
    title: "ACTIONS ",
    key: "actions",
    render: (_, record) => (
      <div className="flex items-center gap-4">
        <Button
          type="link"
          onClick={() => navigate(`/admin/students/${record.id}`)}
        >
          View
        </Button>

        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                label: "Edit",
              },
              {
                key: "delete",
                label: "Delete",
                danger: true,
              },
            ],
            onClick: ({ key }) => {
              if (key === "delete") {
                onDeleteStudent(record.id);
              }
              if (key === "edit") {
                onEditStudent(record);
              }
            },
          }}
        >
          <MoreOutlined />
        </Dropdown>
      </div>
    ),
  };

  const columns = [
    studentColumn,
    // console.log(studentColumn),
    getPrgramColumn(BatcheMap, courseMap, groupMap),
    statusColumn,
    tagsColumn,
    ActionColumn,
  ];
  return (
    <div>
      <Table
        columns={columns}
        dataSource={students}
        rowKey="id"
        pagination={true}
      />
    </div>
  );
}

export default RenderdStudenList;
