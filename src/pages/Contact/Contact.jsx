import CategoryPage from "../../components/CategoryPage";

export default function ContactPage() {
    const helmetObj = {
        title: "Contact",
        description: "Contact page of Zentunes",
        robotsTxt: "index, follow",
        currentUrl: "https://zentunes.netlify.app/contact",
        cannonical: "https://zentunes.netlify.app/contact",
        previewImagePath: "/preview-image.png",
        mainEntityType: "ContactPage",
    };
    const pageHeading = helmetObj.title;
    const pageDescription = `
        Hi,<br/>
        I'm Subhajit Gorai, the developer & maintainer of this site.
        Currently I am a CS undergraduate at IIEST Shibpur.
        This is mainly a personal project and I have not quite thought of anything else about <b>zentunes</b>.
        But in case if you have any suggestions or anything feel free to email me at blog.opencanvas@gmail.com.
        <br/><br/>
        Here are my other socials:<br/><br/>
        <ul>
            <li><a target="_blank" href="https://subhajit.pages.dev">My Portfolio</a></li>
            <li><a target="_blank" href="https://www.linkedin.com/in/subhajitgorai">LinkedIn</a></li>
            <li><a target="_blank" href="https://opencanvas.blog/u/subhajit">My Blog</a></li>
        </ul>
        <br/><br/>
        By the way, I'm always ready to build cool projects, so feel free to connect & collaborate.
        `;

    return (
        <CategoryPage
            helmetObj={helmetObj}
            pageHeading={pageHeading}
            pageDescription={pageDescription}
        />
    );
}
