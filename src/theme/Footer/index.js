import React from "react";
import Footer from "@theme-original/Footer";
import Docsly from "@docsly/react";
import "@docsly/react/styles.css";
import { useLocation } from "@docusaurus/router";

export default function FooterWrapper(props) {
  const { pathname } = useLocation();
  return (
    <>
      <Footer {...props} />
      <Docsly
        publicId="pk_Hke0J0fOA1YJapM3nZqXlpuevvwrTWv8wQA1z5jfkBJ4LbEM"
        pathname={pathname}
      />
    </>
  );
}
