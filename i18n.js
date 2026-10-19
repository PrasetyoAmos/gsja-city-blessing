/* Terjemahan situs: ID (bawaan), EN, 中文, 한국어. Kamus ada di lang/<kode>.js */
(function(){
  var LANGS=['id','en','zh','ko'],HL={id:'id',en:'en',zh:'zh-CN',ko:'ko'},ATTRS=['alt','aria-label','placeholder','title'];
  var cur=window.GSJA_LANG||'id',tn=new WeakMap(),an=new WeakMap(),busy=false;
  function norm(s){return s.replace(/\s+/g,' ').trim()}
  function dict(){return (window.I18N_DICT&&window.I18N_DICT[cur])||null}
  function lookup(s){var d=dict();if(!d)return null;var k=norm(s);return k&&Object.prototype.hasOwnProperty.call(d,k)?d[k]:null}
  function textNode(n){
    var p=n.parentNode;if(!p||/^(SCRIPT|STYLE|NOSCRIPT)$/.test(p.nodeName))return;
    var i=tn.get(n);
    if(i&&n.data!==i.t&&n.data!==i.o)i=null;       // diubah oleh skrip halaman: anggap teks asli baru
    var o=i?i.o:n.data;
    var v=cur==='id'?null:lookup(o);
    var out=v==null?o:o.replace(norm(o),v).replace(/^(\s*)/,function(m){return m});
    if(v!=null){var lead=o.match(/^\s*/)[0],trail=o.match(/\s*$/)[0];out=lead+v+trail}
    if(out!==n.data){busy=true;n.data=out;busy=false}
    tn.set(n,{o:o,t:out});
  }
  function attrs(el){
    ATTRS.forEach(function(a){
      if(!el.hasAttribute||!el.hasAttribute(a))return;
      var m=an.get(el)||{},i=m[a],val=el.getAttribute(a);
      if(i&&val!==i.t&&val!==i.o)i=null;
      var o=i?i.o:val,v=cur==='id'?null:lookup(o),out=v==null?o:v;
      if(out!==val){busy=true;el.setAttribute(a,out);busy=false}
      m[a]={o:o,t:out};an.set(el,m);
    });
  }
  function walk(root){
    if(root.nodeType===3){textNode(root);return}
    if(root.nodeType!==1)return;
    attrs(root);
    var w=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,null),n;
    while((n=w.nextNode())){if(n.nodeType===3)textNode(n);else attrs(n)}
  }
  var meta={};
  function head(){
    if(!meta.title)meta.title=document.title;
    var d=document.querySelector('meta[name=description]');if(d&&!meta.desc)meta.desc=d.content;
    var t=cur==='id'?null:lookup(meta.title);document.title=t==null?meta.title:t;
    if(d){var v=cur==='id'?null:lookup(meta.desc);d.content=v==null?meta.desc:v}
  }
  function apply(){
    document.documentElement.lang=HL[cur];document.documentElement.setAttribute('data-lang',cur);
    walk(document.body);head();
    sync();
    try{document.dispatchEvent(new Event('gsja-lang'))}catch(e){}
  }
  var CODE={id:'ID',en:'EN',zh:'中文',ko:'한국어'};
  function sync(){
    var c=document.querySelector('.lang-cur');if(c)c.textContent=CODE[cur];
    document.querySelectorAll('.lang-opt').forEach(function(b){b.setAttribute('aria-checked',b.getAttribute('data-l')===cur?'true':'false')});
  }
  function set(l){
    if(LANGS.indexOf(l)<0)return;
    try{localStorage.setItem('gsja-lang',l)}catch(e){}
    function go(){cur=l;window.GSJA_LANG=l;apply()}
    if(l==='id'||(window.I18N_DICT&&window.I18N_DICT[l]))return go();
    var s=document.createElement('script');s.src='lang/'+l+'.js';s.onload=go;s.onerror=function(){};document.head.appendChild(s);
  }
  window.GSJA_I18N={set:set,get:function(){return cur}};
  var box=document.querySelector('.lang'),btn=box&&box.querySelector('.lang-btn');
  if(box){
    var opts=[].slice.call(box.querySelectorAll('.lang-opt'));
    var open=function(v,focus){box.classList.toggle('open',v);btn.setAttribute('aria-expanded',v?'true':'false');
      if(v&&focus){var a=box.querySelector('.lang-opt[aria-checked=true]')||opts[0];setTimeout(function(){a.focus()},30)}};
    btn.addEventListener('click',function(){open(!box.classList.contains('open'),false)});
    btn.addEventListener('keydown',function(e){if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();open(true,true)}});
    opts.forEach(function(o,i){
      o.addEventListener('click',function(){set(o.getAttribute('data-l'));open(false);btn.focus()});
      o.addEventListener('keydown',function(e){
        if(e.key==='ArrowDown'){e.preventDefault();opts[(i+1)%opts.length].focus()}
        else if(e.key==='ArrowUp'){e.preventDefault();opts[(i-1+opts.length)%opts.length].focus()}
        else if(e.key==='Escape'||e.key==='Tab'){open(false);if(e.key==='Escape')btn.focus()}
      });
    });
    document.addEventListener('click',function(e){if(!box.contains(e.target))open(false)});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')open(false)});
  }
  new MutationObserver(function(ms){
    if(busy||cur==='id')return;
    ms.forEach(function(m){
      if(m.type==='childList')m.addedNodes.forEach(walk);
      else if(m.type==='characterData')textNode(m.target);
      else if(m.type==='attributes')attrs(m.target);
    });
  }).observe(document.body,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:ATTRS});
  apply();
})();
