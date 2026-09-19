# -*- coding: utf-8 -*-
"""
gerar_bacilo.py - modelo anatomico didatico de Haemophilus influenzae (cocobacilo Gram-negativo)
para o seminario de microbiologia medica. Ilustracao cientifica de livro-texto.

Uso (sem interface):
  "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" --background --python tools/blender/gerar_bacilo.py
  opcoes depois de "--":   --sem-bake   (pula o bake de normal/cavidade)
                           --res 1024   (resolucao do bake; padrao 2048)

Saidas em public/assets/modelo/:
  bacilo.glb              malhas nomeadas com as chaves do contrato + malhas-base para instancing
  bacilo.json             posicoes/normais das instancias (LOS, porinas, ribossomos), ancoras, tabela do corte
  me_normal.webp|jpg      micro-relevo da membrana (normal em espaco tangente, bake Cycles)
  me_cavidade.webp|jpg    cavidade/oclusao do micro-relevo (bake de emissao)

Convencao: aqui o eixo longo e Z (Blender). O exportador glTF converte para Y-para-cima:
  three (x, y, z) = blender (x, z, -y).  O corte em cunha abre para +Z do three = -Y do Blender.
"""
import bpy, bmesh, math, json, os, sys, time
import numpy as np
from mathutils import Vector, Matrix, noise, kdtree

T0 = time.time()
def log(*a):
    print('[bacilo %6.1fs]' % (time.time() - T0), *a, flush=True)

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.normpath(os.path.join(AQUI, '..', '..'))
SAIDA = os.path.join(RAIZ, 'public', 'assets', 'modelo')
os.makedirs(SAIDA, exist_ok=True)

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
SEM_BAKE = '--sem-bake' in ARGS
RES_BAKE = int(ARGS[ARGS.index('--res') + 1]) if '--res' in ARGS else 2048

rng = np.random.default_rng(1892)   # 1892: Pfeiffer

# ----------------------------------------------------------------------------------------------
# dimensoes (unidades do contrato: corpo sem capsula = 2,2 de comprimento; razao 2:1 -> cocobacilo)
# ----------------------------------------------------------------------------------------------
H = 0.55                      # meia-altura do trecho cilindrico (igual em todas as camadas)
R_CAP_EXT, R_CAP_INT = 0.665, 0.582
R_ME_EXT, R_ME_INT = 0.550, 0.522
R_PG = 0.489
R_MI_EXT, R_MI_INT = 0.456, 0.428
R_CITO = 0.425

# corte em cunha escalonado: (meio-angulo em graus, altura do corte transversal) por camada
CORTE = {
    'capsula':         (72.0, -0.66),
    'membranaExterna': (62.0, -0.54),
    'peptidoglicano':  (52.0, -0.42),
    'membranaInterna': (42.0, -0.30),
    'citoplasma':      (42.0, -0.30),
}

CORES = {
    'capsula': '#eadfc8', 'membranaExterna': '#1fb8a6', 'los': '#ff7a45', 'porinas': '#4c8dff',
    'adesinas': '#d4e157', 'pili': '#f5e6a3', 'peptidoglicano': '#58c17a', 'betaLactamase': '#ff5a3c',
    'membranaInterna': '#f2b441', 'pbp3': '#e0247b', 'citoplasma': '#2a2170', 'ribossomos': '#9a8cff',
    'nucleoide': '#c86bfa', 'plasmideo': '#22e8e0', 'septo': '#a8c46a', 'protease': '#ff4d5a',
    'vesicula': '#1fb8a6',
}

# ----------------------------------------------------------------------------------------------
# utilidades
# ----------------------------------------------------------------------------------------------
def b2t(p):
    """blender (x,y,z) -> three (x, z, -y)"""
    return (float(p[0]), float(p[2]), float(-p[1]))

def t2b(p):
    """three (x,y,z) -> blender (x, -z, y)"""
    return Vector((p[0], -p[2], p[1]))

def srgb_lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def hex_lin(h):
    h = h.lstrip('#')
    return tuple(srgb_lin(int(h[i:i + 2], 16) / 255.0) for i in (0, 2, 4)) + (1.0,)

def limpar_cena():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for bloco in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.images, bpy.data.textures):
        for d in list(bloco):
            bloco.remove(d)

def ligar(ob):
    bpy.context.scene.collection.objects.link(ob)
    return ob

def suavizar(me):
    me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    me.update()

def por_uv(me, uvs):
    uvl = me.uv_layers.new(name='UVMap')
    plano = np.asarray(uvs, dtype=np.float32).ravel()
    try:
        uvl.data.foreach_set('uv', plano)
    except Exception:
        uvl.uv.foreach_set('vector', plano)

def malha_obj(nome, verts, faces, uvs=None):
    me = bpy.data.meshes.new(nome)
    me.from_pydata([tuple(v) for v in verts], [], faces)
    me.update()
    if uvs is not None:
        por_uv(me, uvs)
    suavizar(me)
    return ligar(bpy.data.objects.new(nome, me))

def aplicar_modificadores(ob):
    """avalia a pilha de modificadores e grava o resultado como malha real (sem depender de operadores).
    Para curvas (bevel), devolve um objeto-malha novo com o mesmo nome e apaga a curva."""
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    ev = ob.evaluated_get(dg)
    nova = bpy.data.meshes.new_from_object(ev, preserve_all_data_layers=True, depsgraph=dg)
    if ob.type != 'MESH':
        nome = ob.name
        remover(ob)
        nova.name = nome
        novo = ligar(bpy.data.objects.new(nome, nova))
        return novo
    velha = ob.data
    ob.modifiers.clear()
    ob.data = nova
    nova.name = ob.name
    if velha.users == 0:
        if isinstance(velha, bpy.types.Mesh):
            bpy.data.meshes.remove(velha)
        elif isinstance(velha, bpy.types.Curve):
            bpy.data.curves.remove(velha)
    return ob

def bm_para_obj(nome, bm):
    me = bpy.data.meshes.new(nome)
    bm.to_mesh(me)
    bm.free()
    suavizar(me)
    return ligar(bpy.data.objects.new(nome, me))

def remover(ob):
    dado = ob.data
    bpy.data.objects.remove(ob, do_unlink=True)
    if dado and dado.users == 0:
        if isinstance(dado, bpy.types.Mesh):
            bpy.data.meshes.remove(dado)
        elif isinstance(dado, bpy.types.Curve):
            bpy.data.curves.remove(dado)

def material(chave, rugos=0.6, metal=0.0, transm=0.0, emis=0.0, ior=1.45):
    m = bpy.data.materials.new('mat_' + chave)
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    bsdf = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if bsdf is None:
        nt.nodes.clear()
        bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
        saida = nt.nodes.new('ShaderNodeOutputMaterial')
        nt.links.new(bsdf.outputs[0], saida.inputs[0])
    cor = hex_lin(CORES[chave])
    def por(nomes, valor):
        for n in nomes:
            if n in bsdf.inputs:
                bsdf.inputs[n].default_value = valor
                return
    por(['Base Color'], cor)
    por(['Roughness'], rugos)
    por(['Metallic'], metal)
    por(['IOR'], ior)
    if transm > 0:
        por(['Transmission Weight', 'Transmission'], transm)
    if emis > 0:
        por(['Emission Color', 'Emission'], cor)
        por(['Emission Strength'], emis)
    m.diffuse_color = cor
    return m

