document.addEventListener("DOMContentLoaded", function () {
  const musics = document.querySelectorAll(".music");

  musics.forEach((music) => {
    const link = music.querySelector("figcaption");
    const overlay = music.querySelector(".overlay");

    music.addEventListener("mouseenter", (e) => {
      // Determine if mouse is entering from top or bottom
      const bounds = music.getBoundingClientRect();
      const top = e.clientY < bounds.y + bounds.height / 2;

      // Animate link movement and overlay scale
      gsap.to(link, {
        x: "2rem",
        duration: 0.5,
        ease: "power3.out",
      });
      gsap.fromTo(
        overlay,
        {
          scaleY: 0,
          transformOrigin: top ? "0 0" : "0 100%",
        },
        {
          scaleY: 1,
          duration: 0.5,
          ease: "power3.out",
        }
      );
    });

    music.addEventListener("mouseleave", (e) => {
      // Determine if mouse is leaving from top or bottom
      const bounds = music.getBoundingClientRect();
      const top = e.clientY < bounds.y + bounds.height / 2;

      // Reset animations
      gsap.killTweensOf([overlay, link]);
      gsap.to(link, {
        x: 0,
        duration: 0.3,
        ease: "power3.out",
      });
      gsap.to(overlay, {
        scaleY: 0,
        transformOrigin: top ? "0 0" : "0 100%",
        duration: 0.7,
        ease: "power3.out",
      });
    });
  });
});
