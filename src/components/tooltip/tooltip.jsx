import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { useColorMode } from "@docusaurus/theme-common";

const glossary = {
  entity:
    '💡 <b>Port Concepts</b><br/><b>Entity</b> - An instance of a <a href="https://docs.getport.io/build-your-software-catalog/define-your-data-model/setup-blueprint/#what-is-a-blueprint" style="color:#30BFBF"><b>blueprint</b></a>, represents data as defined by that blueprint\'s properties.',
  blueprint:
    "💡 <b>Port Concepts</b><br/><b>Blueprint</b> - A schema definition used to model any type of asset in your software catalog.",
  scorecard:
    "💡 <b>Port Concepts</b><br/><b>Scorecard</b> - A set of custom rules used to define and track standards for your assets.",
  catalog:
    "💡 <b>Port Concepts</b><br/><b>Software Catalog</b> - A central metadata store for your assets. Reflects your data model and is used to track and manage your assets.",
  action:
    "💡 <b>Port Concepts</b><br/><b>Action</b> - A mechanism to trigger reusable logic that interacts with your environment.",
};

const PortTooltip = ({ id, children }) => {
  const { colorMode, setColorMode } = useColorMode();

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
        opacity={1}
        variant={colorMode === "dark" ? "light" : "dark"}
        style={{ borderRadius: "10px 10px 10px 10px", zIndex: 99 }}
      ></Tooltip>
    </>
  );
};

export default PortTooltip;