def por_material(ob, m):
    ob.data.materials.clear()
    ob.data.materials.append(m)

# ----------------------------------------------------------------------------------------------
# geometria da capsula (bastonete curto com calotas hemisfericas)
# ----------------------------------------------------------------------------------------------
def grade_capsula(R, Hh, nu, ncap, ncyl, inverter=False):
    linhas = []
    for i in range(1, ncap + 1):
        a = (i / ncap) * (math.pi / 2)
        linhas.append((Hh + R * math.cos(a), R * math.sin(a), R * a))
    for j in range(1, ncyl + 1):
        z = Hh - 2 * Hh * j / ncyl
        linhas.append((z, R, R * math.pi / 2 + (Hh - z)))
    for i in range(1, ncap):
        a = (i / ncap) * (math.pi / 2)
        linhas.append((-Hh - R * math.sin(a), R * math.cos(a), R * math.pi / 2 + 2 * Hh + R * a))
    total = R * math.pi + 2 * Hh
    nl = len(linhas)
    fi = np.arange(nu) * (2 * math.pi / nu)
    cs, sn = np.cos(fi), np.sin(fi)
    verts = [(0.0, 0.0, Hh + R)]
    for (z, r, s) in linhas:
        for k in range(nu):
            verts.append((r * cs[k], r * sn[k], z))
    verts.append((0.0, 0.0, -Hh - R))
    ult = len(verts) - 1
    idx = lambda l, k: 1 + l * nu + (k % nu)
    faces, uvs = [], []
    vv = lambda l: 1.0 - linhas[l][2] / total
    for k in range(nu):
        f = [0, idx(0, k), idx(0, k + 1)]
        u = [((k + 0.5) / nu, 1.0), (k / nu, vv(0)), ((k + 1) / nu, vv(0))]
        if inverter:
            f, u = f[::-1], u[::-1]
        faces.append(f); uvs.extend(u)
    for l in range(nl - 1):
        for k in range(nu):
            f = [idx(l, k), idx(l + 1, k), idx(l + 1, k + 1), idx(l, k + 1)]
            u = [(k / nu, vv(l)), (k / nu, vv(l + 1)), ((k + 1) / nu, vv(l + 1)), ((k + 1) / nu, vv(l))]
            if inverter:
                f, u = f[::-1], u[::-1]
            faces.append(f); uvs.extend(u)
    for k in range(nu):
        f = [ult, idx(nl - 1, k + 1), idx(nl - 1, k)]
        u = [((k + 0.5) / nu, 0.0), ((k + 1) / nu, vv(nl - 1)), (k / nu, vv(nl - 1))]
        if inverter:
            f, u = f[::-1], u[::-1]
        faces.append(f); uvs.extend(u)
    return verts, faces, uvs

def proj_capsula(p, R, Hh=H):
    """projeta pontos (N,3) sobre a capsula de raio R; devolve (pontos, normais)"""
    p = np.asarray(p, dtype=np.float64)
    seg = np.zeros_like(p)
    seg[:, 2] = np.clip(p[:, 2], -Hh, Hh)
    d = p - seg
    n = d / np.maximum(np.linalg.norm(d, axis=1, keepdims=True), 1e-9)
    return seg + n * R, n

def sd_capsula(p, R, Hh=H):
    p = np.asarray(p, dtype=np.float64)
    seg = np.zeros_like(p)
    seg[:, 2] = np.clip(p[:, 2], -Hh, Hh)
    return np.linalg.norm(p - seg, axis=1) - R

def amostra_superficie(n, R, Hh=H):
    """n pontos uniformes por area na superficie da capsula"""
    pcil = Hh / (Hh + R)
    e_cil = rng.random(n) < pcil
    fi = rng.random(n) * 2 * math.pi
    z = (rng.random(n) * 2 - 1) * Hh
    cil = np.stack([R * np.cos(fi), R * np.sin(fi), z], axis=1)
    d = rng.normal(size=(n, 3))
    d /= np.linalg.norm(d, axis=1, keepdims=True)
    cal = d * R
    cal[:, 2] += np.where(d[:, 2] >= 0, Hh, -Hh)
    return np.where(e_cil[:, None], cil, cal)

def ponto_sup(R, fi_graus, y3, Hh=H):
    """ponto na capsula de raio R em coordenadas do THREE: angulo a partir de +Z rumo a +X, altura y"""
    f = math.radians(fi_graus)
    if abs(y3) <= Hh:
        rr = R
    else:
        dy = abs(y3) - Hh
        rr = math.sqrt(max(R * R - dy * dy, 0.0))
    return (rr * math.sin(f), y3, rr * math.cos(f))

def angulo_three(pb):
    """angulo (graus) no plano XZ do three, a partir de +Z rumo a +X, de um ponto em coords do Blender"""
    return math.degrees(math.atan2(pb[0], -pb[1]))

def dist_cunha(pb, meio_ang, y0):
    """distancia aproximada de um ponto (coords Blender) ate a cunha removida; <=0 se esta dentro da cunha"""
    x3, y3, z3 = pb[0], pb[2], -pb[1]
    a = math.radians(meio_ang)
    dmais = x3 * math.cos(a) - z3 * math.sin(a)
    dmenos = -(x3 * math.cos(-a) - z3 * math.sin(-a))
    d3 = y0 - y3
    pos = [d for d in (dmais, dmenos, d3) if d > 0]
    if not pos:
        return -1.0
    return math.sqrt(sum(d * d for d in pos))

