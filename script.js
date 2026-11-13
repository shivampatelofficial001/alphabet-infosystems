// Alphabet Infosystems: site behaviour

var FORM_ENDPOINT = "https://formspree.io/f/mvkaowdp";
var CONTACT_EMAIL = "shivam@alphabetinfosystems.com";

var yearEls = document.querySelectorAll("[data-year]");
for (var y = 0; y < yearEls.length; y++) yearEls[y].textContent = new Date().getFullYear();

var menuToggle = document.getElementById("menuToggle");
var mainNav = document.getElementById("mainNav");

function setMenu(open) {
  if (!menuToggle || !mainNav) return;
  mainNav.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  if (open) {
    var firstLink = mainNav.querySelector("ul a");
    if (firstLink) firstLink.focus();
  }
}

if (menuToggle) {
  menuToggle.addEventListener("click", function () {
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
  });
}

function trapMenuFocus(e) {
  if (e.key !== "Tab" || !mainNav || !mainNav.classList.contains("is-open")) return;
  var focusables = mainNav.querySelectorAll("a, button");
  if (!focusables.length) return;
  var first = focusables[0];
  var last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

var menuClose = document.getElementById("menuClose");
if (menuClose) {
  menuClose.addEventListener("click", function () {
    setMenu(false);
    if (menuToggle) menuToggle.focus();
  });
}

if (mainNav) {
  mainNav.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("a")) setMenu(false);
  });
}

document.addEventListener("click", function (e) {
  if (!mainNav || !menuToggle) return;
  if (menuToggle.getAttribute("aria-expanded") !== "true") return;
  if (mainNav.contains(e.target) || menuToggle.contains(e.target)) return;
  setMenu(false);
});

document.addEventListener("keydown", trapMenuFocus);
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && menuToggle && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuToggle.focus();
  }
});

var navLinks = document.querySelectorAll(".main-nav ul a");

function markCurrent(id) {
  for (var i = 0; i < navLinks.length; i++) {
    var isCurrent = navLinks[i].getAttribute("href") === "#" + id;
    if (isCurrent) navLinks[i].setAttribute("aria-current", "true");
    else navLinks[i].removeAttribute("aria-current");
  }
}

if ("IntersectionObserver" in window) {
  var observer = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) markCurrent(entries[i].target.id);
    }
  }, { rootMargin: "-40% 0px -55% 0px" });

  var watched = document.querySelectorAll("main section[id]");
  for (var s = 0; s < watched.length; s++) observer.observe(watched[s]);
}

var form = document.getElementById("contactForm");
var statusEl = document.getElementById("formStatus");
var submitBtn = document.getElementById("formSubmit");

function showStatus(text, isError) {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.classList.toggle("is-error", !!isError);
}

function openEmailApp(name, email, message) {
  var subject = "Project enquiry from " + name;
  var body = message + "\n\nName: " + name + "\nEmail: " + email;
  window.location.href = "mailto:" + CONTACT_EMAIL +
    "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent(body);
}

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var data = new FormData(form);
    if (data.get("_gotcha")) {
      showStatus("Please reload the page and try again.", true);
      return;
    }

    var name = String(data.get("name") || "").trim();
    var email = String(data.get("email") || "").trim();
    var message = String(data.get("message") || "").trim();
    if (!name || !email || !message) {
      showStatus("Fill in your name, email and message.", true);
      return;
    }

    if (!FORM_ENDPOINT || window.location.protocol === "file:") {
      openEmailApp(name, email, message);
      showStatus("Your email app should open with the message ready to send. If it does not, write to " + CONTACT_EMAIL + ".", false);
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    showStatus("Sending...", false);

    fetch(FORM_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({ name: name, email: email, message: message }),
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (json) {
        if (!res.ok) {
          var msg = (json.errors && json.errors.map(function (errItem) { return errItem.message; }).join(", ")) || json.error || ("Error " + res.status);
          throw new Error(msg);
        }
        form.reset();
        showStatus("Message sent. I will reply by email.", false);
      });
    }).catch(function (err) {
      showStatus("The message was not sent (" + err.message + "). Try again, or write to " + CONTACT_EMAIL + ".", true);
    }).then(function () {
      if (submitBtn) submitBtn.disabled = false;
    });
  });
}

var root = document.documentElement;
var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

function splitHeroHeading() {
  var h1 = document.querySelector(".hero h1");
  if (!h1 || reduceMotion) return;
  var words = h1.textContent.replace(/\s+/g, " ").trim().split(" ");
  h1.setAttribute("aria-label", words.join(" "));
  h1.textContent = "";
  var c = 0;
  for (var i = 0; i < words.length; i++) {
    var word = document.createElement("span");
    word.className = "word";
    word.setAttribute("aria-hidden", "true");
    for (var j = 0; j < words[i].length; j++) {
      var ch = document.createElement("span");
      ch.className = "ch";
      ch.style.setProperty("--c", c++);
      ch.textContent = words[i].charAt(j);
      word.appendChild(ch);
    }
    h1.appendChild(word);
    if (i < words.length - 1) h1.appendChild(document.createTextNode(" "));
  }
}

