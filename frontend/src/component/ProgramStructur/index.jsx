import React, { useEffect, useState } from "react";
import { Tabs } from "antd";
import {
  AppstoreOutlined,
  FileTextOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import Batches from "./Batches";
import Courses from "./Courses";
import Groups from "./Groups";

function ProgramStructur() {
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/program/batches", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setBatches(
          data.data.batches.map((b) => ({
            ...b,
            courses: b.Courses ?? b.courses ?? [],
          })),
        );
      } catch (error) {
        console.error("Failed to fetch batches:", error);
      }
    };
    fetchBatches();
  }, []);

  const items = [
    {
      key: "1",
      label: (
        <div className="flex items-center  text-md font-medium">
          <AppstoreOutlined />
          <span>Batches</span>
        </div>
      ),
      children: <Batches batches={batches} setBatches={setBatches} />,
    },
    {
      key: "2",
      label: (
        <div className="flex items-center  text-md font-medium">
          <FileTextOutlined />
          <span>Courses</span>
        </div>
      ),
      children: <Courses batches={batches} />,
    },
    {
      key: "3",
      label: (
        <div className="flex items-center  text-md font-medium">
          <TeamOutlined />
          <span>Groups</span>
        </div>
      ),
      children: <Groups />,
    },
  ];

  return (
    <div className="p-4">
      <div>
        <h3 className="text-[22px] font-medium">All Reports</h3>
        <p className="text-xs text-[#4b5563]">
          Review and evaluate student daily reports.
        </p>
      </div>
      <div className="mt-4">
        <Tabs items={items} />
      </div>
    </div>
  );
}

export default ProgramStructur;