class Grade:
    """hash espacial simples para amostragem de Poisson (rejeicao por distancia minima)"""
    def __init__(self, cel):
        self.cel, self.d = cel, {}
    def _k(self, p):
        return (int(math.floor(p[0] / self.cel)), int(math.floor(p[1] / self.cel)), int(math.floor(p[2] / self.cel)))
    def livre(self, p, dmin):
        k = self._k(p)
        r = int(math.ceil(dmin / self.cel))
        d2 = dmin * dmin
        for i in range(k[0] - r, k[0] + r + 1):
            for j in range(k[1] - r, k[1] + r + 1):
                for l in range(k[2] - r, k[2] + r + 1):
                    for q in self.d.get((i, j, l), ()):
                        if (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2 < d2:
                            return False
        return True
    def por(self, p):
        self.d.setdefault(self._k(p), []).append((p[0], p[1], p[2]))

def poisson_superficie(n_alvo, R, dmin, grades_proibidas=(), tentativas=40):
    g = Grade(dmin)
    pts = []
    for _ in range(tentativas):
        cand = amostra_superficie(n_alvo * 2, R)
        for p in cand:
            if len(pts) >= n_alvo:
                break
            if not g.livre(p, dmin):
                continue
            if any(not gp.livre(p, dp) for gp, dp in grades_proibidas):
                continue
            g.por(p); pts.append(p)
        if len(pts) >= n_alvo:
            break
    return np.array(pts), g

def base_tangente(n):
    n = Vector(n).normalized()
    a = Vector((0, 0, 1)) if abs(n.z) < 0.9 else Vector((1, 0, 0))
    t = n.cross(a).normalized()
    b = n.cross(t).normalized()
    return n, t, b

def matriz_para(normal, origem, giro=0.0):
    """matriz que leva +Z local para 'normal' e coloca em 'origem'"""
    n, t, b = base_tangente(normal)
    c, s = math.cos(giro), math.sin(giro)
    t2 = t * c + b * s
    b2 = n.cross(t2)
    m = Matrix((
        (t2.x, b2.x, n.x, origem[0]),
        (t2.y, b2.y, n.y, origem[1]),
        (t2.z, b2.z, n.z, origem[2]),
        (0, 0, 0, 1)))
    return m

def uv_raiz(pb):
    """codifica a raiz (angulo, altura) em UV para o recorte por unidade no shader.
    O exportador glTF inverte V (v' = 1 - v); o shader le v' e desfaz."""
    x3, y3, z3 = pb[0], pb[2], -pb[1]
    u = math.atan2(x3, z3) / (2 * math.pi) + 0.5
    v = (y3 + 1.5) / 3.0
    return (u, v)

def pintar_uv(bm, faces, uv):
    camada = bm.loops.layers.uv.verify()
    for f in faces:
        for l in f.loops:
            l[camada].uv = uv

def ruido_bolha(bm, verts, amp, escala, desloc):
    for v in verts:
        p = v.co * escala + Vector(desloc)
        k = noise.noise(p)
        v.co += v.normal * (k * amp) if v.normal.length > 0 else Vector((0, 0, 0))

# ----------------------------------------------------------------------------------------------
limpar_cena()
cena = bpy.context.scene
mats = {}

# ==============================================================================================
# 1. CASCAS DO ENVELOPE (inteiras; o corte e feito no wrapper JS)
# ==============================================================================================
def casca(nome, r_ext, r_int, dens_ext, dens_int, relevo=None):
    """casca fechada com espessura real: parede externa (densa, com relevo) + parede interna (lisa, invertida)"""
    nu, ncap, ncyl = dens_ext
    v, f, uv = grade_capsula(r_ext, H, nu, ncap, ncyl)
    ext = malha_obj(nome + '_ext', v, f, uv)
    if relevo:
        for i, (tipo, escala, forca) in enumerate(relevo):
            try:
                tex = bpy.data.textures.new('%s_tex%d' % (nome, i), type=tipo)
                tex.noise_scale = escala
                if tipo == 'CLOUDS':
                    tex.noise_depth = 3
                    tex.noise_basis = 'ORIGINAL_PERLIN'
                md = ext.modifiers.new('relevo%d' % i, 'DISPLACE')
                md.texture = tex
                md.texture_coords = 'LOCAL'
                md.direction = 'NORMAL'
                md.mid_level = 0.5
                md.strength = forca
            except Exception as e:
                log('  displace por textura indisponivel (%s); usando ruido em Python' % e)
                me = ext.data
                for vert in me.vertices:
                    k = noise.fractal(vert.co / escala, 1.0, 2.0, 3)
                    vert.co += vert.normal * (k * forca * 0.6)
        aplicar_modificadores(ext)
    nu2, ncap2, ncyl2 = dens_int
    v2, f2, uv2 = grade_capsula(r_int, H, nu2, ncap2, ncyl2, inverter=True)
    inte = malha_obj(nome + '_int', v2, f2, uv2)
    return ext, inte

def juntar(nome, objs, apagar=True):
    bm = bmesh.new()
    for o in objs:
        bm.from_mesh(o.data)
    ob = bm_para_obj(nome, bm)
    if apagar:
        for o in objs:
            remover(o)
    return ob

log('cascas...')
cap_ext, cap_int = casca('capsula', R_CAP_EXT, R_CAP_INT, (128, 28, 40), (96, 22, 30),
                         relevo=[('CLOUDS', 0.55, 0.018)])
me_ext, me_int = casca('membranaExterna', R_ME_EXT, R_ME_INT, (224, 46, 64), (96, 22, 30),
                       relevo=[('CLOUDS', 0.22, 0.016), ('CLOUDS', 0.06, 0.006)])
mi_ext, mi_int = casca('membranaInterna', R_MI_EXT, R_MI_INT, (160, 34, 46), (96, 22, 30),
                       relevo=[('CLOUDS', 0.18, 0.008)])

# ==============================================================================================
# 2. BAKE do micro-relevo (normal + cavidade) na parede externa da membrana externa
# ==============================================================================================
def salvar_imagem(img, base, qualidade=90):
    for fmt, ext in (('WEBP', '.webp'), ('JPEG', '.jpg')):
        try:
            caminho = os.path.join(SAIDA, base + ext)
            img.filepath_raw = caminho
            img.file_format = fmt
            try:
                img.save(filepath=caminho, quality=qualidade)
            except TypeError:
                img.save()
            if os.path.exists(caminho) and os.path.getsize(caminho) > 1000:
                return os.path.basename(caminho)
        except Exception as e:
            log('  falhou salvar %s: %s' % (fmt, e))
    return None

def bake_micro_relevo(ob):
    t_ini = time.time()
    cena.render.engine = 'CYCLES'
    cena.cycles.device = 'CPU'
    cena.cycles.samples = 4
    try:
        cena.cycles.use_denoising = False
    except Exception:
        pass
    m = bpy.data.materials.new('bake_tmp')
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    nt.nodes.clear()
    N = nt.nodes.new
    coord = N('ShaderNodeTexCoord')
    v1 = N('ShaderNodeTexVoronoi'); v1.voronoi_dimensions = '3D'; v1.feature = 'SMOOTH_F1'
    v1.inputs['Scale'].default_value = 44.0
    if 'Smoothness' in v1.inputs: v1.inputs['Smoothness'].default_value = 0.55
    v2 = N('ShaderNodeTexVoronoi'); v2.voronoi_dimensions = '3D'; v2.feature = 'SMOOTH_F1'
    v2.inputs['Scale'].default_value = 13.0
    if 'Smoothness' in v2.inputs: v2.inputs['Smoothness'].default_value = 0.8
    rn = N('ShaderNodeTexNoise'); rn.noise_dimensions = '3D'
    rn.inputs['Scale'].default_value = 150.0
    rn.inputs['Detail'].default_value = 3.0
    for v in (v1, v2, rn):
        nt.links.new(coord.outputs['Object'], v.inputs['Vector'])
    # altura = cupulas pequenas (1 - F1) + manchas maiores + grao fino
    inv1 = N('ShaderNodeMath'); inv1.operation = 'SUBTRACT'; inv1.inputs[0].default_value = 1.0
    nt.links.new(v1.outputs['Distance'], inv1.inputs[1])
    m1 = N('ShaderNodeMath'); m1.operation = 'MULTIPLY'; m1.inputs[1].default_value = 0.85
    nt.links.new(inv1.outputs[0], m1.inputs[0])
    inv2 = N('ShaderNodeMath'); inv2.operation = 'SUBTRACT'; inv2.inputs[0].default_value = 1.0
    nt.links.new(v2.outputs['Distance'], inv2.inputs[1])
    m2 = N('ShaderNodeMath'); m2.operation = 'MULTIPLY'; m2.inputs[1].default_value = 0.55
    nt.links.new(inv2.outputs[0], m2.inputs[0])
    m3 = N('ShaderNodeMath'); m3.operation = 'MULTIPLY'; m3.inputs[1].default_value = 0.22
    nt.links.new(rn.outputs[0], m3.inputs[0])
    s1 = N('ShaderNodeMath'); s1.operation = 'ADD'
    nt.links.new(m1.outputs[0], s1.inputs[0]); nt.links.new(m2.outputs[0], s1.inputs[1])
    s2 = N('ShaderNodeMath'); s2.operation = 'ADD'
    nt.links.new(s1.outputs[0], s2.inputs[0]); nt.links.new(m3.outputs[0], s2.inputs[1])
    bump = N('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.85
    bump.inputs['Distance'].default_value = 0.012
    nt.links.new(s2.outputs[0], bump.inputs['Height'])
    bsdf = N('ShaderNodeBsdfPrincipled')
    nt.links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    saida = N('ShaderNodeOutputMaterial')
    nt.links.new(bsdf.outputs[0], saida.inputs['Surface'])
    # cavidade: altura remapeada -> emissao
    rampa = N('ShaderNodeMapRange')
    rampa.inputs['From Min'].default_value = 0.55
    rampa.inputs['From Max'].default_value = 1.45
    nt.links.new(s2.outputs[0], rampa.inputs['Value'])
    emis = N('ShaderNodeEmission')
    nt.links.new(rampa.outputs[0], emis.inputs['Color'])

    img_n = bpy.data.images.new('me_normal', RES_BAKE, RES_BAKE, alpha=False, is_data=True)
    img_c = bpy.data.images.new('me_cavidade', RES_BAKE // 2, RES_BAKE // 2, alpha=False, is_data=True)
    no_img = N('ShaderNodeTexImage')
    no_img.image = img_n
    nt.nodes.active = no_img
    no_img.select = True

    por_material(ob, m)
    for o in cena.objects:
        o.select_set(False)
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    cena.render.bake.margin = 8
    log('  bake NORMAL %dpx...' % RES_BAKE)
    bpy.ops.object.bake(type='NORMAL', normal_space='TANGENT', margin=8, use_clear=True)
    log('  bake NORMAL ok em %.1fs' % (time.time() - t_ini))
    arq_n = salvar_imagem(img_n, 'me_normal', 92)

    arq_c = None
    if time.time() - t_ini < 480:
        no_img.image = img_c
        nt.links.new(emis.outputs[0], saida.inputs['Surface'])
        cena.cycles.samples = 2
        log('  bake EMIT (cavidade)...')
        bpy.ops.object.bake(type='EMIT', margin=8, use_clear=True)
        arq_c = salvar_imagem(img_c, 'me_cavidade', 88)
    log('  bake total %.1fs -> %s, %s' % (time.time() - t_ini, arq_n, arq_c))
    ob.data.materials.clear()
    bpy.data.materials.remove(m)
    return arq_n, arq_c

texturas = {'normal': None, 'cavidade': None}
if not SEM_BAKE:
    try:
        n_, c_ = bake_micro_relevo(me_ext)
        texturas['normal'], texturas['cavidade'] = n_, c_
    except Exception as e:
        log('BAKE FALHOU, seguindo sem textura:', repr(e))
else:
    # reaproveita texturas ja geradas numa execucao anterior
    for chave, base in (('normal', 'me_normal'), ('cavidade', 'me_cavidade')):
        for ext in ('.webp', '.jpg'):
            if os.path.exists(os.path.join(SAIDA, base + ext)):
                texturas[chave] = base + ext
                break

capsula = juntar('capsula', [cap_ext, cap_int])
membranaExterna = juntar('membranaExterna', [me_ext, me_int])
membranaInterna = juntar('membranaInterna', [mi_ext, mi_int])
mats['capsula'] = material('capsula', rugos=0.35, transm=0.9, ior=1.3)
mats['membranaExterna'] = material('membranaExterna', rugos=0.55)
mats['membranaInterna'] = material('membranaInterna', rugos=0.5)
por_material(capsula, mats['capsula'])
por_material(membranaExterna, mats['membranaExterna'])
por_material(membranaInterna, mats['membranaInterna'])

# citoplasma: volume fechado (superficie unica)
v, f, uv = grade_capsula(R_CITO, H, 96, 22, 30)
citoplasma = malha_obj('citoplasma', v, f, uv)
mats['citoplasma'] = material('citoplasma', rugos=0.3)
por_material(citoplasma, mats['citoplasma'])

# ==============================================================================================
# 3. PEPTIDOGLICANO: rede hexagonal (dual de uma icosfera relaxada sobre a capsula) + Wireframe
# ==============================================================================================
log('peptidoglicano...')
def rede_hexagonal(R, subdiv=5, iteracoes=90):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=1.0)
    bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
    P = np.array([v.co[:] for v in bm.verts], dtype=np.float64)
    n = len(P)
    # mapa esfera -> capsula preservando area, depois relaxamento laplaciano com reprojecao
    fcil = H / (H + R)
    z = P[:, 2]
    fi = np.arctan2(P[:, 1], P[:, 0])
    Q = np.zeros_like(P)
    dentro = np.abs(z) <= fcil
    Q[dentro] = np.stack([R * np.cos(fi[dentro]), R * np.sin(fi[dentro]), z[dentro] / fcil * H], axis=1)
    w = (np.abs(z[~dentro]) - fcil) / (1 - fcil)
    rr = R * np.sqrt(np.clip(1 - w * w, 0, 1))
    Q[~dentro] = np.stack([rr * np.cos(fi[~dentro]), rr * np.sin(fi[~dentro]),
                           np.sign(z[~dentro]) * (H + R * w)], axis=1)
    viz = [[e.other_vert(v).index for e in v.link_edges] for v in bm.verts]
    maxv = max(len(a) for a in viz)
    V = np.full((n, maxv), -1, dtype=np.int64)
    for i, a in enumerate(viz):
        V[i, :len(a)] = a
    mascara = V >= 0
    Vs = np.where(mascara, V, 0)
    cont = mascara.sum(axis=1, keepdims=True)
    for _ in range(iteracoes):
        media = (Q[Vs] * mascara[:, :, None]).sum(axis=1) / cont
        Q = Q * 0.4 + media * 0.6
        Q, _n = proj_capsula(Q, R)
    # dual: um vertice por face (centroide), uma celula por vertice original
    faces_tri = [[v.index for v in f.verts] for f in bm.faces]
    C = np.array([Q[f].mean(axis=0) for f in faces_tri])
    C, _n = proj_capsula(C, R)
    # irregularidade organica
    for i in range(len(C)):
        nn, t, b = base_tangente(_n[i])
        j = rng.normal(size=2) * 0.0035
        C[i] += np.array(t) * j[0] + np.array(b) * j[1]
    C, _n = proj_capsula(C, R)
    celulas = []
    _, NQ = proj_capsula(Q, R)
    for v in bm.verts:
        fs = [f.index for f in v.link_faces]
        nn, t, b = base_tangente(NQ[v.index])
        o = Q[v.index]
        ang = [math.atan2(float(np.dot(C[k] - o, np.array(b))), float(np.dot(C[k] - o, np.array(t)))) for k in fs]
        ordem = [k for _, k in sorted(zip(ang, fs))]
        # orientacao para fora
        a0, a1, a2 = C[ordem[0]], C[ordem[1]], C[ordem[2]]
        if np.dot(np.cross(a1 - a0, a2 - a0), NQ[v.index]) < 0:
            ordem = ordem[::-1]
        celulas.append(ordem)
    bm.free()
    return C, celulas

C, celulas = rede_hexagonal(R_PG, subdiv=5)
pg = malha_obj('peptidoglicano', C, celulas)
wf = pg.modifiers.new('rede', 'WIREFRAME')
wf.thickness = 0.0085
wf.use_replace = True
wf.use_even_offset = True
wf.use_relative_offset = False
wf.use_boundary = False
wf.offset = 0.0
aplicar_modificadores(pg)
suavizar(pg.data)
log('  rede: %d vertices, %d faces' % (len(pg.data.vertices), len(pg.data.polygons)))
mats['peptidoglicano'] = material('peptidoglicano', rugos=0.5)
por_material(pg, mats['peptidoglicano'])

# ==============================================================================================
# 4. NUCLEOIDE: curva NURBS enovelada com bevel (massa irregular, sem membrana)
# ==============================================================================================
log('nucleoide...')
def dentro_nucleoide(p):
    x, y, z = p
    # massa lobulada e irregular ao longo do eixo
    lob = 0.235 + 0.035 * math.sin(z * 7.0 + 0.6) + 0.05 * noise.noise(Vector((x * 2.2, y * 2.2, z * 2.2 + 3.1)))
    comp = 0.64
    return (x * x + y * y) / (lob * lob) + (z * z) / (comp * comp) < 1.0

def caminho_nucleoide(n=520, passo=0.082):
    p = np.array([0.02, -0.03, 0.0])
    d = rng.normal(size=3); d /= np.linalg.norm(d)
    pts = [p.copy()]
    for i in range(n - 1):
        ok = False
        for t in range(40):
            nd = d * 0.55 + rng.normal(size=3) * 0.75
            nd /= np.linalg.norm(nd)
            q = p + nd * passo
            if dentro_nucleoide(q):
                ok = True
                break
        if not ok:
            nd = -p / (np.linalg.norm(p) + 1e-6)
            q = p + nd * passo
        p, d = q, nd
        pts.append(p.copy())
    pts = np.array(pts)
    # fecha o anel (cromossomo circular): os ultimos pontos derivam para o inicio
    m = 28
    for k in range(m):
        w = ((k + 1) / m) ** 2
        pts[n - m + k] = pts[n - m + k] * (1 - w) + pts[0] * w
    return pts[:-1]

def curva_obj(nome, pontos, raio, ciclica=True, res_u=5, res_bevel=1, raios=None, tampas=False, ordem=4):
    cu = bpy.data.curves.new(nome, 'CURVE')
    cu.dimensions = '3D'
    cu.resolution_u = res_u
    cu.bevel_depth = raio
    cu.bevel_resolution = res_bevel
    try:
        cu.bevel_mode = 'ROUND'
    except Exception:
        pass
    cu.use_fill_caps = tampas
    sp = cu.splines.new('NURBS')
    sp.points.add(len(pontos) - 1)
    for i, p in enumerate(pontos):
        sp.points[i].co = (p[0], p[1], p[2], 1.0)
        sp.points[i].radius = 1.0 if raios is None else float(raios[i])
    sp.use_cyclic_u = ciclica
    sp.order_u = ordem
    if not ciclica:
        sp.use_endpoint_u = True
    return ligar(bpy.data.objects.new(nome, cu))

pts_nuc = caminho_nucleoide()
raios_nuc = [1.0 + 0.28 * noise.noise(Vector((i * 0.09, 1.7, 0.3))) for i in range(len(pts_nuc))]
nucleoide = curva_obj('nucleoide', pts_nuc, 0.0115, ciclica=True, res_u=5, res_bevel=1, raios=raios_nuc)
nucleoide = aplicar_modificadores(nucleoide)   # curva -> malha
suavizar(nucleoide.data)
log('  nucleoide: %d vertices' % len(nucleoide.data.vertices))
mats['nucleoide'] = material('nucleoide', rugos=0.4, emis=0.25)
por_material(nucleoide, mats['nucleoide'])
arv_nuc = kdtree.KDTree(len(pts_nuc))
for i, p in enumerate(pts_nuc):
    arv_nuc.insert(Vector(p), i)
arv_nuc.balance()

# ==============================================================================================
# 5. PLASMIDEOS: 3 aneis pequenos superenrolados, separados do nucleoide, na regiao exposta pelo corte
# ==============================================================================================
log('plasmideos...')
a_cito, y_cito = CORTE['citoplasma']
centros_plasm_three = [
    (0.285 * math.sin(math.radians(a_cito)), 0.60, 0.285 * math.cos(math.radians(a_cito))),
    (0.30 * math.sin(math.radians(-a_cito)), -0.02, 0.30 * math.cos(math.radians(-a_cito))),
    (0.12, y_cito + 0.01, 0.30),
]
normais_plasm_three = [
    (math.cos(math.radians(a_cito)), 0.25, -math.sin(math.radians(a_cito))),
    (-math.cos(math.radians(a_cito)), -0.2, -math.sin(math.radians(a_cito))),
    (0.15, 1.0, 0.2),
]
bm = bmesh.new()
centros_plasm_b = []
for i, (c3, n3) in enumerate(zip(centros_plasm_three, normais_plasm_three)):
    cb, nb = t2b(c3), t2b(n3).normalized()
    centros_plasm_b.append(cb)
    r0 = (0.058, 0.05, 0.064)[i]
    voltas = (7, 6, 8)[i]
    nn, t, b = base_tangente(nb)
    pts = []
    for k in range(64):
        a = k / 64 * 2 * math.pi
        rr = r0 + 0.011 * math.sin(voltas * a)
        h = 0.011 * math.cos(voltas * a + 0.7)
        pts.append(cb + t * (rr * math.cos(a)) + b * (rr * math.sin(a)) + nn * h)
    tmp = curva_obj('plasm_tmp', pts, 0.0062, ciclica=True, res_u=3, res_bevel=1)
    tmp = aplicar_modificadores(tmp)
    bm.from_mesh(tmp.data)
    remover(tmp)
plasmideo = bm_para_obj('plasmideo', bm)
mats['plasmideo'] = material('plasmideo', rugos=0.35, emis=0.4)
por_material(plasmideo, mats['plasmideo'])

# ==============================================================================================
# 6. ESTRUTURAS DE SUPERFICIE (malhas unicas com varias unidades; UV = raiz da unidade)
# ==============================================================================================
log('adesinas, pili...')
# raizes: adesinas e pili esparsos, sem colidir entre si
raiz_ades, g_ades = poisson_superficie(48, R_ME_EXT, 0.21)
raiz_pili, g_pili = poisson_superficie(26, R_ME_EXT, 0.30, grades_proibidas=[(g_ades, 0.09)])
_, n_ades = proj_capsula(raiz_ades, R_ME_EXT)
_, n_pili = proj_capsula(raiz_pili, R_ME_EXT)

# adesinas: haste curta e rigida com cabeca trimerica (Hia/HMW), mais grossa que os pili
bm = bmesh.new()
pontas_ades = []
for i, (p, n) in enumerate(zip(raiz_ades, n_ades)):
    compr = 0.105 + rng.random() * 0.05
    inclin = Vector(n) + Vector(rng.normal(size=3) * 0.12)
    inclin.normalize()
    base = Vector(p) - Vector(n) * 0.012
    antes_f = len(bm.faces)
    M = matriz_para(inclin, base + inclin * (compr / 2), rng.random() * 6.28)
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=7,
                          radius1=0.0105, radius2=0.0078, depth=compr, matrix=M)
    topo = base + inclin * compr
    nn, t, b = base_tangente(inclin)
    g0 = rng.random() * 6.28
    for k in range(3):
        a = g0 + k * 2.0944
        c = topo + (t * math.cos(a) + b * math.sin(a)) * 0.0095 + inclin * 0.004
        bmesh.ops.create_icosphere(bm, subdivisions=2, radius=0.0135, matrix=Matrix.Translation(c))
    bm.faces.ensure_lookup_table()
    pintar_uv(bm, bm.faces[antes_f:], uv_raiz(p))
    pontas_ades.append(topo)
adesinas = bm_para_obj('adesinas', bm)
mats['adesinas'] = material('adesinas', rugos=0.5)
por_material(adesinas, mats['adesinas'])

# pili: fibras finas e curvas, poucas dezenas
bm = bmesh.new()
meios_pili = []
for i, (p, n) in enumerate(zip(raiz_pili, n_pili)):
    compr = 0.34 + rng.random() * 0.26
    nn, t, b = base_tangente(n)
    g = rng.random() * 6.28
    lado = t * math.cos(g) + b * math.sin(g)
    curv = 0.25 + rng.random() * 0.5
    pts, raios = [], []
    npt = 7
    for k in range(npt):
        s = k / (npt - 1)
        q = Vector(p) - nn * 0.012 + nn * (compr * s) + lado * (curv * compr * s * s * 0.55)
        q += Vector(rng.normal(size=3)) * (0.012 * s)
        pts.append(q); raios.append(1.0 - 0.5 * s)
    tmp = curva_obj('pilus_tmp', pts, 0.0048, ciclica=False, res_u=5, res_bevel=1, raios=raios, tampas=True)
    tmp = aplicar_modificadores(tmp)
    antes_f = len(bm.faces)
    bm.from_mesh(tmp.data)
    remover(tmp)
    bm.faces.ensure_lookup_table()
    pintar_uv(bm, bm.faces[antes_f:], uv_raiz(p))
    meios_pili.append(pts[4])
pili = bm_para_obj('pili', bm)
mats['pili'] = material('pili', rugos=0.45)
por_material(pili, mats['pili'])

# ---------------------------------------------------------------- periplasma: beta-lactamases
log('beta-lactamases, PBP3, septo...')
def globulo(bm, centro, raio, lobos=3, subdiv=2, semente=0.0):
    antes_v = len(bm.verts)
    for k in range(lobos):
        d = Vector(rng.normal(size=3)); d.normalize()
        c = Vector(centro) + d * (raio * 0.45 if k else 0.0)
        r = raio * (1.0 if k == 0 else 0.62 + 0.2 * rng.random())
        bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=r, matrix=Matrix.Translation(c))
    bm.verts.ensure_lookup_table()
    novos = bm.verts[antes_v:]
    for v in novos:
        k = noise.noise(v.co * 60.0 + Vector((semente, 0, 0)))
        v.co += (v.co - Vector(centro)).normalized() * (k * raio * 0.22)
    return novos

