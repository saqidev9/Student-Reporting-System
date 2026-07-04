export const Batches = [];
export const COURSES = [];
export const GROUPS = [];

export const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "draft", label: "Draft" },
  { value: "needs_revision", label: "Needs Revision" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export const SUBMISSION_OPTIONS = [
  { value: "on_time", label: "On Time" },
  { value: "late", label: "Late" },
  { value: "missing", label: "Missing" },
];

export const STATUS_CONFIG = {
  pending: { color: "orange", label: "Pending" },
  draft: { color: "default", label: "Draft" },
  needs_revision: { color: "purple", label: "Needs Revision" },
  approved: { color: "green", label: "Approved" },
  rejected: { color: "red", label: "Rejected" },
};

export const SUBMISSION_CONFIG = {
  on_time: { color: "green", label: "On Time" },
  late: { color: "orange", label: "Late" },
  missing: { color: "red", label: "Missing" },
};

export const INITIAL_FILTERS = {
  search: "",
  batch: null,
  course: null,
  group: null,
  status: null,
  submission: null,
  dateFrom: "",
  dateTo: "",
  scoreMin: "",
  scoreMax: "",
};
