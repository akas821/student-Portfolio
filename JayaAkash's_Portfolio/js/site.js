(() => {
  const profile = window.PORTFOLIO_PROFILE || {};
  document.querySelectorAll("#brandName").forEach(el => el.textContent = profile.name || "Student Portfolio");
  document.querySelectorAll("#footerName").forEach(el => el.textContent = profile.name || "Your Name");
  document.querySelectorAll("#year").forEach(el => el.textContent = new Date().getFullYear());
})();