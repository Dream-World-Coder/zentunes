document.addEventListener("DOMContentLoaded", () => {
  const darkModeButton = document.querySelector(".dark-mode-button");
  const downloadButton = document.querySelector(".download-button");

  function applyDarkMode() {
    localStorage.setItem("isDarkModeZentunes", "true");
    if (document.body.classList.contains("isDarkMode")) {
      return;
    } else {
      document.body.classList.add("isDarkMode");
    }
  }

  function removeDarkMode() {
    localStorage.setItem("isDarkModeZentunes", "false");
    if (document.body.classList.contains("isDarkMode")) {
      document.body.classList.remove("isDarkMode");
    }
  }

  if (localStorage.getItem("isDarkModeZentunes") === "true") {
    applyDarkMode();
  } else if (localStorage.getItem("isDarkModeZentunes") === "false") {
    removeDarkMode();
  } else {
    console.log("No dark mode preference found");
  }
  darkModeButton.addEventListener("click", () => {
    if (document.body.classList.contains("isDarkMode")) {
      document.body.classList.remove("isDarkMode");
      localStorage.setItem("isDarkModeZentunes", "false");
    } else {
      document.body.classList.add("isDarkMode");
      localStorage.setItem("isDarkModeZentunes", "true");
    }
  });
});
