import { readdirSync as R, readFileSync as F, mkdirSync as M, writeFileSync as W } from "node:fs";
for (const id of R("/input", { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort()) {
  let P; try { P = F(`/input/${id}/program.bin`); } catch { P = Buffer.alloc(0); }
  let I; try { I = F(`/input/${id}/input.bin`); } catch { I = Buffer.alloc(0); }
  const n = P.length, S = new Int32Array(256), A = new Int32Array(256), C = new Int32Array(64), O = Buffer.alloc(65536);
  let sp = 0, cp = 0, pc = 0, ns = 0, ip = 0, ol = 0, ex = 0, a = 0, b = 0, v = 0, o = 0, s = "";
  outer: while (true) {
    if (ns >= 1e6) { ex = 10; break; }
    if (pc < 0 || pc >= n) { ex = 9; break; }
    const op = P[pc];
    const k = op < 8 || op > 15 && op < 35 || op > 47 && op < 53 || op > 63 && op < 66 || op > 79 && op < 84;
    if (!k) { ex = 5; break; }
    const il = op == 2 ? 4 : op == 1 ? 1 : op > 47 && op < 52 ? 2 : 0;
    if (pc + 1 + il > n) { ex = 9; break; }
    ns++;
    const q = pc + 1 + il;
    switch (op) {
      case 0x00: ex = 0; break outer;
      case 0x01:
        if (sp > 255) { ex = 3; break outer; }
        S[sp++] = (P[pc + 1] << 24) >> 24; pc = q; break;
      case 0x02:
        if (sp > 255) { ex = 3; break outer; }
        S[sp++] = P[pc + 1] | P[pc + 2] << 8 | P[pc + 3] << 16 | P[pc + 4] << 24; pc = q; break;
      case 0x03:
        if (sp < 1) { ex = 2; break outer; }
        sp--; pc = q; break;
      case 0x04:
        if (sp < 1) { ex = 2; break outer; }
        if (sp > 255) { ex = 3; break outer; }
        S[sp] = S[sp - 1]; sp++; pc = q; break;
      case 0x05:
        if (sp < 2) { ex = 2; break outer; }
        v = S[sp - 1]; S[sp - 1] = S[sp - 2]; S[sp - 2] = v; pc = q; break;
      case 0x06:
        if (sp < 2) { ex = 2; break outer; }
        if (sp > 255) { ex = 3; break outer; }
        S[sp] = S[sp - 2]; sp++; pc = q; break;
      case 0x07:
        if (sp < 3) { ex = 2; break outer; }
        v = S[sp - 3]; S[sp - 3] = S[sp - 2]; S[sp - 2] = S[sp - 1]; S[sp - 1] = v; pc = q; break;
      case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16:
      case 0x18: case 0x19: case 0x1a: case 0x1c: case 0x1d: case 0x1e:
      case 0x20: case 0x21: case 0x22:
        if (sp < 2) { ex = 2; break outer; }
        b = S[--sp]; a = S[sp - 1];
        if (op > 0x12 && op < 0x17 && !b) { ex = 4; break outer; }
        v = op == 0x10 ? (a + b) | 0 : op == 0x11 ? (a - b) | 0 : op == 0x12 ? Math.imul(a, b)
          : op == 0x13 ? (a / b) | 0 : op == 0x14 ? (a % b) | 0
          : op == 0x15 ? ((a >>> 0) / (b >>> 0)) | 0 : op == 0x16 ? ((a >>> 0) % (b >>> 0)) | 0
          : op == 0x18 ? a & b : op == 0x19 ? a | b : op == 0x1a ? a ^ b
          : op == 0x1c ? a << (b & 31) : op == 0x1d ? a >> (b & 31) : op == 0x1e ? (a >>> (b & 31)) | 0
          : op == 0x20 ? (a == b ? 1 : 0) : op == 0x21 ? (a < b ? 1 : 0) : ((a >>> 0) < (b >>> 0) ? 1 : 0);
        S[sp - 1] = v; pc = q; break;
      case 0x17:
        if (sp < 1) { ex = 2; break outer; }
        S[sp - 1] = (-S[sp - 1]) | 0; pc = q; break;
      case 0x1b:
        if (sp < 1) { ex = 2; break outer; }
        S[sp - 1] = ~S[sp - 1]; pc = q; break;
      case 0x30: case 0x31: case 0x32:
        o = P[pc + 1] | P[pc + 2] << 8; if (o > 32767) o -= 65536;
        if (op == 0x30) { pc = q + o; break; }
        if (sp < 1) { ex = 2; break outer; }
        v = S[--sp]; pc = (op == 0x31 ? v == 0 : v != 0) ? q + o : q; break;
      case 0x33:
        if (cp > 63) { ex = 7; break outer; }
        C[cp++] = q; pc = P[pc + 1] | P[pc + 2] << 8; break;
      case 0x34:
        if (cp < 1) { ex = 8; break outer; }
        pc = C[--cp]; break;
      case 0x40:
        if (sp < 1) { ex = 2; break outer; }
        v = S[sp - 1];
        if (v < 0 || v > 255) { ex = 6; break outer; }
        S[sp - 1] = A[v]; pc = q; break;
      case 0x41:
        if (sp < 2) { ex = 2; break outer; }
        o = S[--sp]; v = S[--sp];
        if (o < 0 || o > 255) { ex = 6; break outer; }
        A[o] = v; pc = q; break;
      case 0x50:
        if (sp < 1) { ex = 2; break outer; }
        v = S[--sp]; s = String(v);
        if (ol + s.length > 65536) { ex = 11; break outer; }
        ol += O.write(s, ol); pc = q; break;
      case 0x51:
        if (sp < 1) { ex = 2; break outer; }
        v = S[--sp];
        if (ol > 65535) { ex = 11; break outer; }
        O[ol++] = v & 255; pc = q; break;
      case 0x52:
        if (sp > 255) { ex = 3; break outer; }
        S[sp++] = ip < I.length ? I[ip++] : -1; pc = q; break;
      case 0x53:
        if (sp < 1) { ex = 2; break outer; }
        ex = S[--sp] & 255; break outer;
    }
  }
  M(`/output/${id}`, { recursive: true });
  W(`/output/${id}/stdout.bin`, O.subarray(0, ol));
  W(`/output/${id}/exit.txt`, String(ex));
}
