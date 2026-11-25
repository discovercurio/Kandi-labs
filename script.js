/* =================================================================
   Kandi-Labs: script.js
   Vanilla JS, no dependencies. Every feature is progressive: the page
   reads and links correctly without JavaScript.
   ================================================================= */
(function () {
  "use strict";

  var cfg = window.KANDI_CONFIG || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------------
     1. Shopify links: every [data-shop-link="path.in.config"]
  --------------------------------------------------------------- */
  var shopBase = String(cfg.shopUrl || "https://kandi-labs.myshopify.com").replace(/\/+$/, "");

  function lookup(obj, path) {
    return path.split(".").reduce(function (o, key) {
      return o && Object.prototype.hasOwnProperty.call(o, key) ? o[key] : undefined;
    }, obj);
  }

  function shopUrl(key) {
    var value = lookup(cfg.links || {}, key);
    if (typeof value !== "string" || !value.trim()) return shopBase + "/";
    value = value.trim();
    if (/^https?:\/\//i.test(value)) return value;
    return shopBase + (value.charAt(0) === "/" ? value : "/" + value);
  }

  $$("[data-shop-link]").forEach(function (a) {
    a.href = shopUrl(a.getAttribute("data-shop-link"));
  });

  /* ---------------------------------------------------------------
     2. Footer: year, social links, email
  --------------------------------------------------------------- */
  $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  var socialList = $("[data-social-list]");
  var socials = Array.isArray(cfg.social) ? cfg.social.filter(function (s) { return s && s.url && s.label; }) : [];
  if (socialList && socials.length) {
    socials.forEach(function (s) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = s.url;
      a.textContent = s.label;
      a.rel = "noopener me";
      a.target = "_blank";
      a.setAttribute("aria-label", s.label + " (opens in a new tab)");
      li.appendChild(a);
      socialList.appendChild(li);
    });
    socialList.hidden = false;
  }

  var emailItem = $("[data-email-item]");
  if (emailItem && cfg.email) {
    var emailLink = $("[data-email-link]", emailItem);
    emailLink.href = "mailto:" + cfg.email;
    emailLink.textContent = cfg.email;
    emailItem.hidden = false;
  }

  /* ---------------------------------------------------------------
     3. Media slots: product photos or GLB models from config.media
  --------------------------------------------------------------- */
  var modelViewerRequested = false;
  function loadModelViewer() {
    if (modelViewerRequested || !cfg.modelViewerSrc) return;
    modelViewerRequested = true;
    var s = document.createElement("script");
    s.type = "module";
    s.src = cfg.modelViewerSrc;
    document.head.appendChild(s);
  }

  $$("[data-media]").forEach(function (slot) {
    var item = (cfg.media || {})[slot.getAttribute("data-media")];
    if (!item) return;

    if (item.glb) {
      loadModelViewer();
      var mv = document.createElement("model-viewer");
      mv.setAttribute("src", item.glb);
      mv.setAttribute("alt", item.alt || "3D preview");
      mv.setAttribute("camera-controls", "");
      mv.setAttribute("touch-action", "pan-y");
      mv.setAttribute("loading", "lazy");
      mv.setAttribute("shadow-intensity", "1");
      if (item.image) mv.setAttribute("poster", item.image);
      if (!reduceMotion.matches) mv.setAttribute("auto-rotate", "");
      slot.appendChild(mv);
      slot.classList.add("has-media");
    } else if (item.image) {
      var img = new Image();
      img.src = item.image;
      img.alt = item.alt || "";
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", function () { img.remove(); slot.classList.remove("has-media"); });
      slot.appendChild(img);
      slot.classList.add("has-media");
    }
  });

  /* ---------------------------------------------------------------
     4. Header: scrolled state + mobile menu
  --------------------------------------------------------------- */
  var header = $("[data-header]");
  var nav = $("[data-nav]");
  var toggle = $("[data-nav-toggle]");
  var toggleLabel = $("[data-nav-toggle-label]");
  var mobileQuery = window.matchMedia("(max-width: 980px)");

  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setMenu(open, returnFocus) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    if (toggleLabel) toggleLabel.textContent = open ? "Close menu" : "Open menu";
    nav.classList.toggle("is-open", open);
    header.classList.toggle("is-open", open);
    if (!open && returnFocus) toggle.focus();
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") setMenu(false, true);
    });
    document.addEventListener("click", function (e) {
      if (toggle.getAttribute("aria-expanded") === "true" && !header.contains(e.target)) setMenu(false);
    });
    var onBreakpoint = function (e) { if (!e.matches) setMenu(false); };
    if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", onBreakpoint);
  }

  /* ---------------------------------------------------------------
     5. Active nav link follows the section in view
  --------------------------------------------------------------- */
  var navLinks = $$(".site-nav__link");
  var linkFor = {};
  navLinks.forEach(function (a) { linkFor[a.getAttribute("href").slice(1)] = a; });

  if ("IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
        var link = linkFor[entry.target.id];
        if (link) link.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main > section[id]").forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------------------------------------------------------------
     6. Scroll reveal (staggered inside grids)
  --------------------------------------------------------------- */
  var revealEls = $$("[data-reveal]");
  revealEls.forEach(function (el) {
    var siblings = el.parentElement ? $$(":scope > [data-reveal]", el.parentElement) : [];
    var i = siblings.indexOf(el);
    if (i > 0) el.style.setProperty("--reveal-delay", Math.min(i * 80, 400) + "ms");
  });

  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------------------------------------------------------
     7. SVG (SMIL) animations respect reduced motion
  --------------------------------------------------------------- */
  function syncSmil() {
    $$("svg[data-smil]").forEach(function (svg) {
      if (!svg.pauseAnimations) return;
      if (reduceMotion.matches) svg.pauseAnimations(); else svg.unpauseAnimations();
    });
  }
  syncSmil();
  if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", syncSmil);

  /* ---------------------------------------------------------------
     8. Paper Theater "lights out"
  --------------------------------------------------------------- */
  $$("[data-lights-toggle]").forEach(function (btn) {
    var scope = btn.closest("[data-lights-scope]");
    var label = $("[data-lights-label]", btn);
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", String(on));
      if (label) label.textContent = on ? "Lights on" : "Lights out";
      if (scope) scope.classList.toggle("is-lights-out", on);
    });
  });

  /* ---------------------------------------------------------------
     9. "Play with Orbit" color demo (illustration only)
  --------------------------------------------------------------- */
  var demo = $("#orbit-demo");
  if (demo) initDemo(demo);

  function initDemo(root) {
    var COLORS = [
      { id: "kandi-purple", name: "Kandi Purple", hex: "#C335EF" },
      { id: "lavender", name: "Lavender", hex: "#E9C8FF" },
      { id: "snow", name: "Snow White", hex: "#F7F5FA" },
      { id: "midnight", name: "Midnight", hex: "#2C2735" },
      { id: "bubblegum", name: "Bubblegum Pink", hex: "#FF7FC8" },
      { id: "cherry", name: "Cherry Red", hex: "#FF4D5E" },
      { id: "sunset", name: "Sunset Orange", hex: "#FF8A3D" },
      { id: "lemon", name: "Lemon Drop", hex: "#FFE15A" },
      { id: "lime", name: "Lime Rave", hex: "#B6F542" },
      { id: "mint", name: "Mint Teal", hex: "#2FD4C0" },
      { id: "electric", name: "Electric Blue", hex: "#3FA9FF" },
      { id: "violet", name: "Deep Violet", hex: "#7B4DFF" }
    ];
    var FINISHES = [
      { id: "matte", name: "Matte" },
      { id: "silk", name: "Silk / metallic" },
      { id: "glitter", name: "Glitter" },
      { id: "translucent", name: "Translucent" },
      { id: "glow", name: "Glow in the dark" },
      { id: "dual", name: "Dual color" },
      { id: "rainbow", name: "Rainbow" }
    ];
    var REGIONS = ["sprout", "planet", "ring", "sparkle"];
    var REGION_NAMES = { sprout: "Sprout", planet: "Planet", ring: "Ring", sparkle: "Sparkle" };
    var ZONES = {
      1: [{ id: "all", label: "Whole piece", regions: REGIONS.slice() }],
      2: [
        { id: "a", label: "Sprout + ring", regions: ["sprout", "ring"] },
        { id: "b", label: "Planet + sparkle", regions: ["planet", "sparkle"] }
      ],
      4: REGIONS.map(function (r) { return { id: r, label: REGION_NAMES[r], regions: [r] }; })
    };
    var DEFAULTS = {
      sprout: { color: "kandi-purple", finish: "matte" },
      planet: { color: "snow", finish: "matte" },
      ring: { color: "kandi-purple", finish: "matte" },
      sparkle: { color: "snow", finish: "matte" }
    };

    var canvas = $("[data-demo-canvas]", root);
    var svg = $(".demo__svg", root);
    var targetsEl = $("[data-demo-targets]", root);
    var swatchesEl = $("[data-demo-swatches]", root);
    var finishesEl = $("[data-demo-finishes]", root);
    var colorNameEl = $("[data-demo-color-name]", root);
    var statusEl = $("[data-demo-status]", root);
    var lightsBtn = $("[data-demo-lights]", root);
    var lightsLabel = $("[data-demo-lights-label]", root);
    var defs = svg.querySelector("defs");
    var NS = "http://www.w3.org/2000/svg";

    var state = { zones: 4, active: "sprout", lightsOut: false, regions: clone(DEFAULTS) };

    function clone(o) { return JSON.parse(JSON.stringify(o)); }
    function colorById(id) { return COLORS.filter(function (c) { return c.id === id; })[0] || COLORS[0]; }
    function finishById(id) { return FINISHES.filter(function (f) { return f.id === id; })[0] || FINISHES[0]; }
    function zoneList() { return ZONES[state.zones]; }
    function activeZone() { return zoneList().filter(function (z) { return z.id === state.active; })[0] || zoneList()[0]; }
    function zoneStyle(zone) { return state.regions[zone.regions[0]]; }

    /* color helpers */
    function hexToRgb(h) { h = h.replace("#", ""); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
    function rgbToHex(r) { return "#" + r.map(function (v) { return Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"); }).join(""); }
    function mix(a, b, t) { var x = hexToRgb(a), y = hexToRgb(b); return rgbToHex(x.map(function (v, i) { return v + (y[i] - v) * t; })); }
    function hueShift(hex, deg) {
      var rgb = hexToRgb(hex).map(function (v) { return v / 255; });
      var max = Math.max.apply(null, rgb), min = Math.min.apply(null, rgb), l = (max + min) / 2, h = 0, s = 0, d = max - min;
      if (d) {
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        h = max === rgb[0] ? (rgb[1] - rgb[2]) / d + (rgb[1] < rgb[2] ? 6 : 0) : max === rgb[1] ? (rgb[2] - rgb[0]) / d + 2 : (rgb[0] - rgb[1]) / d + 4;
        h *= 60;
      } else { s = 0.6; l = Math.min(Math.max(l, 0.45), 0.7); }
      h = (h + deg + 360) % 360;
      var c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, out;
      out = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
      return rgbToHex(out.map(function (v) { return (v + m) * 255; }));
    }

    /* per-region gradients for silk and dual finishes */
    function gradient(id, stops, x2, y2) {
      var g = document.getElementById(id);
      if (!g) {
        g = document.createElementNS(NS, "linearGradient");
        g.id = id;
        defs.appendChild(g);
      }
      g.setAttribute("x1", "0"); g.setAttribute("y1", "0");
      g.setAttribute("x2", x2); g.setAttribute("y2", y2);
      while (g.firstChild) g.removeChild(g.firstChild);
      stops.forEach(function (s) {
        var st = document.createElementNS(NS, "stop");
        st.setAttribute("offset", s[0]);
        st.setAttribute("stop-color", s[1]);
        g.appendChild(st);
      });
      return "url(#" + id + ")";
    }

    function paintRegion(region) {
      var layer = svg.querySelector('[data-region-layer="' + region + '"]');
      var fillEl = layer.querySelector(".demo-fill");
      var st = state.regions[region];
      var hex = colorById(st.color).hex;
      var fill = hex, opacity = "1";

      switch (st.finish) {
        case "silk":
          fill = gradient("silk-" + region, [[0, mix(hex, "#ffffff", 0.55)], [0.3, hex], [0.55, mix(hex, "#000000", 0.28)], [0.78, mix(hex, "#ffffff", 0.35)], [1, hex]], "1", "1");
          break;
        case "translucent":
          fill = mix(hex, "#ffffff", 0.15); opacity = "0.55";
          break;
        case "glow":
          fill = state.lightsOut ? hex : mix(hex, "#ffffff", 0.55);
          break;
        case "dual":
          var second = hueShift(hex, 75);
          fill = gradient("dual-" + region, [[0, hex], [0.44, hex], [0.56, second], [1, second]], "1", "0");
          break;
        case "rainbow":
          fill = "url(#rainbow)";
          break;
      }
      fillEl.style.fill = fill;
      fillEl.style.fillOpacity = opacity;
      layer.setAttribute("data-finish", st.finish);
    }

    function paintAll() { REGIONS.forEach(paintRegion); }

    /* builders */
    function radio(name, value, labelHtml, checked, extra) {
      var label = document.createElement("label");
      var input = document.createElement("input");
      input.type = "radio"; input.name = name; input.value = value; input.checked = !!checked;
      if (extra && extra.ariaLabel) input.setAttribute("aria-label", extra.ariaLabel);
      if (extra && extra.title) label.title = extra.title;
      var span = document.createElement("span");
      span.innerHTML = labelHtml;
      if (extra && extra.style) span.setAttribute("style", extra.style);
      label.appendChild(input); label.appendChild(span);
      return label;
    }

    function buildTargets() {
      targetsEl.innerHTML = "";
      targetsEl.setAttribute("role", "radiogroup");
      targetsEl.setAttribute("aria-label", "Part to color");
      zoneList().forEach(function (z) {
        var hex = colorById(zoneStyle(z).color).hex;
        targetsEl.appendChild(radio("demo-target", z.id, '<i class="zone-dot" style="background:' + hex + '"></i>' + z.label, z.id === state.active));
      });
    }

    function buildSwatches() {
      swatchesEl.setAttribute("role", "radiogroup");
      swatchesEl.setAttribute("aria-label", "Filament color");
      COLORS.forEach(function (c) {
        swatchesEl.appendChild(radio("demo-color", c.id, "", false, { ariaLabel: c.name, title: c.name, style: "--sw:" + c.hex }));
      });
    }

    function buildFinishes() {
      finishesEl.setAttribute("role", "radiogroup");
      finishesEl.setAttribute("aria-label", "Finish");
      FINISHES.forEach(function (f) { finishesEl.appendChild(radio("demo-finish", f.id, f.name, false)); });
    }

    function syncControls() {
      var st = zoneStyle(activeZone());
      $$("input", swatchesEl).forEach(function (i) { i.checked = i.value === st.color; });
      $$("input", finishesEl).forEach(function (i) { i.checked = i.value === st.finish; });
      $$('input[name="demo-target"]', targetsEl).forEach(function (i) { i.checked = i.value === state.active; });
      $$('input[name="zones"]', root).forEach(function (i) { i.checked = Number(i.value) === state.zones; });
      if (colorNameEl) colorNameEl.textContent = "· " + colorById(st.color).name;
    }

    function refreshDots() {
      zoneList().forEach(function (z, idx) {
        var dot = targetsEl.querySelectorAll(".zone-dot")[idx];
        if (dot) dot.style.background = colorById(zoneStyle(z).color).hex;
      });
    }

    function announce(zone) {
      var st = zoneStyle(zone);
      statusEl.textContent = zone.label + ": " + colorById(st.color).name + ", " + finishById(st.finish).name.toLowerCase() + ".";
    }

    function applyToZone(zone, patch) {
      zone.regions.forEach(function (r) {
        if (patch.color) state.regions[r].color = patch.color;
        if (patch.finish) state.regions[r].finish = patch.finish;
      });
      zone.regions.forEach(paintRegion);
      refreshDots();
      syncControls();
      announce(zone);
    }

    function setZones(n) {
      state.zones = n;
      zoneList().forEach(function (z) {
        var lead = clone(state.regions[z.regions[0]]);
        z.regions.forEach(function (r) { state.regions[r] = clone(lead); });
      });
      state.active = zoneList()[0].id;
      buildTargets();
      paintAll();
      syncControls();
      statusEl.textContent = n === 1 ? "One color for the whole piece." : n + " separate color regions.";
    }

    function setLights(off) {
      state.lightsOut = off;
      canvas.classList.toggle("is-lights-out", off);
      lightsBtn.setAttribute("aria-pressed", String(off));
      lightsLabel.textContent = off ? "Lights on" : "Lights out";
      paintAll();
      var glowing = REGIONS.some(function (r) { return state.regions[r].finish === "glow"; });
      statusEl.textContent = off ? (glowing ? "Lights out. Glow parts are glowing." : "Lights out. Pick the glow in the dark finish to see a part glow.") : "Lights on.";
    }

    /* events */
    $$('input[name="zones"]', root).forEach(function (i) {
      i.addEventListener("change", function () { setZones(Number(i.value)); });
    });
    targetsEl.addEventListener("change", function (e) {
      if (e.target.name !== "demo-target") return;
      state.active = e.target.value;
      syncControls();
    });
    swatchesEl.addEventListener("change", function (e) { applyToZone(activeZone(), { color: e.target.value }); });
    finishesEl.addEventListener("change", function (e) { applyToZone(activeZone(), { finish: e.target.value }); });
    lightsBtn.addEventListener("click", function () { setLights(!state.lightsOut); });

    svg.addEventListener("click", function (e) {
      var layer = e.target.closest("[data-region-layer]");
      if (!layer) return;
      var region = layer.getAttribute("data-region-layer");
      var zone = zoneList().filter(function (z) { return z.regions.indexOf(region) > -1; })[0];
      if (!zone) return;
      state.active = zone.id;
      syncControls();
      var input = targetsEl.querySelector('input[value="' + zone.id + '"]');
      if (input) input.focus({ preventScroll: true });
    });

    $("[data-demo-random]", root).addEventListener("click", function () {
      var weighted = ["matte", "matte", "silk", "silk", "glitter", "translucent", "glow", "dual", "rainbow"];
      zoneList().forEach(function (z) {
        var patch = {
          color: COLORS[Math.floor(Math.random() * COLORS.length)].id,
          finish: weighted[Math.floor(Math.random() * weighted.length)]
        };
        z.regions.forEach(function (r) { state.regions[r] = clone(patch); });
      });
      paintAll(); refreshDots(); syncControls();
      statusEl.textContent = "New random colors applied.";
    });

    $("[data-demo-reset]", root).addEventListener("click", function () {
      state.regions = clone(DEFAULTS);
      state.zones = 4;
      state.active = "sprout";
      if (state.lightsOut) setLights(false);
      buildTargets(); paintAll(); syncControls();
      statusEl.textContent = "Colors reset to the original Orbit.";
    });

    buildSwatches();
    buildFinishes();
    buildTargets();
    paintAll();
    syncControls();
  }

  window.KandiLabs = { shopUrl: shopUrl };
  window.__kandiReady = true;
})();