a_pg, y_pg = CORTE['peptidoglicano']
a_me, y_me = CORTE['membranaExterna']
bm = bmesh.new()
centros_bl = []
g_bl = Grade(0.05)
def por_bl(pb, r_peri):
    q, _n = proj_capsula(np.array([pb]), r_peri)
    q = q[0]
    if not g_bl.livre(q, 0.05):
        return False
    g_bl.por(q)
    antes_f = len(bm.faces)
    globulo(bm, q, 0.0135 + rng.random() * 0.003, lobos=3, subdiv=2, semente=len(centros_bl) * 3.3)
    bm.faces.ensure_lookup_table()
    pintar_uv(bm, bm.faces[antes_f:], uv_raiz(q))
    centros_bl.append(q)
    return True
# algumas garantidas nas faixas que o corte expoe (terraco do peptidoglicano)
for fi_g, y3 in [(-57, 0.34), (57, 0.62), (-56, -0.12), (57.5, 0.05), (-58, 0.8), (30, y_pg - 0.06), (-25, y_pg - 0.07),
                 (5, y_pg - 0.05), (56, -0.3), (-57, 0.55)]:
    por_bl(t2b(ponto_sup(0.506, fi_g, y3)), 0.506)
tent = 0
while len(centros_bl) < 46 and tent < 4000:
    tent += 1
    cand = amostra_superficie(1, 0.5)[0]
    por_bl(cand, 0.506 if rng.random() < 0.6 else 0.472)
