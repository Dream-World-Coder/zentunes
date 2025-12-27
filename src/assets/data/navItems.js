export const navItems = [
  { title: "Home", href: "/" },
  //*
  {
    title: "Genre",
    href: "dropdown",
    dropdownItems: [
      { title: "Old Bangla", href: "/search?query=bangla+retro+songs" },
      { title: "New Bangla", href: "/search?query=new+bangla+songs" },
      {
        title: "Rabindra Sangeeet",
        href: "/search?query=rabindra+sangeet",
      },
      { title: "Hindi Retro", href: "/search?query=hindi+retro+songs" },
      { title: "New Hindi", href: "/search?query=new+hindi+songs" },
      { title: "Shamya Sangeet", href: "/search?query=pannalal+shaymasangeet" },
    ],
  },
  //*/
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];
