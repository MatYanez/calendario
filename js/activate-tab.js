// js/activate-tab.js

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".nav-link");

  links.forEach(link => {
    const href = link.getAttribute("href");
    const currentPath = window.location.pathname.split("/").pop(); // solo el nombre del archivo

    if (href === currentPath || window.location.href.includes(href)) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
});
