/* Alphabet Infosystems - site script
   Plain JavaScript with `var` so it ports easily to React / Next.js later. */

/* ------------------------------------------------------------------
   SETTINGS: fill these in. Anything left empty is hidden or falls back.
   ------------------------------------------------------------------ */
var CONFIG = {
  email: "shivam@alphabetinfosystems.com",

  // Full Formspree endpoint. Keep this URL in one place for easy maintenance.
  // The form falls back to the visitor's email app only if this is left empty.
  formspreeEndpoint: "https://formspree.io/f/mvkaowdp",

  // Optional: URL of the hardened form handler in server/form-worker.js once it is deployed
  // (for example "https://contact.alphabetinfosystems.com/send"). When set, it is used instead of
  // Formspree and checks, rate-limits and sends the message on the server.
  secureEndpoint: "",

  // WhatsApp number with country code, digits only, for example "919XXXXXXXXX".
  // Empty = the WhatsApp buttons stay hidden.
  whatsappNumber: "919106096530",

  // Full address of the live Geetva Enterprise website, for example "https://example.com".
  // Empty = the "Visit the live site" button stays hidden.
  geetvaUrl: "",

  // Riverflow waves move with the scroll. Set a small number such as 0.02 to also let them
  // drift slowly while the page is still. 0 = the waves move only while scrolling.
  riverIdleSpeed: 0.018
};

/* ---------- Year in footer and menu ---------- */
(function () {
  var year = String(new Date().getFullYear());
  var nodes = document.querySelectorAll("[data-year]");
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].textContent = year;
  }
})();

/* ---------- Optional links (WhatsApp, Geetva live site) ---------- */
(function () {
  var number = String(CONFIG.whatsappNumber || "").replace(/\D/g, "");
  if (number) {
    var text = encodeURIComponent("Hi Shivam, I would like to talk about a project.");
    var waLinks = document.querySelectorAll("[data-whatsapp]");
    for (var i = 0; i < waLinks.length; i++) {
      waLinks[i].setAttribute("href", "https://wa.me/" + number + "?text=" + text);
      waLinks[i].setAttribute("target", "_blank");
      waLinks[i].setAttribute("rel", "noopener");
      waLinks[i].removeAttribute("hidden");
    }
    var waItems = document.querySelectorAll("[data-whatsapp-item]");
    for (var j = 0; j < waItems.length; j++) {
      waItems[j].removeAttribute("hidden");
    }
  }

  var geetva = document.querySelector("[data-geetva-link]");
  if (geetva && CONFIG.geetvaUrl) {
    geetva.setAttribute("href", CONFIG.geetvaUrl);
    geetva.removeAttribute("hidden");
  }
})();

