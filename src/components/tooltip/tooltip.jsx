import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { useColorMode } from "@docusaurus/theme-common";

const glossary = {
  entity:
    '💡 <b>Port Concepts</b><br/><b>Entity</b> - An instance of a <a class="tooltip-link" href="https://docs.port.io/build-your-software-catalog/define-your-data-model/setup-blueprint/#what-is-a-blueprint"><b>blueprint</b></a>, represents data as defined by that blueprint\'s properties. <a class="tooltip-link" href="https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/#entities">Learn more</a>',
  blueprint:
    "💡 <b>Port Concepts</b><br/><b>Blueprint</b> - A schema definition used to model any type of asset in your software catalog. <a class='tooltip-link' href='https://docs.port.io/build-your-software-catalog/define-your-data-model/setup-blueprint/#what-is-a-blueprint'>Learn more</a>",
  dataSource:
    "💡 <b>Port Concepts</b><br/><b>Data Source</b> - A configurable connection to an external tool/platform, allowing Port to fetch data from it. <a class='tooltip-link' href='https://docs.port.io/build-your-software-catalog/customize-integrations/configure-mapping#how-does-mapping-work'>Learn more</a>",
  scorecard:
    "💡 <b>Port Concepts</b><br/><b>Scorecard</b> - A set of custom rules used to define and track standards for your assets.",
  dashboard:
    "💡 <b>Port Concepts</b><br/><b>Dashboard</b> - A page containing one or more <a class='tooltip-link' href='https://docs.port.io/customize-pages-dashboards-and-plugins/dashboards/'>widgets</a> that visualize data about your entities.",
  widget:
    "💡 <b>Port Concepts</b><br/><b>Widget</b> - A visual representation of data about your entities. <a class='tooltip-link' href='https://docs.port.io/customize-pages-dashboards-and-plugins/dashboards/'>Learn more</a>",
  catalog:
    "💡 <b>Port Concepts</b><br/><b>Software Catalog</b> - A central metadata store for your assets. Reflects your data model and is used to track and manage your assets.",
  jq:
    '💡 <b>Port Concepts</b><br/><b>JQ</b> - A lightweight JSON processor, used in Port to parse, map, and manipulate data. See <a href="https://jqlang.github.io/jq/" style="color:#30BFBF"><b>JQ docs</b></a> for more information.',
  action:
    "💡 <b>Port Concepts</b><br/><b>Action</b> - A mechanism to define custom, reusable logic that portal users can execute. <a class='tooltip-link' href='https://docs.port.io/actions-and-automations/create-self-service-experiences/'>Learn more</a>",
  dataset:
    "💡 <b>Port Concepts</b><br/><b>Dataset</b> - A filtering mechanism for entity inputs comprising two properties: a combinator, and rules.",
  relation:
    '💡 <b>Port Concepts</b><br/><b>Relation</b> - A mechanism to define the connections between <a href="https://docs.port.io/build-your-software-catalog/define-your-data-model/setup-blueprint/#what-is-a-blueprint" style="color:#30BFBF"><b>blueprints</b></a>, consequently connecting the entities based on these blueprints. <a class="tooltip-link" href="https://docs.port.io/build-your-software-catalog/define-your-data-model/relate-blueprints/">Learn more</a>',
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
