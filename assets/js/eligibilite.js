/* Simulateur d'éligibilité POEI — règles France Travail 2026, exécuté dans le navigateur, aucune donnée transmise. */
(function () {
  "use strict";
  var racine = document.getElementById("simulateur");
  if (!racine) return;
  var zoneQ = document.getElementById("simu-question"), form = document.getElementById("simu-form"),
      btnRetour = document.getElementById("simu-retour"), btnSuivant = document.getElementById("simu-suivant"),
      etape = document.getElementById("simu-etape"), barre = document.getElementById("simu-barre"),
      resultat = document.getElementById("simu-resultat"), lienContact = racine.getAttribute("data-contact");

  var Q = {
    profil: { titre: "Vous êtes…", options: [
      ["entreprise", "Une entreprise qui veut recruter", "Vous avez un poste à pourvoir et vous cherchez la bonne personne."],
      ["candidat", "Une personne qui cherche un emploi", "Vous voulez apprendre un métier pour un poste réel."],
      ["prescripteur", "Un conseiller ou un prescripteur", "France Travail, mission locale, structure d’insertion…"]], suivant: function (r) { return r.profil === "candidat" ? "c_inscrit" : "e_poste"; } },

    /* ---- Entreprise ---- */
    e_poste: { titre: "Le poste à pourvoir se situe…", options: [
      ["fr", "En France", "Métropole ou outre‑mer."], ["hors", "Hors de France", ""]], suivant: function () { return "e_contrat"; } },
    e_contrat: { titre: "Quel contrat envisagez‑vous à l’issue de la formation ?", options: [
      ["cdi", "CDI", ""], ["cdd6", "CDD de 6 mois ou plus", ""], ["saison4", "Contrat saisonnier de 4 mois ou plus", ""],
      ["alt", "Contrat d’apprentissage ou de professionnalisation", ""], ["cdd_court", "CDD de moins de 6 mois / intérim", ""], ["nsp", "Je ne sais pas encore", ""]], suivant: function () { return "e_formation"; } },
    e_formation: { titre: "La personne que vous allez embaucher…", options: [
      ["ecart", "Aura besoin d’être formée au poste", "Gestes, outils, procédures, rythme : il y a un écart à combler."],
      ["pret", "Sera déjà opérationnelle le premier jour", "Vous cherchez un profil déjà formé."],
      ["nsp", "Je ne sais pas encore", ""]], suivant: function () { return "e_candidat"; } },
    e_candidat: { titre: "Avez‑vous déjà identifié la personne ?", options: [
      ["oui_ft", "Oui, et elle est inscrite à France Travail", ""], ["oui_nsp", "Oui, mais je ne sais pas si elle est inscrite", ""],
      ["non", "Non, je cherche encore", "Nous faisons le sourcing avec France Travail."]], suivant: function () { return "e_metier"; } },
    e_metier: { titre: "Quel type de poste ?", options: [
      ["polyvalent", "Employé polyvalent", "Commerce de proximité, restauration rapide, services."], ["accueil", "Agent d’accueil", "Accueil physique et téléphonique, standard, orientation."],
      ["autre", "Un autre poste", "Nous construisons le parcours sur mesure."]], suivant: function () { return null; } },

    /* ---- Candidat ---- */
    c_inscrit: { titre: "Êtes‑vous inscrit à France Travail ?", options: [
      ["oui", "Oui", "Indemnisé ou non."], ["encours", "Pas encore, mais je peux m’inscrire", ""], ["non", "Non, et je ne peux pas", "Par exemple : en poste à temps plein, ou sans droit au séjour permettant de travailler."]], suivant: function () { return "c_dispo"; } },
    c_dispo: { titre: "Seriez‑vous disponible pour une formation courte à temps plein, puis pour prendre le poste ?", options: [
      ["oui", "Oui", ""], ["partiel", "Seulement à temps partiel", ""], ["non", "Non", ""]], suivant: function () { return "c_entreprise"; } },
    c_entreprise: { titre: "Une entreprise est‑elle déjà prête à vous embaucher ?", options: [
      ["oui", "Oui, un employeur me veut mais je dois être formé", ""], ["non", "Non, pas encore", "Nous travaillons à partir des besoins d’entreprises que nous accompagnons."]], suivant: function () { return "c_metier"; } },
    c_metier: { titre: "Quel métier vous intéresse ?", options: [
      ["polyvalent", "Employé polyvalent", "Commerce de proximité, restauration rapide, services."], ["accueil", "Agent d’accueil", ""], ["autre", "Autre / je ne sais pas encore", ""]], suivant: function () { return "c_situation"; } },
    c_situation: { titre: "Votre situation actuelle", options: [
      ["indemnise", "Demandeur d’emploi indemnisé", ""], ["non_indemnise", "Demandeur d’emploi non indemnisé", ""], ["rsa", "Bénéficiaire du RSA", ""], ["autre", "Autre", ""]], suivant: function () { return null; } }
  };

  var ordre = [], reponses = {}, courant = "profil";
  var total = function () { return reponses.profil === "candidat" ? 6 : 6; };

  function afficher(cle) {
    courant = cle; var q = Q[cle];
    var idx = ordre.length + 1;
    etape.textContent = "Question " + idx + " sur " + total();
    barre.style.width = Math.round((idx - 1) / total() * 100) + "%";
    var html = '<legend>' + q.titre + '</legend><div class="simu__options">';
    q.options.forEach(function (o, i) {
      var id = cle + "_" + o[0];
      html += '<label class="simu__option" for="' + id + '"><input type="radio" name="' + cle + '" id="' + id + '" value="' + o[0] + '"' + (reponses[cle] === o[0] ? " checked" : "") + (i === 0 ? "" : "") + '><span class="simu__libelle">' + o[1] + '</span>' + (o[2] ? '<span class="simu__aide">' + o[2] + '</span>' : '') + '</label>';
    });
    html += '</div><p class="erreur" hidden>Choisissez une réponse pour continuer.</p>';
    zoneQ.innerHTML = html;
    btnRetour.hidden = ordre.length === 0;
    var premier = zoneQ.querySelector("input"); if (premier) premier.focus();
    resultat.hidden = true; form.hidden = false; etape.hidden = false;
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var choisi = zoneQ.querySelector("input:checked");
    var err = zoneQ.querySelector(".erreur");
    if (!choisi) { err.hidden = false; return; }
    err.hidden = true; reponses[courant] = choisi.value; ordre.push(courant);
    var s = Q[courant].suivant(reponses);
    if (s) afficher(s); else conclure();
  });
  btnRetour.addEventListener("click", function () { if (!ordre.length) return; var prev = ordre.pop(); delete reponses[courant]; afficher(prev); });

  function conclure() {
    var r = reponses, verdict, titre, raisons = [], suite = [], profil;
    if (r.profil !== "candidat") {
      profil = r.profil;
      var bloquant = false, doute = false;
      if (r.e_poste === "hors") { bloquant = true; raisons.push("La POEI est une aide de France Travail pour un poste situé en France."); }
      if (r.e_contrat === "cdd_court") { bloquant = true; raisons.push("Le contrat prévu à l’issue doit être un CDI, un CDD d’au moins 6 mois, un contrat saisonnier d’au moins 4 mois ou un contrat en alternance. Un CDD plus court ou de l’intérim simple ne permet pas la POEI — mais un CDD de 6 mois la rend possible."); }
      else if (r.e_contrat === "nsp") { doute = true; raisons.push("Le type de contrat reste à fixer : CDI, CDD ≥ 6 mois, saisonnier ≥ 4 mois ou alternance rendent la POEI possible."); }
      else raisons.push("Le contrat envisagé (" + libelle("e_contrat") + ") fait partie des contrats éligibles.");
      if (r.e_formation === "pret") { bloquant = true; raisons.push("La POEI finance une formation qui comble un écart de compétences. Si la personne est déjà opérationnelle, c’est un recrutement direct qu’il vous faut — nous pouvons quand même vous aider à sourcer."); }
      else if (r.e_formation === "nsp") { doute = true; raisons.push("Nous vérifierons ensemble l’écart entre le profil et le poste : c’est lui qui justifie la formation."); }
      else raisons.push("Il y a un écart de compétences à combler : c’est exactement l’objet de la POEI.");
      if (r.e_candidat === "oui_nsp") { doute = true; raisons.push("La personne doit être inscrite à France Travail (indemnisée ou non) ; l’inscription peut se faire avant le dépôt du dossier."); }
      else if (r.e_candidat === "oui_ft") raisons.push("La personne est inscrite à France Travail : condition remplie.");
      else raisons.push("Pas encore de candidat : nous assurons le sourcing et le tri avec France Travail.");
      if (r.e_metier === "polyvalent" || r.e_metier === "accueil") raisons.push("Le poste correspond à l’une de nos formations (" + libelle("e_metier") + ") : le parcours est prêt à être individualisé.");
      else raisons.push("Poste hors catalogue : nous écrivons le parcours sur mesure à partir du poste réel.");
      if (bloquant) { verdict = "non"; titre = "En l’état, la POEI n’est pas adaptée — mais il y a souvent une solution."; suite = ["Nous pouvons regarder avec vous une autre voie (contrat de 6 mois, recrutement direct, autre dispositif).", "Échange de 15 minutes, sans engagement."]; }
      else if (doute) { verdict = "doute"; titre = "Éligible a priori, sous réserve d’un ou deux points à vérifier."; suite = ["Nous vérifions ces points au cadrage (30 minutes, chez vous ou à distance).", "Vous connaissez le coût exact et la date d’arrivée avant de vous engager."]; }
      else { verdict = "oui"; titre = "Bonne nouvelle : votre projet coche toutes les cases de la POEI."; suite = ["Prochaine étape : un cadrage de 30 minutes pour décrire le poste réel.", "Ensuite : dépôt de l’offre avec France Travail, sourcing, formation, embauche — deux rendez‑vous pour vous."]; }
    } else {
      profil = "candidat";
      var bl = false, dt = false;
      if (r.c_inscrit === "non") { bl = true; raisons.push("La POEI s’adresse aux personnes inscrites à France Travail. Si votre situation change, nous sommes là."); }
      else if (r.c_inscrit === "encours") { dt = true; raisons.push("Il faudra finaliser votre inscription à France Travail ; nous vous indiquons comment faire."); }
      else raisons.push("Vous êtes inscrit à France Travail : condition remplie.");
      if (r.c_dispo === "non") { bl = true; raisons.push("La formation est courte mais à temps plein, suivie de la prise de poste : la disponibilité est indispensable."); }
      else if (r.c_dispo === "partiel") { dt = true; raisons.push("À temps partiel, tout dépend du poste visé : à regarder ensemble."); }
      else raisons.push("Vous êtes disponible pour la formation puis le poste.");
      if (r.c_entreprise === "oui") raisons.push("Un employeur vous attend : c’est le cas idéal, nous montons le dossier avec lui.");
      else raisons.push("Pas encore d’employeur : nous vous positionnons sur les postes des entreprises que nous accompagnons.");
      if (r.c_metier === "polyvalent" || r.c_metier === "accueil") raisons.push("Le métier visé (" + libelle("c_metier") + ") fait partie de nos formations.");
      if (r.c_situation === "indemnise") raisons.push("Pendant la formation, vous gardez votre allocation (AREF) ; vous ne payez rien.");
      else if (r.c_situation === "non_indemnise" || r.c_situation === "rsa") raisons.push("Non indemnisé : France Travail verse une rémunération de formation pendant la POEI ; la formation est gratuite pour vous.");
      if (bl) { verdict = "non"; titre = "En l’état, la POEI n’est pas possible pour vous."; suite = ["Écrivez‑nous quand même : selon votre situation, d’autres voies existent (inscription, autre dispositif, alternance)."]; }
      else if (dt) { verdict = "doute"; titre = "Vous êtes probablement éligible : un point à régler."; suite = ["Laissez‑nous vos coordonnées : nous vous rappelons et nous réglons ce point avec vous."]; }
      else { verdict = "oui"; titre = "Bonne nouvelle : vous remplissez les conditions de la POEI."; suite = ["Prochaine étape : un entretien de 20 minutes (motivation, disponibilité, mobilité).", "Puis nous vous positionnons sur un poste réel et nous vous formons pour lui."]; }
    }
    var params = "profil=" + encodeURIComponent(profil === "candidat" ? "candidat" : profil) + "&poste=" + encodeURIComponent(libelle(profil === "candidat" ? "c_metier" : "e_metier") || "") + "&message=" + encodeURIComponent("Résultat du simulateur : " + titre + "\n\n" + raisons.map(function (x) { return "• " + x; }).join("\n"));
    var cls = { oui: "simu__verdict--oui", doute: "simu__verdict--doute", non: "simu__verdict--non" }[verdict];
    var html = '<p class="surtitre">Votre résultat</p><h2 class="simu__verdict ' + cls + '">' + titre + '</h2>'
      + '<h3 class="mt-2">Pourquoi</h3><ul class="coches mt-125">' + raisons.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul>'
      + '<h3 class="mt-2">La suite</h3><ul class="mt-125">' + suite.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul>'
      + '<div class="simu__actions mt-2"><a class="bouton" href="' + lienContact + '?' + params + '#formulaire-contact">Envoyer ma situation et être rappelé <span class="fleche" aria-hidden="true">→</span></a><button type="button" class="bouton bouton--contour" id="simu-recommencer">Recommencer</button></div>'
      + '<p class="note mt-15">Avis a priori fondé sur les règles publiées par France Travail. La décision appartient à France Travail à l’examen du dossier.</p>';
    resultat.innerHTML = html; resultat.hidden = false; form.hidden = true; etape.hidden = true; barre.style.width = "100%";
    resultat.focus();
    document.getElementById("simu-recommencer").addEventListener("click", function () { ordre = []; reponses = {}; barre.style.width = "0%"; afficher("profil"); });
  }
  function libelle(cle) { var q = Q[cle]; if (!q || !reponses[cle]) return ""; for (var i = 0; i < q.options.length; i++) if (q.options[i][0] === reponses[cle]) return q.options[i][1]; return ""; }
  afficher("profil");
})();