betaLactamase = bm_para_obj('betaLactamase', bm)
mats['betaLactamase'] = material('betaLactamase', rugos=0.45)
por_material(betaLactamase, mats['betaLactamase'])

# ---------------------------------------------------------------- PBP3: anel na membrana interna, no plano do septo
bm = bmesh.new()
centros_pbp = []
N_PBP = 44
for k in range(N_PBP):
    a = k / N_PBP * 2 * math.pi + 0.04
    zz = 0.017 if k % 2 == 0 else -0.017
    r = R_MI_EXT + 0.010
    c = Vector((r * math.cos(a), r * math.sin(a), zz))
    antes_f = len(bm.faces)
    # dominio periplasmatico (globular) + ancora transmembrana curta
    globulo(bm, c, 0.0155, lobos=2, subdiv=2, semente=k * 1.7)
    rad = Vector((math.cos(a), math.sin(a), 0))
    M = matriz_para(rad, c - rad * 0.02, 0.0)
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=6, radius1=0.0055, radius2=0.0055, depth=0.03, matrix=M)
    bm.faces.ensure_lookup_table()
    pintar_uv(bm, bm.faces[antes_f:], uv_raiz(c))
    centros_pbp.append(c)
pbp3 = bm_para_obj('pbp3', bm)
mats['pbp3'] = material('pbp3', rugos=0.4, emis=0.15)
por_material(pbp3, mats['pbp3'])

