import * as StellarSdk from "@stellar/stellar-sdk";
import {Address , xdr} from "@stellar/stellar-sdk";
import {Api} from "@stellar/stellar-sdk/minimal/rpc";

export class ChatEventBuilder {
    private readonly event: Partial<ChatEvent> = {};
    private readonly _unknownAddressType: string = "Unknown address type";

    /**
     * Extracts and converts an address from an event's XDR topic.
     *
     * @param event - The event response containing the XDR data
     * @returns The decoded Stellar address as a string
     * @throws Error if the address type is unknown or invalid
     */
    getAddressFromXdr (event: Api.EventResponse): string {
        let address = Address.fromScVal (event.topic[0]);
        switch (address.toScAddress ().switch ()) {
            case xdr.ScAddressType.scAddressTypeAccount ():
                return StellarSdk.StrKey.encodeEd25519PublicKey (address.toBuffer ());
            case xdr.ScAddressType.scAddressTypeContract ():
                return Buffer.from (address.toScAddress ().contractId ()).toString ("utf-8");
            default: {
                console.error (this._unknownAddressType);
                throw new Error (`${this._unknownAddressType}`);
            }
        }
    }

    public withId (id: string): ChatEventBuilder {
        if (!id) throw new Error ('Event ID is required');
        this.event.id = id;
        return this;
    }

    public withAddress (topic: Api.EventResponse): ChatEventBuilder {
        try {
            this.event.addr = this.getAddressFromXdr (topic);
        }
        catch (error) {
            this.errorHandler (error , "Failed to set address:");
        }
        return this;
    }

    private errorHandler (error: unknown , errorMsg: string): void {
        //@ts-ignore
        throw new Error (errorMsg + ` ${error.message}`);
    }

    public withTimestamp (date: string): ChatEventBuilder {
        try {
            this.event.timestamp = new Date (date);
        }
        catch (error) {
            this.errorHandler (error , "Failed to set timestamp:");
        }
        return this;
    }

    public withTxHash (txHash: string): ChatEventBuilder {
        if (!txHash) throw new Error ('Transaction hash is required');
        this.event.txHash = txHash;
        return this;
    }

    public withMessage (rawEventMsg: xdr.ScVal): ChatEventBuilder {
        try {
            this.event.msg = Buffer.from (rawEventMsg.str () as Buffer).toString ('utf-8');
        }
        catch (error) {
            this.errorHandler (error , "Failed to set message:");
        }
        return this;
    }

    public validate (): ChatEventBuilder {
        const required: (keyof ChatEvent)[] = ['id' , 'addr' , 'timestamp' , 'txHash' , 'msg'];
        const missing = required.filter (key => !(key in this.event));
        if (missing.length > 0) this.errorHandler (new Error ("Validation Failure") , `Missing required fields: ${missing.join (', ')}`);
        return this;
    }

    public build (): ChatEvent {
        return this.event as ChatEvent;
    }
}

/**
 * The ChatEvent interface contains info from emitted events
 * by the chat-demo [contract](https://github.com/anataliocs/smart-stellar-demo/blob/fb97e3ac801d844b2be2065d5681656294cebd8f/contracts/chat-demo/src/lib.rs).
 */
export interface ChatEvent {
    id: string;
    addr: string;
    timestamp: Date;
    txHash: string;
    msg: string;
}