/* ---------- Menu (floating panel on mobile, inline on desktop) ---------- */
(function () {
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("site-menu");
  var scrim = document.querySelector("[data-scrim]");
  if (!toggle || !menu) {
    return;
  }
  var closeBtn = menu.querySelector(".menu-close");
  var desktop = window.matchMedia("(min-width: 900px)");

  function focusables() {
    return menu.querySelectorAll("a[href], button:not([disabled])");
  }

  function openMenu() {
    menu.classList.add("is-open");
    if (scrim) { scrim.classList.add("is-open"); }
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
    if (closeBtn) { closeBtn.focus(); }
  }

  function closeMenu(returnFocus) {
    menu.classList.remove("is-open");
    if (scrim) { scrim.classList.remove("is-open"); }
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
    if (returnFocus) { toggle.focus(); }
  }

  toggle.addEventListener("click", function () {
    if (menu.classList.contains("is-open")) {
      closeMenu(true);
    } else {
      openMenu();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", function () { closeMenu(true); });
  }
  if (scrim) {
    scrim.addEventListener("click", function () { closeMenu(false); });
  }

  menu.addEventListener("click", function (event) {
    var link = event.target.closest ? event.target.closest("a") : null;
    if (link && menu.classList.contains("is-open")) {
      closeMenu(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (!menu.classList.contains("is-open")) { return; }
    if (event.key === "Escape") {
      closeMenu(true);
      return;
    }
    if (event.key === "Tab") {
      var items = focusables();
      if (!items.length) { return; }
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  function onBreakpoint() {
    if (desktop.matches) { closeMenu(false); }
  }
  if (desktop.addEventListener) {
    desktop.addEventListener("change", onBreakpoint);
  } else if (desktop.addListener) {
    desktop.addListener(onBreakpoint);
  }
})();

/* ---------- Highlight the active menu row ---------- */
(function () {
  var links = document.querySelectorAll(".menu-link[data-nav]");
  if (!links.length) { return; }

  function setActive(key) {
    for (var i = 0; i < links.length; i++) {
      var on = links[i].getAttribute("data-nav") === key;
      if (on) {
        links[i].classList.add("is-active");
        links[i].setAttribute("aria-current", "true");
      } else {
        links[i].classList.remove("is-active");
        links[i].removeAttribute("aria-current");
      }
    }
  }

  var fixed = document.body.getAttribute("data-active");
  if (fixed) {
    setActive(fixed);
    return;
  }

  if (!("IntersectionObserver" in window)) { return; }

  var ids = ["home", "services", "work", "process", "about", "feedback", "faq", "contact"];
  var map = { process: "services", feedback: "about", faq: "about" };
  var sections = [];
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById(ids[i]);
    if (el) { sections.push(el); }
  }

  var observer = new IntersectionObserver(function (entries) {
    for (var j = 0; j < entries.length; j++) {
      if (entries[j].isIntersecting) {
        var id = entries[j].target.id;
        setActive(map[id] || id);
      }
    }
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

  for (var k = 0; k < sections.length; k++) {
    observer.observe(sections[k]);
  }
})();

/* ---------- Contact form ---------- */
/* ---------- Form safety helpers (input limits, cleaning, send throttle) ---------- */
var FormGuard = (function () {
  var LIMITS = { name: 80, email: 254, phone: 30, message: 2000, minMessage: 10 };
  var loadedAt = Date.now();
  var STORE_KEY = "ai_form_sends";
  var MIN_GAP_MS = 45 * 1000;
  var MAX_PER_HOUR = 5;

  // Remove control characters, bidirectional overrides and anything that looks like an HTML tag.
  function clean(value, max, keepNewlines) {
    var s = String(value == null ? "" : value);
    try { s = s.normalize("NFKC"); } catch (e) { /* older browsers */ }
    s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, "");
    s = s.replace(/<[^>]*>/g, "").replace(/[<>]/g, "");
    s = keepNewlines ? s.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n") : s.replace(/\s+/g, " ");
    s = s.trim();
    return s.length > max ? s.slice(0, max) : s;
  }

  function readSends() {
    try {
      var raw = JSON.parse(window.localStorage.getItem(STORE_KEY) || "[]");
      var cutoff = Date.now() - 3600 * 1000;
      return Array.isArray(raw) ? raw.filter(function (t) { return typeof t === "number" && t > cutoff; }) : [];
    } catch (e) { return []; }
  }

  // Returns an empty string when sending is allowed, otherwise a message for the visitor.
  // This only slows down careless repeats and simple bots. The real limit has to live on the server.
  function throttleMessage() {
    if (Date.now() - loadedAt < 3000) { return "Please wait a moment and send again."; }
    var sends = readSends();
    if (sends.length && Date.now() - sends[sends.length - 1] < MIN_GAP_MS) {
      return "Your last message was sent a moment ago. Please wait a minute before sending another.";
    }
    if (sends.length >= MAX_PER_HOUR) {
      return "Too many messages from this browser. Please try again in an hour or email directly.";
    }
    return "";
  }

  function recordSend() {
    try {
      var sends = readSends();
      sends.push(Date.now());
      window.localStorage.setItem(STORE_KEY, JSON.stringify(sends));
    } catch (e) { /* storage blocked: nothing to record */ }
  }

  function allowed(select, value) {
    if (!value) { return ""; }
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].value === value || select.options[i].text === value) { return value; }
    }
    return "";
  }

  return { LIMITS: LIMITS, clean: clean, throttleMessage: throttleMessage, recordSend: recordSend, allowed: allowed };
})();

(function () {
  var form = document.getElementById("contact-form");
  if (!form) { return; }
  var status = document.getElementById("form-status");
  var button = form.querySelector("button[type=submit]");
  var label = button.querySelector(".btn-label");
  var sentText = form.querySelector("[data-sent-text]");

  function setLoading(on) {
    button.disabled = on;
    button.classList.toggle("is-loading", on);
    button.setAttribute("aria-busy", on ? "true" : "false");
    if (label) { label.textContent = on ? "Sending" : "Send message"; }
  }

  function setError(field, message) {
    var input = form.elements[field];
    var out = document.getElementById(field + "-error");
    if (out) { out.textContent = message; }
    if (message) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
    }
  }

  function setStatus(message, isError) {
    status.textContent = message;
    if (isError) {
      status.classList.add("is-error");
    } else {
      status.classList.remove("is-error");
    }
  }

  function validate() {
    var L = FormGuard.LIMITS;
    var name = FormGuard.clean(form.elements.name.value, L.name);
    var email = FormGuard.clean(form.elements.email.value, L.email);
    var message = FormGuard.clean(form.elements.message.value, L.message, true);
    var firstBad = null;

    var nameOk = name.length >= 2;
    setError("name", nameOk ? "" : "Enter your name.");
    if (!nameOk) { firstBad = firstBad || form.elements.name; }

    var emailOk = email.length <= L.email && /^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/.test(email);
    setError("email", emailOk ? "" : "Enter an email address like name@example.com.");
    if (!emailOk) { firstBad = firstBad || form.elements.email; }

    var phone = FormGuard.clean(form.elements.phone.value, L.phone);
    var phoneOk = !phone || (/^[+\d\s().-]+$/.test(phone) && phone.replace(/\D/g, "").length >= 7);
    setError("phone", phoneOk ? "" : "Enter a phone number with at least 7 digits, or leave it empty.");
    if (!phoneOk) { firstBad = firstBad || form.elements.phone; }

    var messageOk = message.length >= L.minMessage;
    setError("message", messageOk ? "" : "Tell me briefly what you need, in at least a sentence.");
    if (!messageOk) { firstBad = firstBad || form.elements.message; }

    if (firstBad) { firstBad.focus(); }
    return !firstBad;
  }

  function sendWithEmailApp(data) {
    var subject = "Project enquiry from " + data.name;
    var body = "Name: " + data.name + "\n" +
      "Email: " + data.email + "\n" +
      "Phone: " + (data.phone || "-") + "\n" +
      "Looking for: " + (data.interest || "-") + "\n" +
      "Budget: " + (data.budget || "-") + "\n\n" +
      data.message;
    window.location.href = "mailto:" + CONFIG.email +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
    setStatus("The form could not send your message. Your email app should open with it filled in. If nothing opens, write to " + CONFIG.email + ".", true);
    setLoading(false);
  }

  function sendWithFormspree(data) {
    setLoading(true);
    setStatus("", false);
    var payload = JSON.parse(JSON.stringify(data));
    payload._gotcha = "";
    fetch(CONFIG.secureEndpoint || CONFIG.formspreeEndpoint, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      mode: "cors",
      credentials: "omit",
      referrerPolicy: "strict-origin-when-cross-origin"
    }).then(function (response) {
      if (response.ok) {
        FormGuard.recordSend();
        if (sentText) { sentText.textContent = "Thank you, " + data.name.split(" ")[0] + ". I will reply to " + data.email + "."; }
        form.reset();
        setLoading(false);
        setStatus("", false);
        form.classList.add("is-sent");
        form.querySelector(".sent").scrollIntoView({ block: "nearest" });
      } else if (response.status === 400 || response.status === 429) {
        setLoading(false);
        setStatus(
          response.status === 429
            ? "Too many messages sent. Please wait a few minutes or reach out on WhatsApp."
            : "Please check your details and try again.",
          true
        );
      } else {
        sendWithEmailApp(data);
      }
    }).catch(function () {
      sendWithEmailApp(data);
    });
  }

  ["name", "email", "phone", "message"].forEach(function (field) {
    form.elements[field].addEventListener("input", function () {
      if (form.elements[field].getAttribute("aria-invalid")) { setError(field, ""); }
    });
  });

  var again = form.querySelector("[data-write-again]");
  if (again) {
    again.addEventListener("click", function () {
      form.classList.remove("is-sent");
      setStatus("", false);
      form.elements.name.focus();
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    setStatus("", false);

    // Spam trap: real visitors never fill this field.
    if (form.elements.company && form.elements.company.value) { return; }
    if (!validate()) { return; }

    var wait = FormGuard.throttleMessage();
    if (wait) { setStatus(wait, true); return; }

    var L = FormGuard.LIMITS;
    var data = {
      name: FormGuard.clean(form.elements.name.value, L.name),
      email: FormGuard.clean(form.elements.email.value, L.email),
      phone: FormGuard.clean(form.elements.phone.value, L.phone),
      interest: FormGuard.allowed(form.elements.interest, form.elements.interest.value),
      budget: FormGuard.allowed(form.elements.budget, form.elements.budget.value),
      message: FormGuard.clean(form.elements.message.value, L.message, true)
    };

    if (CONFIG.secureEndpoint || CONFIG.formspreeEndpoint) {
      sendWithFormspree(data);
    } else {
      sendWithEmailApp(data);
    }
  });
})();

/* ---------- FAQ: smooth open and close ---------- */
(function () {
  var items = document.querySelectorAll(".faq-item");
  if (!items.length || !("animate" in document.documentElement)) { return; }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  Array.prototype.forEach.call(items, function (item) {
    var summary = item.querySelector("summary");
    summary.addEventListener("click", function (event) {
      if (reduce) { return; }
      event.preventDefault();
      var opening = !item.open;
      var start = item.offsetHeight;
      if (opening) { item.open = true; }
      var end = opening ? item.scrollHeight : summary.offsetHeight;
      item.style.overflow = "hidden";
      var anim = item.animate({ height: [start + "px", end + "px"] }, { duration: 260, easing: "ease-out" });
      anim.onfinish = function () {
        if (!opening) { item.open = false; }
        item.style.overflow = "";
      };
    });
  });
})();

/* =====================================================================
   MOTION
   Patterns taken from motion.dev (split text, scroll word reveal, rolling
   text, tilt card, scroll image reveal, hide header on scroll, parallax,
   spring easing) and from MotionSites (word by word blur-in headline).
   Everything below is plain JavaScript. No library, no network request.
   ===================================================================== */
var MOTION = (function () {
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var canAnimate = "animate" in document.documentElement;
  var hasIO = "IntersectionObserver" in window;
  var fine = !!(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  var spring = "cubic-bezier(.2,.7,.2,1)";

  // Damped spring sampled into a CSS linear() easing, the same idea as Motion's spring().
  function buildSpring() {
    if (!(window.CSS && CSS.supports && CSS.supports("animation-timing-function", "linear(0,1)"))) { return null; }
    var n = 56, z = 0.68, w = 2 * Math.PI * 1.35;
    var wd = w * Math.sqrt(1 - z * z);
    var pts = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      var v = 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
      pts.push(Number(v.toFixed(4)));
    }
    pts[n] = 1;
    return "linear(" + pts.join(",") + ")";
  }
  var built = buildSpring();
  if (built) {
    spring = built;
    document.documentElement.style.setProperty("--spring", built);
  }

  return { reduce: reduce, canAnimate: canAnimate, hasIO: hasIO, fine: fine, spring: spring };
})();

/* ---------- Headlines: word by word blur-in (hero) and masked word rise (sections) ---------- */
(function () {
  var js = document.documentElement.classList.contains("js");
  if (!js) { return; }

  function words(el) {
    return el.textContent.trim().split(/\s+/);
  }

  // Page title: each word blurs in and rises, 100ms apart.
  var hero = document.querySelectorAll("[data-split]");
  for (var h = 0; h < hero.length; h++) {
    var h1 = hero[h];
    var list = words(h1);
    h1.setAttribute("aria-label", list.join(" "));
    h1.textContent = "";
    for (var i = 0; i < list.length; i++) {
      var span = document.createElement("span");
      span.className = "w";
      span.setAttribute("aria-hidden", "true");
      span.style.setProperty("--i", i);
      span.textContent = list[i];
      h1.appendChild(span);
      if (i < list.length - 1) { h1.appendChild(document.createTextNode(" ")); }
    }
  }

  // Section headings: every word rises out of its own mask when the heading scrolls into view.
  var heads = document.querySelectorAll(".split-head h2, .case-body h2, .case-cta h2");
  if (!MOTION.hasIO || !MOTION.canAnimate || MOTION.reduce) { return; }
  var masked = [];
  for (var k = 0; k < heads.length; k++) {
    var el = heads[k];
    var parts = words(el);
    el.setAttribute("aria-label", parts.join(" "));
    el.textContent = "";
    for (var j = 0; j < parts.length; j++) {
      var mask = document.createElement("span");
      mask.className = "rw";
      mask.setAttribute("aria-hidden", "true");
      var inner = document.createElement("span");
      inner.className = "rw-i";
      inner.textContent = parts[j];
      mask.appendChild(inner);
      el.appendChild(mask);
      if (j < parts.length - 1) { el.appendChild(document.createTextNode(" ")); }
    }
    el.classList.add("mask");
    masked.push(el);
  }

  var io = new IntersectionObserver(function (entries) {
    for (var e = 0; e < entries.length; e++) {
      if (!entries[e].isIntersecting) { continue; }
      var target = entries[e].target;
      io.unobserve(target);
      var inners = target.querySelectorAll(".rw-i");
      for (var n = 0; n < inners.length; n++) {
        inners[n].animate(
          [{ transform: "translateY(118%)" }, { transform: "translateY(0)" }],
          { duration: 900, delay: n * 60, easing: MOTION.spring, fill: "backwards" }
        );
      }
      target.classList.add("is-in");
    }
  }, { threshold: 0.4 });
  for (var m = 0; m < masked.length; m++) { io.observe(masked[m]); }
})();

/* ---------- Cards enter once with a stagger; the work card opens with a clip reveal ---------- */
(function () {
  if (!document.documentElement.classList.contains("js")) { return; }
  if (!MOTION.hasIO || !MOTION.canAnimate || MOTION.reduce) { return; }

  var groups = [
    { sel: ".services .service", step: 90 },
    { sel: ".steps .step", step: 110 },
    { sel: ".facts > div", step: 90 },
    { sel: ".cinfo > div", step: 90 },
    { sel: ".case-body section", step: 110 },
    { sel: ".fb", step: 0 },
    { sel: ".cform", step: 0 }
  ];
  var items = [];
  for (var g = 0; g < groups.length; g++) {
    var nodes = document.querySelectorAll(groups[g].sel);
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].classList.add("reveal");
      nodes[i].setAttribute("data-delay", String(i * groups[g].step));
      items.push(nodes[i]);
    }
  }
  var clip = document.querySelectorAll(".project");
  for (var c = 0; c < clip.length; c++) {
    clip[c].classList.add("reveal-clip");
    items.push(clip[c]);
  }

  var io = new IntersectionObserver(function (entries) {
    for (var e = 0; e < entries.length; e++) {
      if (!entries[e].isIntersecting) { continue; }
      var el = entries[e].target;
      io.unobserve(el);
      var delay = Number(el.getAttribute("data-delay") || 0);
      if (el.classList.contains("reveal-clip")) {
        el.animate(
          [{ opacity: 0, clipPath: "inset(14% 8% round 28px)" }, { opacity: 1, clipPath: "inset(0% 0% round 28px)" }],
          { duration: 1100, easing: MOTION.spring, fill: "backwards" }
        );
      } else {
        var fromX = 0;
        if (el.classList.contains("step") && window.innerWidth > 760) {
          fromX = el.matches(":nth-child(odd)") ? -36 : 36;
        }
        el.animate(
          [{ opacity: 0, translate: fromX + "px 32px" }, { opacity: 1, translate: "0 0" }],
          { duration: 900, delay: delay, easing: MOTION.spring, fill: "backwards" }
        );
      }
      el.classList.add("is-in");
    }
  }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
  for (var k = 0; k < items.length; k++) { io.observe(items[k]); }
})();

/* ---------- Rolling button labels: the label rolls up and a copy rolls in, letter by letter ---------- */
(function () {
  if (MOTION.reduce) { return; }
  var buttons = document.querySelectorAll(".btn");

  function row(text, extra) {
    var wrap = document.createElement("span");
    wrap.className = "roll-row " + extra;
    for (var i = 0; i < text.length; i++) {
      var ch = document.createElement("span");
      ch.className = "ch";
      ch.style.setProperty("--c", i);
      ch.textContent = text.charAt(i);
      wrap.appendChild(ch);
    }
    return wrap;
  }

  for (var b = 0; b < buttons.length; b++) {
    var btn = buttons[b];
    var nodes = btn.childNodes;
    for (var n = 0; n < nodes.length; n++) {
      var node = nodes[n];
      if (node.nodeType !== 3) { continue; }
      var text = node.nodeValue.replace(/\s+/g, " ").trim();
      if (!text) { continue; }
      var roll = document.createElement("span");
      roll.className = "roll";
      var a = row(text, "roll-a");
      var copy = row(text, "roll-b");
      var label = document.createElement("span");
      label.className = "sr-only";
      label.textContent = text;
      a.setAttribute("aria-hidden", "true");
      copy.setAttribute("aria-hidden", "true");
      roll.appendChild(label);
      roll.appendChild(a);
      roll.appendChild(copy);
      btn.replaceChild(roll, node);
      break;
    }
  }
})();

/* ---------- Tilt cards on pointer devices ---------- */
(function () {
  if (MOTION.reduce || !MOTION.fine) { return; }
  var cards = document.querySelectorAll(".service");
  var max = 5;
  Array.prototype.forEach.call(cards, function (card) {
    card.addEventListener("pointermove", function (event) {
      var r = card.getBoundingClientRect();
      var px = (event.clientX - r.left) / r.width - 0.5;
      var py = (event.clientY - r.top) / r.height - 0.5;
      card.classList.add("is-tilting");
      card.style.setProperty("--ry", (px * max * 2).toFixed(2) + "deg");
      card.style.setProperty("--rx", (-py * max * 2).toFixed(2) + "deg");
    });
    card.addEventListener("pointerleave", function () {
      card.classList.remove("is-tilting");
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--rx", "0deg");
    });
  });
})();

/* ---------- Header: hides while scrolling down, returns on scroll up ---------- */
(function () {
  var header = document.querySelector(".site-header");
  var menu = document.getElementById("site-menu");
  if (!header || MOTION.reduce) { return; }
  var last = window.scrollY || 0;
  var ticking = false;

  function update() {
    var y = window.scrollY || 0;
    var dy = y - last;
    var menuOpen = menu && menu.classList.contains("is-open");
    var focusInside = !!header.querySelector(":focus-visible");
    if (menuOpen || focusInside || y < 160) {
      header.classList.remove("is-hidden");
    } else if (dy > 6) {
      header.classList.add("is-hidden");
    } else if (dy < -6) {
      header.classList.remove("is-hidden");
    }
    if (Math.abs(dy) > 6) { last = y; }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }, { passive: true });
})();

/* ---------- About copy: words light up with the scroll ---------- */
(function () {
  if (!document.documentElement.classList.contains("js") || MOTION.reduce) { return; }
  var paras = document.querySelectorAll(".about-copy p");
  if (!paras.length) { return; }
  var groups = [];
  for (var p = 0; p < paras.length; p++) {
    var list = paras[p].textContent.trim().split(/\s+/);
    paras[p].textContent = "";
    var sr = document.createElement("span");
    sr.className = "sr-only";
    sr.textContent = list.join(" ");
    paras[p].appendChild(sr);
    var vis = document.createElement("span");
    vis.setAttribute("aria-hidden", "true");
    var spans = [];
    for (var i = 0; i < list.length; i++) {
      var s = document.createElement("span");
      s.className = "sw";
      s.textContent = list[i];
      vis.appendChild(s);
      if (i < list.length - 1) { vis.appendChild(document.createTextNode(" ")); }
      spans.push(s);
    }
    paras[p].appendChild(vis);
    groups.push({ el: paras[p], spans: spans, lit: 0 });
  }

  var ticking = false;
  function update() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var g = 0; g < groups.length; g++) {
      var rect = groups[g].el.getBoundingClientRect();
      var start = vh * 0.88;
      var end = vh * 0.42;
      var prog = (start - rect.top) / (start - end + rect.height * 0.6);
      prog = Math.max(0, Math.min(1, prog));
      var count = Math.round(prog * groups[g].spans.length);
      if (count === groups[g].lit) { continue; }
      for (var i = 0; i < groups[g].spans.length; i++) {
        if (i < count) { groups[g].spans[i].classList.add("on"); }
        else { groups[g].spans[i].classList.remove("on"); }
      }
      groups[g].lit = count;
    }
    ticking = false;
  }
  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();

/* ---------- Process S-curve connector (dynamic from marker positions) + scroll progress ---------- */
(function () {
  var steps = document.querySelector(".steps");
  if (!steps) return;

  var stepItems = steps.querySelectorAll(".step");
  var nums = steps.querySelectorAll(".step-num");
  var wrap = steps.parentElement;
  var svg = wrap ? wrap.querySelector(".steps-connector") : null;
  var track = svg ? svg.querySelector(".track") : null;
  var progress = svg ? svg.querySelector(".track-progress") : null;
  var dot = svg ? svg.querySelector(".track-dot") : null;
  var blobA = document.querySelector(".hero-bg .b1");
  var blobB = document.querySelector(".hero-bg .b2");
  var pathLen = 0;
  var ticking = false;

  function isDesktop() {
    return window.innerWidth > 760;
  }

  // One continuous S: the line enters above marker 1, leaves each marker
  // vertically and swings across the gap to the next marker, then runs
  // on below marker 4. It stays inside the gap between the two columns.
  function buildSPath(pts) {
    var f = function (n) { return n.toFixed(1); };
    var first = pts[0];
    var last = pts[pts.length - 1];
    var d = "M " + f(first.x) + " " + f(first.y - 64) + " L " + f(first.x) + " " + f(first.y);
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i];
      var c = pts[i + 1];
      var k = (c.y - a.y) * 0.55;
      d += " C " + f(a.x) + " " + f(a.y + k) + " " + f(c.x) + " " + f(c.y - k) + " " + f(c.x) + " " + f(c.y);
    }
    d += " L " + f(last.x) + " " + f(last.y + 64);
    return d;
  }

  function updateConnectorGeometry() {
    if (!svg || !track || !progress || nums.length < 4) { return; }
    if (!isDesktop()) {
      svg.style.display = "none";
      return;
    }
    svg.style.display = "";

    var contRect = wrap.getBoundingClientRect();
    var w = Math.round(contRect.width);
    var h = Math.round(contRect.height);
    if (w < 40 || h < 40) { return; }

    var pts = [];
    for (var i = 0; i < 4; i++) {
      var r = nums[i].getBoundingClientRect();
      pts.push({
        x: r.left + r.width * 0.5 - contRect.left,
        y: r.top + r.height * 0.5 - contRect.top
      });
    }

    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("preserveAspectRatio", "xMinYMin meet");

    var d = buildSPath(pts);
    track.setAttribute("d", d);
    progress.setAttribute("d", d);

    try {
      pathLen = track.getTotalLength() || 0;
    } catch (e) {
      pathLen = 0;
    }

    if (pathLen > 0) {
      progress.style.strokeDasharray = pathLen;
      applyPathProgress(readingLine() - wrap.getBoundingClientRect().top);
    }
  }

  // The path only ever runs downward, so the point where the reading line
  // meets it can be found by searching along its length.
  function lengthAtY(targetY) {
    var lo = 0;
    var hi = pathLen;
    for (var i = 0; i < 28; i++) {
      var mid = (lo + hi) / 2;
      if (track.getPointAtLength(mid).y < targetY) { lo = mid; } else { hi = mid; }
    }
    return (lo + hi) / 2;
  }

  function applyPathProgress(targetY) {
    if (!progress || pathLen <= 0 || !isDesktop()) { return; }
    var len = MOTION.reduce ? pathLen : lengthAtY(targetY);
    len = Math.max(0, Math.min(pathLen, len));
    progress.style.strokeDashoffset = (pathLen - len).toFixed(1);
    if (dot && !MOTION.reduce) {
      var pt = track.getPointAtLength(len);
      dot.setAttribute("cx", pt.x.toFixed(1));
      dot.setAttribute("cy", pt.y.toFixed(1));
      wrap.classList.toggle("is-drawn", len > 4 && len < pathLen - 4);
    }
  }

  function readingLine() {
    return (window.innerHeight || document.documentElement.clientHeight) * 0.62;
  }

  function updateScrollProgress() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var y = window.scrollY || 0;

    if (steps) {
      var rect = wrap.getBoundingClientRect();
      var p = (vh * 0.62 - rect.top) / Math.max(rect.height, 1);
      p = Math.max(0, Math.min(1, p));
      steps.style.setProperty("--p", p.toFixed(3));

      var reach = readingLine();
      for (var i = 0; i < stepItems.length; i++) {
        var nr = nums[i].getBoundingClientRect();
        var mark = isDesktop() ? nr.top + nr.height / 2 : stepItems[i].getBoundingClientRect().top + 30;
        stepItems[i].classList.toggle("is-on", mark < reach);
      }

      applyPathProgress(reach - rect.top);
    }

    if (!MOTION.reduce) {
      if (blobA && y < 1400) {
        blobA.style.translate = "0 " + (y * 0.12).toFixed(1) + "px";
        if (blobB) blobB.style.translate = "0 " + (y * -0.08).toFixed(1) + "px";
      }
    }
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateScrollProgress);
    }
  }

  function scheduleGeometry() {
    // Double rAF so layout has settled after font / content changes
    requestAnimationFrame(function () {
      requestAnimationFrame(updateConnectorGeometry);
    });
  }

  // ResizeObserver on the steps container
  if (typeof ResizeObserver !== "undefined") {
    var ro = new ResizeObserver(function () {
      scheduleGeometry();
    });
    ro.observe(wrap);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    scheduleGeometry();
    onScroll();
  });

  // Fonts can change metrics
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleGeometry);
  }

  // Initial
  scheduleGeometry();
  updateScrollProgress();
})();