# ---------------------------------------------------------------- septo: disco anelar (cresce no shader com estado.divisao)
def disco_septo(r_ext, r_int, esp, nu=96, nr=20):
    verts, faces = [], []
    for lado, z in ((0, esp / 2), (1, -esp / 2)):
        for j in range(nr + 1):
            r = r_ext + (r_int - r_ext) * j / nr
            for k in range(nu):
                a = k / nu * 2 * math.pi
                verts.append((r * math.cos(a), r * math.sin(a), z))
    idx = lambda lado, j, k: lado * (nr + 1) * nu + j * nu + (k % nu)
    for j in range(nr):
        for k in range(nu):
            faces.append([idx(0, j, k), idx(0, j, k + 1), idx(0, j + 1, k + 1), idx(0, j + 1, k)])      # topo (+z)
            faces.append([idx(1, j, k), idx(1, j + 1, k), idx(1, j + 1, k + 1), idx(1, j, k + 1)])      # fundo (-z)
    for k in range(nu):
        faces.append([idx(0, 0, k), idx(1, 0, k), idx(1, 0, k + 1), idx(0, 0, k + 1)])                  # borda externa
        faces.append([idx(0, nr, k), idx(0, nr, k + 1), idx(1, nr, k + 1), idx(1, nr, k)])              # borda interna
    return verts, faces
