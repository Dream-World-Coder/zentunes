import CategoryPage from "../components/CategoryPage";

export default function NotFoundPage() {
    const helmetObj = {
        title: "Page not found",
        description: "404 zentunes",
        robotsTxt: "index, follow",
        currentUrl: window.location.href,
        cannonical: window.location.href,
        previewImagePath: "/preview-image.png",
        mainEntityType: "WebPage",
    };
    const pageHeading = helmetObj.title;
    const pageDescription = `
        The page you are looking for could not be found. Check the url again for typos.
        <br/>
        Error 404`;

    return (
        <CategoryPage
            helmetObj={helmetObj}
            pageHeading={pageHeading}
            pageDescription={pageDescription}
        />
    );
}