function runPreloader() {
  var pre = document.getElementById("preloader");

  if (root.classList.contains("pl-skip")) {
    if (pre && pre.parentNode) pre.parentNode.removeChild(pre);
    return;
  }

  function openPage() {
    root.classList.remove("is-loading");
    root.classList.add("is-ready");
  }

  var svg = document.getElementById("plSvg");
  var back = document.getElementById("plBack");
  var navy = document.getElementById("plNavy");
  var maskEl = document.getElementById("plMask");
  var maskBg = document.getElementById("plMaskBg");
  var hole = document.getElementById("plHole");
  var fill = document.getElementById("plFill");
  var liquid = document.getElementById("plLiquid");
  var edge = document.getElementById("plEdge");
  var brand = document.getElementById("plBrand");

  if (!pre || reduceMotion || !svg || !back || !navy || !maskEl || !maskBg || !hole || !fill || !liquid || !edge || !brand) {
    if (pre && pre.parentNode) pre.parentNode.removeChild(pre);
    openPage();
    return;
  }

  var VB_W = 340, VB_H = 230;
  var CENTER = { x: 233, y: 235 };
  var ANCHOR = { x: 293, y: 256 };
  var ANCHOR_R = 30;

  var MIN_TIME = 1200;
  var MAX_WAIT = 2500;
  var HOLD = 350;
  var ZOOM = 1700;

  var W = 0, H = 0, k0 = 1, kf = 1, k = 1, ax = 0, ay = 0;

  function applyTransform(scale) {
    k = scale;
    var t = "translate(" + ax + " " + ay + ") scale(" + k + ") translate(" + (-ANCHOR.x) + " " + (-ANCHOR.y) + ")";
    hole.setAttribute("transform", t);
    fill.setAttribute("transform", t);
  }

  function layout() {
    W = pre.clientWidth || window.innerWidth;
    H = pre.clientHeight || window.innerHeight;
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var rects = [back, navy, maskBg];
    for (var i = 0; i < rects.length; i++) {
      rects[i].setAttribute("width", W);
      rects[i].setAttribute("height", H);
    }
    maskEl.setAttribute("width", W);
    maskEl.setAttribute("height", H);

    k0 = Math.min(300, W * 0.62) / VB_W;
    var cx = W / 2;
    var cy = H / 2 - 22;
    ax = cx + (ANCHOR.x - CENTER.x) * k0;
    ay = cy + (ANCHOR.y - CENTER.y) * k0;

    var reach = Math.hypot(Math.max(ax, W - ax), Math.max(ay, H - ay));
    kf = (reach / ANCHOR_R) * 1.12;

    brand.style.top = (cy + (VB_H / 2) * k0 + 34) + "px";
    applyTransform(phase === 2 ? k : k0);
  }

  var phase = 0;
  layout();
  pre.classList.add("pl-ready");
  window.addEventListener("resize", layout);

  var winLoaded = document.readyState === "complete";
  var fontsReady = !(document.fonts && document.fonts.ready);
  if (!winLoaded) window.addEventListener("load", function () { winLoaded = true; });
  if (!fontsReady) document.fonts.ready.then(function () { fontsReady = true; });

  function setProgress(p) {
    var h = (VB_H + 6) * p / 100;
    liquid.setAttribute("y", 350 - h);
    liquid.setAttribute("height", h);
    edge.setAttribute("y", 350 - h - 1.5);
    edge.setAttribute("opacity", p > 0.5 && p < 99.5 ? ".9" : "0");
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function finish() {
    window.removeEventListener("resize", layout);
    if (pre.parentNode) pre.parentNode.removeChild(pre);
    root.classList.remove("is-loading");
    try { sessionStorage.setItem("plSeen", "1"); } catch (e) {}
  }

  var start = null, holdStart = 0, zoomStart = 0, readied = false;

  function frame(now) {
    if (start === null) start = now;

    if (phase === 0) {
      var elapsed = now - start;
      var p = easeOutCubic(Math.min(elapsed / MIN_TIME, 1)) * 100;
      var loaded = (winLoaded && fontsReady) || elapsed > MAX_WAIT;
      if (!loaded) p = Math.min(p, 92);
      setProgress(p);
      if (p >= 100) { phase = 1; holdStart = now; }
    } else if (phase === 1) {
      if (now - holdStart >= HOLD) {
        phase = 2;
        zoomStart = now;
        pre.classList.add("is-zooming");
      }
    } else {
      var z = Math.min((now - zoomStart) / ZOOM, 1);
      applyTransform(k0 * Math.pow(kf / k0, easeInOutQuad(z)));
      var fade = String(1 - Math.min(z / 0.35, 1));
      back.style.opacity = fade;
      fill.style.opacity = fade;
      if (z >= 0.45 && !readied) { readied = true; root.classList.add("is-ready"); }
      if (z >= 1) { finish(); return; }
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function setupHeroTilt() {
  var hero = document.querySelector(".hero");
  var mark = document.querySelector(".hero-mark");
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!hero || !mark || reduceMotion || !fine) return;

  var tx = 0, ty = 0, cx = 0, cy = 0, running = false;

  function step() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    mark.style.setProperty("--tx", cx.toFixed(3));
    mark.style.setProperty("--ty", cy.toFixed(3));
    if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) {
      requestAnimationFrame(step);
    } else {
      running = false;
    }
  }
  function run() {
    if (running) return;
    running = true;
    requestAnimationFrame(step);
  }

  hero.addEventListener("pointermove", function (e) {
    var r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width * 2 - 1;
    ty = (e.clientY - r.top) / r.height * 2 - 1;
    run();
  });
  hero.addEventListener("pointerleave", function () { tx = 0; ty = 0; run(); });
}

function setupReveal() {
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  var groups = [
    { sel: ".section h2", cls: "reveal-wipe", step: 0 },
    { sel: ".rows", cls: "ledger", step: 0 },
    { sel: ".rows .row", cls: "reveal-row", step: 100 },
    { sel: ".prose p", cls: "reveal-focus", step: 80 },
    { sel: ".lead-small", cls: "reveal-focus", step: 0 },
    { sel: ".contact-list li", cls: "reveal-focus", step: 80 },
    { sel: ".form", cls: "reveal-sheet", step: 0 },
    { sel: ".footer-inner > *", cls: "reveal-focus", step: 80 }
  ];
  var targets = [];

  for (var g = 0; g < groups.length; g++) {
    var found = document.querySelectorAll(groups[g].sel);
    var parents = [];
    var counts = [];
    for (var f = 0; f < found.length; f++) {
      var el = found[f];
      var idx = parents.indexOf(el.parentNode);
      if (idx === -1) { parents.push(el.parentNode); counts.push(0); idx = parents.length - 1; }
      el.style.setProperty("--d", Math.min(counts[idx], 5) * groups[g].step + "ms");
      counts[idx]++;
      el.classList.add(groups[g].cls);
      el.setAttribute("data-reveal", groups[g].cls);
      targets.push(el);
    }
  }

  var clipped = { "reveal-wipe": true, "reveal-sheet": true };

  function onReveal(entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        var list = entries[i].target._revealTargets || [];
        for (var j = 0; j < list.length; j++) list[j].classList.add("is-visible");
      }
    }
  }

  var io = new IntersectionObserver(onReveal, { threshold: 0.1, rootMargin: "0px 0px -10% 0px" });
  var ioFooter = new IntersectionObserver(onReveal, { threshold: 0.05, rootMargin: "0px" });

  var queue = [];
  for (var t = 0; t < targets.length; t++) {
    var el2 = targets[t];
    var watch = (clipped[el2.getAttribute("data-reveal")] && el2.parentNode) ? el2.parentNode : el2;
    watch._revealTargets = (watch._revealTargets || []).concat(el2);
    var isFooter = el2.parentNode && el2.parentNode.classList && el2.parentNode.classList.contains("footer-inner");
    queue.push({ node: watch, obs: isFooter ? ioFooter : io });
  }

  var started = false;
  function startObserving() {
    if (started) return;
    started = true;
    setTimeout(function () {
      for (var q = 0; q < queue.length; q++) queue[q].obs.observe(queue[q].node);
    }, 450);
  }
  if (root.classList.contains("is-ready")) {
    startObserving();
  } else {
    var readyWatch = new MutationObserver(function () {
      if (root.classList.contains("is-ready")) { readyWatch.disconnect(); startObserving(); }
    });
    readyWatch.observe(root, { attributes: true, attributeFilter: ["class"] });
  }
}

function prepareIconDraw() {
  if (reduceMotion) return;
  var shapes = document.querySelectorAll(
    ".row-title .icon path, .row-title .icon rect, .row-title .icon circle, .row-title .icon ellipse, .row-title .icon line"
  );
  for (var i = 0; i < shapes.length; i++) shapes[i].setAttribute("pathLength", "1");
  root.classList.add("draw-ready");
}

var progressEl = document.getElementById("scrollProgress");
var headerEl = document.getElementById("siteHeader");
var scrollTicking = false;

function updateScroll() {
  var max = document.documentElement.scrollHeight - window.innerHeight;
  var p = max > 0 ? Math.min(window.pageYOffset / max, 1) : 0;
  if (progressEl) progressEl.style.transform = "scaleX(" + p + ")";
  if (headerEl) headerEl.classList.toggle("is-scrolled", window.pageYOffset > 8);
  scrollTicking = false;
}

window.addEventListener("scroll", function () {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(updateScroll);
}, { passive: true });
updateScroll();

splitHeroHeading();
prepareIconDraw();
setupHeroTilt();
setupReveal();
runPreloader();