v, f = disco_septo(R_MI_EXT, 0.02, 0.05)
septo = malha_obj('septo', v, f)
# confere a orientacao: a face do topo deve olhar para +z
septo.data.update()
if septo.data.polygons[0].normal.z < 0:
    bmx = bmesh.new(); bmx.from_mesh(septo.data); bmesh.ops.reverse_faces(bmx, faces=bmx.faces); bmx.to_mesh(septo.data); bmx.free()
mats['septo'] = material('septo', rugos=0.55)
por_material(septo, mats['septo'])

# ==============================================================================================
# 7. MALHAS-BASE para instancing (uma de cada) + pontos no JSON
# ==============================================================================================
log('malhas-base...')
# LOS: haste MUITO curta (sem antigeno O): lipideo A + nucleo oligossacaridico (2 contas)
bm = bmesh.new()
bmesh.ops.create_cone(bm, cap_ends=False, cap_tris=False, segments=5, radius1=0.0058, radius2=0.0036, depth=0.022,
                      matrix=Matrix.Translation((0, 0, 0.011)))
bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.0072, matrix=Matrix.Translation((0.001, 0, 0.0245)))
bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.0052, matrix=Matrix.Translation((-0.003, 0.002, 0.0335)))
los_base = bm_para_obj('los_base', bm)
mats['los'] = material('los', rugos=0.55)
por_material(los_base, mats['los'])

# porina: trimero de barris curtos com poro central (OMP P2)
bm = bmesh.new()
for k in range(3):
    a = k * 2.0944 + 0.3
    cx, cy = 0.0135 * math.cos(a), 0.0135 * math.sin(a)
    n_seg = 10
    r_o, r_i, h0, h1 = 0.0125, 0.0055, -0.030, 0.0085
    anel = lambda r, z: [bm.verts.new((cx + r * math.cos(j / n_seg * 6.2832), cy + r * math.sin(j / n_seg * 6.2832), z)) for j in range(n_seg)]
    A, B, Cc, D = anel(r_o, h0), anel(r_o, h1), anel(r_i, h1), anel(r_i, h1 - 0.02)
    for j in range(n_seg):
        j2 = (j + 1) % n_seg
        bm.faces.new([A[j], A[j2], B[j2], B[j]])       # parede externa
        bm.faces.new([B[j], B[j2], Cc[j2], Cc[j]])     # topo (anel)
        bm.faces.new([Cc[j], Cc[j2], D[j2], D[j]])     # parede do poro
    bm.faces.new(D[::-1])                               # fundo do poro
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
porina_base = bm_para_obj('porina_base', bm)
mats['porinas'] = material('porinas', rugos=0.4)
por_material(porina_base, mats['porinas'])

# ribossomo: subunidade maior (50S) + menor (30S)
bm = bmesh.new()
bmesh.ops.create_icosphere(bm, subdivisions=2, radius=0.0125, matrix=Matrix.Translation((0, 0, 0.002)))
bm.verts.ensure_lookup_table()
for v_ in bm.verts[:]:
    v_.co.z *= 0.86
    v_.co += v_.co.normalized() * noise.noise(v_.co * 90) * 0.002
n_antes = len(bm.verts)
bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.0088, matrix=Matrix.Translation((0.002, 0.001, -0.0105)))
bm.verts.ensure_lookup_table()
for v_ in bm.verts[n_antes:]:
    v_.co.x *= 1.25
ribossomo_base = bm_para_obj('ribossomo_base', bm)
mats['ribossomos'] = material('ribossomos', rugos=0.5)
por_material(ribossomo_base, mats['ribossomos'])

# protease de IgA1: globulo bilobado
bm = bmesh.new()
globulo(bm, (0, 0, 0), 0.016, lobos=3, subdiv=2, semente=9.1)
protease_base = bm_para_obj('protease_base', bm)
mats['protease'] = material('protease', rugos=0.4, emis=0.3)
por_material(protease_base, mats['protease'])

# vesicula de membrana externa (OMV): esfera com relevo + Subdivision Surface
bm = bmesh.new()
ret = bmesh.ops.create_icosphere(bm, subdivisions=2, radius=0.05)
vesicula_base = bm_para_obj('vesicula_base', bm)
sub = vesicula_base.modifiers.new('sub', 'SUBSURF'); sub.levels = 1; sub.render_levels = 1
try:
    tex = bpy.data.textures.new('ves_tex', type='CLOUDS'); tex.noise_scale = 0.03
    md = vesicula_base.modifiers.new('relevo', 'DISPLACE'); md.texture = tex; md.strength = 0.008; md.mid_level = 0.5
except Exception as e:
    log('  vesicula sem displace:', e)
aplicar_modificadores(vesicula_base)
suavizar(vesicula_base.data)
mats['vesicula'] = material('vesicula', rugos=0.5)
por_material(vesicula_base, mats['vesicula'])

# ==============================================================================================
# 8. PONTOS de instancia (vao para o JSON, nao para o GLB)
# ==============================================================================================
log('pontos de instancia...')
# porinas: ~300, com algumas garantidas na faixa exposta da membrana externa
a_cap, y_cap = CORTE['capsula']
g_por = Grade(0.085)
pts_por = []
for fi_g, y3 in [(67, -0.12), (-67, 0.45), (66, 0.7), (-66.5, -0.35), (20, y_cap + 0.06), (-35, y_cap + 0.05)]:
    q = np.array(t2b(ponto_sup(R_ME_EXT, fi_g, y3)))
    g_por.por(q); pts_por.append(q)
for _ in range(60):
    for p in amostra_superficie(400, R_ME_EXT):
        if len(pts_por) >= 300:
            break
        if g_por.livre(p, 0.085) and g_ades.livre(p, 0.05) and g_pili.livre(p, 0.04):
            g_por.por(p); pts_por.append(p)
    if len(pts_por) >= 300:
        break
pts_por = np.array(pts_por)
pts_por, n_por = proj_capsula(pts_por, R_ME_EXT + 0.004)

# LOS: milhares, distribuicao de Poisson, sem cair em cima de porina/adesina/pilus
pts_los, _g = poisson_superficie(7200, R_ME_EXT, 0.0225,
                                 grades_proibidas=[(g_por, 0.03), (g_ades, 0.022), (g_pili, 0.015)], tentativas=60)
pts_los, n_los = proj_capsula(pts_los, R_ME_EXT - 0.004)
log('  LOS: %d   porinas: %d' % (len(pts_los), len(pts_por)))

