/* Sets Calm and the Lens before first paint. No dependencies. */
(function () {
  var root = document.documentElement;
  var calm = false;
  try {
    calm = localStorage.getItem("calm") === "1";
  } catch (e) {}
  var reduce = false;
  try {
    reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}
  if (calm) root.classList.add("calm");
  if (calm || reduce) root.classList.add("resolved");
  else root.classList.add("lens-ready");
})();
