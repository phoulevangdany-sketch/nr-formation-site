/* NEW REPAIR FORMATION — comportements du site (aucune dépendance, aucun traceur) */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

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

  /* Apparition au défilement */
  var cibles = document.querySelectorAll(".apparait");
  if ("IntersectionObserver" in window && cibles.length) {
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    cibles.forEach(function (c) { obs.observe(c); });
  } else {
    cibles.forEach(function (c) { c.classList.add("visible"); });
  }

  /* Formulaire de contact : validation et envoi sans rechargement */
  var form = document.getElementById("formulaire-contact");
  if (!form) return;
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