# ribossomos: volume do citoplasma, fora do nucleoide e dos plasmideos; mais densos perto do que o corte mostra
g_rib = Grade(0.027)
pts_rib = []
R_RIB = R_CITO - 0.016
alvo_rib = 5200
tent = 0
while len(pts_rib) < alvo_rib and tent < 60:
    tent += 1
    cand = np.stack([(rng.random(6000) * 2 - 1) * R_RIB, (rng.random(6000) * 2 - 1) * R_RIB,
                     (rng.random(6000) * 2 - 1) * (H + R_RIB)], axis=1)
    sd = sd_capsula(cand, R_RIB)
    for p, s in zip(cand, sd):
        if s > 0:
            continue
        prof_sup = -s
        dc = dist_cunha(p, a_cito, y_cito)
        peso = math.exp(-prof_sup / 0.085)
        peso += math.exp(-max(dc, 0.0) / 0.11) if dc > 0 else 0.30
        if rng.random() > min(1.0, 0.07 + peso):
            continue
        co, idx_, dist_ = arv_nuc.find(Vector(p))
        if dist_ < 0.034:
            continue
        if any((Vector(p) - cpl).length < 0.085 for cpl in centros_plasm_b):
            continue
        if not g_rib.livre(p, 0.027):
            continue
        g_rib.por(p); pts_rib.append(p)
        if len(pts_rib) >= alvo_rib:
            break
pts_rib = np.array(pts_rib)
log('  ribossomos: %d' % len(pts_rib))

# ==============================================================================================
# 9. ANCORAS (coords do three) para as linhas de legenda
# ==============================================================================================
def mais_perto(pontos_b, alvo_three):
    alvo = np.array(t2b(alvo_three))
    d = np.linalg.norm(np.asarray(pontos_b) - alvo, axis=1)
    return int(np.argmin(d))

i_ad = mais_perto(raiz_ades, ponto_sup(R_ME_EXT, 105, 0.45))
i_pi = mais_perto(raiz_pili, ponto_sup(R_ME_EXT, -105, 0.75))
i_po = mais_perto(pts_por, ponto_sup(R_ME_EXT, 67, -0.12))
i_bl = mais_perto(centros_bl, ponto_sup(0.506, -57, 0.34))
i_pb = mais_perto(centros_pbp, ponto_sup(R_MI_EXT, -47, 0.0))
# ponto do nucleoide mais "para fora" na abertura do corte
cand_nuc = [(p[1] * -1.0, i) for i, p in enumerate(pts_nuc) if abs(p[2] - 0.2) < 0.25 and abs(p[0]) < 0.12]
i_nu = max(cand_nuc)[1] if cand_nuc else 0

ancoras = {
    'capsula': ponto_sup(R_CAP_EXT, -100, 0.55),
    'membranaExterna': ponto_sup(R_ME_EXT, 67, 0.32),
    'los': ponto_sup(R_ME_EXT + 0.03, -67, 0.12),
    'porinas': b2t(pts_por[i_po]),
    'adesinas': b2t(pontas_ades[i_ad]),
    'pili': b2t(meios_pili[i_pi]),
    'peptidoglicano': ponto_sup(R_PG, 57, 0.18),
    'betaLactamase': b2t(centros_bl[i_bl]),
    'membranaInterna': ponto_sup(R_MI_EXT, 47, -0.08),
    'pbp3': b2t(centros_pbp[i_pb]),
    'citoplasma': (0.34 * math.sin(math.radians(a_cito)), 0.30, 0.34 * math.cos(math.radians(a_cito))),
    'ribossomos': (0.35 * math.sin(math.radians(-a_cito)), 0.62, 0.35 * math.cos(math.radians(-a_cito))),
    'nucleoide': b2t(pts_nuc[i_nu]),
    'plasmideo': centros_plasm_three[0],
    'septo': ponto_sup(R_ME_EXT, 90, 0.0),
    'secrecao': ponto_sup(R_CAP_EXT + 0.22, -125, -0.35),
}

# ==============================================================================================
# 10. EXPORTACAO
# ==============================================================================================
def arr(a, casas=4):
    return [round(float(x), casas) for x in np.asarray(a).ravel()]

def para_three(P):
    P = np.asarray(P)
    return np.stack([P[:, 0], P[:, 2], -P[:, 1]], axis=1)

dados = {
    'versao': 1,
    'gerador': 'tools/blender/gerar_bacilo.py (Blender %s)' % bpy.app.version_string,
    'eixos': 'three: Y = eixo longo; corte em cunha centrado em +Z',
    'dims': {'H': H, 'capsula': [R_CAP_INT, R_CAP_EXT], 'membranaExterna': [R_ME_INT, R_ME_EXT], 'peptidoglicano': [R_PG - 0.006, R_PG + 0.006],
             'membranaInterna': [R_MI_INT, R_MI_EXT], 'citoplasma': [0.0, R_CITO]},
    'corte': {k: {'meioAngulo': v[0], 'y0': v[1]} for k, v in CORTE.items()},
    'cores': CORES,
    'texturas': texturas,
    'ancoras': {k: [round(c, 4) for c in v] for k, v in ancoras.items()},
    'plasmideos': [[round(c, 4) for c in p] for p in centros_plasm_three],
    'los': {'p': arr(para_three(pts_los)), 'n': arr(para_three(n_los), 3)},
    'porinas': {'p': arr(para_three(pts_por)), 'n': arr(para_three(n_por), 3)},
    'ribossomos': {'p': arr(para_three(pts_rib))},
}
with open(os.path.join(SAIDA, 'bacilo.json'), 'w', encoding='utf-8') as fp:
    json.dump(dados, fp, separators=(',', ':'))
log('bacilo.json: %.0f KB' % (os.path.getsize(os.path.join(SAIDA, 'bacilo.json')) / 1024))

# estatistica das malhas
total_tris = 0
for ob in cena.objects:
    if ob.type == 'MESH':
        ob.data.calc_loop_triangles()
        nt_ = len(ob.data.loop_triangles)
        total_tris += nt_
        log('  %-18s %7d vertices %7d triangulos' % (ob.name, len(ob.data.vertices), nt_))
log('  total: %d triangulos (sem instancias)' % total_tris)

for o in cena.objects:
    o.select_set(False)
caminho_glb = os.path.join(SAIDA, 'bacilo.glb')
props = set(bpy.ops.export_scene.gltf.get_rna_type().properties.keys())
pedido = dict(filepath=caminho_glb, export_format='GLB', export_yup=True, export_apply=False,
              export_normals=True, export_texcoords=True, export_tangents=False, export_materials='EXPORT',
              export_animations=False, export_skins=False, export_morph=False, export_cameras=False,
              export_lights=False, export_extras=False, use_selection=False, export_vertex_color='NONE',
              export_image_format='NONE')
opc = {k: v for k, v in pedido.items() if k in props}
ignoradas = [k for k in pedido if k not in props]
if ignoradas:
    log('  opcoes do exportador inexistentes nesta versao (ignoradas):', ignoradas)
bpy.ops.export_scene.gltf(**opc)
log('bacilo.glb: %.2f MB' % (os.path.getsize(caminho_glb) / 1e6))
log('FIM')
