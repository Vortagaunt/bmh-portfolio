"""
Second half of scripts/lrhs-cover/render.mjs: turns the flat wall and the hero
tile it screenshotted into the finished cover.

The camera is the CSS one the first drafts used (perspective 2400px from 34%
down, the wall tipped back 48 degrees and turned 30), done here by hand: every
corner is projected, and Pillow warps the flat image onto it. Working at 2x and
scaling down at the end keeps the marks crisp.

    python compose.py <folder with flat.png and hero.png> <out.jpg>
"""
import math
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src_dir, out_path = sys.argv[1], sys.argv[2]

OUT_W, OUT_H = 2560, 1754            # the card is 1.46:1; 2560 wide is 2x at its widest
S = 2                                # supersampling
OW, OH = OUT_W * S, OUT_H * S

COLS, ROWS, TILE, GAP, PAD = 13, 11, 306, 26, 120   # same grid as render.mjs
HERO_ROW, HERO_COL = 5, 6
FLAT_SCALE = 2                       # flat.png is a 2x screenshot

RX, RZ = math.radians(48), math.radians(-30)        # tip back, turn
DIST = 2400                                         # perspective distance
OX, OY = 1280, 0.34 * 1754                          # where the camera looks from
CX, CY = 1280, 0.52 * 1754                          # where the wall's centre sits
LIFT, HERO_SCALE = 340, 1.5                         # how far the LR tile floats, how big it is
BG = np.array([0x02, 0x1C, 0x11], np.float32) / 255  # the dark Mustang Green the wall fades into

W = COLS * TILE + (COLS - 1) * GAP
H = ROWS * TILE + (ROWS - 1) * GAP

rz = np.array([[math.cos(RZ), -math.sin(RZ), 0], [math.sin(RZ), math.cos(RZ), 0], [0, 0, 1]])
rx = np.array([[1, 0, 0], [0, math.cos(RX), -math.sin(RX)], [0, math.sin(RX), math.cos(RX)]])
M = rx @ rz


def project(points):
    """Wall-local (x, y, z) with the origin at the wall's centre -> output pixels."""
    q = (M @ np.asarray(points, float).T).T
    x, y, z = q[:, 0] + CX, q[:, 1] + CY, q[:, 2]
    f = DIST / (DIST - z)
    return np.stack([OX + (x - OX) * f, OY + (y - OY) * f], 1) * S


def quad_coeffs(src, dst):
    """Pillow's PERSPECTIVE wants the output -> input mapping."""
    a, b = [], []
    for (x, y), (u, v) in zip(dst, src):
        a.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u)
        a.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
    return np.linalg.solve(np.array(a, float), np.array(b, float)).tolist()


def warp(img, quad):
    w, h = img.size
    return img.transform((OW, OH), Image.PERSPECTIVE, quad_coeffs([(0, 0), (w, 0), (w, h), (0, h)], quad), Image.BICUBIC)


def ramp(t, stops):
    return np.interp(t, [s[0] for s in stops], [s[1] for s in stops])


# ---- the wall, tipped into perspective
flat = Image.open(f"{src_dir}/flat.png").convert("RGBA")
fw, fh = flat.size
corners = [(0, 0), (fw, 0), (fw, fh), (0, fh)]
local = [((x / FLAT_SCALE - PAD) - W / 2, (y / FLAT_SCALE - PAD) - H / 2, 0) for x, y in corners]
wall_quad = project(local)
wall = warp(flat, wall_quad)

# depth of every output pixel on the wall, for the depth of field
a, b, c, d, e, f, g, h = quad_coeffs([p[:2] for p in local], wall_quad)
yy, xx = np.mgrid[0:OH, 0:OW].astype(np.float32)
den = g * xx + h * yy + 1
depth = M[2, 0] * (a * xx + b * yy + c) / den + M[2, 1] * (d * xx + e * yy + f) / den
del xx, yy, den

