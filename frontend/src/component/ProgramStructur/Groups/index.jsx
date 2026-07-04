import React, { useEffect, useState } from "react";
import { Select } from "antd";
import GroupList from "./GroupList";
import GroupModal from "./GroupModal";

function Groups() {
  const [groups, setGroups] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectBatch, setSelectBatch] = useState(null);
  const [selectCourse, setSelectCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBatches();
    fetchGroups();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/program/batches",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const result = await response.json();
      setBatches(result.data.batches || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/program/groups", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const result = await response.json();
      setGroups(result.data.groups || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  // Derive courses from selected batch — no separate fetch needed
  const filterCourses = selectBatch
    ? batches.find((b) => b.id === selectBatch)?.courses || []
    : [];

  // Filter groups by selected batch and course
  const filteredGroups = groups.filter((group) => {
    const batchMatch = selectBatch ? group.batchId === selectBatch : true;
    const courseMatch = selectCourse ? group.courseId === selectCourse : true;
    return batchMatch && courseMatch;
  });

  return (
    <>
      <div className="p-4 border border-[#e5e7eb] bg-white rounded-lg flex items-center gap-3">
        <Select
          value={selectBatch}
          placeholder="Select Batch"
          className="flex-1"
          onChange={(value) => {
            setSelectBatch(value);
            setSelectCourse(null);
          }}
          options={batches.map((batch) => ({
            label: batch.name,
            value: batch.id,
          }))}
        />
        <Select
          value={selectCourse}
          placeholder={!selectBatch ? "Select batch first" : "Select Course"}
          disabled={!selectBatch}
          className="flex-1"
          onChange={(value) => setSelectCourse(value)}
          options={filterCourses.map((course) => ({
            label: course.name,
            value: course.id,
          }))}
        />
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#2563EB] text-white px-4 py-2 rounded-lg"
        >
          + New Group
        </button>
      </div>
      <div>
        <GroupList
          groups={filteredGroups}
          selectBatch={selectBatch}
          course={selectCourse}
          batches={batches}
        />
        {showModal && (
          <GroupModal
            setGroups={setGroups}
            onClose={() => setShowModal(false)}
            batches={batches}
          />
        )}
      </div>
    </>
  );
}

export default Groups;
