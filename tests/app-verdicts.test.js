const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

/* app.js is DOM code with no module export, so this reads the source.
   A hash the chain does not know (typo, wrong chain) is not a verdict:
   it must render Class X like network errors and BTC not-found, never
   CLASS C - ACT NOW. */
const src = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");

test("not-found lookups render Class X, never Class C", () => {
  const calls = src.match(/show\("[A-Z]",tr\("c_notfound"/g) || [];
  assert.equal(calls.length, 2, "expected the Solana and Ethereum not-found paths");
  for (const c of calls) assert.equal(c, 'show("X",tr("c_notfound"');
});

test("network errors still render Class X", () => {
  assert.ok(src.includes('show("X",chainErr(e))'));
});
