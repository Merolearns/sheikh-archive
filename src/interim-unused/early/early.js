/* EARLY VISUAL ONLY - minimal boot, real DATA */
(function(){
  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
  function fmtDur(s){s=Math.round(s||0);var h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;
    return h?h+":"+String(m).padStart(2,"0")+":"+String(x).padStart(2,"0"):m+":"+String(x).padStart(2,"0")}
  var splash=document.getElementById("sp-splash"), home=document.getElementById("earlyHome");
  var skip=new URLSearchParams(location.search).get("splash")==="0";
  function enter(){splash.classList.add("done");home.style.display="block";renderRail()}
  document.getElementById("spEnter").addEventListener("click",enter);
  if(skip){enter()}
  function renderRail(){
    var pls=DATA.playlists.slice().sort(function(a,b){return b.count-a.count}).slice(0,8);
    document.getElementById("ehRail").innerHTML=pls.map(function(p){
      var tot=p.items.reduce(function(a,it){var v=byId(it.id);return a+(v&&v.duration||0)},0);
      return '<div class="eh-card"><div class="eh-thumb"><img src="'+esc(p.cover)+'" alt="" loading="lazy" onerror="this.remove()"><div class="fb">✦</div></div>'+
      '<div class="eh-body"><div class="eh-eyebrow">سلسلة · '+p.count+' درساً</div>'+
      '<h3 class="eh-title">'+esc(p.title)+'</h3>'+
      '<div class="eh-meta">'+fmtDur(tot)+' · الشيخ د. مصطفى كامل</div>'+
      '<a class="eh-open" href="#/playlist/'+p.id+'">افتح · Open</a></div></div>'
    }).join("");
  }
  var _map=null;
  function byId(id){if(!_map){_map={};DATA.videos.forEach(function(v){_map[v.id]=v})}return _map[id]}
})();
