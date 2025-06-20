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
      { title: "Bangla", href: "/musics/bangla_new" },
      {
        title: "Rabindra Sangeet",
        href: "/musics/rabindra_sangeet",
      },
      { title: "Retro Hindi", href: "/musics/hindi_retro" },
      { title: "Hindi", href: "/musics/hindi_new" },
      { title: "Devotional", href: "/musics/religious" },
      { title: "Gentle Tunes", href: "/musics/miscellaneous" },
    ],
  },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

export const navItemsSimple = [
  { title: "Home", href: "/" },
  {
    title: "Genres",
    href: "dropdown",

    dropdownItems: [
      { title: "পুরানো বাংলা", href: "/musics/bangla_retro" },
      { title: "বাংলা", href: "/musics/bangla_new" },
      {
        title: "রবীন্দ্র সঙ্গীত",
        href: "/musics/rabindra_sangeet",
      },
      { title: "পুরানো হিন্দি", href: "/musics/hindi_retro" },
      { title: "হিন্দি", href: "/musics/hindi_new" },
      { title: "ভজন", href: "/musics/religious" },
    ],
  },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];
