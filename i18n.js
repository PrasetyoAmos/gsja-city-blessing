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
    var sel=document.querySelector('.lang-select');if(sel)sel.value=cur;
  }
  function set(l){
    if(LANGS.indexOf(l)<0)return;
    try{localStorage.setItem('gsja-lang',l)}catch(e){}
    function go(){cur=l;window.GSJA_LANG=l;apply()}
    if(l==='id'||(window.I18N_DICT&&window.I18N_DICT[l]))return go();
    var s=document.createElement('script');s.src='lang/'+l+'.js';s.onload=go;s.onerror=function(){};document.head.appendChild(s);
  }
  window.GSJA_I18N={set:set,get:function(){return cur}};
  var sel=document.querySelector('.lang-select');if(sel)sel.addEventListener('change',function(){set(sel.value)});
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
