// Passos com desenho proprio: capa, contador de dias, mapa, esquemas de imunologia, fecho, modo estudo.
import gsap from 'gsap'

const txt = (c) => `${c.kicker ? `<div class="kicker">${c.kicker}</div>` : ''}<h2 class="titulo">${c.titulo || ''}</h2>${c.corpo ? `<div class="corpo">${c.corpo}</div>` : ''}${c.ficha ? `<dl class="ficha">${c.ficha.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>` : ''}`

/** camada para desenhos vetoriais grandes, fora da coluna de texto */
function camada(id, html) {
  let el = document.getElementById(id)
  if (!el) { el = document.createElement('div'); el.id = id; el.style.cssText = 'position:absolute;inset:0;opacity:0;visibility:hidden'; el.innerHTML = html; document.querySelector('#midia').appendChild(el) }
  return el
}
const mostra = (el, on, d) => gsap.to(el, { autoAlpha: on ? 1 : 0, duration: (on ? 0.9 : 0.35) * d, delay: on ? 0.4 * d : 0 })

// Brasil simplificado (contorno esquematico) com SP e Promissao. Coordenadas em viewBox 0..1000.
const MAPA = `
<svg viewBox="0 0 1000 1000" style="position:absolute;right:6vw;top:50%;height:82vh;transform:translateY(-50%);overflow:visible">
  <path id="br" d="M318 118 L402 96 L470 132 L540 120 L604 168 L690 196 L772 250 L842 300 L870 372 L842 452 L800 520 L776 600 L720 668 L660 712 L612 780 L560 852 L508 900 L470 860 L486 790 L440 740 L380 712 L352 650 L300 610 L252 560 L196 520 L150 470 L132 400 L170 340 L150 280 L206 236 L262 190 Z"
        fill="rgba(243,233,217,0.04)" stroke="rgba(243,233,217,0.5)" stroke-width="2" stroke-linejoin="round"/>
  <path id="sp" d="M560 668 L640 650 L700 690 L676 736 L612 760 L560 730 Z" fill="rgba(255,77,90,0.22)" stroke="#ff4d5a" stroke-width="2"/>
  <g id="prom"><circle cx="604" cy="690" r="7" fill="#ff4d5a"/><circle class="onda" cx="604" cy="690" r="7" fill="none" stroke="#ff4d5a" stroke-width="2"/>
    <line x1="604" y1="690" x2="760" y2="620" stroke="rgba(243,233,217,0.6)"/><text x="770" y="614" fill="#f3e9d9" font-size="30" font-weight="700" letter-spacing="-0.5">Promissão, SP</text><text x="770" y="646" fill="#a89e90" font-size="20">outubro de 1984</text></g>
</svg>`

// Esquema da vacina conjugada. Origem do desenho no centro (0,0); cada peca animada fica dentro de um
// <g> de posicao fixa, para o GSAP mexer so no <g> interno (sem brigar com o atributo transform).
const IMUNO = `
<svg viewBox="-450 -280 900 560" style="position:absolute;left:var(--m);top:50%;width:min(58vw,104vh);transform:translateY(-50%);overflow:visible;font-family:var(--font-text)">
  <defs>
    <g id="hx"><polygon points="0,-15 13,-7.5 13,7.5 0,15 -13,7.5 -13,-7.5" fill="rgba(234,223,200,0.14)" stroke="#eadfc8" stroke-width="2.2"/></g>
    <g id="ig"><path d="M0 4 v30 M0 4 l-15 -20 M0 4 l15 -20" fill="none" stroke="#f3e9d9" stroke-width="4" stroke-linecap="round"/></g>
  </defs>
  <g class="celB"><circle cx="-150" r="118" fill="rgba(31,184,166,0.10)" stroke="#1fb8a6" stroke-width="2.2"/><circle cx="-150" r="50" fill="rgba(31,184,166,0.20)"/>
    <path d="M-268 -14 h-16 M-268 14 h-16 M-284 -24 v48" stroke="#1fb8a6" stroke-width="3" fill="none"/>
    <text x="-150" y="158" text-anchor="middle" fill="#1fb8a6" font-size="17" font-weight="650" letter-spacing="2.4">LINFÓCITO B</text>
    <text x="-150" y="182" text-anchor="middle" fill="#a89e90" font-size="15">BCR específico para o PRP</text></g>
  <g class="mhc"><rect x="-34" y="-17" width="30" height="34" rx="5" fill="#f2b441"/><text x="-19" y="-30" text-anchor="middle" fill="#f2b441" font-size="14" font-weight="650">MHC II + peptídeo</text></g>
  <g class="celT"><circle cx="122" r="94" fill="rgba(154,140,255,0.10)" stroke="#9a8cff" stroke-width="2.2"/><circle cx="122" r="40" fill="rgba(154,140,255,0.24)"/>
    <rect x="4" y="-13" width="24" height="26" rx="5" fill="#9a8cff"/>
    <text x="122" y="134" text-anchor="middle" fill="#9a8cff" font-size="17" font-weight="650" letter-spacing="2.4">LINFÓCITO T CD4</text>
    <text x="122" y="158" text-anchor="middle" fill="#a89e90" font-size="15">CD40L · citocinas</text></g>
  <g class="igs"><g><use href="#ig" x="-290" y="-225"/></g><g><use href="#ig" x="-215" y="-255"/></g><g><use href="#ig" x="-135" y="-262"/></g><g><use href="#ig" x="-55" y="-246"/></g><g><use href="#ig" x="20" y="-215"/></g>
    <text x="90" y="-226" fill="#f3e9d9" font-size="19" font-weight="700">IgG anti-PRP</text><text x="90" y="-202" fill="#a89e90" font-size="15">alta afinidade · memória</text></g>
  <g class="conj"><use href="#hx" x="-78"/><use href="#hx" x="-50"/><use href="#hx" x="-22"/><use href="#hx" x="6"/><use href="#hx" x="34"/>
    <path d="M52 -8 c16 -40 84 -36 94 0 c30 10 26 54 -6 56 c-20 26 -72 18 -82 -8 c-24 -10 -22 -40 -6 -48z" fill="rgba(255,90,60,0.20)" stroke="#ff5a3c" stroke-width="2.2"/>
    <g class="rot"><text x="-22" y="-34" text-anchor="middle" fill="#eadfc8" font-size="16" font-weight="650" letter-spacing="2.4">PRP</text>
    <text x="100" y="86" text-anchor="middle" fill="#ff5a3c" font-size="16" font-weight="650" letter-spacing="2.4">PROTEÍNA CARREADORA</text>
    <text x="40" y="-62" text-anchor="middle" fill="#a89e90" font-size="15">ligação covalente</text></g></g>
</svg>`

// Capa: autores e logos. O logo da faculdade chega em 4 pecas (anel, louros, bastao, fita) e se MONTA;
// ao sair da capa, se fragmenta. As posicoes (em % do quadrado) foram medidas sobre o logo original.
export const AUTORES = ['Nalbert Henrique', 'Moisés Davi', 'Edmund Jeffrey']
export const VINCULO = 'Eixo CFSH · Faculdade de Medicina de Altamira · Universidade Federal do Pará'
const L = '/assets/logo/'
const CAPA = `
  <div class="autores">
    <div class="rot">Seminário de Microbiologia</div>
    <div class="nomes">${AUTORES.map((n) => `<span>${n}</span>`).join('')}</div>
    <div class="inst">${VINCULO}</div>
  </div>
  <div class="logos">
    <div class="famed">
      <i class="disco"></i>
      <img class="p anel" src="${L}anel.webp" alt="" style="left:0.97%;top:-2.52%;width:96.97%">
      <img class="p louros" src="${L}louros.webp" alt="" style="left:15.95%;top:20.14%;width:66.2%">
      <img class="p bastao" src="${L}bastao.webp" alt="" style="left:19.23%;top:18.99%;width:61.15%">
      <img class="p fita" src="${L}fita.webp" alt="" style="left:10.46%;top:59.24%;width:77.77%">
    </div>
    <img class="ufpa" src="${L}ufpa.webp" alt="Universidade Federal do Pará">
  </div>`

function capaExtra(on, d) {
  let el = document.getElementById('capa-extra')
  if (!el) { if (!on) return; el = document.createElement('div'); el.id = 'capa-extra'; el.innerHTML = CAPA; document.querySelector('#midia').appendChild(el) }
  const q = (s) => el.querySelector(s), qa = (s) => el.querySelectorAll(s)
  gsap.killTweensOf([el, ...qa('.p, .disco, .ufpa, .famed, .autores > *, .nomes span')])
  if (on) {
    gsap.set(el, { autoAlpha: 1 })
    gsap.set(qa('.p'), { xPercent: 0, yPercent: 0 })
    const tl = gsap.timeline({ delay: 0.9 * d })
    // cada peca vem de um lado, com giro proprio, e encaixa
    tl.fromTo(q('.disco'), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7 * d, ease: 'power3.out' }, 0)
      .fromTo(q('.anel'), { scale: 2.6, rotation: -220, opacity: 0, filter: 'blur(10px)' }, { scale: 1, rotation: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5 * d, ease: 'expo.out' }, 0.05 * d)
      .fromTo(q('.louros'), { scale: 0.15, rotation: 140, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 1.2 * d, ease: 'back.out(1.5)' }, 0.45 * d)
      .fromTo(q('.bastao'), { yPercent: -170, rotation: -30, opacity: 0 }, { yPercent: 0, rotation: 0, opacity: 1, duration: 1.1 * d, ease: 'back.out(1.3)' }, 0.8 * d)
      .fromTo(q('.fita'), { xPercent: -140, rotation: -18, opacity: 0 }, { xPercent: 0, rotation: 0, opacity: 1, duration: 1.0 * d, ease: 'back.out(1.6)' }, 1.15 * d)
      .fromTo(q('.famed'), { scale: 1 }, { scale: 1.06, duration: 0.22 * d, yoyo: true, repeat: 1, ease: 'power2.out' }, 2.05 * d)
      .fromTo(q('.ufpa'), { opacity: 0, x: 46, filter: 'blur(10px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1.0 * d, ease: 'power3.out' }, 1.5 * d)
      .fromTo(qa('.autores .rot, .nomes span, .autores .inst'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8 * d, stagger: 0.09 * d, ease: 'power3.out' }, 0.3 * d)
  } else if (getComputedStyle(el).visibility !== 'hidden') {
    // fragmenta: cada peca sai por um lado
    const f = 0.75 * d
    gsap.timeline()
      .to(q('.anel'), { scale: 2.4, rotation: 160, opacity: 0, filter: 'blur(8px)', duration: f, ease: 'power3.in' }, 0)
      .to(q('.louros'), { scale: 0.2, rotation: -150, xPercent: -120, opacity: 0, duration: f, ease: 'power3.in' }, 0.04 * d)
      .to(q('.bastao'), { yPercent: -220, rotation: 40, opacity: 0, duration: f, ease: 'power3.in' }, 0.08 * d)
      .to(q('.fita'), { yPercent: 260, xPercent: 60, rotation: 24, opacity: 0, duration: f, ease: 'power3.in' }, 0.02 * d)
      .to(q('.disco'), { scale: 0, opacity: 0, duration: f * 0.8, ease: 'power2.in' }, 0)
      .to(q('.ufpa'), { opacity: 0, x: 60, filter: 'blur(10px)', duration: f * 0.8, ease: 'power2.in' }, 0)
      .to(qa('.autores .rot, .nomes span, .autores .inst'), { opacity: 0, y: -14, duration: f * 0.6, stagger: 0.04 * d, ease: 'power2.in' }, 0)
      .set(el, { autoAlpha: 0 })
  }
}

export function criarEspeciais({ GLOSSARIO, creditos }) {
  const cont = { d: 1 }
  return {
    // vitrine: as descricoes ficam sob cada organismo; no bloco, so o titulo e a nota taxonomica
    vitrine: { html: (c) => { const nota = (c.ficha || []).find(([k]) => /taxonom/i.test(k)); return `${c.kicker ? `<div class="kicker">${c.kicker}</div>` : ''}<h2 class="titulo">${c.titulo || ''}</h2>${nota ? `<div class="corpo"><p>${nota[1]} (${nota[0].replace(/<[^>]+>/g, '')}).</p></div>` : ''}` } },
    capa: { html: () => `<div class="capa"><h1 class="titulo">Haemophilus</h1><div class="sub">influenzae</div><div class="etimo">haima · sangue &nbsp;&nbsp;&nbsp; philos · afinidade</div></div>`, ativo: (on, p, d) => capaExtra(on, d) },
    fecho: { html: (c) => `<div class="capa"><h1 class="titulo" style="font-size:clamp(40px,6vw,120px)"><em style="font-weight:750;font-style:italic">Haemophilus</em></h1><div class="etimo" style="margin-top:1.4em;color:var(--fg-dim);letter-spacing:.4em">1892 &nbsp;·&nbsp; 1995 &nbsp;·&nbsp; 1999</div></div>` },
    numero: {
      html: (c) => `<div class="numero">1</div><div class="numero-leg">${c.titulo || 'dias'}</div>${c.corpo ? `<div class="corpo extra" style="max-width:46ch;margin-inline:auto">${c.corpo}</div>` : ''}`,
      ativo(on, p, d) { if (!on) return; const el = document.querySelector('.bloco.t-numero .numero'); cont.d = 1; gsap.to(cont, { d: 21, duration: 3.2 * d, delay: 0.6 * d, ease: 'power1.inOut', onUpdate: () => { el.textContent = Math.round(cont.d) } }) },
    },
    mapa: {
      html: txt,
      ativo(on, p, d) {
        const el = camada('mapa', MAPA); mostra(el, on, d); if (!on) return
        const br = el.querySelector('#br'), n = br.getTotalLength()
        gsap.fromTo(br, { strokeDasharray: n, strokeDashoffset: n }, { strokeDashoffset: 0, duration: 2.2 * d, delay: 0.5 * d, ease: 'power2.inOut' })
        gsap.fromTo(el.querySelectorAll('#sp, #prom'), { opacity: 0 }, { opacity: 1, duration: 0.8 * d, delay: 2.2 * d, stagger: 0.4 })
        gsap.fromTo(el.querySelector('.onda'), { attr: { r: 7 }, opacity: 1 }, { attr: { r: 46 }, opacity: 0, duration: 1.8, repeat: -1, delay: 3 * d, ease: 'power1.out' })
      },
    },
    conjugado: {
      html: txt,
      ativo(on, p, d) {
        const el = camada('imuno', IMUNO); if (!on) { if (p.tipo !== 'imuno') mostra(el, false, d); return }
        mostra(el, true, d)
        gsap.to(el.querySelectorAll('.celB, .celT, .igs, .mhc'), { opacity: 0, duration: 0.3 * d, overwrite: true })
        gsap.to(el.querySelector('.conj .rot'), { opacity: 1, duration: 0.4 * d })
        gsap.fromTo(el.querySelector('.conj'), { opacity: 0, x: -40, y: 0, scaleX: 1.2, scaleY: 1.2, svgOrigin: '0 0' }, { opacity: 1, x: -40, y: 0, scaleX: 1.75, scaleY: 1.75, duration: 1.3 * d, delay: 0.5 * d, ease: 'power3.out', overwrite: true })
      },
    },
    imuno: {
      html: txt,
      ativo(on, p, d) {
        const el = camada('imuno', IMUNO); if (!on) { if (p.tipo !== 'conjugado') mostra(el, false, d); return }
        mostra(el, true, d)
        const q = (s) => el.querySelector(s)
        gsap.set([q('.celT'), q('.igs'), q('.mhc')], { opacity: 0 }); gsap.set(q('.celT'), { x: 160 })
        gsap.timeline({ delay: 0.4 * d })
          .to(q('.conj .rot'), { opacity: 0, duration: 0.3 * d }, 0)
          // o conjugado vira: e o PRP (acucar) que encosta no BCR — o linfocito B e especifico para o polissacarideo
          .to(q('.conj'), { opacity: 1, x: -345, y: 0, scaleX: -0.62, scaleY: 0.62, svgOrigin: '0 0', duration: 1.2 * d, ease: 'power3.inOut', overwrite: true }, 0)
          .to(q('.celB'), { opacity: 1, duration: 0.7 * d }, 0.3 * d)
          .to(q('.conj'), { x: -170, scaleX: -0.38, scaleY: 0.38, opacity: 0.8, duration: 1.0 * d, ease: 'power2.inOut' }, '+=0.35')
          .to(q('.mhc'), { opacity: 1, duration: 0.5 * d })
          .to(q('.celT'), { opacity: 1, x: 0, duration: 0.9 * d, ease: 'power3.out' }, '<0.1')
          .to(q('.igs'), { opacity: 1, duration: 0.4 * d })
          .fromTo(el.querySelectorAll('.igs > g'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.55 * d, stagger: 0.09 * d, ease: 'back.out(2)' }, '<')
      },
    },
    estudo: {
      html: () => '',
      ativo(on, p, d) {
        const el = document.querySelector('#estudo')
        if (on && !el.dataset.ok) {
          el.dataset.ok = 1
          el.innerHTML = `<h2>Glossário</h2><dl class="grade">${Object.values(GLOSSARIO).sort((a, b) => a.termo.localeCompare(b.termo, 'pt')).map((g) => `<div><dt>${g.termo}</dt><dd>${g.def}</dd></div>`).join('')}</dl>
            <h2 style="margin-top:2em;font-size:clamp(22px,2vw,36px)">Créditos das imagens</h2><div class="creditos">${(creditos || []).map((c) => `<p><strong style="color:var(--fg-dim)">${c.titulo || c.arquivo}</strong><br>${c.credito || ''} · ${c.licenca || ''}</p>`).join('')}</div>`
        }
        gsap.to(el, { autoAlpha: on ? 1 : 0, duration: 0.6 * d, delay: on ? 0.5 * d : 0 })
      },
    },
  }
}
