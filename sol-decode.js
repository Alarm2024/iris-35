/* ---------------------------------------------------------------
   IRIS 35 — Solana transaction decoder.
   Pure: no DOM, no network. decodeSolanaTx(tx) returns
   {cls, programs, findings}. findings are the desk notes.
   Program names come from the checked table. The notes under
   that line keep the chain-read order and wording.
   --------------------------------------------------------------- */
var IrisSol=(function(){
/* Checked names. An id is here only when that program's own docs or
   GitHub publish it. Anything else stays UNKNOWN — never a guess. */
var PROGRAMS={
"11111111111111111111111111111111":"System", // https://solana.com/docs/core/programs/builtin-programs
"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA":"SPL Token", // https://www.solana-program.com/docs/token
"TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb":"Token-2022", // https://www.solana-program.com/docs/token-2022
"ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL":"Associated Token", // https://github.com/solana-labs/solana-program-library/blob/master/docs/src/associated-token-account.md
"ComputeBudget111111111111111111111111111111":"Compute Budget", // https://solana.com/docs/core/programs/builtin-programs
"MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr":"Memo", // https://github.com/solana-program/memo/blob/main/clients/js-legacy/src/index.ts
"Stake11111111111111111111111111111111111111":"Stake", // https://solana.com/docs/core/programs/builtin-programs
"Vote111111111111111111111111111111111111111":"Vote", // https://solana.com/docs/core/programs/builtin-programs
"AddressLookupTab1e1111111111111111111111111":"Address Lookup Table", // https://solana.com/docs/core/programs/builtin-programs
"JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4":"Jupiter v6", // https://github.com/jup-ag/instruction-parser/blob/main/README.md
"675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8":"Raydium AMM v4", // https://docs.raydium.io/reference/program-addresses
"CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK":"Raydium CLMM", // https://docs.raydium.io/reference/program-addresses
"CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C":"Raydium CPMM", // https://docs.raydium.io/reference/program-addresses
"whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc":"Orca Whirlpool", // https://github.com/orca-so/whirlpools/blob/main/README.md
"6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P":"Pump.fun" // https://github.com/pump-fun/pump-public-docs/blob/main/docs/PUMP_PROGRAM_README.md
};
var MAX="18446744073709551615";

function ixList(tx){
  var outer=(tx.transaction&&tx.transaction.message&&tx.transaction.message.instructions)||[];
  var inner=[];
  ((tx.meta&&tx.meta.innerInstructions)||[]).forEach(function(g){(g.instructions||[]).forEach(function(ix){inner.push(ix);});});
  return outer.concat(inner);
}

function decodeSolanaTx(tx){
  var ixs=ixList(tx),programs=[],findings=[],cls="A";
  if(tx.meta&&tx.meta.err)findings.push("transaction FAILED on chain");
  if(tx.blockTime)findings.push("time "+new Date(tx.blockTime*1000).toISOString());
  ixs.forEach(function(ix){
    var pid=String(ix.programId||"");
    var name=PROGRAMS[pid];
    var label=name||("UNKNOWN ("+pid.slice(0,8)+"\u2026)");
    if(programs.indexOf(label)<0)programs.push(label);
    if(!name&&pid.length>20){cls="C";findings.push("unknown program "+pid);}
    var parsed=ix.parsed||null;
    var typ=parsed&&parsed.type?parsed.type:"";
    var info=(parsed&&parsed.info)||{};
    var amt=info.amount||(info.tokenAmount&&info.tokenAmount.amount);
    if(typ==="approve"||typ==="approveChecked"){
      if(String(amt)===MAX){if(cls!=="C")cls="B";findings.push("UNLIMITED approve -> "+(info.delegate||"?"));}
      else findings.push("finite approve "+amt+" -> "+(info.delegate||"?"));
    }
    if(typ==="revoke")findings.push("revoke (good)");
    if(typ==="setAuthority"){cls="C";findings.push("SetAuthority -> "+(info.newAuthority||"?"));}
    if(typ==="closeAccount"){if(cls==="A")cls="B";findings.push("closeAccount -> "+(info.destination||"?"));}
    if(typ==="transfer"||typ==="transferChecked")findings.push("transfer "+(amt||info.lamports||"?")+" -> "+(info.destination||"?"));
  });
  if(!ixs.length){cls="C";findings.push("no instructions");}
  findings.unshift("programs "+programs.join(", "));
  return {cls:cls, programs:programs, findings:findings};
}

return {decodeSolanaTx:decodeSolanaTx};
})();

if(typeof module!=="undefined"&&module.exports)module.exports=IrisSol;
if(typeof window!=="undefined")window.IrisSol=IrisSol;
