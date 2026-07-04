// src/component/AllReports/index.jsx

import React, { useState, useMemo } from "react";
import { Tabs } from "antd";
import { useReportsData } from "./hooks/useReportData";
import { useReportsFilter } from "./hooks/useFilteredReport";
import ReportsTabContent from "./ReportTabContent";

function AllReports() {
  const [activeTab, setActiveTab] = useState("1");

  const { reports, loading, batches, courses, groups } = useReportsData();

  // FIX Bug #13: removed UseGroupData() — groups already fetched above.
  // Derive groupMap here instead of making a second network request.
  const groupMap = useMemo(
    () => Object.fromEntries(groups.map((g) => [g.id, g.name])),
    [groups],
  );

  const {
    filters,
    activeStatus,
    handleChange,
    setActiveStatus,
    tabFilteredReports,
  } = useReportsFilter(reports, activeTab);

  const sharedProps = {
    filters,
    onChange: handleChange,
    reports,
    data: tabFilteredReports,
    loading,
    activeStatus,
    onStatusClick: setActiveStatus,
    groupMap,
    batches,
    courses,
    groups,
  };

  const items = [
    {
      key: "1",
      label: <span className="text-sm font-medium">All</span>,
      children: <ReportsTabContent {...sharedProps} />,
    },
    {
      key: "2",
      label: <span className="text-sm font-medium">Pending Review</span>,
      children: <ReportsTabContent {...sharedProps} />,
    },
    {
      key: "3",
      label: <span className="text-sm font-medium">Needs Attention</span>,
      children: <ReportsTabContent {...sharedProps} />,
    },
  ];

  return (
    <div className="p-6 space-y-1">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900">Reports</h3>
        <p className="text-sm text-gray-400 mt-0.5">
          Review and evaluate student daily reports.
        </p>
      </div>
      <Tabs items={items} activeKey={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default AllReports;
