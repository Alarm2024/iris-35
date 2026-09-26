# Solana mainnet fixtures

Real `getTransaction` results (`encoding: jsonParsed`). Public signatures only — no keys, no seeds. Each file is the transaction object the decoder reads.

The **transfer** fixture is one System-program SOL transfer (0.1 SOL, a single instruction). It is not a swap or any other compound trade.

| Fixture | What it is | Signature | Solscan |
| --- | --- | --- | --- |
| `transfer.json` | System transfer, 100000000 lamports, one instruction. Class A. | `qevR6dgHnmxw5HdwbGAyiDYD3zvc1CNjM3rF8ok7smZQ44oT5KCrfTcTrpJCrfAxiazMerQiVFsPTkMrukangYM` | https://solscan.io/tx/qevR6dgHnmxw5HdwbGAyiDYD3zvc1CNjM3rF8ok7smZQ44oT5KCrfTcTrpJCrfAxiazMerQiVFsPTkMrukangYM |
| `close-account.json` | SPL Token `closeAccount` plus a compute-budget instruction. Class B. | `5DzPzQfzxEdBpHcfjYS7EVHXT7i9FdBhd2CT97MRcF49NUp6JrRJDoEsQLBGLa6yeWSynpys3hr6mCgYx7WJcM7s` | https://solscan.io/tx/5DzPzQfzxEdBpHcfjYS7EVHXT7i9FdBhd2CT97MRcF49NUp6JrRJDoEsQLBGLa6yeWSynpys3hr6mCgYx7WJcM7s |
| `set-authority.json` | Token-2022 mint setup. Three `SetAuthority` instructions, known programs only. Class C. | `3gaWG6w1d1BYSoHytV7LaXEzuMiMEA7v8tJZUw7bAsZmgTG2pLBEXuMBX2e6RZxCWVWWGxRaYmQjtCatku4ucv7f` | https://solscan.io/tx/3gaWG6w1d1BYSoHytV7LaXEzuMiMEA7v8tJZUw7bAsZmgTG2pLBEXuMBX2e6RZxCWVWWGxRaYmQjtCatku4ucv7f |
| `approve.json` | Unlimited SPL `approveChecked` (u64 max) to a delegate. The same transaction also moves tokens. Class C. | `4Eahg1sCRqNEAcFc6ThBKiiLQYR6Jv8ixyEmMAS5R8HjUrNzzakAR5CFVjgWmb15cQt9FoxrsLN92byY9vWcs27Z` | https://solscan.io/tx/4Eahg1sCRqNEAcFc6ThBKiiLQYR6Jv8ixyEmMAS5R8HjUrNzzakAR5CFVjgWmb15cQt9FoxrsLN92byY9vWcs27Z |
| `failed.json` | Failed on chain. A system transfer plus one program outside the allowlist. Class C. | `3eJfmkCaPhFJ92RPUdJdwGLsUT2Rf5gXcnN8qa9m5BTFgyHkQmw95ksNjbZgAPYLMC1rdD3LasZc4nbLCcgD4R94` | https://solscan.io/tx/3eJfmkCaPhFJ92RPUdJdwGLsUT2Rf5gXcnN8qa9m5BTFgyHkQmw95ksNjbZgAPYLMC1rdD3LasZc4nbLCcgD4R94 |
