const DOMAIN_STYLES = {
  programming: {
    bg: "#E6F1FB",
    color: "#0C447C",
    icon: "ti-code",
    label: "Programming",
  },
  designing: {
    bg: "#EEEDFE",
    color: "#3C3489",
    icon: "ti-vector-bezier",
    label: "Designing",
  },
  video_editing: {
    bg: "#FAECE7",
    color: "#712B13",
    icon: "ti-video",
    label: "Video editing",
  },
  professional_skills: {
    bg: "#EAF3DE",
    color: "#27500A",
    icon: "ti-briefcase",
    label: "Professional skills",
  },
};
function CategoryBadge({ category }) {
  const key = category?.toLowerCase().trim();
  const style = DOMAIN_STYLES[key];

  if (!style) return null;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        backgroundColor: style.bg,
        color: style.color,
        whiteSpace: "nowrap",
      }}
    >
      <i
        className={`ti ${style.icon}`}
        aria-hidden="true"
        style={{ fontSize: 13 }}
      />
      {style.label}
    </span>
  );
}

export default CategoryBadge;
