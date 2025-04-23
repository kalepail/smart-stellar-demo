import {Contract , xdr} from "@stellar/stellar-sdk";
import {Api , Server as RpcServer} from '@stellar/stellar-sdk/minimal/rpc';
import {beforeAll , beforeEach , describe , expect , expectTypeOf , it , vi} from 'vitest';
import type {ChatEvent} from "../../src/utils/chat-event-builder.ts";
import {LocalRpcServer} from '../../src/utils/local-rpc-server.ts';

// Mock environment variables
const MOCK_CONTRACT_ID = '68c7240403d70a0ad5433c749fb755edd73fe28d5cec313894f3e3146d07f4ed';
const PUBLIC_START_LEDGER: number = 589387;
const mockCursor: string = "0002533562553204735-4294967295";
const expectedId: string = "8675309";

beforeAll (() => {
    vi.stubEnv ('PUBLIC_RPC_URL' , 'Test SDF Network ; September 2015');
    vi.stubEnv ('PUBLIC_NETWORK_PASSPHRASE' , 'https://mock-rpc-url.stellar.org');
    vi.stubEnv ('PUBLIC_CHAT_CONTRACT_ID' , MOCK_CONTRACT_ID);
    vi.stubEnv ('PUBLIC_START_LEDGER' , "589387");
});

// Mock RpcServer class
vi.mock ('@stellar/stellar-sdk/minimal/rpc' , () => {
    const mockGetEvents = vi.fn ();
    const mockGetLatestLedger = vi.fn ();
    const RpcServer = vi.fn ().mockImplementation (() => ({
        getEvents: mockGetEvents ,
        getLatestLedger: mockGetLatestLedger
    }));
    return {Server: RpcServer};
});

const localRpcServer: LocalRpcServer = new LocalRpcServer (MOCK_CONTRACT_ID , PUBLIC_START_LEDGER);

function getLocalRpcServer (): LocalRpcServer {
    return localRpcServer;
}

function buildMockEventsResponse (ids: string[]): Api.GetEventsResponse {

    const eventTemplate = {
        type: xdr.ContractEventType.contract ().name ,
        ledger: 589387 ,
        ledgerClosedAt: "2025-04-22T20:52:41Z" ,
        contractId: (new Contract ("CBUMOJAEAPLQUCWVIM6HJH5XKXW5OP7CRVOOYMJYSTZ6GFDNA72O2QW6")) ,
        inSuccessfulContractCall: true ,
        txHash: "86ad86ba26466e50b764cb7c0dab1082a5e1eec4e1cc82ae2bade7fbeb5d143f" ,
        topic: [
            xdr.ScVal.fromXDR ("AAAAEgAAAAAAAAAAxJYJmGjzotfUZImIspIV+7UI2gWeEsNcIDRS4CIg2FE=" , "base64") ,
        ] ,
        value: xdr.ScVal.fromXDR ("AAAADgAAABB0ZXN0LW1zZy10by1zZW5k" , "base64")
    } as Api.EventResponse;

    // Extract function to create an event with a dynamic ID and paging token
    function createMockEvent (id: string): typeof eventTemplate & { id: string; pagingToken: string } {
        return {
            ... eventTemplate ,
            id: id ,
            pagingToken: `0002531397889695744-${id.toString ().padStart (10 , '0')}` ,
        };
    }

    return {
        events: ids.map (value => createMockEvent (value)) ,
        latestLedger: 589890 ,
        cursor: "0002533562553204735-4294967295" ,
    };
}

function assertChatEventObjectIsPopulated (result: ChatEvent[] , index: number , expectedId: string): void {
    expectTypeOf (result).toEqualTypeOf<ChatEvent[]> ();
    expect (result[index]).toHaveProperty ("id" , expectedId);
    expect (result[index]).toHaveProperty ("addr" , "GDCJMCMYNDZ2FV6UMSEYRMUSCX53KCG2AWPBFQ24EA2FFYBCEDMFCBCV");
    expect (result[index]).toHaveProperty ("txHash" , "86ad86ba26466e50b764cb7c0dab1082a5e1eec4e1cc82ae2bade7fbeb5d143f");
    expect (result[index]).toHaveProperty ("msg" , "test-msg-to-send");
}

describe ('LocalRpcServer' , () => {
    let mockGetEventsFn: ReturnType<typeof vi.fn>;
    let mockGetLatestLedgerFn: ReturnType<typeof vi.fn>;

    beforeEach (() => {
        vi.resetModules ();
        vi.clearAllMocks ();

        const rpcServerMock = new RpcServer ('https://mock-rpc-url.stellar.org');
        mockGetEventsFn = rpcServerMock.getEvents as ReturnType<typeof vi.fn>;
        mockGetLatestLedgerFn = rpcServerMock.getLatestLedger as ReturnType<typeof vi.fn>;
    });

    describe ('getFilteredEventsForContract' , () => {
        it ('should process contract events correctly using getAddress' , async () => {
            const mockEventsResponse = buildMockEventsResponse ([expectedId , "8675319"]);

            mockGetEventsFn.mockResolvedValueOnce (mockEventsResponse);
            mockGetLatestLedgerFn.mockResolvedValueOnce ({
                                                             id: "8675319" ,
                                                             sequence: 8675319 ,
                                                             protocolVersion: "22"
                                                         });

            const result: ChatEvent[] = await getLocalRpcServer ()
                .getFilteredEventsForContract (mockCursor);

            // Ensure events were processed correctly
            expect (result).toHaveLength (2);
            assertChatEventObjectIsPopulated (result , 0 , expectedId);
            assertChatEventObjectIsPopulated (result , 1 , "8675319");
        });

        it ('should return empty array if no events are found' , async () => {
            mockGetEventsFn.mockResolvedValueOnce ({events: [] , cursor: mockCursor});
            mockGetLatestLedgerFn.mockResolvedValueOnce ({
                                                             id: "8675319" ,
                                                             sequence: 8675319 ,
                                                             protocolVersion: "22"
                                                         });

            const result = await getLocalRpcServer ().getFilteredEventsForContract ('cursor-empty');

            expect (result).toEqual ([]);
            expect (mockGetEventsFn).toHaveBeenCalled ();
        });

        it ('should not add duplicate events' , async () => {

            const duplicateEvent = buildMockEventsResponse ([expectedId , expectedId , expectedId , expectedId]);

            mockGetEventsFn.mockResolvedValueOnce (duplicateEvent);
            mockGetLatestLedgerFn.mockResolvedValueOnce ({
                                                             id: "8675319" ,
                                                             sequence: 8675319 ,
                                                             protocolVersion: "22"
                                                         });

            const result = await getLocalRpcServer ()
                .getFilteredEventsForContract (mockCursor);
            expect (result).toHaveLength (0);
        });

        it ('should filter out non-contract events' , async () => {
            const nonContractEvent = buildMockEventsResponse ([expectedId]);
            nonContractEvent.events[0].type = "diagnostic";

            mockGetEventsFn.mockResolvedValueOnce (nonContractEvent);
            mockGetLatestLedgerFn.mockResolvedValueOnce ({
                                                             id: "8675319" ,
                                                             sequence: 8675319 ,
                                                             protocolVersion: "22"
                                                         });

            const result = await getLocalRpcServer ().getFilteredEventsForContract (mockCursor);

            expect (result).toEqual ([]);
        });
    });
});


