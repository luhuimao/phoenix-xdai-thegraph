/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-16 17:00:56
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-08-17 14:49:01
 */
import {
    ProposalCreated as ProposalCreatedEvent,
    ProposalExecuted as ProposalExecutedEvent,
    StartVote as handleStartVoteEvent,
    VintageFundingAdapterContract
} from "../generated/VintageFundingAdapterContract/VintageFundingAdapterContract";
import { VintageFundRaiseAdapterContract } from "../generated/VintageFundRaiseAdapterContract/VintageFundRaiseAdapterContract";
import { DaoRegistry } from "../generated/DaoRegistry/DaoRegistry";
import { VintageFundingProposalInfo, VintageDaoStatistic, VintageProposalVoteInfo, VintageFundRoundStatistic } from "../generated/schema"
import { bigInt, BigInt, Bytes, Address, log } from "@graphprotocol/graph-ts"

export function handleProposalCreated(event: ProposalCreatedEvent): void {

    let entity = VintageFundingProposalInfo.load(event.params.proposalId.toHexString())

    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new VintageFundingProposalInfo(event.params.proposalId.toHexString())
        // Entity fields can be set using simple assignments
        // entity.count = BigInt.fromI32(0)
    }

    let vintageFundingContract = VintageFundingAdapterContract.bind(event.address);
    const vintageFundingProposalInfo = vintageFundingContract.
        proposals(event.params.daoAddr,
            event.params.proposalId);
    entity.proposalId = event.params.proposalId
    entity.daoAddress = event.params.daoAddr;
    entity.state = BigInt.fromI32(0);
    entity.escrow = vintageFundingProposalInfo.getProposalReturnTokenInfo().escrow;
    entity.approverAddr = vintageFundingProposalInfo.getProposalReturnTokenInfo().approveOwnerAddr;
    entity.minDepositAmount = BigInt.fromI32(0);
    entity.minDepositAmountFromWei = entity.minDepositAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.maxDepositAmount = BigInt.fromI32(0);
    entity.maxDepositAmountFromWei = entity.maxDepositAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.fundingToken = vintageFundingProposalInfo.getFundingToken();
    entity.fundingAmount = vintageFundingProposalInfo.getFundingAmount();
    entity.fundingAmountFromWei = entity.fundingAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.totalAmount = vintageFundingProposalInfo.getTotalAmount();
    entity.totalAmountFromWei = entity.totalAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.price = vintageFundingProposalInfo.getPrice();
    entity.recipientAddr = vintageFundingProposalInfo.getRecipientAddr();
    entity.proposer = vintageFundingProposalInfo.getProposer();
    entity.vestingStartTime = vintageFundingProposalInfo.getVestInfo().vestingStartTime;
    entity.vetingEndTime = vintageFundingProposalInfo.getVestInfo().vetingEndTime;
    entity.vestingCliffEndTime = vintageFundingProposalInfo.getVestInfo().vestingCliffEndTime;
    entity.vestingCliffLockAmount = vintageFundingProposalInfo.getVestInfo().vestingCliffLockAmount;
    entity.vestingInterval = vintageFundingProposalInfo.getVestInfo().vestingInterval;
    entity.returnToken = vintageFundingProposalInfo.getProposalReturnTokenInfo().returnToken;
    entity.returnTokenAmount = vintageFundingProposalInfo.getProposalReturnTokenInfo().returnTokenAmount;
    entity.returnTokenAmountFromWei = entity.returnTokenAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.inQueueTimestamp = vintageFundingProposalInfo.getProposalTimeInfo().inQueueTimestamp;
    entity.proposalStartVotingTimestamp = vintageFundingProposalInfo.getProposalTimeInfo().proposalStartVotingTimestamp;
    entity.proposalStopVotingTimestamp = vintageFundingProposalInfo.getProposalTimeInfo().proposalStopVotingTimestamp;
    entity.proposalExecuteTimestamp = vintageFundingProposalInfo.getProposalTimeInfo().proposalExecuteTimestamp;
    entity.createDateTime = new Date(event.block.timestamp.toI64() * 1000).toISOString();

    entity.save()


}

