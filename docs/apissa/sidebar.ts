import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "apissa/port-api",
    },
    {
      type: "category",
      label: "Entities",
      items: [
        {
          type: "doc",
          id: "apissa/create-entities",
          label: "Create entities",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "apissa/get-all-blueprints-entities",
          label: "Get all blueprint's entities",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apissa/patch-an-entity",
          label: "Patch an entity",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "apissa/change-an-entities",
          label: "Change an entities",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "apissa/get-an-entity",
          label: "Get an entity",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apissa/delte-a-blueprints-entity",
          label: "Delte a blueprint's entity",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "apissa/get-blueprints-entity-count",
          label: "Get blueprint's entity count",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apissa/delete-all-entities-of-blueprint",
          label: "Delete all entities of blueprint",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "apissa/search-entities",
          label: "Search entities",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "apissa/aggregate-entities",
          label: "Aggregate entities",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
