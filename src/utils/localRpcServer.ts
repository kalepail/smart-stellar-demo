import {Address , scValToNative , xdr} from "@stellar/stellar-sdk/minimal";
import {Api , Server as RpcServer} from "@stellar/stellar-sdk/minimal/rpc";

export class LocalRpcServer {
    public get contractId (): string {
        return this._contractId;
    }

    private readonly instance: RpcServer;
    private readonly _contractId: string;
    private readonly eventFilters: Api.EventFilter[];
    private readonly _unknownAddressType: string = "Unknown address type";
    private readonly _limit: number = 10_000;

    constructor (contractIdString: string) {
        //@ts-ignore
        this.instance = new RpcServer (import.meta.env.PUBLIC_RPC_URL , import.meta.env.PUBLIC_NETWORK_PASSPHRASE);
        this._contractId = contractIdString || import.meta.env.PUBLIC_CHAT_CONTRACT_ID;
        this.eventFilters = [
            {
                type: "contract" ,
                contractIds: [this._contractId] ,
            } ,
        ];
    }

    public getInstance (): RpcServer {
        return this.instance;
    }

    contractIdIsDefined (eventResponse: Api.EventResponse) {
        return eventResponse.contractId !== undefined && eventResponse.contractId !== null
               && eventResponse.id !== undefined && eventResponse.id !== null;
    }


    getAddressFromXdr (address: xdr.ScAddress): string {
        switch (address.switch ().name) {
            case "scAddressTypeAccount":
                return Address.account (address.accountId ().ed25519 ()).toString ();
            case "scAddressTypeContract":
                return Address.contract (address.contractId ()).toString ();
            default: {
                console.error (this._unknownAddressType);
                throw new Error (`${this._unknownAddressType}`);
            }
        }
    }

    private getOnError (reason: any): ChatEvent[] {
        console.error (reason);
        return [];
    }

    private successfulRequestEventHandler (eventResponse: Api.GetEventsResponse): ChatEvent[] {
        const events: Api.EventResponse[] = eventResponse.events;

        if (events.length === 0) {
            return [];
        }

        return events
            .filter ((eventResponse) => eventResponse.type === "contract")
            .filter (this.contractIdIsDefined)
            .map ((event , index) => {
                return {
                    id: event.id ,
                    addr: this.getAddressFromXdr (event.topic[0].address ()) ,
                    timestamp: new Date (event.ledgerClosedAt) ,
                    txHash: event.txHash ,
                    msg: scValToNative (event.value) ,
                } as ChatEvent;
            });
    }

    public async getFilteredEventsForContract (cursor: string): Promise<ChatEvent[]> {

        const eventRequest: RpcServer.GetEventsRequest = {
            filters: this.eventFilters ,
            startLedger: 0 ,
            limit: this._limit ,
            cursor: cursor ,
        };

        return this.instance
                   .getEvents (eventRequest)
                   .then (this.successfulRequestEventHandler)
                   .catch (this.getOnError);
    }
}
