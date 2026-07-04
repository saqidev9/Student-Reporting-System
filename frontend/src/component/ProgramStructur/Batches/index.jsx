import { useEffect, useState } from "react";
import BatchList from "./BatchList";
import BatchDetails from "./elements/BatchDetails";
import AssignedCourses from "./elements/AssignedCourses";
import EmptyBatchState from "./elements/EmptyBatchState";
import SuccessToast from "./elements/SuccessToast";
import NewBatchModal from "./elements/NewBatchModal";
import AddCourseModal from "./elements/AddCourseModal";
import Courses from "../Courses";
// ─── New Batch Modal ───────────────────────────────────────────────────────────

// ─── Main Batches Component ────────────────────────────────────────────────────
function Batches({ batches, setBatches }) {
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [expandedBatchId, setExpandedBatchId] = useState(null); // FIX: controls which batch is expanded in left panel
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);

  function handleNewBatch(newBatch) {
    setBatches((prev) => [...prev, newBatch]);
    setSelectedBatch(newBatch);
    setShowModal(false);
    setSuccessMessage(`"${newBatch.name}" created successfully!`);
    setTimeout(() => setSuccessMessage(""), 3000);
  }

  // useEffect(() => {
  //   fetchBatches();
  // }, []);
  // const fetchBatches = async () => {
  //   const token = localStorage.getItem("token");
  //   try {
  //     setLoading(true);
  //     const response = await fetch(
  //       "http://localhost:3000/api/program/batches",
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       },
  //     );
  //     const data = await response.json();
  //     console.log(data);
  //     setBatches(data.data.batches);
  //   } catch (error) {
  //     console.error("Failed to load batches:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="grid grid-cols-12 gap-5 mt-6 relative">
      {/* ── Success toast ── */}
      <SuccessToast message={successMessage} />

      {/* ── Modal ── */}
      {showModal && (
        <NewBatchModal
          batches={batches}
          onClose={() => setShowModal(false)}
          onSubmit={handleNewBatch}
        />
      )}
      {showAssignModal && (
        <AddCourseModal
          batch={selectedBatch}
          onClose={() => setShowAssignModal(false)}
        />
      )}

      {/* ── LEFT PANEL ── */}
      <div className="col-span-4">
        <BatchList
          batches={batches}
          selectedBatch={selectedBatch}
          expandedBatchId={expandedBatchId}
          setSelectedBatch={setSelectedBatch}
          setExpandedBatchId={setExpandedBatchId}
          onNewBatch={() => setShowModal(true)}
        />
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="col-span-8 space-y-5">
        {selectedBatch === null ? (
          <EmptyBatchState />
        ) : (
          <>
            <BatchDetails batch={selectedBatch} />

            {/* Assigned courses card */}
            <AssignedCourses
              batch={selectedBatch}
              onAssignCourse={() => setShowAssignModal(true)}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Batches;