/* ---------- Riverflow waves ----------
   Four layers per wave. Each layer slides sideways by the scroll distance at its own speed, so
   the water looks like it flows past as you scroll. Fast scrolling swells the crests and a spring
   settles them again, the same idea as Motion's scroll velocity examples. ---------- */
(function () {
  var wraps = document.querySelectorAll("[data-river]");
  if (!wraps.length) { return; }
  var PERIOD = 1440;
  var rivers = [];

  for (var i = 0; i < wraps.length; i++) {
    var layers = wraps[i].querySelectorAll(".river-layer, .river-highlight");
    var list = [];
    for (var j = 0; j < layers.length; j++) {
      list.push({ node: layers[j], speed: parseFloat(layers[j].getAttribute("data-speed")) || 1, gain: j < 4 ? 1 - j * 0.14 : 0.7 });
    }
    rivers.push({ el: wraps[i], layers: list, phase: parseFloat(wraps[i].getAttribute("data-phase")) || 0, visible: false });
  }

  var target = window.scrollY || 0;
  var current = target;
  var swell = 0;
  var idle = 0;
  var running = false;
  var idleSpeed = Number(CONFIG.riverIdleSpeed) || 0;

  function paint(river, flow, amp) {
    for (var k = 0; k < river.layers.length; k++) {
      var layer = river.layers[k];
      var dir = (k === 1) ? -0.65 : 1;
      var turns = (flow * layer.speed * dir + river.phase + k * 0.17) % 1;
      if (turns < 0) { turns += 1; }
      var x = turns * PERIOD;
      var bob = Math.sin((flow * 6.28318) + k * 1.3 + river.phase * 6.28) * (3.5 * layer.gain);
      var scale = 1 + (amp - 1) * layer.gain;
      layer.node.style.transform = "translate3d(" + (-x).toFixed(1) + "px," + bob.toFixed(2) + "px,0) scaleY(" + scale.toFixed(3) + ")";
    }
  }

  function paintAll(flow, amp) {
    for (var r = 0; r < rivers.length; r++) {
      if (rivers[r].visible) { paint(rivers[r], flow, amp); }
    }
  }

  if (MOTION.reduce) {
    for (var s = 0; s < rivers.length; s++) {
      rivers[s].el.classList.add("is-in");
      paint(rivers[s], 0, 1);
    }
    return;
  }

  function frame() {
    var diff = target - current;
    var step = diff * 0.085;
    current += step;
    idle += idleSpeed;
    var velocity = Math.min(Math.abs(step), 40);
    var wanted = 1 + Math.min(0.22, velocity * 0.02);
    swell += (wanted - swell) * 0.14;
    paintAll((current + idle * 900) / 900, swell);
    if (Math.abs(diff) > 0.2 || Math.abs(swell - 1) > 0.004) {
      window.requestAnimationFrame(frame);
    } else if (idleSpeed > 0) {
      // Gentle idle drift: keep the animation alive only while visible on screen.
      var anyVisible = rivers.some(function (rv) { return rv.visible; });
      if (!document.hidden && anyVisible) { window.requestAnimationFrame(frame); }
      else { running = false; }
    } else {
      running = false;
      swell = 1;
      paintAll((current + idle * 900) / 900, 1);
    }
  }

  function wake() {
    target = window.scrollY || 0;
    if (!running) { running = true; window.requestAnimationFrame(frame); }
  }

  function markIn(river) {
    river.el.classList.add("is-in");
    var svg = river.el.querySelector("svg");
    if (svg) { svg.classList.add("is-in"); }
  }

  if (MOTION.hasIO) {
    var io = new IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e++) {
        var river = null;
        for (var r = 0; r < rivers.length; r++) {
          if (rivers[r].el === entries[e].target) { river = rivers[r]; }
        }
        if (!river) { continue; }
        river.visible = entries[e].isIntersecting;
        if (river.visible) {
          markIn(river);
          paint(river, current / 900, swell || 1);
        }
      }
    }, { rootMargin: "0px 0px 12% 0px" });
    for (var o = 0; o < rivers.length; o++) { io.observe(rivers[o].el); }
  } else {
    for (var f = 0; f < rivers.length; f++) { rivers[f].visible = true; markIn(rivers[f]); }
  }

  window.addEventListener("scroll", wake, { passive: true });
  window.addEventListener("resize", wake);
  swell = 1;
  wake();
})();


