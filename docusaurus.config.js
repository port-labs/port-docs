// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer").themes.github;
const darkCodeTheme = require("prism-react-renderer").themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Port",
  tagline: "Port documentation",
  url: "https://docs.getport.io",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "throw",
  favicon: "img/logos/port-favicon.png",
  organizationName: "port-labs", // Usually your GitHub org/user name.
  projectName: "port", // Usually your repo name.
  staticDirectories: ["static"],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl: ({ locale, docPath }) => {
            return `https://github.com/port-labs/port-docs/edit/main/docs/${docPath}`;
          },
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        gtag: {
          trackingID: "G-3YL3X47R7L",
          anonymizeIP: false,
        },
        googleTagManager: {
          containerId: 'GTM-MNB6TPLF',
        },
        sitemap: {
          changefreq: "weekly",
          priority: 0.5,
          ignorePatterns: ["/tags/**"],
          filename: "sitemap.xml",
        },
      }),
    ],
    // Currently disabled because redocusaurus fails parsing our OpenAPI spec
    // [
    //   "redocusaurus",
    //   {
    //     // Plugin Options for loading OpenAPI files
    //     specs: [
    //       {
    //         id: "port-api",
    //         spec: "https://api.getport.io/yaml",
    //       },
    //     ],
    //     // Theme Options for modifying how redoc renders them
    //     theme: {
    //       // Change with your site colors
    //       primaryColor: "#1890ff",
    //       primaryColorDark: "#1890ff",
    //       theme: {
    //         typography: {
    //           fontFamily: "Inter",
    //         },
    //       },
    //     },
    //   },
    // ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Port Documentation",
        logo: {
          alt: "Port Logo",
          src: "img/logos/port-logo.svg",
          srcDark: "img/logos/port-logo-dark.svg",
        },
        items: [
          {
            to: "https://demo.getport.io",
            position: "right",
            target: "_blank",
            className: "header-demo-link",
          },
          {
            to: "https://github.com/port-labs/port-docs",
            position: "right",
            target: "_blank",
            className: "header-github-link",
          },
          {
            to: "https://www.getport.io/community",
            position: "right",
            target: "_blank",
            className: "header-slack-link",
          },
        ],
      },
      hotjar: {
        applicationId: 3649439,
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Documentation",
            items: [
              {
                label: "Port overview",
                to: "/",
              },
              {
                label: "Quickstart",
                to: "/quickstart",
              },
              {
                label: "Build a software catalog",
                to: "/build-your-software-catalog",
              },
              {
                label: "Create self-service actions",
                to: "/create-self-service-experiences",
              },
              {
                label: "Promote scorecards",
                to: "/promote-scorecards",
              },
              {
                label: "Search & query",
                to: "/search-and-query",
              },
              {
                label: "API reference",
                to: "/api-reference",
              },
            ],
          },
          {
            title: "Ingest data to catalog",
            items: [
              {
                label: "API",
                to: "/build-your-software-catalog/custom-integration/api",
              },
              {
                label: "CI/CD",
                to: "/build-your-software-catalog/sync-data-to-catalog/ci-cd",
              },
              {
                label: "Kubernetes",
                to: "/build-your-software-catalog/sync-data-to-catalog/kubernetes",
              },
              {
                label: "Git",
                to: "/build-your-software-catalog/sync-data-to-catalog/git",
              },
              {
                label: "AWS",
                to: "/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws",
              },
              {
                label: "Terraform",
                to: "/build-your-software-catalog/sync-data-to-catalog/iac/terraform",
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
              {
                label: "DevEx Community",
                href: "https://join.slack.com/t/devex-community/shared_invite/zt-1bmf5621e-GGfuJdMPK2D8UN58qL4E_g",
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
                label: "Demo",
                href: "https://demo.getport.io",
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
      colorMode: {
        defaultMode: "dark",
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      zoom: {
        selector: ".markdown img",
        background: {
          light: "rgb(255, 255, 255)",
          dark: "rgb(50, 50, 50)",
        },
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: [
          "hcl",
          "groovy",
          "bash",
          "yaml",
          "json",
          "python",
          "javascript",
          "go",
          "typescript",
          "jq"
        ],
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
      algolia: {
        // The application ID provided by Algolia
        appId: "VHYI0G637S",
        // Public API key: it is safe to commit it
        apiKey: "1bacc12054c0224408f2be6b60d697c9",
        indexName: "getport",
        contextualSearch: true,
      },
    }),
  themes: [
    // [
    //   require.resolve("@easyops-cn/docusaurus-search-local"),
    //   {
    //     hashed: true,
    //     indexDocs: true,
    //     indexBlog: false,
    //     docsRouteBasePath: "/",
    //   },
    // ],
  ],

  plugins: [
    require.resolve("docusaurus-plugin-image-zoom"),
    "@docusaurus/theme-live-codeblock",
    "docusaurus-plugin-hotjar",
    "@stackql/docusaurus-plugin-hubspot",
    [
      "@docusaurus/plugin-client-redirects",
      {
        createRedirects(existingPath) {
          console.log("path is:", existingPath);
          if (!existingPath.includes("/docs") && existingPath !== "/") {
            // Support URLs without /docs prepended and route them to /docs
            return [existingPath.replace("/", "/docs/", 1)];
          }
          return undefined;
        },
      },
    ],
    [
      "@docusaurus/plugin-ideal-image",
      {
        quality: 70,
        max: 1000, // max resized image's size.
        min: 300, // min resized image's size. if original is lower, use that size.
        steps: 7, // the max number of images generated between min and max (inclusive)
        disableInDev: false,
      },
    ],
    "./src/plugins/intercom.js",
  ],
};

module.exports = config;
