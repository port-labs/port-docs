// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Port",
  tagline: "Documentation site",
  url: "https://docs.getport.io",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "throw",
  favicon: "img/favicon.svg",
  organizationName: "port-labs", // Usually your GitHub org/user name.
  projectName: "port", // Usually your repo name.
  staticDirectories: ["static"],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/docs",
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // editUrl: "https://github.com/port-labs",
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        gtag: {
          trackingID: "UA-225507431-1",
          anonymizeIP: false,
        },
        sitemap: {
          changefreq: "weekly",
          priority: 0.5,
          ignorePatterns: ["/tags/**"],
          filename: "sitemap.xml",
        },
      }),
    ],
    [
      "redocusaurus",
      {
        // Plugin Options for loading OpenAPI files
        specs: [
          {
            spec: "https://api.getport.io/yaml",
            route: "/docs/api-reference/",
          },
        ],
        // Theme Options for modifying how redoc renders them
        theme: {
          // Change with your site colors
          primaryColor: "#1890ff",
          primaryColorDark: "#1890ff",
          theme: {
            typography: {
              fontFamily: "Inter",
            },
          },
        },
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Port Documentation",
        logo: {
          alt: "Port Logo",
          src: "img/logo.svg",
        },
        items: [
          // {
          //   type: "doc",
          //   docId: "welcome/quickstart",
          //   position: "left",
          //   label: "Tutorial",
          // },
          // { to: "/blog", label: "Blog", position: "left" },
          {
            href: "https://github.com/port-labs",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Documentation",
            items: [
              {
                label: "Quickstart",
                to: "/docs/",
              },
              {
                label: "Tutorials",
                to: "/docs/tutorials",
              },
              {
                label: "Integrations",
                to: "/docs/integrations",
              },
            ],
          },
          {
            title: "Complete Use Cases",
            items: [
              {
                label: "Software Catalog",
                to: "/docs/complete-use-cases/software-catalog",
              },
              {
                label: "Service Locking",
                to: "/docs/complete-use-cases/service-locking",
              },
              {
                label: "Software Templates",
                to: "/docs/complete-use-cases/software-templates",
              },
              {
                label: "IaC Templates",
                to: "/docs/complete-use-cases/iac-templates",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Twitter",
                href: "https://twitter.com/tweetsbyport",
              },
              {
                label: "Linkedin",
                href: "https://www.linkedin.com/company/getport/",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                href: "https://www.getport.io/blog",
              },
              {
                label: "GitHub",
                href: "https://github.com/port-labs",
              },
              {
                label: "Port",
                href: "https://getport.io",
              },
            ],
          },
          {
            title: "Legal",
            items: [
              {
                label: "Terms of Service",
                href: "https://getport.io/legal/terms-of-service",
              },
              {
                label: "Privacy Policy",
                href: "https://getport.io/legal/privacy-policy",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Port, Inc. Built with Docusaurus.`,
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 6,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ["hcl"],
      },
      liveCodeBlock: {
        /**
         * The position of the live playground, above or under the editor
         * Possible values: "top" | "bottom"
         */
        playgroundPosition: "bottom",
      },
      hubspot: {
        accountId: 21928972,
      },
    }),
  themes: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        docsRouteBasePath: "/docs",
      },
    ],
  ],

  plugins: [
    "@docusaurus/theme-live-codeblock",
    "@stackql/docusaurus-plugin-hubspot",
    [
      "@docusaurus/plugin-client-redirects",
      {
        createRedirects(existingPath) {
          console.log("path is:", existingPath);
          if (existingPath.includes("/docs") && existingPath !== "/") {
            // Support URLs without /docs prepended and route them to /docs
            return [existingPath.replace("/docs/", "/")];
          }
          return undefined;
        },
      },
    ],
  ],
};

module.exports = config;
