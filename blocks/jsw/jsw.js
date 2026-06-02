function getHTMLTemplate() {
    return `<div class="jsw-root">
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <symbol id="i-arr" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
</defs></svg>

<!-- ============ NAV ============ -->
<header class="nav" data-screen-label="nav">
  <a class="brand" href="#top">
    <span class="mark">JSW<b> Motors</b></span>
    <span class="div"></span>
    <span class="model">Jetour T2</span>
  </a>
  <nav class="nav-links">
    <a href="#models">Models</a>
    <a href="#design">Design</a>
    <a href="#performance">Performance</a>
    <a href="#interior">Interior</a>
    <a href="#colours">Colours</a>
    <a href="#specs">Specs</a>
  </nav>
  <button class="nav-cta">Register Interest</button>
  <button class="nav-burger" aria-label="Menu"><svg><use href="#i-menu"/></svg></button>
</header>

<main id="top">

  <!-- ============ HERO ============ -->
  <section class="hero" data-screen-label="hero">
    <video autoplay muted loop playsinline preload="auto"
           poster="https://jetourglobal.com/new-static/images/vehicles/image/T2.png">
      <source src="https://jetourglobal.com/new-static/images/vehicles/video/g700.mp4" type="video/mp4"/>
    </video>
    <img class="poster" src="https://jetourglobal.com/new-static/images/vehicles/image/T2.png" alt="" style="display:none"/>
    <div class="hero-inner wrap">
      <div class="hero-kicker kicker on-dark">Rugged Adventure SUV<span class="dot"> · </span>Arriving 2026</div>
      <h1><span class="l1">Jetour</span><span class="l2">T2</span></h1>
      <p class="hero-sub">A boxy, hardcore SUV built for the road less travelled — and the city you live in.</p>
      <div class="hero-actions">
        <a class="btn btn-light" href="#register">Register Interest <svg><use href="#i-arr"/></svg></a>
        <a class="btn btn-ghost-light" href="#design"><svg><use href="#i-play"/></svg> Watch film</a>
      </div>
    </div>
    <div class="hero-scroll"><span>SCROLL</span><span class="bar"></span></div>
  </section>

  <!-- ============ STATEMENT ============ -->
  <section class="block statement" data-screen-label="statement">
    <div class="wrap">
      <p class="kicker reveal" style="margin-bottom:26px">Hardcore by design</p>
      <h2 class="reveal reveal-d1">Adventure isn't a place.<br/>It's a <em>posture.</em></h2>
      <p class="reveal reveal-d2">4,785&nbsp;mm of presence. 220&nbsp;mm of clearance. A steel-cage body built to go further than the map.</p>
    </div>
  </section>

  <!-- ============ 360 SHOWCASE ============ -->
  <section class="showcase" id="design" data-screen-label="360 showcase">
    <div class="sticky">
      <div class="label-top">
        <p class="kicker reveal-dn">Every angle</p>
        <h2 class="reveal-dn reveal-d1">The shape of <b>capability</b></h2>
      </div>
      <div class="frames"></div>
      <div class="ground"></div>
      <div class="progress">
        <span class="hint">DRAG-FREE · SCROLL TO ROTATE</span>
        <span class="track"><span class="fill"></span></span>
        <span data-deg>0°</span>
      </div>
    </div>
  </section>

  <!-- ============ KEY FIGURES ============ -->
  <section class="block tight" data-screen-label="figures">
    <div class="wrap">
      <div class="figures">
        <div class="fig reveal">
          <div class="n">4785<span>mm</span></div>
          <div class="l">Length</div>
          <div class="d">Harrier-plus presence with a 2,800 mm wheelbase.</div>
        </div>
        <div class="fig reveal reveal-d1">
          <div class="n">220<span>mm</span></div>
          <div class="l">Ground clearance</div>
          <div class="d">Engineered to clear what the trail throws at it.</div>
        </div>
        <div class="fig reveal reveal-d2">
          <div class="n">254<span>PS</span></div>
          <div class="l">Max power</div>
          <div class="d">2.0L turbo petrol with 4-wheel drive.</div>
        </div>
        <div class="fig reveal reveal-d3">
          <div class="n">390<span>Nm</span></div>
          <div class="l">Peak torque</div>
          <div class="d">7-speed DCT. Built for explosive launches.</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ FULL-BLEED FEATURE — Off-road ============ -->
  <section class="feature full" id="performance" data-screen-label="performance">
    <div class="media" data-parallax="70">
      <img src="https://jetourglobal.com/new-static/images/vehicles/image/T2.png" alt="Jetour T2 in the wild"/>
    </div>
    <div class="scrim"></div>
    <div class="feat-inner wrap">
      <p class="kicker on-dark reveal">Off-road performance</p>
      <h2 class="reveal reveal-d1">Go where the<br/>road <b>ends.</b></h2>
      <p class="reveal reveal-d2">Kunpeng power, a steel-cage body structure and intelligent 4WD. The T2 doesn't follow the trail — it sets one.</p>
    </div>
  </section>

  <!-- ============ INTERIOR SPLIT ============ -->
  <section class="block" id="interior" data-screen-label="interior">
    <div class="wrap split rev">
      <div class="media reveal">
        <img src="https://jetourglobal.com/new-static/images/vehicles/cars/T2/p1_2.png" alt="Jetour T2 cockpit"/>
      </div>
      <div class="copy">
        <p class="kicker reveal">The cockpit</p>
        <h2 class="reveal reveal-d1">A wide, calm<br/>place to <b>command.</b></h2>
        <p class="reveal reveal-d2">A clean, horizontal dashboard wrapped in soft-touch materials, crowned by a 15.6-inch floating display and a 12-speaker Sony system.</p>
        <div class="mini-specs reveal reveal-d2">
          <div>
            <div class="n">15.6<span>"</span></div>
            <div class="l">Touchscreen</div>
          </div>
          <div>
            <div class="n">10.25<span>"</span></div>
            <div class="l">Digital cluster</div>
          </div>
          <div>
            <div class="n">12</div>
            <div class="l">Sony speakers</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ COLOURS ============ -->
  <section class="block colours" id="colours" data-screen-label="colours">
    <div class="wrap">
      <div class="sec-head reveal" style="align-items:center;text-align:center">
        <p class="kicker">Six finishes</p>
        <h2>Wear it your <b>way.</b></h2>
      </div>
      <div class="colour-stage reveal reveal-d1"></div>
      <div class="colour-name"><span class="nm">Silver Snow</span></div>
      <div class="swatches reveal">
        <button class="swatch active" data-folder="silver_snow" data-name="Silver Snow" style="background:#D7DBDD" title="Silver Snow"></button>
        <button class="swatch" data-folder="night_black" data-name="Night Black" style="background:#1A1C1F" title="Night Black"></button>
      </div>
      <p class="kicker" style="text-align:center;margin-top:22px;color:var(--muted-2)">More finishes — Sun Orange · Misty Cyan · Lime Green · Sand — at launch</p>
    </div>
  </section>

  <!-- ============ SPECS ============ -->
  <section class="block" id="specs" data-screen-label="specs">
    <div class="wrap specs">
      <div class="sec-head reveal" style="margin-bottom:0">
        <p class="kicker">At a glance</p>
        <h2>The <b>essentials.</b></h2>
        <p style="margin:6px 0 0;color:var(--ink-2);font-size:15px;line-height:1.6;max-width:34ch">Indicative specification for the India-bound Jetour T2. Final figures confirmed at launch.</p>
      </div>
      <div class="spec-list reveal reveal-d1">
        <div class="spec-row"><div class="k">Engine</div><div class="v">2.0L turbo petrol</div></div>
        <div class="spec-row"><div class="k">Transmission</div><div class="v">7-speed DCT</div></div>
        <div class="spec-row"><div class="k">Drivetrain</div><div class="v">Intelligent 4WD</div></div>
        <div class="spec-row"><div class="k">Power / Torque</div><div class="v">254 PS / 390 Nm</div></div>
        <div class="spec-row"><div class="k">Dimensions (L×W×H)</div><div class="v">4785 × 2006 × 1880 mm</div></div>
        <div class="spec-row"><div class="k">Wheelbase</div><div class="v">2800 mm</div></div>
        <div class="spec-row"><div class="k">Ground clearance</div><div class="v">220 mm</div></div>
        <div class="spec-row"><div class="k">Seating</div><div class="v">5 · panoramic sunroof</div></div>
        <div class="spec-row"><div class="k">Safety</div><div class="v">L2 ADAS · 360° camera · 5★ ASEAN NCAP</div></div>
        <p class="spec-note">* Specifications shown reflect the global model and may vary for India.</p>
      </div>
    </div>
  </section>

  <!-- ============ MODELS / VARIANTS (below the fold) ============ -->
  <section class="block variants" id="models" data-screen-label="models">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="kicker">The line-up</p>
        <h2>Choose your <b>T2.</b></h2>
      </div>

      <div class="variant-grid">

        <article class="vcard reveal">
          <div class="pic">
            <span class="tier">Explorer</span>
            <span class="drive">FWD</span>
            <img src="https://jetourglobal.com/new-static/exterior/T2/silver_snow/08.png" alt="Jetour T2 Explorer"/>
          </div>
          <div class="body">
            <h3>T2 Explorer</h3>
            <p class="blurb">The everyday adventurer. 1.5L turbo petrol, front-wheel drive.</p>
            <div class="price"><span class="from">From</span><span class="amt">₹ 21.99 L</span><span class="star">*</span></div>
            <div class="vspecs">
              <div class="s"><div class="n">184<small>PS</small></div><div class="t">Power</div></div>
              <div class="s"><div class="n">290<small>Nm</small></div><div class="t">Torque</div></div>
              <div class="s"><div class="n">1.5<small>T</small></div><div class="t">7-DCT</div></div>
            </div>
            <div class="vlinks">
              <a class="build" href="#register">Build &amp; reserve <svg><use href="#i-arr"/></svg></a>
              <a class="details" href="#specs">Details</a>
            </div>
          </div>
        </article>

        <article class="vcard reveal reveal-d1">
          <div class="pic">
            <span class="tier">Adventure</span>
            <span class="drive">4WD</span>
            <img src="https://jetourglobal.com/new-static/exterior/T2/night_black/08.png" alt="Jetour T2 Adventure"/>
          </div>
          <div class="body">
            <h3>T2 Adventure</h3>
            <p class="blurb">Intelligent 4WD and the 2.0L turbo. Built to leave the tarmac.</p>
            <div class="price"><span class="from">From</span><span class="amt">₹ 25.49 L</span><span class="star">*</span></div>
            <div class="vspecs">
              <div class="s"><div class="n">254<small>PS</small></div><div class="t">Power</div></div>
              <div class="s"><div class="n">390<small>Nm</small></div><div class="t">Torque</div></div>
              <div class="s"><div class="n">2.0<small>T</small></div><div class="t">7-DCT</div></div>
            </div>
            <div class="vlinks">
              <a class="build" href="#register">Build &amp; reserve <svg><use href="#i-arr"/></svg></a>
              <a class="details" href="#specs">Details</a>
            </div>
          </div>
        </article>

        <article class="vcard feature-tier reveal reveal-d2">
          <div class="pic">
            <span class="tier">Summit</span>
            <span class="drive">4WD</span>
            <img src="https://jetourglobal.com/new-static/exterior/T2/silver_snow/00.png" alt="Jetour T2 Summit"/>
          </div>
          <div class="body">
            <h3>T2 Summit</h3>
            <p class="blurb">Fully loaded. Sony 12-speaker, ventilated &amp; massaging seats, L2 ADAS.</p>
            <div class="price"><span class="from">From</span><span class="amt">₹ 27.99 L</span><span class="star">*</span></div>
            <div class="vspecs">
              <div class="s"><div class="n">254<small>PS</small></div><div class="t">Power</div></div>
              <div class="s"><div class="n">390<small>Nm</small></div><div class="t">Torque</div></div>
              <div class="s"><div class="n">15.6<small>"</small></div><div class="t">Screen</div></div>
            </div>
            <div class="vlinks">
              <a class="build" href="#register">Build &amp; reserve <svg><use href="#i-arr"/></svg></a>
              <a class="details" href="#specs">Details</a>
            </div>
          </div>
        </article>

      </div>
      <p class="spec-note" style="margin-top:22px">* Indicative ex-showroom pricing. Variants &amp; final prices confirmed at India launch.</p>
    </div>
  </section>

  <!-- ============ END CTA ============ -->
  <section class="block endcta" id="register" data-screen-label="register">
    <div class="wrap">
      <p class="kicker on-dark reveal" style="margin-bottom:22px">Be first in line</p>
      <h2 class="reveal reveal-d1">Your adventure<br/>starts <b>here.</b></h2>
      <p class="reveal reveal-d2">Register your interest and we'll keep you posted on pricing, variants and the first test drives near you.</p>
      <div class="actions reveal reveal-d2">
        <a class="btn btn-light" href="#top">Register Interest <svg><use href="#i-arr"/></svg></a>
        <a class="btn btn-ghost-light" href="#specs">Download brochure</a>
      </div>
    </div>
  </section>

</main>

<!-- ============ FOOTER ============ -->
<footer class="foot" data-screen-label="footer">
  <div class="wrap">
    <div class="mark">JSW Motors</div>
    <div class="links">
      <a href="#design">Design</a>
      <a href="#performance">Performance</a>
      <a href="#interior">Interior</a>
      <a href="#specs">Specs</a>
      <a href="#register">Register</a>
    </div>
    <div class="fine">© 2026 JSW MOTORS · JETOUR T2</div>
  </div>
</footer>
</div>`
}

export default async function decorate(block) {
  document.body.innerHTML = getHTMLTemplate();
  await import('./jsw-lib.js');
}
