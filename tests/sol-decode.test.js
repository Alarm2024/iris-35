const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const IrisSol = require("../sol-decode.js");

/* The desk's old classifySol, kept here as the parity oracle.
   Notes shown on the page must match this on every fixture. */
const ALLOW = {
  "11111111111111111111111111111111": "System",
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA": "SPL Token",
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb": "Token-2022",
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL": "ATA",
  "ComputeBudget111111111111111111111111111111": "ComputeBudget",
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr": "Memo",
  "Stake11111111111111111111111111111111111111": "Stake",
  "Vote111111111111111111111111111111111111111": "Vote",
  "AddressLookupTab1e1111111111111111111111111": "AddressLookupTable"
};
const MAX = "18446744073709551615";
const COMPUTE = "ComputeBudget111111111111111111111111111111";

function ixList(tx) {
  const outer = (tx.transaction && tx.transaction.message && tx.transaction.message.instructions) || [];
  const inner = [];
  ((tx.meta && tx.meta.innerInstructions) || []).forEach(function (g) {
    (g.instructions || []).forEach(function (ix) { inner.push(ix); });
  });
  return outer.concat(inner);
}

function legacyClassifySol(tx) {
  const ixs = ixList(tx), programs = [], notes = [];
  let cls = "A";
  if (tx.meta && tx.meta.err) notes.push("transaction FAILED on chain");
  if (tx.blockTime) notes.push("time " + new Date(tx.blockTime * 1000).toISOString());
  ixs.forEach(function (ix) {
    const pid = String(ix.programId || "");
    const name = ALLOW[pid] || "UNKNOWN";
    const label = name === "UNKNOWN" ? pid.slice(0, 8) + "..." : name;
    if (programs.indexOf(label) < 0) programs.push(label);
    if (!ALLOW[pid] && pid.length > 20) { cls = "C"; notes.push("unknown program " + pid); }
    const parsed = ix.parsed || null;
    const typ = parsed && parsed.type ? parsed.type : "";
    const info = (parsed && parsed.info) || {};
    const amt = info.amount || (info.tokenAmount && info.tokenAmount.amount);
    if (typ === "approve" || typ === "approveChecked") {
      if (String(amt) === MAX) { if (cls !== "C") cls = "B"; notes.push("UNLIMITED approve -> " + (info.delegate || "?")); }
      else notes.push("finite approve " + amt + " -> " + (info.delegate || "?"));
    }
    if (typ === "revoke") notes.push("revoke (good)");
    if (typ === "setAuthority") { cls = "C"; notes.push("SetAuthority -> " + (info.newAuthority || "?")); }
    if (typ === "closeAccount") { if (cls === "A") cls = "B"; notes.push("closeAccount -> " + (info.destination || "?")); }
    if (typ === "transfer" || typ === "transferChecked") notes.push("transfer " + (amt || info.lamports || "?") + " -> " + (info.destination || "?"));
  });
  if (!ixs.length) { cls = "C"; notes.push("no instructions"); }
  notes.unshift("programs " + programs.join(", "));
  return { cls: cls, notes: notes, programs: programs };
}

const root = path.join(__dirname, "..");
const fixDir = path.join(root, "fixtures", "solana");
const files = fs.readdirSync(fixDir).filter((f) => f.endsWith(".json")).sort();

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(fixDir, name), "utf8"));
}

test("six real mainnet fixtures, each listed with a Solscan link", () => {
  assert.deepEqual(files, [
    "approve.json",
    "close-account.json",
    "failed.json",
    "jupiter-swap.json",
    "set-authority.json",
    "transfer.json"
  ]);
  const readme = fs.readFileSync(path.join(fixDir, "README.md"), "utf8");
  for (const file of files) {
    const tx = load(file);
    const sig = tx.transaction.signatures[0];
    assert.equal(typeof sig, "string");
    assert.ok(sig.length >= 64, file);
    assert.ok(readme.includes(sig), file + " signature missing from README");
    assert.ok(readme.includes("https://solscan.io/tx/" + sig), file + " Solscan link missing");
  }
});

for (const file of files) {
  test("parity " + file, () => {
    const tx = load(file);
    const old = legacyClassifySol(tx);
    const got = IrisSol.decodeSolanaTx(tx);
    assert.equal(got.cls, old.cls);
    assert.deepEqual(got.programs, old.programs);
    assert.deepEqual(got.findings, old.notes);
    assert.equal(got.findings[0], "programs " + got.programs.join(", "));
    assert.ok(got.findings.indexOf("time " + new Date(tx.blockTime * 1000).toISOString()) > 0);
  });
}