# ---- depth of field: sharp along the line through the lifted tile, softer away from it
hero_x = HERO_COL * (TILE + GAP) + TILE / 2 - W / 2
hero_y = HERO_ROW * (TILE + GAP) + TILE / 2 - H / 2
focus = float((M @ np.array([hero_x, hero_y, 0]))[2])
defocus = np.clip(np.abs(depth - focus) / 900, 0, 1.6)
sharp = np.asarray(wall).astype(np.float32) / 255
soft = np.asarray(wall.filter(ImageFilter.GaussianBlur(5 * S))).astype(np.float32) / 255
softer = np.asarray(wall.filter(ImageFilter.GaussianBlur(14 * S))).astype(np.float32) / 255
w1 = np.clip(defocus / 0.8, 0, 1)[..., None]
w2 = np.clip((defocus - 0.8) / 0.8, 0, 1)[..., None]
wall_px = sharp * (1 - w1) + soft * w1
wall_px = wall_px * (1 - w2) + softer * w2
del sharp, soft, softer, depth, defocus

img = np.ones((OH, OW, 3), np.float32) * BG
alpha = wall_px[..., 3:4]
img = img * (1 - alpha) + wall_px[..., :3] * alpha
del wall_px

# ---- the lifted tile's shadow on the wall
half = TILE / 2 * HERO_SCALE
hero_local = [(hero_x - half, hero_y - half), (hero_x + half, hero_y - half),
              (hero_x + half, hero_y + half), (hero_x - half, hero_y + half)]
shadow = Image.new("L", (OW, OH), 0)
ImageDraw.Draw(shadow).polygon([tuple(p) for p in project([(x + 40, y + 120, 0) for x, y in hero_local])], fill=255)
shadow = np.asarray(shadow.filter(ImageFilter.GaussianBlur(55 * S))).astype(np.float32) / 255
img *= (1 - 0.88 * shadow)[..., None]
del shadow

# ---- fog: a pool of light in the middle, dark at the top and bottom
yy, xx = np.mgrid[0:OH, 0:OW].astype(np.float32) / S
r = np.sqrt(((xx - 1280) / (2560 * 0.55)) ** 2 + ((yy - 0.5 * 1754) / (1754 * 0.52)) ** 2)
fog_round = ramp(r, [(0, 0), (0.40, 0.22), (0.78, 0.86), (1.0, 1.0), (9, 1.0)])
fog_tb = ramp(yy / 1754, [(0, 1.0), (0.24, 0), (0.68, 0), (1.0, 0.92)])
fog = (1 - (1 - fog_round) * (1 - fog_tb))[..., None]
img = img * (1 - fog) + BG * fog
del xx, yy, r, fog_round, fog_tb, fog

# ---- the lifted tile: two darker copies underneath for its edge, then the tile
hero = Image.open(f"{src_dir}/hero.png").convert("RGBA")
for drop, shade in ((22, (150, 156, 150)), (11, (205, 209, 203))):
    edge = np.asarray(warp(hero.split()[3], project([(x, y, LIFT - drop) for x, y in hero_local]))).astype(np.float32)[..., None] / 255
    img = img * (1 - edge) + np.array(shade, np.float32) / 255 * edge
tile = np.asarray(warp(hero, project([(x, y, LIFT) for x, y in hero_local]))).astype(np.float32) / 255
img = img * (1 - tile[..., 3:4]) + tile[..., :3] * tile[..., 3:4]
del tile

# ---- grain
noise = np.random.default_rng(3).normal(0, 1, (OUT_H, OUT_W)).astype(np.float32)
noise = Image.fromarray((noise * 40 + 128).clip(0, 255).astype(np.uint8)).resize((OW, OH), Image.BILINEAR)
img = np.clip(img + (np.asarray(noise).astype(np.float32) / 255 - 0.5)[..., None] * 0.035, 0, 1)

out = Image.fromarray((img * 255 + 0.5).astype(np.uint8)).resize((OUT_W, OUT_H), Image.LANCZOS)
out.save(out_path, quality=90, optimize=True, progressive=True)
