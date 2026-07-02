/* ============================================================
   Forge Cleaning & Property Services — interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---- current year in footer ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- sticky header shadow/condense on scroll ---- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (window.scrollY > 12) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- mobile menu ---- */
  var toggle = document.getElementById("nav-toggle");
  var menu = document.getElementById("mobile-menu");
  function setMenu(open) {
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    toggle.innerHTML = open
      ? '<svg aria-hidden="true"><use href="#i-close"/></svg>'
      : '<svg aria-hidden="true"><use href="#i-menu"/></svg>';
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(menu.hidden);
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) setMenu(false);
    });
  }

  /* ---- reveal on scroll ---- */
  var groups = document.querySelectorAll("[data-reveal-group]");
  var revealEls = [];
  groups.forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (child, i) {
      child.setAttribute("data-reveal", "");
      child.style.transitionDelay = Math.min(i * 60, 300) + "ms";
      revealEls.push(child);
    });
  });
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- FAQ: keep it an accordion (only one open) ---- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---- touch devices: tap a service card to reveal its "Request a Quote" button ---- */
  if (window.matchMedia && window.matchMedia("(hover: none), (pointer: coarse)").matches) {
    var svcCards = document.querySelectorAll(".service-card:not(.service-card--cta)");
    svcCards.forEach(function (card) {
      card.addEventListener("click", function (e) {
        if (e.target.closest(".card-cta")) return; // let the button link work
        var isOpen = card.classList.contains("revealed");
        svcCards.forEach(function (c) { c.classList.remove("revealed"); });
        if (!isOpen) card.classList.add("revealed");
      });
    });
    // tapping elsewhere collapses any revealed card
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".service-card")) {
        svcCards.forEach(function (c) { c.classList.remove("revealed"); });
      }
    });
  }

  /* ---- quote form submission ---- */
  var form = document.getElementById("quote-form");
  if (!form) return;
  var statusEl = document.getElementById("qf-status");
  var submitBtn = document.getElementById("qf-submit");

  function showStatus(type, msg) {
    statusEl.hidden = false;
    statusEl.className = "form-status " + type;
    statusEl.textContent = msg;
  }
  function clearInvalid() {
    form.querySelectorAll(".invalid").forEach(function (el) { el.classList.remove("invalid"); });
  }
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate() {
    clearInvalid();
    var problems = [];
    var name = form.name, phone = form.phone, email = form.email;
    if (!name.value.trim()) { name.classList.add("invalid"); problems.push(name); }
    if (!phone.value.trim()) { phone.classList.add("invalid"); problems.push(phone); }
    if (!emailRe.test(email.value.trim())) { email.classList.add("invalid"); problems.push(email); }
    return problems;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var problems = validate();
    if (problems.length) {
      showStatus("error", "Please add your name, phone, and a valid email so we can reach you.");
      problems[0].focus();
      return;
    }

    var payload = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      service: form.service.value,
      message: form.message.value.trim(),
      company: form.company.value // honeypot
    };

    submitBtn.disabled = true;
    var originalLabel = submitBtn.textContent;
    submitBtn.textContent = "Sending…";
    statusEl.hidden = true;

    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (r) {
        if (r.ok) {
          form.reset();
          showStatus("success", "Thanks! Your request is on its way to Mike. We'll be in touch shortly — for anything urgent, call (904) 469-7439.");
        } else {
          showStatus("error", (r.data && r.data.error) || "Something went wrong sending your request. Please call (904) 469-7439 or email mike@forgecleaningandpropertyservices.com.");
        }
      })
      .catch(function () {
        showStatus("error", "We couldn't reach the server. Please call (904) 469-7439 or email mike@forgecleaningandpropertyservices.com.");
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      });
  });
})();