/* ---------- Interactive spotlight on work card & magnetic buttons (motion.dev) ---------- */
(function () {
  if (MOTION.reduce || !MOTION.fine) { return; }
  var projectCard = document.querySelector(".project");
  if (projectCard) {
    projectCard.addEventListener("pointermove", function (e) {
      var r = projectCard.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width) * 100;
      var y = ((e.clientY - r.top) / r.height) * 100;
      projectCard.style.setProperty("--mx", x.toFixed(1) + "%");
      projectCard.style.setProperty("--my", y.toFixed(1) + "%");
    });
  }

  var magnets = document.querySelectorAll(".btn-primary, .btn-light");
  Array.prototype.forEach.call(magnets, function (btn) {
    btn.addEventListener("pointermove", function (e) {
      var r = btn.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
      var dy = (e.clientY - (r.top + r.height / 2)) * 0.22;
      btn.style.transform = "translate3d(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px,0)";
    });
    btn.addEventListener("pointerleave", function () {
      btn.style.transform = "";
    });
  });
})();

/* ---------- Client feedback: auto-rotating quotes, 5 seconds each, dots to navigate, pauses on hover/focus ---------- */
(function () {
  var root = document.querySelector("[data-testimonials]");
  if (!root) { return; }
  var section = root.closest("section") || root;
  var slides = root.querySelectorAll("[data-fb-slide]");
  var dots = root.querySelectorAll("[data-fb-dot]");
  var now = root.querySelector("[data-fb-now]");
  var stage = root.querySelector("[data-fb-stage]");
  var DELAY = 5000;
  var autoplay = !MOTION.reduce; // visitors who prefer reduced motion get manual navigation only
  if (slides.length < 2 || dots.length !== slides.length) { return; }

  var index = 0;
  var anim = null;
  var timer = null;
  var hovering = false;
  var focusing = false;
  var hidden = document.hidden;

  function paused() { return hovering || focusing || hidden; }

  function stop() {
    if (anim) { anim.onfinish = null; anim.cancel(); anim = null; }
    clearTimeout(timer);
  }

  // The thin fill on the active dot is the 5 second clock; when it completes the next quote shows.
  // Pausing pauses that same clock, so a quote always gets its full time on screen.
  function start() {
    stop();
    if (!autoplay) { return; }
    var fill = dots[index].firstElementChild.firstElementChild;
    if (fill.animate) {
      anim = fill.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: DELAY, easing: "linear", fill: "forwards" });
      anim.onfinish = function () { show(index + 1); };
      sync();
    } else {
      timer = setTimeout(function () { if (paused()) { start(); } else { show(index + 1); } }, DELAY);
    }
  }

  function sync() {
    if (!anim) { return; }
    if (paused()) { anim.pause(); } else { anim.play(); }
  }

  function show(i) {
    index = (i + slides.length) % slides.length;
    for (var k = 0; k < slides.length; k++) {
      var on = k === index;
      slides[k].classList.toggle("is-active", on);
      if (on) {
        slides[k].removeAttribute("aria-hidden");
        slides[k].removeAttribute("inert");
        dots[k].setAttribute("aria-current", "true");
      } else {
        slides[k].setAttribute("aria-hidden", "true");
        slides[k].setAttribute("inert", "");
        dots[k].removeAttribute("aria-current");
      }
    }
    if (now) { now.textContent = String(index + 1).padStart(2, "0"); }
    start();
  }

  for (var d = 0; d < dots.length; d++) {
    (function (n) {
      dots[n].addEventListener("click", function () { show(n); });
    })(d);
  }

  // Keyboard: Left/Right arrows on a focused dot move between quotes
  for (var q = 0; q < dots.length; q++) {
    dots[q].addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") { return; }
      e.preventDefault();
      show(index + (e.key === "ArrowRight" ? 1 : -1));
      dots[index].focus();
    });
  }

  // Hover pauses with a mouse only; on touch screens a tap would otherwise leave it paused.
  section.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { hovering = true; sync(); } });
  section.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { hovering = false; sync(); } });
  root.addEventListener("focusin", function () { focusing = true; sync(); });
  root.addEventListener("focusout", function () { focusing = false; sync(); });
  document.addEventListener("visibilitychange", function () { hidden = document.hidden; sync(); });

  // Swipe on touch screens
  var startX = null;
  stage.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    if (startX === null) { return; }
    var dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 48) { show(index + (dx < 0 ? 1 : -1)); }
  }, { passive: true });

  show(0);
})();