export function handleProposalExecuted(event: ProposalExecutedEvent): void {
    let proposalEntity = VintageFundingProposalInfo.load(event.params.proposalID.toHexString())
    // log.error("funding proposal state: {}", [event.params.state.toString()]);
    if (proposalEntity) {
        const vintageFundingContract = VintageFundingAdapterContract.bind(event.address);
        const vintageFundingProposalInfo = vintageFundingContract.
            proposals(event.params.daoAddr,
                event.params.proposalID);

        proposalEntity.state = BigInt.fromI32(vintageFundingProposalInfo.getStatus());
        proposalEntity.proposalExecuteTimestamp = event.block.timestamp;
        proposalEntity.save();

        if (proposalEntity.state == BigInt.fromI32(3)) {
            let VintageDaoStatisticsEntity = VintageDaoStatistic.load(event.params.daoAddr.toString());
            if (!VintageDaoStatisticsEntity) {
                VintageDaoStatisticsEntity = new VintageDaoStatistic(event.params.daoAddr.toString());
                VintageDaoStatisticsEntity.fundRaised = BigInt.fromI64(0);
                VintageDaoStatisticsEntity.fundRaisedFromWei = "0";
                VintageDaoStatisticsEntity.fundInvestedFromWei = "0";
                VintageDaoStatisticsEntity.fundInvested = BigInt.fromI64(0);
                VintageDaoStatisticsEntity.fundedVentures = BigInt.fromI64(0);
                VintageDaoStatisticsEntity.members = BigInt.fromI64(0);
                VintageDaoStatisticsEntity.daoAddr = event.params.daoAddr;
            }
            VintageDaoStatisticsEntity.fundInvested = VintageDaoStatisticsEntity.fundInvested.plus(proposalEntity.fundingAmount);
            VintageDaoStatisticsEntity.fundInvestedFromWei = VintageDaoStatisticsEntity.fundInvested.div(BigInt.fromI64(10 ** 18)).toString();
            VintageDaoStatisticsEntity.fundedVentures = VintageDaoStatisticsEntity.fundedVentures.plus(BigInt.fromI32(1));

            VintageDaoStatisticsEntity.save();
        }

        let voteInfoEntity = VintageProposalVoteInfo.load(event.params.proposalID.toHexString());

        if (voteInfoEntity) {
            voteInfoEntity.nbYes = event.params.nbYes;
            voteInfoEntity.nbNo = event.params.nbNo;
            voteInfoEntity.totalWeights = event.params.allVotingWeight;
            voteInfoEntity.save();
        }

        const daoContract = DaoRegistry.bind(event.params.daoAddr);
        const fundRaiseAddress = daoContract.getAdapterAddress(Bytes.fromHexString("0xa837e34a29b67bf52f684a1c93def79b84b9c012732becee4e5df62809df64ed"));
        const fundRaiseContract = VintageFundRaiseAdapterContract.bind(fundRaiseAddress);
        const currentFundRound = fundRaiseContract.createdFundCounter(event.params.daoAddr);

        // let fundRoundEntity = VintageFundRoundStatistic.load(event.params.daoAddr.toString() + currentFundRound.toString());

        // if (!fundRoundEntity) {
        //     fundRoundEntity = new VintageFundRoundStatistic(event.params.daoAddr.toString() + currentFundRound.toString());
        //     fundRoundEntity.daoAddr = event.params.daoAddr;
        //     fundRoundEntity.fundInvested = BigInt.fromI32(0);
        //     fundRoundEntity.fundRaised = BigInt.fromI32(0);
        //     fundRoundEntity.fundRound = currentFundRound;
        //     fundRoundEntity.fundedVentures = BigInt.fromI32(0);
        // }
        if (proposalEntity.state == BigInt.fromI32(3)) {
            let fundRoundEntity = VintageFundRoundStatistic.load(event.params.daoAddr.toString() + currentFundRound.toString());
            if (fundRoundEntity) {
                fundRoundEntity.fundInvested = fundRoundEntity.fundInvested.plus(proposalEntity.fundingAmount);
                fundRoundEntity.fundedVentures = fundRoundEntity.fundedVentures.plus(BigInt.fromI32(1));
                fundRoundEntity.save();
            }
        }
    }
}

export function handleStartVote(event: handleStartVoteEvent): void {
    let entity = VintageFundingProposalInfo.load(event.params.proposalID.toHexString())
    if (entity) {
        const vintageFundingContract = VintageFundingAdapterContract.bind(event.address);
        const vintageFundingProposalInfo = vintageFundingContract.
            proposals(event.params.daoAddr,
                event.params.proposalID);

        entity.state = BigInt.fromI32(vintageFundingProposalInfo.getStatus());
        entity.proposalStartVotingTimestamp = vintageFundingProposalInfo.getProposalTimeInfo().proposalStartVotingTimestamp;
        entity.proposalStopVotingTimestamp = vintageFundingProposalInfo.getProposalTimeInfo().proposalStopVotingTimestamp;
        entity.save();
    }
}

export function donothing(): void { }