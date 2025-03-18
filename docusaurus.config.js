// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer").themes.github;
const darkCodeTheme = require("prism-react-renderer").themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Port",
  tagline: "Port documentation",
  url: "https://docs.port.io",
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
          docRootComponent: "@theme/DocRoot",
          docItemComponent: "@theme/ApiItem",
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
            to: "/",
            label: "Home",
            position: "left",
            className: "header-home-link",
            activeBaseRegex: "^((?!api-reference|guides).)*$",
          },
          {
            to: "/api-reference/port-api",
            label: "API Reference",
            position: "left",
            className: "header-api-link",
            activeBasePath: "api-reference",
          },
          {
            to: "/guides",
            label: "Guides",
            position: "left",
            className: "header-guides-link",
            activeBasePath: "guides",
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
          {
            to: "https://www.youtube.com/@getport",
            position: "right",
            target: "_blank",
            className: "header-youtube-link",
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
                to: "/getting-started/overview",
              },
              {
                label: "Build a software catalog",
                to: "/build-your-software-catalog",
              },
              {
                label: "Create self-service actions",
                to: "/actions-and-automations/create-self-service-experiences",
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
                to: "/api-reference/port-api",
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
                to: "/build-your-software-catalog/custom-integration/api/ci-cd",
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
                to: "/build-your-software-catalog/custom-integration/iac/terraform",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Slack",
                href: "https://www.getport.io/community",
              },
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
                label: "Release notes",
                href: "https://roadmap.getport.io/changelog",
              },
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
        copyright: `Copyright © ${new Date().getFullYear()} Port, Inc.`,
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
        selector: ".markdown img:not(.not-zoom)",
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
      // algolia: {
      //   // The application ID provided by Algolia
      //   appId: "VHYI0G637S",
      //   // Public API key: it is safe to commit it
      //   apiKey: "1bacc12054c0224408f2be6b60d697c9",
      //   indexName: "getport",
      //   contextualSearch: true,
      // },
      announcementBar: {
        id: 'port_ctas',
        content: " ",
        backgroundColor: '#000000',
        textColor: '#FFFFFF',
        isCloseable: false,
      },
    }),
  themes: [
    "docusaurus-theme-openapi-docs", 
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        indexBlog: false,
        indexDocs: true,
        docsRouteBasePath: "/",
        hashed: true,
        explicitSearchResultPath: true,
      },
    ]
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
          if (!existingPath.includes("/docs") && existingPath !== "/") {
            return [existingPath.replace("/", "/docs/", 1)];
          }
          return undefined;
        },
      },
    ],
    [
      "docusaurus-plugin-openapi-docs",
      {
        id: "api",
        docsPluginId: "classic",
        config: {
          port: {
            specPath: './static/apispec.yaml',
            outputDir: "docs/api-reference-temp",
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
            baseUrl: "/api-reference/"
          },
        }
      },
    ],
    [
      "@docusaurus/plugin-ideal-image",
      {
        quality: 70,
        max: 1000,
        min: 300,
        steps: 7,
        disableInDev: false,
      },
    ],
    "./src/plugins/intercom.js",
  ],

  scripts: [
    {
      src: "https://widget.kapa.ai/kapa-widget.bundle.js",
      "data-website-id": "1aefba51-348e-4747-9a4c-93306459542d",
      "data-project-name": "Port-documentation",
      "data-user-analytics-fingerprint-enabled": "true",
      "data-project-color": "#FFFFFF",
      "data-project-logo": "https://raw.githubusercontent.com/port-labs/port-docs/refs/heads/main/static/img/logos/port-logo.svg",
      "data-button-hide": "true",
      "data-modal-override-open-class": "ask-kapa-button",
      "data-modal-title": "Port AI Assistant",
      "data-modal-ask-ai-input-placeholder": "Ask me anything about Port...",
      "data-submit-query-button-bg-color": "#000000",
      "data-modal-example-questions": "How can I create a table that shows all services belonging to my team?, Write me a scorecard definition that ensures each repository has a readme file, Which SSO providers are supported?, How can I install Port's Datadog integration without using k8s?",
      "data-font-family": "DM Sans",
      "data-modal-disclaimer": "This AI assistant has full access to Port's documentation and API references.\nPlease note that answers may not be fully accurate.\n\nWe would appreciate your feedback (👍🏽/👎🏽) on answers you receive in order to improve the results 🙏🏽",
      "data-modal-example-questions-title": "Example Questions",
      "data-modal-example-questions-col-span": "12",
      "data-modal-disclaimer-font-size": "0.85rem",
      "data-example-question-button-font-size": "0.85rem",
      // "data-search-mode-enabled": "true",
      // "data-modal-search-input-placeholder": "What are you looking for?",
      // "data-modal-title-search": "Search Port's documentation",
      // "data-search-result-secondary-text-color": "#000000",
      // "data-search-result-primary-text-color": "#000000",
      async: true,
    }
  ],
};

module.exports = config;
