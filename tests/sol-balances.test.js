const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const IrisSol = require("../sol-decode.js");

const root = path.join(__dirname, "..");
const fixDir = path.join(root, "fixtures", "solana");
const files = fs.readdirSync(fixDir).filter((f) => f.endsWith(".json")).sort();

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(fixDir, name), "utf8"));
}

const WSOL = "So11111111111111111111111111111111111111112";

/* Exact expected changes, read off the fixtures by hand.
   Strings, not floats: every digit must match. */
const EXPECT = {
  "transfer.json": [
    { account: "7K6xTeFHR76kgf1ysekuSfnYntGiYVqK2gCT64WepgeQ", owner: null, mint: null, before: "0.100005", after: "0", delta: "-0.100005", note: "fee payer; delta includes the 0.000005 SOL fee" },
    { account: "FNgt9yZAWrorzhgdVWYyJBeSGknR4Xbja5k5B9RtXdq5", owner: null, mint: null, before: "0", after: "0.1", delta: "0.1" }
  ],
  "close-account.json": [
    { account: "7zYJad2TFBYvtNxvypBJ6CobC1kvFzMTcrcfd1k35urL", owner: null, mint: null, before: "0.009987775", after: "0.011468215", delta: "0.00148044", note: "fee payer; delta includes the 0.000008 SOL fee" },
    { account: "4feXmJ3MJGnwfiVd8iSnoYJSqDEDfq8b9dzB8thrKRZ5", owner: null, mint: null, before: "0.00148844", after: "0", delta: "-0.00148844" }
  ],
  "failed.json": [
    { account: "BuekUk3YMmm7Agnb4ni1qMCmShVpeBTdQZYNyihyzr7u", owner: null, mint: null, before: "146.543762755", after: "146.543754539", delta: "-0.000008216", note: "fee payer; delta includes the 0.000008216 SOL fee" }
  ],
  "set-authority.json": [
    { account: "3x78i6FyFphzU6R45fCocrtRF6f2i3PsLSVqdbWddoc6", owner: null, mint: null, before: "108.511795966", after: "108.505228792", delta: "-0.006567174", note: "fee payer; delta includes the 0.000243334 SOL fee" },
    { account: "4cXVqX7sP67iHFeafGHVbxzkVmEojizqDiBBeV2GzG5s", owner: null, mint: null, before: "0", after: "0.00329616", delta: "0.00329616" },
    { account: "A5fxfzpBPwJAAioMEKm7YULhBYQc3wmRcRzZZfYWjnf", owner: null, mint: null, before: "0", after: "0.00151384", delta: "0.00151384" },
    { account: "4ZrhgXceDyMcVexZsMRzjSM55J3uyftBekiraCZ3swTZ", owner: null, mint: null, before: "0", after: "0.00151384", delta: "0.00151384" },
    { account: "A5fxfzpBPwJAAioMEKm7YULhBYQc3wmRcRzZZfYWjnf", owner: "3x78i6FyFphzU6R45fCocrtRF6f2i3PsLSVqdbWddoc6", mint: "4cXVqX7sP67iHFeafGHVbxzkVmEojizqDiBBeV2GzG5s", before: "0", after: "1000000000", delta: "1000000000" },
    { account: "4ZrhgXceDyMcVexZsMRzjSM55J3uyftBekiraCZ3swTZ", owner: "Aa8oCaj5BFY5jFSCCNGkFQXcbQYvy2WbeKH73m7ABcsn", mint: "4cXVqX7sP67iHFeafGHVbxzkVmEojizqDiBBeV2GzG5s", before: "0", after: "1", delta: "1" }
  ],
  "approve.json": [
    { account: "ETfGuL6yPaixVBEfor4DgsYbgL8JqmrFPopk9Ye1xmDV", owner: null, mint: null, before: "0.019893352", after: "0.021302955", delta: "0.001409603", note: "fee payer; delta includes the 0.000078837 SOL fee" },
    { account: "6fWEibYLBv9ETW3vNJQPqfpVmyMJZ8UHkH4niVZFiKcQ", owner: null, mint: null, before: "18.20228713", after: "17.945942767", delta: "-0.256344363" },
    { account: "5aBz3e9Q6kmnCyeRCZBXZ2dyTKNJmnC9fRFtGiAuJcrT", owner: null, mint: null, before: "4.73325928", after: "4.986626763", delta: "0.253367483" },
    { account: "EyYbG9tr8irQEDPTnwGwEP6Ho1cati9JMFHbrz81kUy3", owner: null, mint: null, before: "0", after: "0.00148844", delta: "0.00148844" },
    { account: "5aBz3e9Q6kmnCyeRCZBXZ2dyTKNJmnC9fRFtGiAuJcrT", owner: "FhVo3mqL8PW5pH5U2CN4XE33DokiyZnUwuGpH2hmHLuM", mint: WSOL, before: "4.73177084", after: "4.985138323", delta: "0.253367483" },
    { account: "HiwWfPy2tq2PKheDUJk6wYvyHvV3PFiWahHnGUZ46XhM", owner: "FhVo3mqL8PW5pH5U2CN4XE33DokiyZnUwuGpH2hmHLuM", mint: "QG8yYr2K6g3HHpHy23SkQXPY6URtuBk3cQczNg1Bu4T", before: "803085692.871922", after: "795668508.246561", delta: "-7417184.625361" },
    { account: "EyYbG9tr8irQEDPTnwGwEP6Ho1cati9JMFHbrz81kUy3", owner: "ETfGuL6yPaixVBEfor4DgsYbgL8JqmrFPopk9Ye1xmDV", mint: "QG8yYr2K6g3HHpHy23SkQXPY6URtuBk3cQczNg1Bu4T", before: "0", after: "7417184.625361", delta: "7417184.625361" }
  ],
  "jupiter-swap.json": [
    { account: "6QsXFVQrRcUiSwPKGHbRNUH1w2eQwcCZhW5v74m4Kx22", owner: null, mint: null, before: "0.085430897", after: "0.04542009", delta: "-0.040010807", note: "fee payer; delta includes the 0.000010807 SOL fee" },
    { account: "ADKKyzoY8MUtPAMgjuBkuc9Y3BmZaTueeGkbMo7CVrdg", owner: null, mint: null, before: "0.452228071", after: "0.452308071", delta: "0.00008" },
    { account: "CA7v8gHfbquYXyDnDx6QxWW8hmL1H7X6Y2RYDrGLnuck", owner: null, mint: null, before: "1.671715656", after: "1.671725527", delta: "0.000009871" },
    { account: "X5QPJcpph4mBAJDzc4hRziFftSbcygV59kRb2Fu6Je1", owner: null, mint: null, before: "4205.897439668", after: "4205.89744954", delta: "0.000009872" },
    { account: "6DN2J1h9K4s5qDPWcuzSRFsdYg8g78K8EzFnV9EfYLWu", owner: null, mint: null, before: "6.380847931", after: "6.38118356", delta: "0.000335629" },
    { account: "7V62E8PsSxWz2gEkPQs5tM374njvwy2CcbjKYif6igEF", owner: null, mint: null, before: "254.386137372", after: "254.425702", delta: "0.039564628" },
    { account: "4Ps2hUNBDxUoKMmGTeWbktk6dTktGDiqHZjXyzoCzfDw", owner: "6QsXFVQrRcUiSwPKGHbRNUH1w2eQwcCZhW5v74m4Kx22", mint: "5NhN6zzDkzwXFGPFqtpTopV4ttBeZ6CWy1oRL9Rkpump", before: "36561.423881", after: "50452.221499", delta: "13890.797618" },
    { account: "ADKKyzoY8MUtPAMgjuBkuc9Y3BmZaTueeGkbMo7CVrdg", owner: "6Gfahmxqn1VfJE1rZ3JsDZdztUKMc4F8bjR9pfu1XhWZ", mint: WSOL, before: "0.450739631", after: "0.450819631", delta: "0.00008" },
    { account: "CA7v8gHfbquYXyDnDx6QxWW8hmL1H7X6Y2RYDrGLnuck", owner: "EHAAiTxcdDwQ3U4bU6YcMsQGaekdzLS3B5SmYo46kJtL", mint: WSOL, before: "1.669676376", after: "1.669686247", delta: "0.000009871" },
    { account: "X5QPJcpph4mBAJDzc4hRziFftSbcygV59kRb2Fu6Je1", owner: "7hTckgnGnLQR6sdH7YkqFTAA7VwTfYFaZ6EhEsU3saCX", mint: WSOL, before: "4205.895584098", after: "4205.89559397", delta: "0.000009872" },
    { account: "6DN2J1h9K4s5qDPWcuzSRFsdYg8g78K8EzFnV9EfYLWu", owner: "J8KjzksG64hB6v5WWfz5Ux1MsmFyhte4NoX9AVa5Xe5u", mint: WSOL, before: "6.379359491", after: "6.37969512", delta: "0.000335629" },
    { account: "7V62E8PsSxWz2gEkPQs5tM374njvwy2CcbjKYif6igEF", owner: "3yXXas5wQqC6LzV9x22GEqVr9Dgg1VC6yynkVGhRWJWM", mint: WSOL, before: "254.384648932", after: "254.42421356", delta: "0.039564628" },
    { account: "CMWxvodadDcLG8gd7ZpNjDfNhazFU1UDED9D8PaZWic1", owner: "3yXXas5wQqC6LzV9x22GEqVr9Dgg1VC6yynkVGhRWJWM", mint: "5NhN6zzDkzwXFGPFqtpTopV4ttBeZ6CWy1oRL9Rkpump", before: "95690877.326182", after: "95676986.528564", delta: "-13890.797618" }
  ]
};

