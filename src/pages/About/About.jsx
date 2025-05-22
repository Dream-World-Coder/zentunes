import CategoryPage from "../../components/CategoryPage";

export default function AboutPage() {
    const helmetObj = {
        title: "About",
        description: "About zentunes",
        robotsTxt: "index, follow",
        currentUrl: "https://zentunes.netlify.app/about",
        cannonical: "https://zentunes.netlify.app/about",
        previewImagePath: "/preview-image.png",
        mainEntityType: "AboutPage",
    };
    const pageHeading = helmetObj.title;
    const pageDescription = `
        Welcome.<br/><br/>
        I&apos;am glad you&apos;ve found your way here.<br/>
        In a world that often moves too quickly, filled with noise and constant demands for our attention,
        I envisioned a quiet corner – a digital sanctuary where sound could be a source of peace and gentle reflection.
        This is the heart of <b>Zentunes</b>, a space carefully curated for those who seek solace in melody and comfort
        in the echoes of the familiar.<br/><br/>

        In <b>Zentunes</b> you will find a collection of beautiful melodies in a calm attire of nostalgia.
        I really love to hear these, I&apos;m sure you will get a soothing experience too.
        I invite you to explore, listen, and let the sounds envelop you.
        May you find stillness, comfort, and perhaps a few beautiful memories along the way.<br/><br/>

        Warmly,<br/>
        Team Zentunes`;

    return (
        <CategoryPage
            helmetObj={helmetObj}
            pageHeading={pageHeading}
            pageDescription={pageDescription}
        />
    );
}
