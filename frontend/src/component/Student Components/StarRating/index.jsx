// component/Student Components/StarRating.jsx
import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

function StarRating({ rating = 0, max = 5, size = 14, color = "#f59e0b" }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i + 1 <= Math.floor(rating);
        const half = !filled && i < rating;
        return filled ? (
          <FaStar key={i} size={size} color={color} />
        ) : half ? (
          <FaStarHalfAlt key={i} size={size} color={color} />
        ) : (
          <FaRegStar key={i} size={size} color="#d1d5db" />
        );
      })}
    </div>
  );
}

export default StarRating;
