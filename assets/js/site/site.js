/* Progressive enhancement only: theme toggle, mobile menu, section reveal, current-section nav, copy email. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");

  var storage = {
    get: function (key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set: function (key, value) { try { localStorage.setItem(key, value); } catch (e) { /* ignore */ } }
  };

  // Theme: explicit choice wins; otherwise follow the system.
  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    var systemLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    var current = function () { return root.getAttribute("data-theme") || (systemLight ? "light" : "dark"); };
    var label = function () { toggle.setAttribute("aria-label", current() === "light" ? "Switch to dark theme" : "Switch to light theme"); };
    label();
    toggle.addEventListener("click", function () {
      var next = current() === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      storage.set("bp-theme", next);
      label();
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
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
