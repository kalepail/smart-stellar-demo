# Stellar Network Demo: Smart Wallets with Game-Changer Dev Tools

This demo repo demonstrates the basics of how to get started with building on
the [Stellar Network](https://developers.stellar.org/) smart wallets and transaction workflows powered by Stellar's
innovative tools like the **Stellar CLI**, the **Stellar Javascript SDK**, **Passkey Kit** and **Launchtube**. all
integrated with **Astro** and **Svelte**.
These tools aim to simplify the development of Web3 applications by providing user-friendly features and fine-grained
transaction management.

## ✨ Features

- Integration with **Passkey Kit** for seamless biometric authentication
- **Launchtube** for abstracting transaction lifecycle management and paymaster functionality
- Deployment-ready environment with **ZettaBlock Indexer** and TypeScript bindings generated with the Stellar CLI.
- Alternative indexers(Not currently supported):
    - [Subquery](https://subquery.network/)
    - [Goldsky](https://goldsky.com/)
    - [The Graph](https://thegraph.com/)

---

## 📚 Highlighted Tools

### Passkey Kit: Simplifying UX in Web3

[Passkey Kit GitHub Repository](https://github.com/kalepail/passkey-kit)

Self-custody is just too complicated for the majority of users and is not neccesary for many use-cases. This greatly
impacts adoption and also diminishes security ecosystem wide b/c the demands of operational security are just too high
for most folx.

**Passkey Kit** streamlines user experience (UX) in Web3 by introducing biometric authentication for signing and
fine-grained authorization of Stellar blockchain transactions. Using [WebAuthn](https://webauthn.io/) standards, Passkey
Kit removes the complexity of self-custodied private key management, making it possible for developers to implement:

1. **Passwordless Login**: Enhanced security and streamlined user onboarding. No more magic link emails, OTPs, or
   boilerplate registration forms
2. **Biometric Signing**: Enables users to apply fine-grained authorization policies to the act of signing Stellar
   network transactions or actions using their device's biometric or password management software.
3. **Fine-Grained Authorization**: Users can assign precise permissions to transaction signing credentials, enabling
   modular and controlled access.
4. **Seamless UX**: With Passkey Kit, developers can provide authentication methods familiar to Web2 users, bridging the
   gap between Web2 and Web3.

Passkey Kit ushers in a new era for Stellar applications by combining biometric security with intuitive UX, opening the
doors for mass adoption.

---

### Launchtube: Managing the Transaction Lifecycle

[Launchtube GitHub Repository](https://github.com/stellar/launchtube)

Launchtube is a super cool service provided free-of-charge(currently) by Stellar that abstracts away the complexities of
managing transactions on Stellar. It provides multiple layers of utility.

Blockchain transactions are very nuanced and complex in many cases. Especially when talking about making smart contract
invocations on Stellar. Determining the footprint of an operation, thinking about different types of storage durability
and TTLs, managing the XDR binary data format complexity, polling rpc servers for transaction status, considering
resource fees, managing ledger keys, auth and signers.

Launchtube handles all that for you!

1. **Transaction Lifecycle Management**: Launchtube handles the intricate processes involved in:
    - Transaction building, simulation, assembly, validation, and submission
    - Fee estimation, fee bumps, and even pays the resource fees for your transaction functioning as a Paymaster service
      available as a public good!

   This automation ensures developers can focus on building their application rather than managing the boilerplate of
   Stellar protocol interactions.

2. **Paymaster Service**: One of Launchtube’s standout features is acting as a **paymaster**, simplifying gas fee
   management:
    - Subsidizes transaction fees for users including smart contract invocations
    - Enhances and simplifies developer experience so they can focus on building their products

Launchtube and Passkeys removes technical hurdles for Web3 developers, facilitating a faster path to launch for
Stellar-powered dApps.

---

## 🚀 🛠 Commands to Get Started

All commands are run from the root directory of the project. Here's what you need to know:

| Command                    | Action                                       |
|:---------------------------|:---------------------------------------------|
| `pnpm install`             | Installs dependencies                        |
| `pnpm run dev`             | Starts local dev server at `localhost:4321`  |
| `pnpm run build`           | Build your production site to `./dist/`      |
| `pnpm run preview`         | Preview your build locally, before deploying |
| `pnpm run astro ...`       | Run Astro CLI commands like `astro add`      |
| `pnpm run astro -- --help` | Get help using the Astro CLI                 |

---

## Smart Contract Deployment and Interaction

This demo includes a demo smart contract chat interface that provides a simplified example of secure, passkey-powered,
message broadcasting in the cloud. The contract is super streamlined at the moment, persisting message content in
emitted Soroban events upon invocting the contract's `send` function.
Here’s how to get started:

### Build and Deploy the Smart Contract

Getting your local developer environment setup is the first step. Check out
our [Getting Started guide here](https://developers.stellar.org/docs/build/smart-contracts/getting-started).

Check out our [docs](https://developers.stellar.org/) and jump into
our [Discord server](https://discord.gg/stellardev) for more support.

## Deploy and Invoke Contract

First, you need to deploy and invoke your contract. The example contract is a simple
broadcast-based, verified messaging interface deployed as a smart contract on the Stellar Network that emits sent
messages as contract events.

Building the contract:

```
stellar contract build
```

Deploy contract:

```
stellar contract deploy \
    --wasm target/wasm32-unknown-unknown/release/chat_demo.wasm \
    --source alice \
    --network testnet
```

## Reviewing the `send()` function on the chat-demo contract:

First, let's take a moment to briefly chat about smart contract security.

Spend some time and check out the following line in the contract, `contracts/chat-demo/src/lib.rs` line 10

**internal::Env::require_auth**
This amazing functionality is made possible by the Soroban Rust SDK, specifically
the [Soroban Env Common crate](https://docs.rs/crate/soroban-env-common/latest)

Check out the docs
for [require_auth()](https://docs.rs/soroban-sdk/22.0.7/soroban_sdk/struct.Address.html#method.require_auth) to learn
more!

```
addr.require_auth();
```

This ensures the `Address` has authorized the current invocation including all the invocation arguments. This works
roughly similar to `require_auth_for_args`, but args are inferred from the current invocation.

In this case, since only a single Address needs to authorize the invocation and there are no dynamic arguments that
would need additional consideration, this simple solution works just fine!

Addresses on Stellar are very versatile and can be used as parameter (e.g identify a payment recipient), as a
`DataKey` (e.g. storing the balance), and as the authentication/authorization source.

How can a single function be so powerful? If you really want to go down a rabbit hole, perform a `Recursive Expansion`on
the `#[contractimpl]` (What's called
a [Procedural attribute macro](https://doc.rust-lang.org/reference/procedural-macros.html#attribute-macros))
which basically auto-magically generates a huge amount of boilerplate code for you through insanely clever engineering
🤯.

**TL;DR;**
Basically, you will be able to get fairly sensible default security measures in-place without needing to be a Smart
Contract security formal auditing maestro right out of the gate. But def take time to learn the nuances of smart
contract security. These interfaces are public so security is paramount.

**Very small snippet of some of the auto-magically generated auth code:**
_Just for fun and trivia :)_

```rust
...
	pub fn send(&self, addr: &Address, msg: &String) -> () {
		let old_auth_manager = self.env.in_contract().not().then(|| self.env.host().snapshot_auth_manager().unwrap());
			if let Some(set_auths) = self.set_auths { self.env.set_auths(set_auths); }
			if let Some(mock_auths) = self.mock_auths { self.env.mock_auths(mock_auths); }
			if self.mock_all_auths { if self.allow_non_root_auth { self.env.mock_all_auths_allowing_non_root_auth(); } else { self.env.mock_all_auths(); } }
	}
...
```

## Invoking your Smart Contract

Now let's walk through how to invoke your deployed contract using the Stellar CLI!

```bash
stellar contract invoke \
    --id CBUMOJAEAPLQUCWVIM6HJH5XKXW5OP7CRVOOYMJYSTZ6GFDNA72O2QW6 \
    --source alice2 \
    -- \
    send \
    --addr GDCJMCMYNDZ2FV6UMSEYRMUSCX53KCG2AWPBFQ24EA2FFYBCEDMFCBCV \
    --msg test-msg-to-send
```

**Example diagnostic event:**
When the send function is invoked it emits an event onto the Stellar network with the following statement:

```
env.events().publish((addr.clone(),), msg.clone());
```

The Stellar CLI is super smart so it automagically picks this up for you and displays it.
_ℹ️ Why does it look like a cat walked across my Keyboard after hitting the CAPS LOCK key?_

```rust
contract_event: soroban_cli::log::event: 1: 
AAAAAQAAAAAAAAABaMckBAPXCgrVQzx0n7dV7dc/4o1c7DE4lPPjFG0H9O0AAAABAAAAAAAAAAEAAAASAAAAAAAAAADElgmYaPOi19RkiYiykhX7tQjaBZ4Sw1wgNFLgIiDYUQAAAA4AAAAQdGVzdC1tc2ctdG8tc2VuZA== 
```

This is [XDR](https://developers.stellar.org/docs/data/apis/horizon/api-reference/structure/xdr), the specially binary
format used for externally representing data from the Stellar Network.

It's very compact and great for machines to read, but not-so-great for human-readability. Check
out [Stellar Lab](https://lab.stellar.org/xdr/view?$=network$id=testnet&label=Testnet&horizonUrl=https:////horizon-testnet.stellar.org&rpcUrl=https:////testnet.rpciege.com//&passphrase=Test%20SDF%20Network%20/;%20September%202015;)
for help decoding XDR or the Stellar CLI to [decode XDR
](https://developers.stellar.org/docs/tools/cli/stellar-cli#stellar-xdr-decode)

You can also check out [rs-stellar-xdr](https://github.com/stellar/rs-stellar-xdr) for more robust XDR functionality.

**Decoding XDR into JSON:**
_Decoded XDR is much easier to read 😅_

Here's an example of the diagnostic event emitted by the contract after we invoked it in much more readable JSON format:

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

## Polling for Events using the CLI, cURL, or Stellar Lab

You can query an RPC endpoint with the Stellar CLI, a HTTP request(Axios or cURL), using the Javascript SDK, or using [Stellar Lab]
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

**Topic Field: `ScVal` representing the Address:**
Path:  `result.events.topic`

The topic XDR:

```
AAAAEgAAAAAAAAAAxJYJmGjzotfUZImIspIV+7UI2gWeEsNcIDRS4CIg2FE=
```

A `ScVal` type in JSON format representing an Address:

```json
{
  "address": "GDCJMCMYNDZ2FV6UMSEYRMUSCX53KCG2AWPBFQ24EA2FFYBCEDMFCBCV"
}
```

**Value Field: `ScVal` representing the message payload:**
Path:  `result.events.value`

Here is an example of the XDR that represents the `value` field:

```
AAAADgAAABB0ZXN0LW1zZy10by1zZW5k
```

Here is a JSON representation of that XDR:

```json
{
  "string": "test-msg-to-send"
}
```

## 👀 Want to learn more?

Feel free to check [our documentation](https://developers.stellar.org/) or jump into
our [Discord server](https://discord.gg/stellardev).

Now let's take a look at some of the other code in this repo.

## LocalRpcServer

Path:  `src/utils/local-rpc-server.ts`

The `LocalRpcServer` class provides a robust interface for interacting with Stellar's RPC server to retrieve and process contract events from the Soroban blockchain. It handles the complexities of RPC communication, event filtering, data validation, and transformation.

### Functionality

- **Contract Event Retrieval**: Fetches contract events from the Stellar network using using a RpcServer built with
  the [Stellar Javascript SDK](https://stellar.github.io/js-stellar-sdk/)
- **Event Filtering**: Filters events by contract ID, topic and validates data integrity
- **Event Transformation**: Converts raw `Api.GetEventsResponse` responses into structured `ChatEvent` objects using a builder pattern with built-in validation and error-handling via
  the [chat-event-builder.ts](src/utils/chat-event-builder.ts) class.
- **Deduplication**: Ensures each event is processed only once through in-memory ID uniqueness

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

### How It Works

1. **Initialization**: The server is initialized with configuration options from your `.env` file
2. **RPC Communication**: Interacts with the Stellar network through the `@stellar/stellar-sdk`
3. **Event Processing Pipeline**:
    - Retrieves events using the RpcServer `getEvents` rpc call with appropriate filters
    - Validates that all required event data is present
    - Filters out duplicates using the in-memory id tracking
    - Transforms validated events into structured `ChatEvent` objects using the `ChatEventBuilder` class
    - Returns an array of processed events

### Usage Example

```

```
