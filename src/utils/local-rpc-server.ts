import {Api , Server as RpcServer} from "@stellar/stellar-sdk/minimal/rpc";
import {type ChatEvent , ChatEventBuilder} from "./chat-event-builder.ts";

/**
 * `LocalRpcServer` provides an interface for interacting with the Stellar `RpcServer`
 * to retrieve and process contract events.
 *
 * The server is initialized with the deployed address of the contract and the ledger
 * number in which the contract was deployed.
 */
export class LocalRpcServer {
    /**
     * Gets the contract ID associated with this RPC server instance.
     *
     * @returns The contract ID string used for filtering events.
     */
    public get contractId (): string {
        return this._contractId;
    }

    private readonly instance: RpcServer;
    private readonly _contractId: string;
    private readonly eventFilters: Api.EventFilter[];
    private processedEventIds = new Set<string> ();

    private readonly _limit: number = 1_000;
    private readonly _startLedger: number = 589387;

    constructor (contractIdString?: string , startLedger?: number) {
        //@ts-ignore
        this.instance = new RpcServer (import.meta.env.PUBLIC_RPC_URL , import.meta.env.PUBLIC_NETWORK_PASSPHRASE);
        this._contractId = import.meta.env.PUBLIC_CHAT_CONTRACT_ID;
        this.eventFilters = [
            {
                type: "contract" ,
                contractIds: [this._contractId] ,
            } ,
        ];
        this._startLedger = startLedger || import.meta.env.PUBLIC_START_LEDGER;
        this.contractDataIsDefined = this.contractDataIsDefined.bind (this);
        this.successfulRequestEventHandler = this.successfulRequestEventHandler.bind (this);
        this.getOnError = this.getOnError.bind (this);
    }

    /**
     * Returns the underlying RPC server instance.
     *
     * @returns The `RpcServer` instance used for communication with
     * the [Stellar network](https://www.stellar.org/).
     */
    public getInstance (): RpcServer {
        return this.instance;
    }

    /**
     * Predicate filter that Validates that all required fields are present
     * in an `Api.EventResponse`.
     *
     * @param eventResponse - The event response to validate
     * @returns True if all required fields (contractId, id, value) are defined
     */
    contractDataIsDefined (eventResponse: Api.EventResponse): boolean {

        return eventResponse.contractId !== undefined && eventResponse.contractId !== null
               && eventResponse.id !== undefined && eventResponse.id !== null &&
               eventResponse.value !== undefined && eventResponse.value !== null;
    }

    private getOnError (reason: any): ChatEvent[] {
        console.error (reason);
        return [];
    }

    /**
     * Handles `Api.GetEventsResponse` returned from the `RpcServer`
     * [getEvents](https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getEvents) call.
     *
     * This method filters out non-contract events and validates required data is present.
     * It then extracts and transforms data into an array of `ChatEvent` objects.
     *
     * @param eventResponse - Successful response from the `RpcServer`
     * @returns An array of `ChatEvent`s
     * @throws Error in case of invalid data
     */
    private successfulRequestEventHandler (eventResponse: Api.GetEventsResponse): ChatEvent[] {
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

    decendingTimestampSort (): (a: ChatEvent , b: ChatEvent) => (number) {
        return (a , b) => {
            if (a.timestamp < b.timestamp) return - 1;
            if (a.timestamp > b.timestamp) return 1;
            return 0;
        };
    }

    private transformApiResponseToChatEvent (event: Api.EventResponse): ChatEvent {
        return new ChatEventBuilder ()
            .withId (event.id)
            .withAddress (event)
            .withTimestamp (event.ledgerClosedAt)
            .withTxHash (event.txHash)
            .withMessage (event.value)
            .validate ()
            .build ();
    }

    deduplicateEventIds (event: Api.EventResponse): boolean {
        if (this.processedEventIds.has (event.id)) return false;
        else {
            this.processedEventIds.add (event.id);
            return true;
        }
    }

    /**
     * Retrieves filtered events for the specified contract using pagination.
     *
     * @param cursor - Pagination cursor indicating where to start fetching events
     * @returns Promise resolving to an array of ChatEvents
     * @throws Error if the RPC request fails or returns invalid data
     */
    public async getFilteredEventsForContract (cursor: string): Promise<ChatEvent[]> {
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

    /**
     * Returns sequence number representing the last 24 hours of ledgers and events.
     *
     * @returns Promise resolving to sequence number
     * @throws Error if the RPC request fails or returns invalid data
     */
    async getLast24HourSequence (): Promise<number> {
        let latestLedger: Api.GetLatestLedgerResponse =
            await this.instance.getLatestLedger ();

        return latestLedger.sequence - 17_280;
    }
}


