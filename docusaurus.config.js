// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Port",
  tagline: "Documentation Portal",
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
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   editUrl: "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        // },
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
            route: "/api-reference/",
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
          // {
          //   title: "Docs",
          //   items: [
          //     {
          //       label: "Tutorial",
          //       to: "/docs/intro",
          //     },
          //   ],
          // },
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
  ],
};

module.exports = config;
