// Set the theme class before first paint to avoid a flash of the wrong theme.
// A separate file rather than an inline script, so the Content Security Policy can forbid inline scripts.
(function () {
  try {
    var theme = localStorage.getItem("theme") || "system";
    var dark =
      theme === "dark" ||
      (theme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
