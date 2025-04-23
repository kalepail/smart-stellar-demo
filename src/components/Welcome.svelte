<script lang="ts">
    import {contractId} from "../store/contractId";
    import {onDestroy , onMount} from "svelte";
    import {keyId} from "../store/keyId";
    import {chat} from "../utils/chat";
    import {account , server} from "../utils/passkey-kit";

    let interval: NodeJS.Timeout;

    let msg: string = "";

    let sending: boolean = false;

    onMount (async () => {

        interval = setInterval (async () => {
        } , 12_000); // 5 times per minute
    });

    onDestroy (() => {
        if (interval) clearInterval (interval);
    });

    async function send () {
        if (!$contractId || !$keyId) return;

        try {
            sending = true;

            let at = await chat.send ({
                                          addr: $contractId ,
                                          msg ,
                                      });

            at = await account.sign (at , {keyId: $keyId});

            await server.send (at);

            msg = "";
        }
        finally {
            sending = false;
        }
    }
</script>

<div class="flex flex-col min-w-full items-center my-10">
    {#if $contractId}
        <div class="max-w-[350px] w-full">

            <form class="flex flex-col mt-5" on:submit|preventDefault={send}>
                <textarea
                        class="border px-3 py-1 mb-2 border-gray-400 rounded-lg"
                        rows="4"
                        name="msg"
                        id="msg"
                        placeholder="Type your message..."
                        bind:value={msg}
                ></textarea>

                <div class="flex items-center ml-auto">
                    <button
                            class="bg-black text-white px-2 py-1 text-sm font-mono disabled:bg-gray-400"
                            type="submit"
                            disabled={sending}>Send{sending ? "ing..." : ""}</button
                    >
                </div>
            </form>
        </div>
    {:else}
        <h1>Login or create a new account</h1>
    {/if}
</div>
