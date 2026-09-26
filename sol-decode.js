/* ---------------------------------------------------------------
   IRIS 35 — Solana transaction decoder.
   Pure: no DOM, no network. decodeSolanaTx(tx) returns
   {cls, programs, findings}. findings are the desk notes,
   same order and wording the chain read used to build.
   --------------------------------------------------------------- */
var IrisSol=(function(){
var ALLOW={
"11111111111111111111111111111111":"System",
"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA":"SPL Token",
"TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb":"Token-2022",
"ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL":"ATA",
"ComputeBudget111111111111111111111111111111":"ComputeBudget",
"MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr":"Memo",
"Stake11111111111111111111111111111111111111":"Stake",
"Vote111111111111111111111111111111111111111":"Vote",
"AddressLookupTab1e1111111111111111111111111":"AddressLookupTable"
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
    var name=ALLOW[pid]||"UNKNOWN";
    var label=name==="UNKNOWN"?pid.slice(0,8)+"...":name;
    if(programs.indexOf(label)<0)programs.push(label);
    if(!ALLOW[pid]&&pid.length>20){cls="C";findings.push("unknown program "+pid);}
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
