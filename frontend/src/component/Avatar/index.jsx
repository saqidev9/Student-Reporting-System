import "./elements.style.css";
const getChars = (str) => {
  const trimmed = str.trim();

  if (!trimmed) return "**"; // Guard Clause

  const split = trimmed.split(" ");

  if (split.length === 1) {
    const first = trimmed[0].toUpperCase();
    const second = trimmed[1].toLowerCase();

    return first + second;
  } else {
    const first = split.at(0)[0].toUpperCase();
    const second = split.at(-1)[0].toUpperCase();

    return first + second;
  }
};

const Avatar = ({
  name,
  imgSrc,
  fontSize = "14px",
  dim = "40px",
  style = {},
}) => {
  const styleObj = {
    width: dim,
    fontSize,
    ...style,
  };

  if (imgSrc) {
    styleObj.backgroundImage = `url(${imgSrc})`;
  }

  //   !imgSrc && delete styleObj.backgroundImage;

  return (
    <div className="avatar" style={styleObj} title={name}>
      {!imgSrc && getChars(name)}
    </div>
  );
};

export default Avatar;
