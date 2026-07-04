// Cycles through a palette based on tag index / id hash
// Colors match the UI design: soft backgrounds with colored text

const TAG_COLORS = [
  { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
  { bg: "bg-red-100", text: "text-red-600", border: "border-red-200" },
  { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
  { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
];

export function getTagColor(tagId) {
  // Simple hash from tag id string so same tag always gets same color
  let hash = 0;
  for (let i = 0; i < tagId.length; i++) {
    hash = (hash * 31 + tagId.charCodeAt(i)) % TAG_COLORS.length;
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export function getAvatarInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-red-500",
];

export function getAvatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
