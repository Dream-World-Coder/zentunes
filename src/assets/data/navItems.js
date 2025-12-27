export const navItems = [
  { title: "Home", href: "/" },
  {
    title: "Genres",
    href: "dropdown",

    // no need to fetch them, cuz as of now they should be fixed bcz of music-page-data, just songs inside will vary
    dropdownItems: [
      { title: "Nature", href: "/musics/nature" },
      { title: "Classical", href: "/musics/classical" },
      { title: "Retro Bangla", href: "/musics/bangla_retro" },
      { title: "Extant Bangla", href: "/musics/bangla_new" },
      {
        title: "Rabindra Sangeeet",
        href: "/musics/rabindra_sangeet",
      },
      { title: "Hindi Retro", href: "/musics/hindi_retro" },
      { title: "Contemporary Hindi", href: "/musics/hindi_new" },
      { title: "Devotional", href: "/musics/religious" },
      { title: "Gentle Tunes", href: "/musics/miscellaneous" },
    ],
  },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];
