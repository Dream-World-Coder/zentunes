export const navItems = [
  { title: "Home", href: "/" },
  {
    title: "Genres",
    href: "dropdown",

    // no need to fetch them, cuz as of now they should be fixed bcz of music-page-data, just songs inside will vary
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
