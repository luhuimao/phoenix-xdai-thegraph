/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-22 15:32:03
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-08-22 17:32:49
 */
import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"
import {
    VintageFundRaiseAdapterContract,
    ProposalCreated,
    proposalExecuted
} from "../generated/VintageFundRaiseAdapterContract/VintageFundRaiseAdapterContract"
import { VintageNewFundProposal, VintageProposalVoteInfo, VintageFundRoundToNewFundProposalId } from "../generated/schema"

export function handleProposalCreated(event: ProposalCreated): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = VintageNewFundProposal.load(event.params.proposalId.toHexString())

    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new VintageNewFundProposal(event.params.proposalId.toHexString())
    }

    // BigInt and BigDecimal math are supported
    // entity.count = entity.count + BigInt.fromI32(1)
    let vintageFundRaiseContract = VintageFundRaiseAdapterContract.bind(event.address);
    let proposalInfo = vintageFundRaiseContract.Proposals((event.params.daoAddr),
        event.params.proposalId);

    // Entity fields can be set based on event parameters
    entity.daoAddr = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.acceptTokenAddr = proposalInfo.getAcceptTokenAddr();
    entity.fundRaiseTarget = proposalInfo.getFundRaiseTarget();
    entity.fundRaiseTargetFromWei = entity.fundRaiseTarget.div(BigInt.fromI64(10 ** 18)).toString();
    entity.fundRaiseMaxAmount = proposalInfo.getFundRaiseMaxAmount();
    entity.fundRaiseMaxAmountFromWei = entity.fundRaiseMaxAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.lpMinDepositAmount = proposalInfo.getLpMinDepositAmount();
    entity.lpMinDepositAmountFromWei = entity.lpMinDepositAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.lpMaxDepositAmount = proposalInfo.getLpMaxDepositAmount();
    entity.lpMaxDepositAmountFromWei = entity.lpMaxDepositAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.fundRaiseStartTime = proposalInfo.getTimesInfo().fundRaiseStartTime;
    entity.fundRaiseEndTime = proposalInfo.getTimesInfo().fundRaiseEndTime;
    entity.fundTerm = proposalInfo.getTimesInfo().fundTerm;
    entity.redemptPeriod = proposalInfo.getTimesInfo().redemptPeriod;
    entity.redemptDuration = proposalInfo.getTimesInfo().redemptDuration;
    entity.returnDuration = proposalInfo.getTimesInfo().returnDuration;
    entity.managementFeeRatio = proposalInfo.getFeeInfo().managementFeeRatio;
    entity.redepmtFeeRatio = proposalInfo.getFeeInfo().redepmtFeeRatio;
    entity.protocolFeeRatio = proposalInfo.getFeeInfo().protocolFeeRatio;
    entity.managementFeeAddress = proposalInfo.getFeeInfo().managementFeeAddress;
    entity.fundFromInverstor = proposalInfo.getProposerReward().fundFromInverstor;
    entity.projectTokenFromInvestor = proposalInfo.getProposerReward().projectTokenFromInvestor;
    entity.state = BigInt.fromI32(proposalInfo.getState());
    entity.creationTime = proposalInfo.getCreationTime();
    entity.stopVoteTime = proposalInfo.getStopVoteTime();
    entity.fundStartTime = BigInt.fromI32(0);
    entity.fundEndTime = BigInt.fromI32(0);
    entity.totalFund = BigInt.fromI32(0);
    entity.totalFundFromWei = "0";

    // Entities can be written to the store with `.save()`
    entity.save()
}

export function handleProposalExecuted(event: proposalExecuted): void {
    let entity = VintageNewFundProposal.load(event.params.proposalId.toHexString())

    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (entity) {
        entity.state = BigInt.fromI32(event.params.state);
        if (event.params.state == 2) {
            entity.fundStartTime = event.block.timestamp;
            entity.fundEndTime = entity.fundStartTime.plus(entity.fundTerm);

            let vintageFundRaiseContract = VintageFundRaiseAdapterContract.bind(event.address);
            const fundRound = vintageFundRaiseContract.createdFundCounter(event.params.daoAddr);
            let roundPropossalEntity = new VintageFundRoundToNewFundProposalId(event.params.daoAddr.toHexString() + fundRound.toString());
            roundPropossalEntity.daoAddr = event.params.daoAddr;
            roundPropossalEntity.fundRound = fundRound;
            roundPropossalEntity.proposalId = event.params.proposalId;
            roundPropossalEntity.save();
        }
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
