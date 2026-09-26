/* ---------------------------------------------------------------
   IRIS 35 — Solana transaction decoder.
   Pure: no DOM, no network. decodeSolanaTx(tx) returns
   {cls, programs, findings, changes}. findings are the desk notes,
   same order and wording the chain read used to build. changes is
   balanceChanges(tx): what left and what arrived, per account.
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

/* Exact decimal string from an integer amount in base units.
   BigInt on the string form — never float math. Token amounts
   (uiTokenAmount.amount) arrive as strings and stay exact past 2^53.
   Floats can still enter via meta.preBalances/postBalances: the RPC
   sends those as JSON numbers, so above Number.MAX_SAFE_INTEGER
   (~9,007,199 SOL) they are already rounded before BigInt runs. */
function units(raw,decimals){
  var v=BigInt(String(raw||"0")),neg=v<0n;
  if(neg)v=-v;
  var s=v.toString();
  if(decimals>0){
    while(s.length<=decimals)s="0"+s;
    var i=s.slice(0,s.length-decimals),f=s.slice(s.length-decimals).replace(/0+$/,"");
    s=f?i+"."+f:i;
  }
  return (neg?"-":"")+s;
}

/* Balance changes for every account the transaction touched.
   SOL from meta.preBalances/postBalances against accountKeys,
   tokens from meta.pre/postTokenBalances matched by accountIndex+mint.
   Zero deltas are skipped. before/after/delta are exact decimal
   strings — or "UNKNOWN" when a SOL balance arrived as a JSON number
   outside the safe-integer range (already rounded; never print it).
   The fee payer (accountKeys[0]) pays the fee out of the same SOL
   balance, so its delta includes it; the note says so. */
function balanceChanges(tx){
  var meta=tx&&tx.meta;if(!meta)return [];
  var keys=((tx.transaction&&tx.transaction.message&&tx.transaction.message.accountKeys)||[])
    .map(function(k){return typeof k==="string"?k:String((k&&k.pubkey)||"");});
  var out=[];
  var pre=meta.preBalances||[],post=meta.postBalances||[];
  var n=Math.max(pre.length,post.length);
  for(var i=0;i<n;i++){
    /* JSON numbers only: strings (tests / token path) stay exact via BigInt. */
    if((typeof pre[i]==="number"&&!Number.isSafeInteger(pre[i]))||
       (typeof post[i]==="number"&&!Number.isSafeInteger(post[i]))){
      out.push({account:keys[i]||("#"+i),owner:null,mint:null,before:"UNKNOWN",after:"UNKNOWN",delta:"UNKNOWN",note:"balance too large to read exactly"});
      continue;
    }
    var b=BigInt(String(pre[i]||0)),a=BigInt(String(post[i]||0)),d=a-b;
    if(d===0n)continue;
    var c={account:keys[i]||("#"+i),owner:null,mint:null,before:units(b,9),after:units(a,9),delta:units(d,9)};
    if(i===0&&meta.fee)c.note="fee payer; delta includes the "+units(meta.fee,9)+" SOL fee";
    out.push(c);
  }
  var slots={},order=[];
  function slot(t){
    var k=t.accountIndex+":"+t.mint;
    if(!slots[k]){slots[k]={idx:t.accountIndex,mint:t.mint,owner:t.owner||null,decimals:(t.uiTokenAmount&&t.uiTokenAmount.decimals)|0,pre:"0",post:"0"};order.push(k);}
    else if(!slots[k].owner&&t.owner)slots[k].owner=t.owner;
    return slots[k];
  }
  (meta.preTokenBalances||[]).forEach(function(t){slot(t).pre=(t.uiTokenAmount&&t.uiTokenAmount.amount)||"0";});
  (meta.postTokenBalances||[]).forEach(function(t){slot(t).post=(t.uiTokenAmount&&t.uiTokenAmount.amount)||"0";});
  order.forEach(function(k){
    var s=slots[k],b=BigInt(s.pre),a=BigInt(s.post),d=a-b;
    if(d===0n)return;
    out.push({account:keys[s.idx]||("#"+s.idx),owner:s.owner,mint:s.mint,before:units(b,s.decimals),after:units(a,s.decimals),delta:units(d,s.decimals)});
  });
  return out;
}

function shortAddr(s){s=String(s||"");return s.length>12?s.slice(0,4)+"…"+s.slice(-4):s;}

/* One plain line per change for the desk report:
   "−0.1 SOL  7K6x…pgeQ" or "+25 <mint> 6QsX…Kx22".
   Tokens name the owner (the wallet), not the token account.
   Mint -> symbol is a later step; the mint address stands for now. */
function formatChange(c){
  var sign=c.delta.charAt(0)==="-"?"−":"+";
  var amt=c.delta.replace(/^-/,"");
  var who=shortAddr(c.mint?(c.owner||c.account):c.account);
  var line=sign+amt+" "+(c.mint||"SOL")+"  "+who;
  if(c.note)line+="  ("+c.note+")";
  return line;
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
  return {cls:cls, programs:programs, findings:findings, changes:balanceChanges(tx)};
}

return {decodeSolanaTx:decodeSolanaTx, balanceChanges:balanceChanges, formatChange:formatChange};
})();

if(typeof module!=="undefined"&&module.exports)module.exports=IrisSol;
if(typeof window!=="undefined")window.IrisSol=IrisSol;