test("every fixture has an exact expectation", () => {
  assert.deepEqual(Object.keys(EXPECT).sort(), files);
});

for (const file of files) {
  test("exact balance changes " + file, () => {
    const tx = load(file);
    const got = IrisSol.balanceChanges(tx);
    assert.deepEqual(got, EXPECT[file]);
    assert.deepEqual(IrisSol.decodeSolanaTx(tx).changes, got);
  });

  test("SOL deltas sum to minus the fee " + file, () => {
    /* Conservation, computed straight from the fixture in lamports:
       what every account lost or gained nets to exactly the fee. */
    const tx = load(file);
    const pre = tx.meta.preBalances, post = tx.meta.postBalances;
    let sum = 0n;
    for (let i = 0; i < pre.length; i++) sum += BigInt(post[i]) - BigInt(pre[i]);
    assert.equal(sum, -BigInt(tx.meta.fee));

    const sol = IrisSol.balanceChanges(tx).filter((c) => c.mint === null);
    let fromModule = 0n;
    for (const c of sol) fromModule += lamports(c.delta);
    assert.equal(fromModule, sum);
    assert.equal(sol[0].account, tx.transaction.message.accountKeys[0].pubkey);
    assert.equal(sol[0].note, "fee payer; delta includes the " + units(BigInt(tx.meta.fee), 9) + " SOL fee");
    for (const c of sol.slice(1)) assert.equal(c.note, undefined);
  });
}

