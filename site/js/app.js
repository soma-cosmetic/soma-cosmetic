/* Soma Cosmetic — catalog rendering.
   All content comes from data/settings.json and data/products.json,
   which are edited through the admin panel (Pages CMS). */

(function () {
  "use strict";

  var state = { category: "all", brand: "all" };
  var SETTINGS = {};
  var PRODUCTS = [];

  var els = {
    grid: document.getElementById("productGrid"),
    chips: document.getElementById("categoryChips"),
    brandSelect: document.getElementById("brandSelect"),
    brandPills: document.getElementById("brandPills"),
    resultsTitle: document.getElementById("resultsTitle"),
    resultsCount: document.getElementById("resultsCount"),
    emptyState: document.getElementById("emptyState"),
  };

  /* On the live site, images are resized on the fly by Netlify's image CDN
     so large phone photos never slow the page down. Locally, raw files are
     used. If the CDN request fails, the <img> falls back to the raw file. */
  var IS_LIVE = location.protocol === "https:";

  function rawSrc(path) {
    return String(path).replace(/^\/+/, "");
  }

  function imgSrc(path, size) {
    var clean = rawSrc(path);
    if (/^https?:/i.test(path)) return path;
    if (!IS_LIVE) return clean;
    return "/.netlify/images?url=/" +
      encodeURIComponent(clean).replace(/%2F/gi, "/") +
      "&w=" + size + "&h=" + size + "&fit=cover";
  }

  function makeImg(path, size, alt) {
    var img = document.createElement("img");
    img.src = imgSrc(path, size);
    img.alt = alt || "";
    img.loading = "lazy";
    img.onerror = function () {
      img.onerror = null;
      img.src = rawSrc(path);
    };
    return img;
  }

  /* Category icons are picked by keywords in the category name, so renamed
     or new categories still get a sensible icon. */
  function categoryIcon(name) {
    var n = String(name).toLowerCase();
    if (n.indexOf("shampoo") !== -1 || n.indexOf("hair") !== -1) return "shampoo";
    if (n.indexOf("shav") !== -1 || n.indexOf("razor") !== -1 || n.indexOf("trim") !== -1) return "shaver";
    if (n.indexOf("perfume") !== -1 || n.indexOf("parfum") !== -1 || n.indexOf("fragrance") !== -1) return "perfume";
    if (n.indexOf("skin") !== -1 || n.indexOf("cream") !== -1 || n.indexOf("care") !== -1) return "skincare";
    if (n.indexOf("deo") !== -1 || n.indexOf("spray") !== -1) return "deo";
    return "sparkle";
  }

  function categories() {
    var seen = [];
    PRODUCTS.forEach(function (p) {
      if (p.category && seen.indexOf(p.category) === -1) seen.push(p.category);
    });
    return seen;
  }

  function brands() {
    var seen = [];
    PRODUCTS.forEach(function (p) {
      if (p.brand && seen.indexOf(p.brand) === -1) seen.push(p.brand);
    });
    return seen.sort(function (a, b) { return a.localeCompare(b); });
  }

  /* ---------- Shop info ---------- */
  function fillShopInfo() {
    document.title = SETTINGS.shopName + " — Grooming & Beauty Catalog";
    ["shopName", "heroName", "footerName"].forEach(function (id) {
      document.getElementById(id).textContent = SETTINGS.shopName;
    });
    document.getElementById("shopTagline").textContent = SETTINGS.tagline || "";
    document.getElementById("heroTagline").textContent = SETTINGS.tagline || "";
    document.getElementById("footerYear").textContent = new Date().getFullYear();

    if (SETTINGS.logo) {
      var logo = document.getElementById("shopLogo");
      logo.src = imgSrc(SETTINGS.logo, 96);
      logo.onerror = function () { logo.onerror = null; logo.src = rawSrc(SETTINGS.logo); };
    }

    var tel = "tel:" + String(SETTINGS.phone || "").replace(/[^+\d]/g, "");
    document.getElementById("headerPhone").href = tel;
    var phoneLink = document.getElementById("contactPhone");
    phoneLink.href = tel;
    phoneLink.textContent = SETTINGS.phone || "";

    document.getElementById("contactAddress").textContent = SETTINGS.address || "";
    document.getElementById("linkInstagram").href = SETTINGS.instagram || "#";
    document.getElementById("linkFacebook").href = SETTINGS.facebook || "#";

    document.getElementById("waFloat").href =
      "https://wa.me/" + (SETTINGS.whatsapp || "") +
      "?text=" + encodeURIComponent(SETTINGS.whatsappMessage || "");
  }

  /* ---------- Filters ---------- */
  function buildCategoryChips() {
    var cats = [{ name: "all", label: "All", icon: null }].concat(
      categories().map(function (c) {
        return { name: c, label: c, icon: categoryIcon(c) };
      })
    );
    cats.forEach(function (c) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.setAttribute("role", "tab");
      btn.dataset.category = c.name;
      if (c.icon) {
        btn.innerHTML = '<svg class="icon"><use href="#i-' + c.icon + '"/></svg>';
      }
      btn.appendChild(document.createTextNode(c.label));
      btn.addEventListener("click", function () {
        state.category = c.name;
        render();
      });
      els.chips.appendChild(btn);
    });
  }

  function buildBrandControls() {
    brands().forEach(function (b) {
      var opt = document.createElement("option");
      opt.value = b;
      opt.textContent = b;
      els.brandSelect.appendChild(opt);

      var pill = document.createElement("button");
      pill.type = "button";
      pill.className = "brand-pill";
      pill.textContent = b;
      pill.addEventListener("click", function () {
        state.brand = b;
        state.category = "all";
        render();
        document.getElementById("products").scrollIntoView();
      });
      els.brandPills.appendChild(pill);
    });

    els.brandSelect.addEventListener("change", function () {
      state.brand = els.brandSelect.value;
      render();
    });
  }

  /* ---------- Rendering ---------- */
  function formatPrice(price) {
    if (price === null || price === undefined || price === "") return "Ask for price";
    return Number(price).toLocaleString("en-US") + " " + (SETTINGS.currency || "IQD");
  }

  function productCard(p) {
    var card = document.createElement("article");
    card.className = "card";

    var media = document.createElement("div");
    media.className = "card-media";
    if (p.image) {
      media.appendChild(makeImg(p.image, 640, p.brand + " " + p.name));
    } else {
      media.innerHTML =
        '<svg class="icon"><use href="#i-' + categoryIcon(p.category) + '"/></svg>';
    }

    var body = document.createElement("div");
    body.className = "card-body";

    var brand = document.createElement("span");
    brand.className = "card-brand";
    brand.textContent = p.brand || "";

    var name = document.createElement("h3");
    name.className = "card-name";
    name.textContent = p.name || "";

    var noPrice = p.price === null || p.price === undefined || p.price === "";
    var price = document.createElement("span");
    price.className = "card-price" + (noPrice ? " ask" : "");
    price.textContent = formatPrice(p.price);

    body.appendChild(brand);
    body.appendChild(name);
    body.appendChild(price);
    card.appendChild(media);
    card.appendChild(body);
    return card;
  }

  function render() {
    var filtered = PRODUCTS.filter(function (p) {
      return (state.category === "all" || p.category === state.category) &&
             (state.brand === "all" || p.brand === state.brand);
    });

    els.grid.textContent = "";
    filtered.forEach(function (p) { els.grid.appendChild(productCard(p)); });

    var title = state.category === "all" ? "All products" : state.category;
    if (state.brand !== "all") title += " · " + state.brand;
    els.resultsTitle.textContent = title;
    els.resultsCount.textContent =
      filtered.length + (filtered.length === 1 ? " item" : " items");
    els.emptyState.hidden = filtered.length !== 0;

    els.chips.querySelectorAll(".chip").forEach(function (chip) {
      chip.setAttribute("aria-selected",
        chip.dataset.category === state.category ? "true" : "false");
    });
    els.brandSelect.value = state.brand;
  }

  function showLoadError() {
    els.grid.innerHTML = "";
    var msg = document.createElement("p");
    msg.style.cssText = "grid-column:1/-1;text-align:center;color:#8B7B66;padding:2rem 0;";
    msg.textContent = "Couldn't load the catalog data. If you opened this file " +
      "directly from a folder, please view the live site instead.";
    els.grid.appendChild(msg);
  }

  /* ---------- Boot ---------- */
  function getJSON(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(url + " -> " + r.status);
      return r.json();
    });
  }

  document.getElementById("clearFilters").addEventListener("click", function () {
    state.category = "all";
    state.brand = "all";
    render();
  });

  Promise.all([getJSON("data/settings.json"), getJSON("data/products.json")])
    .then(function (results) {
      SETTINGS = results[0] || {};
      PRODUCTS = (results[1] && results[1].products) || [];
      fillShopInfo();
      buildCategoryChips();
      buildBrandControls();
      render();
    })
    .catch(function (err) {
      console.error(err);
      showLoadError();
    });
})();
