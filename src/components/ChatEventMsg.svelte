<script module>

</script>

<script lang="ts">
    import {LocalRpcServer} from "../utils/local-rpc-server.js";
    import type {ChatEvent} from "../utils/chat-event-builder.ts";
    import {StellarToml} from "@stellar/stellar-sdk/no-eventsource";

    let msgs: ChatEvent[] = $state ([]);

    let localRpcServer: LocalRpcServer =
        new LocalRpcServer ();

    console.log (localRpcServer);

    let refreshActive = $state (false);


    async function callGetEvents () {
        refreshActive = true;
        let newFilteredEventsFromChatContract: ChatEvent[] =
            await localRpcServer.getFilteredEventsForContract ("10");

        console.log (newFilteredEventsFromChatContract.length);
        console.log (msgs.length);

        msgs.push (... newFilteredEventsFromChatContract);
        refreshActive = false;
    }
</script>

<div class="flex flex-col items-center my-4">
    <div class="flex items-center">

        <button onclick={ callGetEvents }
                class="bg-black text-white px-2 py-1 text-sm font-mono disabled:bg-gray-400"
                type="submit"
                disabled={refreshActive}>Get Messages{refreshActive ? "ing..." : ""}</button>


    </div>
    <div class="flex items-center">
        <ul role="list" class="divide-y divide-gray-100">

            {#each msgs as msg, i}
                <li class="flex gap-x-1 py-4">
                    <div class="flex min-w-1 gap-x-1 backdrop-blur-sm backdrop-grayscale-25 bg-amber-50 border-amber-100 border-1 transform-border backdrop-opacity-30">
                        <div class="min-w-1 flex-auto">
                            <img class="size-10 flex m-2 p-2 justify-center"
                                 src="../../favicon.svg"
                                 alt="">
                            <p class="m-1 p-1 text-xs/2 font-semibold text-gray-300 text-center justify-center">Chat
                                Message Broadcast Demo</p>
                            <p class="m-1 text-sm/6 font-semibold text-gray-900">
                                <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">
                                    ID</span>
                                {msg.id}</p>
                            <p class="m-1 truncate text-xs/4 text-gray-600">
                                <span class="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-yellow-600/20 ring-inset">
                                    Tx Hash</span>
                                {msg.txHash}</p>
                            <p class="m-1 text-xs/3 font-light text-gray-400">
                                <span class="inline-flex items-center rounded-xs bg-purple-100 px-1 py-1 text-xs font-medium text-purple-800 ring-1 ring-yellow-600/20 ring-inset">
                                    Address: </span>
                                {msg.addr}</p>
                            <p class="m-1 text-xs/3 font-light text-gray-400">
                                <span class="inline-flex items-center rounded-xs bg-teal-300 px-1 py-1 text-xs font-medium text-teal-900 ring-1 ring-yellow-600/20 ring-inset">
                                    Timestamp</span>
                                {msg.timestamp}
                            </p>
                            <p class="m-1 p-1 justify-center text-xs/4 text-shadow-yellow-500 text-center">
                                <a href="https://stellar.expert/explorer/testnet/tx/{msg.addr}" target="_blank">
                                    🔗 Stellar Expert Link
                                </a>
                            </p>

                        </div>
                    </div>
                </li>
            {/each}
        </ul>
    </div>
</div>

<style>
    /* styles go here */
</style>