function lamports(dec) {
  const neg = dec.startsWith("-");
  const [i, f = ""] = dec.replace(/^-/, "").split(".");
  const v = BigInt(i + f.padEnd(9, "0"));
  return neg ? -v : v;
}
function units(v, d) {
  let s = v.toString().padStart(d + 1, "0");
  return (s.slice(0, -d) + "." + s.slice(-d)).replace(/\.?0+$/, "");
}

test("transfer: −0.1 SOL and the fee leave the sender, +0.1 SOL reaches the receiver", () => {
  const tx = load("transfer.json");
  const got = IrisSol.balanceChanges(tx);
  assert.equal(got.length, 2);
  const [from, to] = got;
  assert.equal(from.account, tx.transaction.message.instructions[0].parsed.info.source);
  assert.equal(to.account, tx.transaction.message.instructions[0].parsed.info.destination);
  assert.equal(tx.meta.fee, 5000);
  assert.equal(from.delta, "-0.100005");
  assert.equal(lamports(from.delta), -100000000n - 5000n);
  assert.equal(to.delta, "0.1");
  assert.equal(lamports(to.delta), 100000000n);
  assert.equal(from.note, "fee payer; delta includes the 0.000005 SOL fee");
  assert.equal(to.note, undefined);
  /* the System program key sits at index 2 with 1 lamport both sides: skipped */
  assert.equal(got.some((c) => c.account === "11111111111111111111111111111111"), false);
});

