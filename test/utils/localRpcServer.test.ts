import {describe , it , expect , vi , beforeEach} from 'vitest';
import {Address} from '@stellar/stellar-sdk/minimal';
import {Api , Server as RpcServer} from '@stellar/stellar-sdk/minimal/rpc';
import {LocalRpcServer} from '../../src/utils/localRpcServer';

// Mock environment variables
const MOCK_CONTRACT_ID = '68c7240403d70a0ad5433c749fb755edd73fe28d5cec313894f3e3146d07f4ed';

vi.mock ('import.meta' , () => ({
    env: {
        PUBLIC_RPC_URL: 'https://mock-rpc-url.stellar.org' ,
        PUBLIC_NETWORK_PASSPHRASE: 'Test SDF Network ; September 2015' ,
        PUBLIC_CHAT_CONTRACT_ID: MOCK_CONTRACT_ID ,
    } ,
}));

// Mock RpcServer class
vi.mock ('@stellar/stellar-sdk/minimal/rpc' , () => {
    const mockGetEvents = vi.fn ();
    const RpcServer = vi.fn ().mockImplementation (() => ({
        getEvents: mockGetEvents ,
    }));
    return {Server: RpcServer};
});

vi.mock ('@stellar/stellar-sdk/minimal' , () => ({
    Address: {
        account: vi.fn ().mockImplementation ((ed25519: string) => ({
            toString: () => `G${ed25519}` ,
        })) ,
        contract: vi.fn ().mockImplementation ((contractId: string) => ({
            toString: () => `C${contractId}` ,
        })) ,
    } ,
    scValToNative: vi.fn ().mockImplementation (val => JSON.stringify (val)) ,
}));

function getLocalRpcServer (): LocalRpcServer {
    return new LocalRpcServer (MOCK_CONTRACT_ID);
}

describe ('LocalRpcServer' , () => {
    let mockGetEventsFn: ReturnType<typeof vi.fn>;

    beforeEach (() => {
        vi.resetModules ();
        vi.clearAllMocks ();

        const rpcServerMock = new RpcServer ('https://mock-rpc-url.stellar.org');
        mockGetEventsFn = rpcServerMock.getEvents as ReturnType<typeof vi.fn>;
    });

    describe ('getFilteredEventsForContract' , () => {
        it ('should process contract events correctly using getAddress' , async () => {
            const mockAccountEvent = {
                id: '8675309' ,
                type: 'contract' ,
                contractId: MOCK_CONTRACT_ID ,
                topic: [
                    {
                        switch: () => ({name: 'scAddressTypeAccount'}) ,
                        address: () => ({
                            switch: () => ({name: 'scAddressTypeAccount'}) ,
                            accountId: () => ({ed25519: () => 'account-id-1'}) ,
                        }) ,
                    } ,
                ] ,
                ledgerClosedAt: '2023-01-01T00:00:00Z' ,
                txHash: 'tx-hash-1' ,
                value: {message: 'Hello'} ,
            };

            const mockContractEvent = {
                id: 'event-2' ,
                type: 'contract' ,
                contractId: MOCK_CONTRACT_ID ,
                topic: [
                    {
                        switch: () => ({name: 'scAddressTypeContract'}) ,
                        address: () => ({
                            switch: () => ({name: 'scAddressTypeContract'}) ,
                            contractId: () => 'contract-id-2' ,
                        }) ,
                    } ,
                ] ,
                ledgerClosedAt: '2023-01-02T00:00:00Z' ,
                txHash: 'tx-hash-2' ,
                value: {message: 'Hello from contract'} ,
            };

            mockGetEventsFn.mockResolvedValueOnce ({
                                                       events: [mockAccountEvent , mockContractEvent] ,
                                                       cursor: 'test-cursor' ,
                                                   });

            const result = await getLocalRpcServer()
                .getFilteredEventsForContract ('cursor-1');

            // Ensure events were processed correctly
            expect (result).toHaveLength (2);
            expect (result[0]).toEqual ({
                                            id: 'event-1' ,
                                            addr: 'Gaccount-id-1' ,
                                            timestamp: new Date ('2023-01-01T00:00:00Z') ,
                                            txHash: 'tx-hash-1' ,
                                            msg: JSON.stringify ({message: 'Hello'}) ,
                                        });
            expect (result[1]).toEqual ({
                                            id: 'event-2' ,
                                            addr: 'Ccontract-id-2' ,
                                            timestamp: new Date ('2023-01-02T00:00:00Z') ,
                                            txHash: 'tx-hash-2' ,
                                            msg: JSON.stringify ({message: 'Hello from contract'}) ,
                                        });

            // Verify mocked Address methods were used correctly
            expect (Address.account).toHaveBeenCalledWith ('account-id-1');
            expect (Address.contract).toHaveBeenCalledWith ('contract-id-2');
        });

        it ('should return empty array if no events are found' , async () => {
            mockGetEventsFn.mockResolvedValueOnce ({events: [] , cursor: 'empty-cursor'});

            const result = await getLocalRpcServer ().getFilteredEventsForContract ('cursor-empty');

            expect (result).toEqual ([]);
            expect (mockGetEventsFn).toHaveBeenCalled ();
        });

        it ('should not add duplicate events' , async () => {
            const existingEvent: ChatEvent = {
                id: 'event-1' ,
                addr: 'Gexisting-account' ,
                timestamp: new Date ('2023-01-01T00:00:00Z') ,
                txHash: 'tx-hash-existing' ,
                msg: 'Existing message' ,
            };

            const duplicateEvent = {
                id: 'event-1' , // Same ID as existing
                type: 'contract' ,
                contractId: MOCK_CONTRACT_ID ,
                topic: [
                    {
                        switch: () => ({name: 'scAddressTypeAccount'}) ,
                        address: () => ({
                            switch: () => ({name: 'scAddressTypeAccount'}) ,
                            accountId: () => ({ed25519: () => 'account-id-1'}) ,
                        }) ,
                    } ,
                ] ,
                ledgerClosedAt: '2023-01-01T00:00:00Z' ,
                txHash: 'tx-hash-1' ,
                value: {message: 'Hello'} ,
            };

            mockGetEventsFn.mockResolvedValueOnce ({
                                                       events: [duplicateEvent] ,
                                                       cursor: 'duplicate-cursor' ,
                                                   });

            const result = await getLocalRpcServer ().getFilteredEventsForContract ('cursor-dupe');
            expect (result).toHaveLength (0);
        });

        it ('should filter out non-contract events' , async () => {
            const nonContractEvent = {
                id: 'event-3' ,
                type: 'non-contract' ,
                contractId: MOCK_CONTRACT_ID ,
                topic: [
                    {
                        switch: () => ({name: 'scAddressTypeAccount'}) ,
                        address: () => ({
                            switch: () => ({name: 'scAddressTypeAccount'}) ,
                            accountId: () => ({ed25519: () => 'account-id-3'}) ,
                        }) ,
                    } ,
                ] ,
                ledgerClosedAt: '2023-01-01T00:00:00Z' ,
                txHash: 'tx-hash-3' ,
                value: {message: 'Hello'} ,
            };

            mockGetEventsFn.mockResolvedValueOnce ({events: [nonContractEvent] , cursor: 'cursor-non-contract'});

            const result = await getLocalRpcServer ().getFilteredEventsForContract ('cursor-non-contract');

            expect (result).toEqual ([]);
        });
    });
});
