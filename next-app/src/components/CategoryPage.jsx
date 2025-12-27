"use client";

import { memo } from "react";
import Head from "next/head";
import PropTypes from "prop-types";

const CategoryPage = memo(function CategoryPage({
  helmetObj,
  pageHeading,
  pageDescription,
}) {
  return (
    <>
      <Head>
        <title>{helmetObj.title}</title>
        <meta name="description" content={helmetObj.description} />
        <meta name="robots" content={helmetObj.robotsTxt} />
        <meta name="author" content="Subhajit Gorai" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={helmetObj.title} />
        <meta property="og:description" content={helmetObj.description} />
        <meta property="og:url" content={helmetObj.currentUrl} />
        <meta
          property="og:image"
          content={`https://zentunes.vercel.app${helmetObj.previewImagePath}`}
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={helmetObj.title} />
        <meta name="twitter:description" content={helmetObj.description} />
        <meta
          name="twitter:image"
          content={`https://zentunes.vercel.app${helmetObj.previewImagePath}`}
        />

        <link rel="canonical" href={helmetObj.cannonicalUrl} />
        <link rel="manifest" href="/manifest.json" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: helmetObj.title,
              url: helmetObj.currentUrl,
              description: helmetObj.description,
              publisher: {
                "@type": "Person",
                name: "Subhajit Gorai",
                url: "https://myopencanvas.in",
              },
              mainEntity: {
                "@type": helmetObj.mainEntityType,
              },
            }),
          }}
        />
      </Head>

      <section className="container">
        <h2 className="heading isr">{pageHeading}</h2>
        <p
          className="description"
          dangerouslySetInnerHTML={{ __html: pageDescription || "" }}
        ></p>
      </section>
    </>
  );
});

CategoryPage.propTypes = {
  helmetObj: PropTypes.object,
  pageHeading: PropTypes.string,
  pageDescription: PropTypes.string,
};

export default CategoryPage;
