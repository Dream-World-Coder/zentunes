# Zentunes 

![ZenTunes Preview](https://zentunes.vercel.app/preview-image.png)

**Zentunes** is a modern, ad-free YouTube streaming experience built with **Next.js** and **SCSS**. It leverages the YouTube Data API to provide a seamless, distraction-free interface for watching your favorite videos.

> **Note:** This project is intended for personal use and educational purposes.

## Demo

Check out the live application: **[ZenTunes Live](https://zentunes.vercel.app)**

## Features

- **Ad-Free Experience**: Enjoy videos without interruptions.
- **Search Functionality**: Instantly search for any video available on YouTube.
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices using custom SCSS.
- **High Performance**: Built on Next.js for server-side rendering and fast load times.
- **Video Player**: Custom video player integration for a smooth viewing experience.
- **Related Videos**: Discover new content with related video recommendations.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Language:** JavaScript
- **Styling:** SCSS (Sass)
- **API:** [YouTube Data API v3](https://developers.google.com/youtube/v3)
- **Deployment:** [Vercel](https://vercel.com/)

## Installation & Setup

Follow these steps to run the project locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A **YouTube Data API Key** from the [Google Cloud Console](https://console.cloud.google.com/).

### 1. Clone the Repository

```bash
git clone [https://github.com/Dream-World-Coder/zentunes.git](https://github.com/Dream-World-Coder/zentunes.git)
cd zentunes

```

### 2. Install Dependencies

```bash
npm install
# or
yarn install

```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory of the project. Add your YouTube API key:

```bash
GOOGLE_CLOUD_API_KEY=your_api_key_here
```

> **Important:** Make sure not to commit your `.env.local` file to GitHub to keep your API key secure.

### 4. Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```txt
zentunes  (git)-[main]- ➤ tree
.
├── LICENSE
├── README.md
├── data.txt
└── next-app
    ├── eslint.config.mjs
    ├── jsconfig.json
    ├── next.config.mjs
    ├── package.json
    ├── pnpm-lock.yaml
    ├── public
    │   ├── favicon.ico
    │   ├── favicon.png
    │   ├── icons
    │   │   ├── icon-128x128-maskable.png
    │   │   ├── icon-128x128.png
    │   │   ├── icon-192x192-maskable.png
    │   │   ├── icon-384x384-maskable.png
    │   │   ├── icon-512x512-maskable.png
    │   │   ├── icon-512x512.png
    │   │   ├── icon-72x72.png
    │   │   └── icon-96x96.png
    │   ├── images
    │   │   ├── ham.svg
    │   │   ├── logo.svg
    │   │   ├── none.svg
    │   │   ├── pause.svg
    │   │   ├── play-next.svg
    │   │   ├── play.svg
    │   │   ├── repeat.svg
    │   │   └── shuffle.svg
    │   ├── manifest.json
    │   ├── preview-image.png
    │   └── robots.txt
    └── src
        ├── app
        │   ├── about
        │   │   └── page.jsx
        │   ├── contact
        │   │   └── page.jsx
        │   ├── globals.css
        │   ├── layout.jsx
        │   ├── not-found.jsx
        │   ├── page.jsx
        │   ├── search
        │   │   ├── api
        │   │   │   └── route.js
        │   │   ├── page.jsx
        │   │   └── search.scss
        │   ├── styles
        │   │   ├── home.scss
        │   │   └── music.scss
        │   └── watch
        │       ├── [id]
        │       │   └── page.jsx
        │       └── watch.scss
        ├── assets
        │   ├── data
        │   │   └── navItems.js
        │   └── fonts
        │       ├── Pally-Regular.woff2
        │       └── matter-light.woff2
        ├── components
        │   ├── CategoryPage.jsx
        │   ├── footer.jsx
        │   ├── footer.scss
        │   ├── header.jsx
        │   └── header.scss
        └── services
            ├── formatting.js
            ├── historyTracker.js
            └── ytData.js

19 directories, 53 files
```

## Routes
```txt
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
├ ○ /contact
├ ○ /search
├ ƒ /search/api
└ ƒ /watch/[id]


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

## Contributing

Contributions are welcome! If you have suggestions for improvements or bug fixes, feel free to open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Disclaimer

This application uses the YouTube Data API. By using this application, you agree to be bound by the [YouTube Terms of Service](https://www.youtube.com/t/terms). This project is not affiliated with, endorsed by, or connected to YouTube or Google.

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

**Created with ❤️ by [Dream-World-Coder](https://github.com/Dream-World-Coder)**

</div>

### How to use this:

1.  Copy the code block above.
2.  Go to your GitHub repository (`zentunes`).
3.  Edit (or create) the `README.md` file.
4.  Paste the content and save the changes.
