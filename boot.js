// Runs before first paint: marks JS as available and skips the intro on repeat visits.
(function () {
  var d = document.documentElement, seen = false;
  try { seen = sessionStorage.getItem("plSeen") === "1"; } catch (e) {}
  d.classList.add("js");
  if (seen) { d.classList.add("is-ready", "pl-skip"); return; }
  d.classList.add("is-loading");
  // Failsafe: never keep the page hidden longer than 9 seconds.
  setTimeout(function () {
    d.classList.remove("is-loading");
    d.classList.add("is-ready");
  }, 9000);
})();
