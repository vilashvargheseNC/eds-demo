/* ============================================================
   JSW · Jetour T2 PDP v3 — interactions
   ============================================================ */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- NAV: solid on scroll ---------- */
  var nav = document.querySelector('.nav');
  function onNav(){
    if(!nav) return;
    if(window.scrollY > window.innerHeight * 0.72) nav.classList.add('is-solid');
    else nav.classList.remove('is-solid');
  }
  window.addEventListener('scroll', onNav, {passive:true});
  onNav();

  /* ---------- Reveal on scroll ---------- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold:0.18, rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal, .reveal-dn').forEach(function(el){ io.observe(el); });

  /* ---------- Parallax on feature media ---------- */
  var parallax = [].slice.call(document.querySelectorAll('[data-parallax]'));
  function onParallax(){
    if(reduce) return;
    var vh = window.innerHeight;
    parallax.forEach(function(el){
      var r = el.getBoundingClientRect();
      if(r.bottom < -200 || r.top > vh + 200) return;
      var prog = (r.top + r.height/2 - vh/2) / vh; // -1..1
      var amt = (el.getAttribute('data-parallax')|0) || 40;
      el.style.transform = 'translate3d(0,' + (-prog * amt).toFixed(1) + 'px,0)';
    });
  }

  /* ---------- 360 scroll-scrubbed showcase ---------- */
  var showcase = document.querySelector('.showcase');
  var frameEls = [], imgsReady = false;
  if(showcase){
    var framesWrap = showcase.querySelector('.frames');
    var BASE = 'https://jetourglobal.com/new-static/exterior/T2/silver_snow/';
    var COUNT = 36; // 00..35
    // build <img> elements
    for(var i=0;i<COUNT;i++){
      var im = document.createElement('img');
      var n = (i<10?'0':'')+i;
      im.src = BASE + n + '.png';
      im.alt = 'Jetour T2 exterior frame ' + n;
      im.loading = 'eager';
      im.decoding = 'async';
      if(i===0) im.className = 'active';
      framesWrap.appendChild(im);
      frameEls.push(im);
    }
    var fillEl = showcase.querySelector('.progress .fill');
    var degEl  = showcase.querySelector('[data-deg]');
    var curFrame = 0;
    function setFrame(idx){
      idx = Math.max(0, Math.min(COUNT-1, idx));
      if(idx === curFrame) return;
      frameEls[curFrame].classList.remove('active');
      frameEls[idx].classList.add('active');
      curFrame = idx;
    }
    function onShowcase(){
      var r = showcase.getBoundingClientRect();
      var total = showcase.offsetHeight - window.innerHeight;
      var prog = Math.max(0, Math.min(1, (-r.top) / total));
      setFrame(Math.round(prog * (COUNT-1)));
      if(fillEl) fillEl.style.width = (prog*100).toFixed(1) + '%';
      if(degEl) degEl.textContent = Math.round(prog*360) + '°';
    }
    showcase._onScroll = onShowcase;
  }

  /* ---------- Colour switcher ---------- */
  var stage = document.querySelector('.colour-stage');
  if(stage){
    var swatches = document.querySelectorAll('.swatch');
    var nameEl = document.querySelector('.colour-name .nm');
    var stageImgs = {};
    // Map swatches -> jetour exterior folders (frame 08 = front 3/4)
    swatches.forEach(function(sw){
      var folder = sw.getAttribute('data-folder');
      var img = document.createElement('img');
      img.src = 'https://jetourglobal.com/new-static/exterior/T2/' + folder + '/08.png';
      img.alt = sw.getAttribute('data-name');
      img.decoding = 'async';
      if(sw.classList.contains('active')) img.classList.add('active');
      stage.appendChild(img);
      stageImgs[folder] = img;
      sw.addEventListener('click', function(){
        swatches.forEach(function(s){ s.classList.remove('active'); });
        sw.classList.add('active');
        for(var k in stageImgs){ stageImgs[k].classList.remove('active'); }
        stageImgs[folder].classList.add('active');
        if(nameEl) nameEl.textContent = sw.getAttribute('data-name');
      });
    });
  }

  /* ---------- Specs accordion (mobile single-open is fine open) ---------- */

  /* ---------- Tabs (cockpit / off-road / upholstery) ---------- */
  document.querySelectorAll('.tabs').forEach(function(tabs){
    var btns = tabs.querySelectorAll('.tab');
    var panels = tabs.querySelectorAll('.tabpanel');
    btns.forEach(function(btn){
      btn.addEventListener('click', function(){
        var key = btn.getAttribute('data-tab');
        btns.forEach(function(b){ b.classList.toggle('is-active', b===btn); });
        panels.forEach(function(p){ p.classList.toggle('is-active', p.getAttribute('data-panel')===key); });
      });
    });
  });

  /* ---------- master scroll loop (rAF throttled) ---------- */
  var ticking = false;
  function tick(){
    onParallax();
    if(showcase && showcase._onScroll) showcase._onScroll();
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if(!ticking){ requestAnimationFrame(tick); ticking = true; }
  }, {passive:true});
  window.addEventListener('resize', tick, {passive:true});
  tick();

  /* ---------- mobile menu (simple) ---------- */
  var burger = document.querySelector('.nav-burger');
  if(burger){
    burger.addEventListener('click', function(){
      var open = document.body.classList.toggle('menu-open');
      // smooth scroll to register section as a lightweight action
      var t = document.getElementById('register');
      if(t) t.scrollIntoView({behavior:'smooth'});
      document.body.classList.remove('menu-open');
    });
  }

  /* ---------- hero video graceful fallback ---------- */
  var v = document.querySelector('.hero video');
  if(v){
    v.play && v.play().catch(function(){});
    v.addEventListener('error', function(){
      var p = document.querySelector('.hero .poster');
      if(p) p.style.display = 'block';
    });
  }
})();
