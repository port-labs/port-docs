import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

const glossary = {
  entity:
    '💡 Port Concepts<br/><b>Entity</b> - An instance of a <a href="sdfas.com" style="color:aqua;">blueprint</a>, represents data as defined by that blueprint\'s properties.',
  blueprint:
    "💡 Port Concepts<br/><b>Blueprint</b> - A schema definition for any type of asset in your software catalog.",
};

const PortTooltip = ({ id, children }) => {
  return (
    <>
      <a
        style={{ fontWeight: "bold", textDecoration: "underline dotted" }}
        data-tooltip-id={id}
        data-tooltip-html={glossary[id]}
        data-tooltip-place="top"
      >
        {children}
      </a>

      <Tooltip
        id={id}
        className={"tooltip"}
        clickable={true}
        style={{ borderRadius: "10px 10px 10px 10px" }}
      ></Tooltip>
    </>
  );
};

export default PortTooltip;