test("jupiter swap: 0.04 SOL out plus fee, 13890.797618 of the mint in, for the same wallet", () => {
  const tx = load("jupiter-swap.json");
  const payer = tx.transaction.message.accountKeys[0].pubkey;
  const got = IrisSol.balanceChanges(tx);
  const sol = got.find((c) => c.mint === null && c.account === payer);
  assert.equal(sol.delta, "-0.040010807");
  assert.equal(lamports(sol.delta), -40000000n - BigInt(tx.meta.fee));
  const tok = got.filter((c) => c.mint && c.owner === payer);
  assert.equal(tok.length, 1);
  assert.equal(tok[0].mint, "5NhN6zzDkzwXFGPFqtpTopV4ttBeZ6CWy1oRL9Rkpump");
  assert.equal(tok[0].delta, "13890.797618");
  assert.equal(tok[0].before, "36561.423881");
  assert.equal(tok[0].after, "50452.221499");
  /* the pool gave up exactly what the wallet received */
  const pool = got.find((c) => c.mint === tok[0].mint && c.owner !== payer);
  assert.equal(pool.delta, "-13890.797618");
  /* wrapped SOL shows up as a token with 9 decimals and matches the SOL move on the same account */
  const wsol = got.filter((c) => c.mint === WSOL);
  assert.equal(wsol.length, 5);
  for (const w of wsol) {
    const same = got.find((c) => c.mint === null && c.account === w.account);
    assert.equal(same.delta, w.delta);
  }
  assert.equal(tx.version, 0);
  assert.ok(tx.transaction.message.accountKeys.some((k) => k.source === "lookupTable"));
  assert.equal(tx.transaction.message.instructions.some((ix) => ix.programId === "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"), true);
});

test("token matching is by accountIndex + mint, with new and closed accounts", () => {
  const tx = {
    transaction: { message: { accountKeys: [{ pubkey: "PAYER" }, { pubkey: "TOKA" }, { pubkey: "TOKB" }, { pubkey: "TOKC" }] } },
    meta: {
      fee: 5000,
      preBalances: [1000000, 0, 2039280, 2039280],
      postBalances: [995000, 0, 2039280, 2039280],
      preTokenBalances: [
        { accountIndex: 2, mint: "MINTX", owner: "OWN2", uiTokenAmount: { amount: "500", decimals: 2 } },
        { accountIndex: 3, mint: "MINTX", owner: "OWN3", uiTokenAmount: { amount: "7", decimals: 2 } },
        { accountIndex: 3, mint: "MINTY", owner: "OWN3", uiTokenAmount: { amount: "1", decimals: 0 } }
      ],
      postTokenBalances: [
        { accountIndex: 1, mint: "MINTX", owner: "OWN1", uiTokenAmount: { amount: "500", decimals: 2 } },
        { accountIndex: 3, mint: "MINTX", owner: "OWN3", uiTokenAmount: { amount: "7", decimals: 2 } },
        { accountIndex: 3, mint: "MINTY", owner: "OWN3", uiTokenAmount: { amount: "3", decimals: 0 } }
      ]
    }
  };
  assert.deepEqual(IrisSol.balanceChanges(tx), [
    { account: "PAYER", owner: null, mint: null, before: "0.001", after: "0.000995", delta: "-0.000005", note: "fee payer; delta includes the 0.000005 SOL fee" },
    { account: "TOKB", owner: "OWN2", mint: "MINTX", before: "5", after: "0", delta: "-5" },
    { account: "TOKC", owner: "OWN3", mint: "MINTY", before: "1", after: "3", delta: "2" },
    { account: "TOKA", owner: "OWN1", mint: "MINTX", before: "0", after: "5", delta: "5" }
  ]);
});

