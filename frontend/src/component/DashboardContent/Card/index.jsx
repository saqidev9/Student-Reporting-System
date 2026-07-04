import React from "react";
import "./Card.style.css";

function Card({
  label,
  value,
  hint,
  icon: Icon,
  iconBgColor,
  iconColor,
  link,
}) {
  return (
    <div
      id="Card-box"
      className="flex flex-col gap-[10px] mt-4 px-[18px] py-[20px] w-[300px] rounded-[12px] border-[1px] border-[#e5e7eb] bg-white shadow-sm"
    >
      <div className="flex items-center gap-3.5">
        <div
          className="flex items-center justify-center w-[34px] h-[34px] rounded-[8px]"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon style={{ color: iconColor, fontSize: "18px" }} />
        </div>
        <h2 className="font-bold text-[#4b5563]">{label}</h2>
      </div>

      <div id="Count">
        <h1 className="text-[#4b5563] text-[30px] font-bold">{value}</h1>
      </div>

      <div>
        {link ? (
          <a
            href={link.href}
            className="text-blue-500 text-[13px] hover:underline"
          >
            {link.text}
          </a>
        ) : (
          <h2 className="text-[#9ca3af] text-[12px]">{hint}</h2>
        )}
      </div>
    </div>
  );
}

export default Card;
