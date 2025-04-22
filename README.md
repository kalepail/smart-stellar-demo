# Stellar Demo:  Smart Wallets

Astro + Svelte demo repo:

**Features:**
* Passkey kit
* Launchtube
* ZettaBlock indexer
* TS bindings


**Alternative indexers:**
* https://subquery.network/
* https://goldsky.com/
* https://thegraph.com/


## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                    | Action                                           |
|:---------------------------|:-------------------------------------------------|
| `pnpm install`             | Installs dependencies                            |
| `pnpm run dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm run build`           | Build your production site to `./dist/`          |
| `pnpm run preview`         | Preview your build locally, before deploying     |
| `pnpm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm run astro -- --help` | Get help using the Astro CLI                     |
                   
## Deploy and Invoke Contract

First, you need to deploy and invoke your contract.  The example contract is a simple
chat smart contract that emits sent messages as events.

Deploy contract:
```
stellar contract deploy \
    --wasm target/wasm32-unknown-unknown/release/chat_demo.wasm \
    --source alice2 \
    --network testnet
```

Invoke `send()` function:

```bash
stellar contract invoke \
    --id CBUMOJAEAPLQUCWVIM6HJH5XKXW5OP7CRVOOYMJYSTZ6GFDNA72O2QW6 \
    --source alice2 \
    -- \
    send \
    --addr GDCJMCMYNDZ2FV6UMSEYRMUSCX53KCG2AWPBFQ24EA2FFYBCEDMFCBCV \
    --msg test-msg-to-send
```

Example diagnostic event:
```rust
contract_event: soroban_cli::log::event: 1: 
AAAAAQAAAAAAAAABaMckBAPXCgrVQzx0n7dV7dc/4o1c7DE4lPPjFG0H9O0AAAABAAAAAAAAAAEAAAASAAAAAAAAAADElgmYaPOi19RkiYiykhX7tQjaBZ4Sw1wgNFLgIiDYUQAAAA4AAAAQdGVzdC1tc2ctdG8tc2VuZA== 
```

JSON event:
```json
{
   "in_successful_contract_call":true,
   "event":{
      "ext":"v0",
      "contract_id":"68c7240403d70a0ad5433c749fb755edd73fe28d5cec313894f3e3146d07f4ed",
      "type_":"contract",
      "body":{
         "v0":{
            "topics":[
               {
                  "address":"GDCJMCMYNDZ2FV6UMSEYRMUSCX53KCG2AWPBFQ24EA2FFYBCEDMFCBCV"
               }
            ],
            "data":{
               "string":"test-msg-to-send"
            }
         }
      }
   }
}
```

## Polling for Events using the CLI, cURL or Stellar Lab

You can query a RPC endpoint with the CLI, a HTTP request, using the Javascript SDK, or using [Stellar Lab]
(https://lab.stellar.org/)

Poll for events using a `cursor` parameter:
```bash
stellar events \
	--network testnet \
    --cursor 0002533961985163263-4294967295 \
    --id CBUMOJAEAPLQUCWVIM6HJH5XKXW5OP7CRVOOYMJYSTZ6GFDNA72O2QW6 \
    --output pretty
```
Or using a `start-ledger` parameter:
```
stellar events \
	--network testnet \
    --start-ledger 589386 \
    --id CBUMOJAEAPLQUCWVIM6HJH5XKXW5OP7CRVOOYMJYSTZ6GFDNA72O2QW6 \
    --output pretty
```

Example `cURL` call for making a `getEvents` RPC call on testnet:
```bash
curl 'https://testnet.rpciege.com/' \
  -H 'accept: */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H 'content-type: application/json' \
  -H 'origin: https://lab.stellar.org' \
  --data-raw '{"jsonrpc":"2.0","id":8675309,"method":"getEvents","params":{"xdrFormat":"base64","startLedger":589386,"pagination":{"limit":10},"filters":[{"type":"contract","contractIds":["CBUMOJAEAPLQUCWVIM6HJH5XKXW5OP7CRVOOYMJYSTZ6GFDNA72O2QW6"],"topics":[]}]}}'
```

Link to [Stellar lab with a prepopulated getEvents request]
(https://lab.stellar.org/endpoints/rpc/get-events?$=network$id=testnet&label=Testnet&horizonUrl=https:////horizon-testnet.stellar.org&rpcUrl=https:////testnet.rpciege.com//&passphrase=Test%20SDF%20Network%20/;%20September%202015;&endpoints$params$startLedger=589386&limit=10&filters=%7B%22type%22:%22contract%22,%22contract_ids%22:%5B%22CBUMOJAEAPLQUCWVIM6HJH5XKXW5OP7CRVOOYMJYSTZ6GFDNA72O2QW6%22%5D,%22topics%22:%5B%22%22%5D%7D;;)

### Example Response from `getEvents` RPC call

Example JSON response for Get Events RPC Call:
```json
{
  "jsonrpc": "2.0",
  "id": 8675309,
  "result": {
	"events": [
	  {
		"type": "contract",
		"ledger": 589387,
		"ledgerClosedAt": "2025-04-22T20:52:41Z",
		"contractId": "CBUMOJAEAPLQUCWVIM6HJH5XKXW5OP7CRVOOYMJYSTZ6GFDNA72O2QW6",
		"id": "0002531397889695744-0000000001",
		"pagingToken": "0002531397889695744-0000000001",
		"inSuccessfulContractCall": true,
		"txHash": "86ad86ba26466e50b764cb7c0dab1082a5e1eec4e1cc82ae2bade7fbeb5d143f",
		"topic": [
		  "AAAAEgAAAAAAAAAAxJYJmGjzotfUZImIspIV+7UI2gWeEsNcIDRS4CIg2FE="
		],
		"value": "AAAADgAAABB0ZXN0LW1zZy10by1zZW5k"
	  }
	],
	"latestLedger": 589890,
	"cursor": "0002533562553204735-4294967295"
  }
}
```

The topic XDR:
```
AAAAEgAAAAAAAAAAxJYJmGjzotfUZImIspIV+7UI2gWeEsNcIDRS4CIg2FE=
```

Is a `ScVal` representing an address:
```
{
  "address": "GDCJMCMYNDZ2FV6UMSEYRMUSCX53KCG2AWPBFQ24EA2FFYBCEDMFCBCV"
}
```

The `value` field is XDR: 
```
AAAADgAAABB0ZXN0LW1zZy10by1zZW5k
```

Is a `ScVal` representing the message payload:
```json
{
"string": "test-msg-to-send"
}
```

## 👀 Want to learn more?

Feel free to check [our documentation](https://developers.stellar.org/) or jump into our [Discord server](https://discord.gg/stellardev).