test("amounts stay exact past 2^53 and with many decimals", () => {
  const tx = {
    transaction: { message: { accountKeys: ["A", "B"] } },
    meta: {
      fee: 1,
      preBalances: ["9007199254740993", 0],
      postBalances: ["9007199254740992", 0],
      preTokenBalances: [{ accountIndex: 1, mint: "M", owner: "O", uiTokenAmount: { amount: "123456789012345678901234567890", decimals: 18 } }],
      postTokenBalances: [{ accountIndex: 1, mint: "M", owner: "O", uiTokenAmount: { amount: "123456789012345678901234567891", decimals: 18 } }]
    }
  };
  assert.deepEqual(IrisSol.balanceChanges(tx), [
    { account: "A", owner: null, mint: null, before: "9007199.254740993", after: "9007199.254740992", delta: "-0.000000001", note: "fee payer; delta includes the 0.000000001 SOL fee" },
    { account: "B", owner: "O", mint: "M", before: "123456789012.34567890123456789", after: "123456789012.345678901234567891", delta: "0.000000000000000001" }
  ]);
});

test("no meta, no changes", () => {
  assert.deepEqual(IrisSol.balanceChanges({}), []);
  assert.deepEqual(IrisSol.balanceChanges({ transaction: { message: { accountKeys: [] } } }), []);
  assert.deepEqual(IrisSol.balanceChanges({ meta: { fee: 5000, preBalances: [7], postBalances: [7] }, transaction: { message: { accountKeys: [{ pubkey: "X" }] } } }), []);
});

test("formatChange prints one plain line: sign, amount, SOL or mint, short address", () => {
  const changes = IrisSol.balanceChanges(load("transfer.json"));
  assert.deepEqual(changes.map(IrisSol.formatChange), [
    "−0.100005 SOL  7K6x…pgeQ  (fee payer; delta includes the 0.000005 SOL fee)",
    "+0.1 SOL  FNgt…Xdq5"
  ]);
  const swap = IrisSol.balanceChanges(load("jupiter-swap.json")).map(IrisSol.formatChange);
  assert.equal(swap[0], "−0.040010807 SOL  6QsX…Kx22  (fee payer; delta includes the 0.000010807 SOL fee)");
  /* tokens name the owner wallet and the full mint address (symbol comes later) */
  assert.equal(swap[6], "+13890.797618 5NhN6zzDkzwXFGPFqtpTopV4ttBeZ6CWy1oRL9Rkpump  6QsX…Kx22");
  assert.equal(swap[12], "−13890.797618 5NhN6zzDkzwXFGPFqtpTopV4ttBeZ6CWy1oRL9Rkpump  3yXX…WJWM");
});

test("app.js prints the changes as plain lines after the dashed notes", () => {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const notes = app.indexOf('.concat(r.notes.map(function(n){return "- "+n;}))');
  const changes = app.indexOf(".concat(r.changes.map(IrisSol.formatChange))");
  assert.ok(notes > -1 && changes > notes);
  assert.equal(app.includes("preBalances"), false);
  assert.equal(app.includes("BigInt"), false);
});

test("service worker cache bumped for the balances step", () => {
  const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
  assert.match(sw, /var VERSION="2026-09-26-sol-balances";/);
});
