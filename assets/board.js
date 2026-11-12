
(function(){
  // Static edition: no scroll engine, no animated effects. This
  // script only runs the reading chrome: the pill menu's edge
  // fades and active section, and the locked full-bleed width the
  // bands are sized from. (The progress bar's fill is CSS now,
  // keyed to the scroll position itself.) Nothing here moves,
  // hides or transforms any content.
  var root = document.documentElement;
  function setW(){
    var cw = root.clientWidth || window.innerWidth || 0;
    if(cw > 0){ root.style.setProperty("--cw", cw + "px"); root.style.setProperty("--chw", (cw / 2) + "px"); }
  }
  // Rotation repair: mid-turn, iOS reports the OLD width, and the
  // resize that follows can carry the landscape width into the
  // portrait layout - leaving --cw (and every full-bleed band
  // sized from it, the dot field's included) one orientation
  // behind, wider than the screen, with the browser zoomed out
  // to fit it. So a rotation does not trust any single event:
  // it re-measures on a short ladder of timers until the turn
  // has fully settled, takes the last (settled) width, and
  // clears any sideways pan the too-wide moment left behind.
  var settleTimers = [];
  function settleW(){
    setW();
    for(var i = 0; i < settleTimers.length; i++){ clearTimeout(settleTimers[i]); }
    settleTimers = [];
    [60, 180, 360, 700].forEach(function(ms){
      settleTimers.push(setTimeout(function(){
        setW();
        if(window.scrollX){ window.scrollTo(0, window.scrollY || 0); }
      }, ms));
    });
  }
  var nav = document.getElementById("menu");
  function fade(){
    if(!nav){ return; }
    var max = nav.scrollWidth - nav.clientWidth, next;
    if(max <= 2){ next = "none"; }
    else if(nav.scrollLeft <= 2){ next = "right"; }
    else if(nav.scrollLeft >= max - 2){ next = "left"; }
    else { next = "both"; }
    if(nav.getAttribute("data-fade") !== next){ nav.setAttribute("data-fade", next); }
  }
  if(nav){ nav.addEventListener("scroll", fade, { passive: true }); }
  window.addEventListener("resize", function(){ setW(); fade(); }, { passive: true });
  window.addEventListener("orientationchange", function(){ settleW(); fade(); }, { passive: true });
  if(window.visualViewport){ window.visualViewport.addEventListener("resize", setW, { passive: true }); }
  window.addEventListener("pageshow", settleW, { passive: true });
  var links = {};
  var pillList = document.querySelectorAll("#menu a");
  Array.prototype.forEach.call(pillList, function(a){ links[a.getAttribute("href").slice(1)] = a; });
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var activeId = null;
  // Centre the active pill: scroll the pill container (never the
  // page) so the active section's pill sits in the middle of the
  // visible pill area, but only within the row's natural scroll
  // range - scrollLeft clamped to 0 through scrollWidth minus
  // clientWidth, with no extra room at either end. For the first
  // few sections the centring target falls below 0, so it clamps
  // to 0 and the row does not move at all: those pills simply
  // highlight in place, the first one at the menu's original
  // left padding. For the last section the target exceeds the
  // range, so the row stops at max scroll and that pill also
  // highlights in place. Middle sections centre normally. Works
  // the same in both scroll directions, because it runs on every
  // change of the active section. When every pill fits there is
  // nothing to scroll and the group is already centred by the
  // end pills' auto margins.
  function centerActive(){
    if(!nav || !activeId || !links[activeId]){ return; }
    var a = links[activeId];
    var max = nav.scrollWidth - nav.clientWidth;
    if(max <= 0){ return; }
    var target = a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2;
    if(target < 0){ target = 0; } if(target > max){ target = max; }
    if(Math.abs(nav.scrollLeft - target) < 1){ return; }
    if(reduceMotion || !nav.scrollTo){ nav.scrollLeft = target; }
    else { nav.scrollTo({ left: target, behavior: "smooth" }); }
  }
  function setActive(id){
    if(id === activeId){ return; }
    activeId = id;
    for(var k in links){ links[k].classList.toggle("active", k === id); }
    // Adding .active restarts the pill's pop animation in CSS;
    // centring rides along in the same beat.
    centerActive();
  }
  Array.prototype.forEach.call(document.querySelectorAll("#menu a"), function(a){
    a.addEventListener("click", function(){ setActive(a.getAttribute("href").slice(1)); });
  });
  window.addEventListener("resize", function(){ centerActive(); fade(); }, { passive: true });
  window.addEventListener("orientationchange", function(){ centerActive(); fade(); }, { passive: true });
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(function(){ centerActive(); fade(); }); }
  if(window.IntersectionObserver){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ setActive(e.target.id); }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(links).forEach(function(id){
      var el = document.getElementById(id); if(el){ spy.observe(el); }
    });
  }
  settleW(); fade();
})();
