/* Progressive enhancement only: theme toggle, mobile menu, section reveal, current-section nav, copy email. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");

  var storage = {
    get: function (key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set: function (key, value) { try { localStorage.setItem(key, value); } catch (e) { /* ignore */ } }
  };

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Theme: explicit choice wins; otherwise follow the system.
  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    var systemLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    var current = function () { return root.getAttribute("data-theme") || (systemLight ? "light" : "dark"); };
    var label = function () { toggle.setAttribute("aria-label", current() === "light" ? "Switch to dark theme" : "Switch to light theme"); };
    label();
    var flip = function () {
      var next = current() === "light" ? "dark" : "light";
      var apply = function () { root.setAttribute("data-theme", next); storage.set("bp-theme", next); label(); };
      if (document.startViewTransition && !reduceMotion) { document.startViewTransition(apply); } else { apply(); }
    };
    toggle.addEventListener("click", flip);
    document.addEventListener("keydown", function (e) {
      var tag = (e.target && e.target.tagName || "").toLowerCase();
      if (e.key === "t" && !e.metaKey && !e.ctrlKey && !e.altKey && tag !== "input" && tag !== "textarea") flip();
    });
  }

  // Mobile menu.
  var menuButton = document.querySelector(".menu-toggle");
  var headerInner = document.querySelector(".site-header__inner");
  if (menuButton && headerInner) {
    menuButton.addEventListener("click", function () {
      var open = headerInner.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
    headerInner.querySelectorAll(".site-nav a").forEach(function (link) {
      link.addEventListener("click", function () { headerInner.classList.remove("is-open"); menuButton.setAttribute("aria-expanded", "false"); });
    });
  }

  // Reveal on scroll.
  var revealItems = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); revealObserver.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealItems.forEach(function (el) { revealObserver.observe(el); });
  }

  // Highlight the section in view.
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".site-nav a[href^='#']"));
  var sections = navLinks.map(function (link) { return document.querySelector(link.getAttribute("href")); }).filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    var setCurrent = function (id) {
      navLinks.forEach(function (link) { link.classList.toggle("is-current", link.getAttribute("href") === "#" + id); });
    };
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) setCurrent(entry.target.id); });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    sections.forEach(function (section) { navObserver.observe(section); });
  }

  // Scroll progress bar.
  var progress = document.createElement("div");
  progress.className = "progress"; progress.setAttribute("aria-hidden", "true");
  document.body.prepend(progress);
  var ticking = false;
  var updateProgress = function () {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    root.style.setProperty("--progress", max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
    ticking = false;
  };
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); } }, { passive: true });
  updateProgress();

  // Cursor spotlight on cards.
  var SPOT = ".work-card, .mini-card, .stat, .contact-tile, .pub, .paper-card, .interest-card, .skill-group, .plain-card, .about-card, .glance > div, .education";
  var spots = document.querySelectorAll(SPOT);
  spots.forEach(function (el) { el.classList.add("spot"); });
  if (window.matchMedia && window.matchMedia("(hover: hover)").matches) {
    document.addEventListener("pointermove", function (e) {
      var el = e.target.closest && e.target.closest(".spot");
      if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  }

  // Rotating word in the terminal line.
  document.querySelectorAll(".term__word[data-words]").forEach(function (el) {
    var words; try { words = JSON.parse(el.getAttribute("data-words")); } catch (e) { return; }
    if (!words || words.length < 2 || reduceMotion) return;
    var i = 0, typing = true, text = "";
    var step = function () {
      var target = words[i];
      if (typing) {
        text = target.slice(0, text.length + 1); el.textContent = text;
        if (text === target) { typing = false; return setTimeout(step, 1700); }
        return setTimeout(step, 55);
      }
      text = text.slice(0, -1); el.textContent = text;
      if (!text) { typing = true; i = (i + 1) % words.length; return setTimeout(step, 250); }
      setTimeout(step, 28);
    };
    setTimeout(step, 1400);
  });

  // Count-up numbers.
  var countTargets = document.querySelectorAll(".stat dd, .pub__results dd");
  var animateNumber = function (el) {
    var raw = el.textContent.trim();
    var m = raw.match(/^([\d,]+)(\.\d+)?(%?)$/);
    if (!m) return;
    var decimals = m[2] ? m[2].length - 1 : 0;
    var end = parseFloat(raw.replace(/[,%]/g, ""));
    var start = performance.now(), dur = 1100;
    var fmt = function (v) { var s = v.toFixed(decimals); var parts = s.split("."); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); return parts.join(".") + m[3]; };
    var frame = function (now) {
      var p = Math.min(1, (now - start) / dur); var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(end * eased);
      if (p < 1) requestAnimationFrame(frame); else el.textContent = raw;
    };
    requestAnimationFrame(frame);
  };
  if (!reduceMotion && "IntersectionObserver" in window && countTargets.length) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { animateNumber(entry.target); countObserver.unobserve(entry.target); } });
    }, { threshold: 0.4 });
    countTargets.forEach(function (el) { countObserver.observe(el); });
  }

  // Copy email.
  document.querySelectorAll("[data-copy]").forEach(function (button) {
    var status = document.getElementById(button.getAttribute("aria-describedby") || "") || null;
    button.addEventListener("click", function () {
      var value = button.getAttribute("data-copy");
      var done = function (ok) { if (status) { status.textContent = ok ? "Copied " + value + " to your clipboard." : "Copy failed. The address is " + value + "."; } };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(function () { done(true); }, function () { done(false); });
      } else { done(false); }
    });
  });
}());
