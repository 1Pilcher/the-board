
// Nine chapters dot field, drawn in its finished state:
// 9 ink dots for the nine chapters of the featured report
// (the first one red for Chapter One).
(function(){
  var f=document.getElementById('dotfield');
  if(!f) return;
  for(var i=0;i<9;i++){
    var d=document.createElement('i');
    if(i===0) d.className='r';
    f.appendChild(d);
  }
})();
// Genuine tabs: clicking a tab switches the view. Only the blocks that
// belong to the active tab are shown; the other views are hidden entirely,
// not scrolled to. The active tab turns red and centers in the pill, the
// page returns to the top, and the hash names the open tab.
(function(){
  var nav=document.getElementById('menu');
  var track=document.getElementById('menuTrack');
  if(!nav||!track) return;
  var links=Array.prototype.slice.call(track.querySelectorAll('a[data-tab]'));
  var blocks=Array.prototype.slice.call(document.querySelectorAll('[data-view]'));
  var tabs={};
  links.forEach(function(a){ tabs[a.getAttribute('data-tab')]=a; });
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll-aware edge fades, and centered tabs when the whole row fits.
  function updateFades(){
    var max=track.scrollWidth-track.clientWidth;
    if(max<=2){ nav.classList.add('fits'); nav.setAttribute('data-fade','none'); return; }
    nav.classList.remove('fits');
    var x=track.scrollLeft;
    nav.setAttribute('data-fade', x<=2 ? 'right' : (x>=max-2 ? 'left' : 'both'));
  }

  // Glide the row so the given tab sits in the middle of the pill. Only the
  // row scrolls, never the page. First and last tabs clamp at the row ends.
  function centerTab(a){
    var max=track.scrollWidth-track.clientWidth;
    if(max<=0){ updateFades(); return; }
    var target=a.offsetLeft+a.offsetWidth/2-track.clientWidth/2;
    target=Math.max(0,Math.min(max,target));
    if(Math.abs(target-track.scrollLeft)<2){ updateFades(); return; }
    track.scrollTo({left:target,behavior:reduce?'auto':'smooth'});
  }

  var currentId=null;
  function showTab(id,opts){
    opts=opts||{};
    var a=tabs[id];
    if(!a) id='latest',a=tabs[id];
    links.forEach(function(x){
      var on=x===a;
      x.classList.toggle('active',on);
      x.setAttribute('aria-selected',on?'true':'false');
    });
    blocks.forEach(function(b){ b.hidden=b.getAttribute('data-view')!==id; });
    currentId=id;
    centerTab(a);
    if(!opts.keepScroll) window.scrollTo(0,0);
    if(!opts.keepHash){
      try{ history.replaceState(null,'','#'+id); }catch(e){}
    }
    // Page height just changed: refresh the fades.
    updateFades();
  }

  links.forEach(function(a){
    a.addEventListener('click',function(e){
      e.preventDefault();
      showTab(a.getAttribute('data-tab'));
    });
  });
  track.addEventListener('scroll',updateFades,{passive:true});
  window.addEventListener('resize',function(){
    updateFades();
    var a=tabs[currentId];
    if(a) centerTab(a);
  });
  window.addEventListener('hashchange',function(){
    var id=(location.hash||'').slice(1);
    if(tabs[id]&&id!==currentId) showTab(id,{keepHash:true});
  });
  window.addEventListener('load',updateFades);

  var initial=(location.hash||'').slice(1);
  showTab(tabs[initial]?initial:'latest',{keepScroll:true,keepHash:true});
})();