test("transfer fixture is a simple SOL transfer, not a compound trade", () => {
  const tx = load("transfer.json");
  const ixs = ixList(tx);
  assert.ok(ixs.length >= 1);
  const moves = ixs.filter((ix) => ix.programId !== COMPUTE);
  assert.equal(moves.length, 1);
  assert.equal(moves[0].programId, "11111111111111111111111111111111");
  assert.equal(moves[0].parsed.type, "transfer");
  assert.equal(moves[0].parsed.info.lamports, 100000000);
  const got = IrisSol.decodeSolanaTx(tx);
  assert.equal(got.cls, "A");
  assert.deepEqual(got.programs, ["System"]);
  assert.equal(got.findings.some((n) => n.indexOf("unknown program ") === 0), false);
  assert.equal(got.findings.some((n) => n.indexOf("UNLIMITED approve") === 0), false);
  assert.equal(got.findings.some((n) => n.indexOf("transfer 100000000 -> ") === 0), true);
});

test("the other fixtures hit the remaining note paths", () => {
  const close = IrisSol.decodeSolanaTx(load("close-account.json"));
  assert.equal(close.cls, "B");
  assert.equal(close.findings.some((n) => n.indexOf("closeAccount -> ") === 0), true);

  const auth = IrisSol.decodeSolanaTx(load("set-authority.json"));
  assert.equal(auth.cls, "C");
  assert.equal(auth.findings.filter((n) => n.indexOf("SetAuthority -> ") === 0).length, 3);
  assert.equal(auth.findings.some((n) => n.indexOf("unknown program ") === 0), false);

  const approve = IrisSol.decodeSolanaTx(load("approve.json"));
  assert.equal(approve.cls, "C");
  assert.equal(approve.findings.some((n) => n.indexOf("UNLIMITED approve -> ") === 0), true);

  const failed = IrisSol.decodeSolanaTx(load("failed.json"));
  assert.equal(failed.cls, "C");
  assert.equal(failed.findings.indexOf("transaction FAILED on chain") > 0, true);
  assert.equal(failed.findings.some((n) => n.indexOf("unknown program ") === 0), true);
});

test("app.js shows decoder findings as the chain-read notes", () => {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.match(app, /function classifySol\(tx\)\{\s*var d=IrisSol\.decodeSolanaTx\(tx\);\s*return \{cls:d\.cls, notes:d\.findings, changes:d\.changes\|\|\[\]\};\s*\}/);
  assert.equal(app.includes("function ixList"), false);
  assert.equal(app.includes("18446744073709551615"), false);
});

test("index.html loads sol-decode.js before app.js and leaves CSP alone", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const sol = html.indexOf('<script src="sol-decode.js"></script>');
  const app = html.indexOf('<script src="app.js"></script>');
  assert.ok(sol > -1 && app > sol);
  assert.equal((html.match(/Content-Security-Policy/g) || []).length, 1);
  assert.ok(html.includes("script-src 'self'"));
  assert.equal(html.includes("script-src 'self' 'unsafe-inline'"), false);
  assert.equal(html.includes("unsafe-eval"), false);
});

test("service worker cache names the decoder and includes the file", () => {
  const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
  assert.match(sw, /var VERSION="2026-09-26-sol-safe-v1";/);
  assert.match(sw, /"sol-decode\.js"/);
});

test("live getTransaction asks for maxSupportedTransactionVersion 1", () => {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.match(app, /maxSupportedTransactionVersion:\s*1/);
  assert.equal(app.includes("maxSupportedTransactionVersion:0"), false);
});

test("version-1 fixtures decode (approve + failed)", () => {
  const approve = load("approve.json");
  const failed = load("failed.json");
  assert.equal(approve.version, 1);
  assert.equal(failed.version, 1);
  const a = IrisSol.decodeSolanaTx(approve);
  const f = IrisSol.decodeSolanaTx(failed);
  assert.equal(a.cls, "C");
  assert.equal(a.findings.some((n) => n.indexOf("UNLIMITED approve -> ") === 0), true);
  assert.ok(a.changes.length > 0);
  assert.equal(f.cls, "C");
  assert.equal(f.findings.indexOf("transaction FAILED on chain") > 0, true);
  assert.ok(f.changes.length > 0);
});

test("package.json test script has no dependencies", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.equal(pkg.scripts.test, "node --test tests/*.test.js");
  assert.equal(pkg.dependencies, undefined);
  assert.equal(pkg.devDependencies, undefined);
});
