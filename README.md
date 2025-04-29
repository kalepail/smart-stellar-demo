# Stellar Network Demo: Smart Wallets with Game-Changer Dev Tools

This repo demonstrates the basics of getting started building on the [Stellar Network](https://developers.stellar.org/) 
with [smart wallets](https://developers.stellar.org/docs/build/apps/smart-wallets) and transaction workflows powered 
by Stellar dev tools like the **Stellar CLI**, the **Stellar Javascript SDK**, **Passkey Kit** and **Launchtube**. 

With **Astro** and **Svelte** on the front-end

**📚 Highlighted Tools**
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli/install-cli)
    - [Generating Bindings](https://developers.stellar.org/docs/tools/cli/stellar-cli#stellar-contract-bindings)
- [Stellar Javascript SDK](https://developers.stellar.org/docs/tools/sdks/client-sdks#javascript-sdk)
    - [Stellar RPC Server](https://stellar.github.io/js-stellar-sdk/module-rpc.Server.html)
- [Passkey Kit](https://github.com/kalepail/passkey-kit)
- [Launchtube](https://github.com/stellar/launchtube)
- [Zettablock GraphQL](https://docs.zettablock.com/reference/custom-api-call)

**✨ Features**
- **Passkey Kit** for seamless biometric authentication
- **Launchtube** for transaction lifecycle management and paymaster functionality
- GraphQL event data with **Zettablock** 
- [TypeScript bindings generated with the Stellar CLI](https://developers.stellar.org/docs/tools/cli/stellar-cli#stellar-contract-bindings-typescript)

---

### Passkey Kit: Simplifying UX in Web3

[Passkey Kit GitHub Repository](https://github.com/kalepail/passkey-kit)

Self-custody is too complicated for users.

**Passkey Kit** streamlines user experience (UX) in Web3 by leveraging biometric authentication for signing and
fine-grained authorization of Stellar transactions with [Policy Signers](https://github.com/kalepail/passkey-kit/tree/next/contracts/sample-policy). 
Implementing [WebAuthn](https://webauthn. io/) standards, Passkey Kit removes the complexity of Web3 on-boarding.

1. **Passwordless Login**: Streamlined onboarding. No more magic link emails, OTPs, or registration forms
2. **Biometric Signing**: Users can use their device's biometric authentication or password management software
3. **Fine-Grained Authorization**: Configured fine-grained transaction signing credentials with modular access
4. **Seamless UX**: Provide a familar login flow

---

### Launchtube: Managing the Transaction Lifecycle

[Launchtube GitHub Repository](https://github.com/stellar/launchtube)

Launchtube is a super cool service that abstracts away the complexity of submitting transactions.

**Smart Contract Development is Complex:**
- Determining the footprint of an operation
- Different [types of storage durability](https://developers.stellar.org/docs/build/guides/storage/choosing-the-right-storage)
- [TTLs](https://developers.stellar.org/docs/learn/encyclopedia/storage/state-archival#ttl)
- Managing [XDR binary data](https://developers.stellar.org/docs/learn/encyclopedia/data-format/xdr)
- Considering [resource fees](https://developers.stellar.org/docs/networks/resource-limits-fees)
- Transaction building, simulation, assembly and validation

Let Launchtube handle getting your operations on-chain!

1. **Transaction Lifecycle Management**:
    - Transaction Submission
    - Retries
    - Working around rate limits

2. **Paymaster Service**:
    - Subsidizes transaction fees

Launchtube and Passkeys remove technical hurdles for Web3 developers!

---

## 🚀 🛠 PNPM Commands

Run from the root directory of the project:

| Command                    | Action                                       |
|:---------------------------|:---------------------------------------------|
| `pnpm install`             | Installs dependencies                        |
| `pnpm run dev`             | Starts local dev server at `localhost:4321`  |
| `pnpm run build`           | Build your production site to `./dist/`      |
| `pnpm run preview`         | Preview your build locally, before deploying |
| `pnpm run astro ...`       | Run Astro CLI commands like `astro add`      |
| `pnpm run astro -- --help` | Get help using the Astro CLI                 |

---

## Stellar Smart Contract Chat Demo

Example of secure, passkey-powered, chat message broadcasting. 
Message content is persisted in emitted Soroban events upon invocation of the `send()` function

`contracts/chat-demo`

### Build and Deploy your Smart Contract

Getting your local environment setup is the first step

Check out [Getting Started guide here](https://developers.stellar.org/docs/build/smart-contracts/getting-started).

Vist our [Discord server](https://discord.gg/stellardev) for more support

## Deploy and Invoke Contract

Building the contract with the Stellar CLI:
```bash
stellar contract build
```

Deploy contract:
```bash
stellar contract deploy \
    --wasm target/wasm32-unknown-unknown/release/chat_demo.wasm \
    --source alice \
    --network testnet
```

**Get your Contract ID:**
```terminaloutput
🔗 https://stellar.expert/explorer/testnet/contract/CBK6E4G3DCE3OR44ZYMKV36O35LMUIGH7LRV4GIUUMA5UDNWS57MAJN3
✅ Deployed!
CBK6E4G3DCE3OR44ZYMKV36O35LMUIGH7LRV4GIUUMA5UDNWS57MAJN3
```

## Review the `send()` function in the chat-demo contract:

Review line 10 in the contract, `contracts/chat-demo/src/lib.rs`:

**soroban_sdk::address::require_auth**
```rust
addr.require_auth();
```
- Ensures the `Address` has authorized the current invocation(including all the invocation arguments)
- Provided by the Soroban Rust SDK(Specifically the [Soroban Env Common crate](https://docs.rs/crate/soroban-env-common/latest))
- Sensible built-in security

Auth on Stellar is powerful and gives you sensible security measures by default

## Invoking your Smart Contract

Invoke your deployed contract `send()` function using the Stellar CLI:
```bash
stellar contract invoke \
    --id CBUMOJAEAPLQUCWVIM6HJH5XKXW5OP7CRVOOYMJYSTZ6GFDNA72O2QW6 \
    --source alice2 \
    -- \
    send \
    --addr GDCJMCMYNDZ2FV6UMSEYRMUSCX53KCG2AWPBFQ24EA2FFYBCEDMFCBCV \
    --msg new-mesg-test2
```

**Example Diagnostic Event:**
When the `send()` function is invoked, it emits an event onto the Stellar network:

```rust
env.events().publish((addr.clone(),), msg.clone());
```

The Stellar CLI picks this up for you and displays it.
_ℹ️ Why does it look like a cat walked across my Keyboard after hitting the CAPS LOCK key?_

```terminaloutput
contract_event: soroban_cli::log::event: 1: 
AAAAAQAAAAAAAAABaMckBAPXCgrVQzx0n7dV7dc/4o1c7DE4lPPjFG0H9O0AAAABAAAAAAAAAAEAAAASAAAAAAAAAADElgmYaPOi19RkiYiykhX7tQjaBZ4Sw1wgNFLgIiDYUQAAAA4AAAAQdGVzdC1tc2ctdG8tc2VuZA== 
```

This is [XDR](https://developers.stellar.org/docs/data/apis/horizon/api-reference/structure/xdr) 
a binary data format

**Help Decoding XDR:**
- [Stellar Lab](https://lab.stellar.org/xdr/view?$=network$id=testnet&label=Testnet&horizonUrl=https:////horizon-testnet.stellar.org&rpcUrl=https:////testnet.rpciege.com//&passphrase=Test%20SDF%20Network%20/;%20September%202015;)
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli/stellar-cli#stellar-xdr-decode)
- [rs-stellar-xdr](https://github.com/stellar/rs-stellar-xdr)

**XDR Decoded into JSON format:**
```json
{
  "in_successful_contract_call": true,
  "event": {
    "ext": "v0",
    "contract_id": "68c7240403d70a0ad5433c749fb755edd73fe28d5cec313894f3e3146d07f4ed",
    "type_": "contract",
    "body": {
      "v0": {
        "topics": [
          {
            "address": "GDCJMCMYNDZ2FV6UMSEYRMUSCX53KCG2AWPBFQ24EA2FFYBCEDMFCBCV"
          }
        ],
        "data": {
          "string": "test-msg-to-send"
        }
      }
    }
  }
}
```

## Polling for Events

Make a Remote Procedure Call(RPC) with:
- [Stellar CLI](https://github.com/stellar/stellar-cli)
- An HTTP request (Axios or cURL)
- Using the [Javascript SDK](https://stellar.github.io/js-stellar-sdk/)
- Or using [Stellar Lab](https://lab.stellar.org/)

**Poll for events using a `cursor` parameter with the Stellar CLI:**
```bash
stellar events \
	--network testnet \
    --cursor 0002533961985163263-4294967295 \
    --id CBUMOJAEAPLQUCWVIM6HJH5XKXW5OP7CRVOOYMJYSTZ6GFDNA72O2QW6 \
    --output pretty
```

**Using a `start-ledger` parameter:**
```bash
stellar events \
	--network testnet \
    --start-ledger 589386 \
    --id CBUMOJAEAPLQUCWVIM6HJH5XKXW5OP7CRVOOYMJYSTZ6GFDNA72O2QW6 \
    --output pretty
```

**HTTP `cURL` making a `getEvents` RPC call on testnet:**
```http request
curl 'https://testnet.rpciege.com/' \
  -H 'accept: */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H 'content-type: application/json' \
  -H 'origin: https://lab.stellar.org' \
  --data-raw '{"jsonrpc":"2.0","id":8675309,"method":"getEvents","params":{"xdrFormat":"base64","startLedger":589386,"pagination":{"limit":10},"filters":[{"type":"contract","contractIds":["CBUMOJAEAPLQUCWVIM6HJH5XKXW5OP7CRVOOYMJYSTZ6GFDNA72O2QW6"],"topics":[]}]}}'
```
[Stellar lab getEvents request](https://lab.stellar.org/endpoints/rpc/get-events?$=network$id=testnet&label=Testnet&horizonUrl=https:////horizon-testnet.stellar.org&rpcUrl=https:////testnet.rpciege.com//&passphrase=Test%20SDF%20Network%20/;%20September%202015;&endpoints$params$startLedger=589386&limit=10&filters=%7B%22type%22:%22contract%22,%22contract_ids%22:%5B%22CBUMOJAEAPLQUCWVIM6HJH5XKXW5OP7CRVOOYMJYSTZ6GFDNA72O2QW6%22%5D,%22topics%22:%5B%22%22%5D%7D)

### `getEvents` RPC Response

JSON response for [Get Events RPC Call](https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getEvents):
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

**Topic Field: `ScVal` representing the Address:**
Path:  `result.events.topic`
```terminaloutput
AAAAEgAAAAAAAAAAxJYJmGjzotfUZImIspIV+7UI2gWeEsNcIDRS4CIg2FE=
```

**Decoded Event Topic: `ScVal` JSON representing an Address:**
```json
{
  "address": "GDCJMCMYNDZ2FV6UMSEYRMUSCX53KCG2AWPBFQ24EA2FFYBCEDMFCBCV"
}
```

**XDR Value Field: `ScVal` representing the message payload:**
Path:  `result.events.value`
```terminaloutput
AAAADgAAABB0ZXN0LW1zZy10by1zZW5k
```
**Decoded JSON:**
```json
{
  "string": "test-msg-to-send"
}
```

## RpcServer
Path:  `src/utils/rpc.ts`

`rpc.ts` provides an interface for calling a Stellar RPC server. 
We will use it to retrieve and process emitted contract events.
It uses the [Stellar Javascript SDK](https://stellar.github.io/js-stellar-sdk/)

**Contract Event Retrieval**:
-  Fetches contract events 
- Filters events by contract ID, topic and validates data integrity
- Converts `Api.GetEventsResponse`s into structured `ChatEvent` objects for the front-end

### Configuration Options

The `LocalRpcServer` accepts the following configuration parameters in your local `.env` file on initialization:

| Parameter          | Type     | Description                                       | Default                                                   |
|--------------------|----------|---------------------------------------------------|-----------------------------------------------------------|
| `contractIdString` | `string` | The Stellar contract ID to filter events          | Value from `PUBLIC_CHAT_CONTRACT_ID` environment variable |
| `startLedger`      | `number` | The ledger number to start retrieving events from | Value from `PUBLIC_START_LEDGER` environment variable     |

Additionally, the class uses these internal configuration values:

- `_limit`: Maximum number of events to retrieve per request (default: 1,000)
- Environment variables:
    - `PUBLIC_RPC_URL`: The URL of the Stellar RPC server
    - `PUBLIC_NETWORK_PASSPHRASE`: The network passphrase for the target Stellar network
    - `PUBLIC_CHAT_CONTRACT_ID`: The default contract ID to filter events
    - `PUBLIC_START_LEDGER`: The default starting ledger number

## Usage Example

Let's walk through an example watching how data goes from the RpcServer to your UI.

### Front-end

Check out the following file:
`src/components/Welcome.svelte`

This component requests emitted events from a rpc server and the prints out the resulting chat messages 
emitted in the events

```typescript
    async function callGetEvents () {
    refreshActive = true;
    let newFilteredEventsFromChatContract: ChatEvent[] =
        await localRpcServer.getFilteredEventsForContract ("10");

    msgs.push (... newFilteredEventsFromChatContract);
    refreshActive = false;
}
```

We can see that we are calling the `getFilteredEventsForContract()` function on a local rpc server and the result of
that call is an array of ChatEvent objects that is then pushed onto an array.

**Reactive State**

Wrapping the data on the assignment side of a variable declaration with the following state annotation `$state (DATA)`
marks that data as "Reactive State" which means the UI responds to changes in the value of that data. Read more here on
using [$state](https://svelte.dev/docs/svelte/$state)

``` typescript
let msgs: ChatEvent[] = $state ([]);
```

**Updating the UI**

Here's an example of updating the UI in responses to changes in the state.

```sveltehtml

<ul role="list" class="divide-y divide-gray-100">

    {#each msgs as msg, i}
        <li class="flex gap-x-1 py-4">
            {msg.id}
        </li>

    {/each}

</ul>
```

Svelte has a expression language like many front-end frameworks that allows you to define dynamic UI elements such as
this unordered lists that displays bullet points of msg content in repose to messages being pushed on the msgs array.

### Back-end

Check out the following file:
`src/utils/local-rpc-server.ts`

This service exposes a function called `getFilteredEventsForContract` that querys a rpc server with various filters and
parameters and returns the results. In this case, we are looking for events emitted by a deployed smart contract on the
blockchain.

```typescript

async function getFilteredEventsForContract (cursor: string): Promise<ChatEvent[]> {
    let last24HoursOfEventsSequence: number =
        await this.getLast24HourSequence ();

    const eventRequest: RpcServer.GetEventsRequest = {
        filters: this.eventFilters ,
        startLedger: last24HoursOfEventsSequence ,
        limit: this._limit ,
    };

    return await this.instance
                     .getEvents (eventRequest)
                     .then (this.successfulRequestEventHandler)
                     .catch (this.getOnError);
}
```

Next, let's take a look at the request handler.

```typescript
    function successfulRequestEventHandler (eventResponse: Api.GetEventsResponse): ChatEvent[] {
    const events: Api.EventResponse[] = eventResponse.events;
    if (events.length === 0) return [];

    return events
        .map ((event: Api.EventResponse) => event as Api.EventResponse)
        .filter ((event) => event.type === "contract")
        .filter ((event) => this.contractDataIsDefined (event))
        .filter ((event) => this.deduplicateEventIds (event))
        .map ((event) => this.transformApiResponseToChatEvent (event))
        .sort (this.decendingTimestampSort ());
    }
```

This function takes a response from the rpc server and performs various validations, filtering and transformations to extract the data we need on the front-end!

---

## 👀 Want to learn more?

Feel free to check [our documentation](https://developers.stellar.org/) or jump into
our [Discord server](https://discord.gg/stellardev).

Now let's take a look at some of the other code in this repo.

---

#### Addendum: How Auth code in your contract is generated with `require_auth`

If you perform a `Recursive Expansion`on
the `#[contractimpl]` a [Procedural attribute macro](https://doc.rust-lang.org/reference/procedural-macros.html#attribute-macros)) generates the code for you

```rust
	pub fn send(&self, addr: &Address, msg: &String) -> () {
		let old_auth_manager = self.env.in_contract().not().then(|| self.env.host().snapshot_auth_manager().unwrap());
			if let Some(set_auths) = self.set_auths { self.env.set_auths(set_auths); }
			if let Some(mock_auths) = self.mock_auths { self.env.mock_auths(mock_auths); }
			if self.mock_all_auths { if self.allow_non_root_auth { self.env.mock_all_auths_allowing_non_root_auth(); } else { self.env.mock_all_auths(); } }
	}
```
Learn more [require_auth()](https://docs.rs/soroban-sdk/22.0.7/soroban_sdk/struct.Address.html#method.require_auth)

---

**Alternative indexers(Not currently supported):**
- [Subquery](https://subquery.network/)
- [Goldsky](https://goldsky.com/)
- [The Graph](https://thegraph.com/)