/* ---------- Alpha Assist: rule-based assistant (no server, answers come from the site's own content) ---------- */
(function () {
  var root = document.querySelector("[data-aa]");
  if (!root) { return; }

  var toggle = root.querySelector("[data-aa-toggle]");
  var panel = root.querySelector(".aa-panel");
  var closeBtn = root.querySelector("[data-aa-close]");
  var log = root.querySelector("[data-aa-log]");
  var chips = root.querySelector("[data-aa-chips]");
  var form = root.querySelector("[data-aa-form]");
  var input = root.querySelector("[data-aa-input]");
  if (!toggle || !panel || !log || !form || !input) { return; }

  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var finePointer = !!(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  var waNumber = String(CONFIG.whatsappNumber || "").replace(/\D/g, "");
  var waHref = waNumber ? "https://wa.me/" + waNumber + "?text=" + encodeURIComponent("Hi Shivam, I would like to talk about a project.") : "";
  var MAX_NODES = 60;

  /* Links that can sit under an answer */
  function contactAct() { return { label: "Open the contact form", href: document.getElementById("contact") ? "#contact" : "/contact/", main: true }; }
  function whatsappAct() { return waHref ? { label: "Chat on WhatsApp", href: waHref, external: true, wa: true } : null; }
  function emailAct() { return CONFIG.email ? { label: "Email Shivam", href: "mailto:" + CONFIG.email } : null; }
  function caseAct() { return { label: "Read the case study", href: "/work/geetva/", main: true }; }

  var ANSWERS = {
    welcome: { text: "Hello, I'm Alpha Assist. I can answer common questions about Alphabet Infosystems: what is built, how a project works and where Shivam is based. For anything specific, I'll point you to Shivam directly." },
    hello: { text: "Hello. Ask me about services, pricing, how a project works or how to get in touch." },
    thanks: { text: "You're welcome. If you would like to take it further, the contact form is the quickest way to reach Shivam.", acts: function () { return [contactAct()]; } },
    services: { text: "Shivam designs and builds business websites, ERP systems, SaaS products and AI automation. Each project is shaped around how your team already works." },
    pricing: { text: "There is no fixed price list. You send a short message, Shivam replies with questions if anything is unclear, and you receive a written estimate with the scope, the price and the timeline. Nothing starts until you agree.", acts: function () { return [contactAct(), whatsappAct()]; } },
    timeline: { text: "The timeline depends on the size of the project, so it is given in the written estimate instead of being guessed in advance." },
    start: { text: "Send a short message about your business and what the project should achieve. Shivam replies by email, with questions if anything is unclear, then sends a written estimate.", acts: function () { return [contactAct(), whatsappAct(), emailAct()]; } },
    work: { text: "Geetva Enterprise, a precision brass and metal manufacturer in GIDC Jamnagar, is live in production. Its case study is on this site.", acts: function () { return [caseAct()]; } },
    support: { text: "After the project goes live, Shivam stays available for updates and fixes. Ask about ongoing support when you request the estimate." },
    mobile: { text: "Yes. Websites are designed for small screens first and checked on a phone before they go live." },
    needs: { text: "A short description of your business and what the website or software should do. Logos, photos, product details or examples you like help, but they are not required." },
    languages: { text: "Shivam works in Gujarati and English." },
    location: { text: "Shivam is based in Rajkot, Gujarat, India. Work is handled by email and calls, so your location does not limit the project." },
    fallback: { text: "I may not have an answer for that. I can help with services, pricing, how a project works or location, and Shivam can answer anything else directly.", acts: function () { return [contactAct(), whatsappAct()]; } }
  };

  /* First match wins, so more specific topics come before broader ones */
  var INTENTS = [
    ["thanks", /\b(thanks?|thank you|thx)\b/],
    ["pricing", /\b(price|prices|pricing|cost|costs|budget|quote|quotation|estimate|fee|fees|charge|charges|rate|rates|how much)\b|\u20b9/],
    ["timeline", /\b(how long|timeline|deadline|duration|turnaround|delivery time|weeks?|days?)\b/],
    ["work", /\b(your work|portfolio|case stud(y|ies)|examples?|samples?|geetva|previous (work|projects?)|past (work|projects?))\b/],
    ["support", /\b(support|maintenance|maintain|after (launch|delivery|it goes live|the site goes live)|updates?|fixes)\b/],
    ["mobile", /\b(mobile|responsive|small screens?)\b/],
    ["needs", /\b(what do you need|need from me|what should i (send|prepare|bring)|requirements?)\b/],
    ["languages", /\b(languages?|gujarati|english)\b/],
    ["start", /\b(start|begin|hire|contact|reach|talk|speak|email|e-?mail|whatsapp|call|get in touch|work with|get started|enquiry|inquiry)\b/],
    ["location", /\b(where|location|located|based|rajkot|gujarat|india|city|office|remote|outside)\b/],
    ["services", /\b(services?|build|builds|offer|offers|websites?|web ?design|erp|saas|automation|automate|ai|software|apps?|what do you (do|make))\b/],
    ["hello", /^(hi|hello|hey|namaste|kem cho)\b|^good (morning|afternoon|evening)\b/],
  ];

  function match(text) {
    var t = String(text || "").toLowerCase();
    for (var i = 0; i < INTENTS.length; i++) {
      if (INTENTS[i][1].test(t)) { return INTENTS[i][0]; }
    }
    return "fallback";
  }

  function trim() {
    while (log.children.length > MAX_NODES) { log.removeChild(log.firstChild); }
  }

  function toBottom() { log.scrollTop = log.scrollHeight; }

  function makeAction(a) {
    var link = document.createElement("a");
    link.className = "aa-act" + (a.main ? " aa-act-main" : "");
    link.href = a.href;
    if (a.external) {
      link.target = "_blank";
      link.rel = "noopener";
    }
    if (a.wa) {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "icon icon-fill");
      svg.setAttribute("aria-hidden", "true");
      var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", "#i-wa-logo");
      svg.appendChild(use);
      link.appendChild(svg);
    }
    link.appendChild(document.createTextNode(a.label));
    if (a.href.charAt(0) === "#") {
      link.addEventListener("click", function () { closeBot(false); });
    }
    return link;
  }

  function addUser(text) {
    var el = document.createElement("div");
    el.className = "aa-msg user";
    el.textContent = text;
    log.appendChild(el);
    trim();
    toBottom();
  }

  function addBot(answer) {
    var el = document.createElement("div");
    el.className = "aa-msg bot";
    var p = document.createElement("p");
    p.textContent = answer.text;
    el.appendChild(p);
    var acts = answer.acts ? answer.acts().filter(Boolean) : [];
    if (acts.length) {
      var row = document.createElement("div");
      row.className = "aa-acts";
      for (var i = 0; i < acts.length; i++) { row.appendChild(makeAction(acts[i])); }
      el.appendChild(row);
    }
    log.appendChild(el);
    trim();
    toBottom();
  }

  function addTyping() {
    var el = document.createElement("div");
    el.className = "aa-msg bot aa-typing";
    el.setAttribute("aria-hidden", "true");
    for (var ti = 0; ti < 3; ti++) { el.appendChild(document.createElement("i")); }
    log.appendChild(el);
    toBottom();
    return el;
  }

  /* Replies are shown one after another, even if the visitor sends several questions quickly */
  var queue = [];
  var busy = false;

  function drain() {
    var key = queue.shift();
    if (!key) { busy = false; return; }
    busy = true;
    var answer = ANSWERS[key];
    var typing = addTyping();
    var wait = reduce ? 120 : Math.min(1100, 380 + answer.text.length * 5);
    setTimeout(function () {
      if (typing.parentNode) { typing.parentNode.removeChild(typing); }
      addBot(answer);
      drain();
    }, wait);
  }

  function ask(text) {
    var value = String(text || "").replace(/\s+/g, " ").trim();
    if (!value) { return; }
    addUser(value);
    queue.push(match(value));
    if (!busy) { drain(); }
  }

  var opened = false;

  function openBot() {
    root.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    if ("inert" in panel) { panel.inert = false; }
    if (!opened) {
      opened = true;
      addBot(ANSWERS.welcome);
    }
    if (finePointer) { setTimeout(function () { input.focus(); }, 320); }
  }

  function closeBot(returnFocus) {
    var hadFocus = panel.contains(document.activeElement);
    root.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    if ("inert" in panel) { panel.inert = true; }
    if (returnFocus || hadFocus) { toggle.focus(); }
  }

  if ("inert" in panel) { panel.inert = true; }

  toggle.addEventListener("click", function () {
    if (root.classList.contains("is-open")) { closeBot(false); } else { openBot(); }
  });
  if (closeBtn) { closeBtn.addEventListener("click", function () { closeBot(true); }); }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var value = input.value;
    input.value = "";
    ask(value);
  });

  if (chips) {
    chips.addEventListener("click", function (event) {
      var btn = event.target.closest ? event.target.closest("[data-aa-q]") : null;
      if (btn) { ask(btn.textContent); }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && root.classList.contains("is-open")) { closeBot(true); }
  });
})();
