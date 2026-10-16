"use strict";

/*
 * love-poem — "Our Anthology".
 *
 * A small shelf of original short poems for Mena. One is featured for today
 * (deterministic by day-of-year); you can shuffle, keep favourites and send a
 * poem as a link (?n=index). Everything is local (localStorage `mena-poem`).
 */

(function () {
  var POEMS = [
    { title: "White", body:
      "You wear white like a season,\nlike snow that decided to stay.\nI keep finding quiet places\nwhere the light looks like you." },
    { title: "Pizza at Midnight", body:
      "Two cities, two ovens,\nand the same midnight hunger.\nWe split a photo between us\nand call it a meal together." },
    { title: "Free Fire", body:
      "We met between the gunfire\nof a game that meant nothing,\nand somehow built a country\nout of one smooth landing." },
    { title: "Distance", body:
      "Four thousand kilometres\nis only a number.\nLove counts in seconds,\nand ours never stops." },
    { title: "Art", body:
      "You look at the world\nlike it is still wet paint —\neach ordinary thing\nwaiting for its name." },
    { title: "Nature", body:
      "I used to think the trees\nwere quiet from a distance.\nThen I heard you describe them,\nand every leaf had a voice." },
    { title: "Same Sky", body:
      "The sun sets on Karachi,\nthen on Bucharest an hour later —\nproof, if anyone asks,\nthat we share one sky." },
    { title: "The First Spark", body:
      "Before we were born,\nyou say, we were already us.\nI only know that somewhere\nthe universe smiled." },
    { title: "Her Laugh", body:
      "There is a sound\nthe day makes better,\nand it happens\nwhenever you laugh." },
    { title: "Bucharest Rain", body:
      "I imagine the rain there\nfinding your window first,\nand I am suddenly jealous\nof ordinary weather." },
    { title: "Kitchen", body:
      "If love has a smell,\nit is something burning\nwhile we laugh,\nand call it dinner." },
    { title: "Forever", body:
      "Not a promise of years —\na promise of ordinary Tuesdays,\nof coffee going cold\nwhile we talk about nothing." },
    { title: "Your Name", body:
      "Himena —\nsix small letters,\na whole language\nI keep learning by heart." },
    { title: "The Map", body:
      "I trace a line on the map\nand call it a road.\nYou trace the same line\nand call it coming home." },
    { title: "Awake", body:
      "I learned the timezones\nlike a second alphabet,\njust to know\nwhen you might be smiling." },
    { title: "Small Things", body:
      "It is not the grand gestures\nthat keep me here —\nit is how you say good morning\nlike you mean it." },
    { title: "Our Garden", body:
      "We plant things in pixels\nand water them with words.\nStill, somehow, they bloom,\nand still, somehow, so do we." },
    { title: "Always", body:
      "Always is a big word.\nI mean it anyway.\nNot loud, not often —\njust true." }
  ];

  var LS = "mena-poem";
  var state = { read: 0, kept: [] };
  var currentIndex = null;

  function $(id) { return document.getElementById(id); }

  function load() {
    try {
      var raw = window.localStorage.getItem(LS);
      if (!raw) return;
      var p = JSON.parse(raw);
      state.read = p.read | 0;
      state.kept = Array.isArray(p.kept) ? p.kept.filter(function (n) {
        return typeof n === "number" && n >= 0 && n < POEMS.length;
      }) : [];
    } catch (e) {}
  }

  function save() {
    try { window.localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {}
  }

  function dayOfYear(d) {
    var start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / 86400000);
  }

  function featuredIndex() {
    var d = new Date();
    return dayOfYear(d) % POEMS.length;
  }

  function todayIndex() { return featuredIndex(); }

  function fmtDate(d) {
    var months = ["January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"];
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  }

  function render(markRead) {
    var p = POEMS[currentIndex];
    $("poem-title").textContent = p.title;
    $("poem-body").textContent = p.body;
    $("poem-date").textContent = fmtDate(new Date());
    if (markRead) { state.read++; save(); }
    renderStats();
    renderKept();
  }

  function renderStats() {
    $("read").textContent = String(state.read);
    $("kept").textContent = String(state.kept.length);
    $("shelf-size").textContent = String(POEMS.length);
  }

  function renderKept() {
    var list = $("kept-list");
    list.textContent = "";
    if (!state.kept.length) {
      var li = document.createElement("li");
      li.className = "empty";
      li.textContent = "Nothing kept yet \u2014 hold on to the ones that stay with you.";
      list.appendChild(li);
      return;
    }
    state.kept.forEach(function (idx) {
      var li = document.createElement("li");
      li.textContent = POEMS[idx].title + " \u2014 " + POEMS[idx].body.split("\n")[0];
      list.appendChild(li);
    });
  }

  function another() {
    if (POEMS.length <= 1) { currentIndex = 0; render(true); return; }
    var idx;
    do { idx = Math.floor(Math.random() * POEMS.length); } while (idx === currentIndex);
    currentIndex = idx;
    render(true);
    $("note").textContent = "A new one for you \u2665";
  }

  function showToday() {
    currentIndex = todayIndex();
    render(true);
    $("note").textContent = "Today's poem, always the same until tomorrow \u2665";
  }

  function keep() {
    if (state.kept.indexOf(currentIndex) >= 0) {
      $("note").textContent = "Already kept \u2665";
      return;
    }
    state.kept.unshift(currentIndex);
    if (state.kept.length > 30) state.kept = state.kept.slice(0, 30);
    save();
    renderKept();
    renderStats();
    $("note").textContent = "Kept \u2014 this one is yours \u2665";
  }

  function share() {
    var url;
    try {
      url = window.location.origin + window.location.pathname + "?n=" + currentIndex;
    } catch (e) { url = "?n=" + currentIndex; }
    function ok() { $("note").textContent = "Link copied \u2014 send it to her \u2665"; }
    function bad() { $("note").textContent = "Copy this link: " + url; }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(ok, bad);
      } else bad();
    } catch (e) { bad(); }
  }

  function clearKept() {
    state.kept = [];
    save();
    renderKept();
    renderStats();
    $("note").textContent = "Cleared \u2014 the poems stay in the anthology.";
  }

  function readArrival() {
    var params;
    try { params = new URLSearchParams(window.location.search); } catch (e) { return false; }
    var n = params.get("n");
    if (n === null) return false;
    var idx = Number(n);
    if (!(idx >= 0 && idx < POEMS.length)) return false;
    currentIndex = idx;
    render(false);
    $("arrive-note").textContent = "Ammar sent you this poem \u2665";
    $("arrive-note").hidden = false;
    return true;
  }

  function boot() {
    load();
    var arrived = readArrival();
    if (!arrived) {
      currentIndex = featuredIndex();
      render(true);
    }
    $("another").addEventListener("click", another);
    $("today").addEventListener("click", showToday);
    $("keep").addEventListener("click", keep);
    $("share").addEventListener("click", share);
    $("clear").addEventListener("click", clearKept);

    if (typeof navigator !== "undefined" && navigator.serviceWorker) {
      try { navigator.serviceWorker.register("sw.js"); } catch (e) {}
    }
  }

  boot();
})();
