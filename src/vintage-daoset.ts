/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-22 15:32:03
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-10-16 14:28:21
 */
import { BigInt, Bytes, Address, log, bigInt } from "@graphprotocol/graph-ts"
import {
    VintageDaoSetAdapterContract,
    ProposalCreated,
    ProposalProcessed
} from "../generated/VintageDaoSetAdapterContract/VintageDaoSetAdapterContract"
import { VintageDaoSetProposal, VintageProposalVoteInfo, VintageFundRoundToNewFundProposalId } from "../generated/schema"

export function handleProposalCreated(event: ProposalCreated): void {
    let entity = VintageDaoSetProposal.load(event.params.proposalId.toHexString())

    if (!entity) {
        entity = new VintageDaoSetProposal(event.params.proposalId.toHexString())
    }

    entity.daoAddr = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.proposalType = BigInt.fromI32(event.params.pType);
    switch (event.params.pType) {
        // PARTICIPANT_CAP,
        // GOVERNOR_MEMBERSHIP,
        // INVESTOR_MEMBERSHIP,
        // VOTING
        case 0:
            entity.proposalTypeString = "PARTICIPANT_CAP";
            break;
        case 1: entity.proposalTypeString = "GOVERNOR_MEMBERSHIP";
            break;
        case 2: entity.proposalTypeString = "INVESTOR_MEMBERSHIP";
            break;
        case 3: entity.proposalTypeString = "VOTING";
            break;
        default:
            entity.proposalTypeString = "";
            break;
    }
    entity.state = BigInt.fromI32(0);
    entity.vintageDaoEntity = event.params.daoAddr.toHexString();
    entity.save();
}

export function handleProposalExecuted(event: ProposalProcessed): void {
    let entity = VintageDaoSetProposal.load(event.params.proposalId.toHexString())

    if (entity) {
        entity.state = BigInt.fromI32(event.params.state);

        entity.save();
    }

    let voteInfoEntity = VintageProposalVoteInfo.load(event.params.proposalId.toHexString());

    if (voteInfoEntity) {
        voteInfoEntity.nbYes = event.params.nbYes;
        voteInfoEntity.nbNo = event.params.nbNo;
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }
}