import React from "react";
import FilterBar from "../FilterBar";
import SummaryPills from "../SummreyPill";
import ReportsTable from "../ReportTable";

function ReportsTabContent({
  filters,
  onChange,
  reports, // full unfiltered list (for pill counts)
  data, // tab+filter result (for table)
  loading,
  activeStatus,
  onStatusClick,
  groupMap,
  batches,
  courses,
  groups,
}) {
  return (
    <div className="space-y-4">
      <FilterBar
        filters={filters}
        onChange={onChange}
        batches={batches}
        courses={courses}
        groups={groups}
      />
      <SummaryPills
        reports={reports}
        activeStatus={activeStatus}
        onStatusClick={onStatusClick}
      />
      <ReportsTable data={data} loading={loading} groupMap={groupMap} />
    </div>
  );
}

export default React.memo(ReportsTabContent);
