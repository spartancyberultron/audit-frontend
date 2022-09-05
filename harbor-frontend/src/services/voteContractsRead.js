import { CosmWasmClient } from "cosmwasm";
import { comdex } from '../config/network'
import { lockingContractAddress } from "./keplr";


const configin = {
    chainId: comdex?.chainId,
    rpcEndpoint: comdex?.rpc,
    prefix: comdex?.prefix,
};

export const votingCurrentProposalId = async (productId) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "current_proposal": { "app_id": productId } });
    return await config;
}
export const votingCurrentProposal = async (proposalId) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "proposal": { "proposal_id": proposalId } });
    return await config;
}

export const votingTotalVotes = async (proposalId, extendedPairID) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "extended_pair_vote": { "proposal_id": proposalId, "extended_pair_id": extendedPairID } });
    return await config;
}

export const votingTotalBribs = async (proposalId, extendedPairID) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "bribe_by_proposal": { "proposal_id": proposalId, "extended_pair_id": extendedPairID } });
    return await config;
}

export const votingUserVote = async (proposalId, address) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "vote": { "proposal_id": proposalId, "address": address } });
    return await config;
} 
export const totalVTokens = async ( address) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "total_v_tokens": { "address": address, "denom":"uharbor" } });
    return await config;
} 