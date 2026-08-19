/* NEW REPAIR FORMATION — comportements du site (aucune dépendance, aucun traceur) */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  /* Vidéo d'ambiance du héros : version allégée sur mobile ; jamais si économie de données ou animations réduites ; chargée après le reste */
  var heroVid = document.querySelector(".heros__video");
  if (heroVid && window.matchMedia
      && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      && !(navigator.connection && navigator.connection.saveData)) {
    var large = window.matchMedia("(min-width: 900px)").matches;
    window.addEventListener("load", function () {
      heroVid.src = large ? heroVid.getAttribute("data-src") : heroVid.getAttribute("data-src-mobile");
      heroVid.addEventListener("canplay", function () { heroVid.classList.add("prete"); var p = heroVid.play(); if (p && p.catch) p.catch(function () {}); }, { once: true });
      heroVid.load();
    });
  }

  /* Menu mobile */
  var burger = document.querySelector(".burger");
  var navMobile = document.getElementById("nav-mobile");
  if (burger && navMobile) {
    burger.addEventListener("click", function () {
      var ouvert = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!ouvert));
      navMobile.setAttribute("data-ouvert", String(!ouvert));
    });
  }

  /* Apparition au défilement — appliquée automatiquement aux éléments de structure (sans JS, tout reste visible) */
  var reduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduit) {
    var auto = ".section__tete, .carte, .etapes li, .frise li, .fiche, .faits div, .citation, .encadre, .deux > .c5, .deux > .c6, .deux > .c7, .deux > .d6, .deux > .d7, .deux > .d9, .tableau--compare, .faq details, .kpi div";
    document.querySelectorAll(auto).forEach(function (el, i) { if (!el.classList.contains("apparait")) { el.classList.add("apparait"); if (!el.hasAttribute("data-delai")) { var idx = Array.prototype.indexOf.call(el.parentNode.children, el); el.setAttribute("data-delai", String(Math.min(idx % 6, 5))); } } });
    /* calendrier : le trait se dessine quand la frise entre dans l'écran */
    document.querySelectorAll(".frise").forEach(function (c) { c.classList.add("frise--anime"); });
    /* compteurs du héros */
    document.querySelectorAll(".heros__repères strong").forEach(function (el) {
      var m = el.textContent.match(/^(\D*?)(\d+)(.*)$/); if (!m) return;
      var cible = parseInt(m[2], 10), debut = null, duree = 1100;
      function pas(ts) { if (!debut) debut = ts; var p = Math.min(1, (ts - debut) / duree); var e = 1 - Math.pow(1 - p, 3); el.textContent = m[1] + Math.round(cible * e) + m[3]; if (p < 1) requestAnimationFrame(pas); }
      el.textContent = m[1] + "0" + m[3]; requestAnimationFrame(pas);
    });
  }
  var cibles = document.querySelectorAll(".apparait");
  if ("IntersectionObserver" in window && cibles.length) {
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    cibles.forEach(function (c) { obs.observe(c); });
    var obsCal = new IntersectionObserver(function (entrees) { entrees.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("visible"); obsCal.unobserve(e.target); } }); }, { threshold: 0.2 });
    document.querySelectorAll(".frise--anime").forEach(function (c) { obsCal.observe(c); });
  } else {
    cibles.forEach(function (c) { c.classList.add("visible"); });
  }

  /* Formulaire de contact : validation et envoi sans rechargement */
  var form = document.getElementById("formulaire-contact");
  if (!form) return;
  /* Pré-remplissage depuis le simulateur d'éligibilité (paramètres d'URL, rien n'est envoyé avant validation) */
  try {
    var prm = new URLSearchParams(window.location.search);
    ["profil", "poste", "message"].forEach(function (k) { var v = prm.get(k); var c = form.elements[k]; if (v && c && !c.value) c.value = v; });
    if (prm.get("message")) { var m = form.elements["message"]; if (m) { m.value = m.value + "\n\nMes coordonnées et ma demande : "; } }
  } catch (e) {}
  var retour = document.getElementById("retour-formulaire");
  var bouton = form.querySelector('button[type="submit"]');

  function erreur(champ, message) {
    var zone = champ.closest(".champ") || champ.parentElement;
    var msg = zone.querySelector(".erreur");
    if (message) {
      if (!msg) { msg = document.createElement("p"); msg.className = "erreur"; msg.setAttribute("role", "alert"); zone.appendChild(msg); }
      msg.textContent = message; champ.setAttribute("aria-invalid", "true");
    } else {
      if (msg) msg.remove(); champ.removeAttribute("aria-invalid");
    }
  }

  function valider() {
    var ok = true;
    form.querySelectorAll("[required]").forEach(function (c) {
      var vide = c.type === "checkbox" ? !c.checked : !c.value.trim();
      var mauvaisMail = c.type === "email" && c.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.value);
      if (vide) { erreur(c, c.type === "checkbox" ? "Votre accord est nécessaire pour envoyer le message." : "Ce champ est nécessaire."); ok = false; }
      else if (mauvaisMail) { erreur(c, "Vérifiez l’adresse e‑mail."); ok = false; }
      else erreur(c, null);
    });
    return ok;
  }

  form.addEventListener("submit", function (ev) {
    if (!window.fetch || form.dataset.apercu) return; /* sans fetch ou en aperçu : envoi classique */
    ev.preventDefault();
    if (!valider()) { var premier = form.querySelector('[aria-invalid="true"]'); if (premier) premier.focus(); return; }
    bouton.disabled = true; bouton.textContent = "Envoi en cours…";
    retour.hidden = true;
    var donnees = new FormData(form);
    donnees.append("ajax", "1");
    fetch(form.getAttribute("action"), { method: "POST", body: donnees, headers: { "Accept": "application/json" }, credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        retour.hidden = false;
        retour.className = "retour " + (j.ok ? "retour--ok" : "retour--ko");
        retour.textContent = j.message;
        if (j.ok) form.reset();
        retour.focus();
      })
      .catch(function () {
        retour.hidden = false; retour.className = "retour retour--ko";
        retour.textContent = "L’envoi n’a pas abouti. Vous pouvez nous écrire directement à contact@nrformation.fr.";
      })
      .finally(function () { bouton.disabled = false; bouton.textContent = "Envoyer la demande"; });
  });
})();
