/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-22 15:32:03
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-10-07 13:35:12
 */
import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"
import {
    FlexFundingAdapterContract,
    ProposalCreated,
    ProposalExecuted
} from "../generated/FlexFundingAdapterContract/FlexFundingAdapterContract"
import { DaoRegistry } from "../generated/DaoRegistry/DaoRegistry";
import { FlexFundingPoolAdapterContract } from "../generated/FlexFundingPoolAdapterContract/FlexFundingPoolAdapterContract";

import { FlexFundingProposal, FlexDaoStatistic } from "../generated/schema"

export function handleProposalCreated(event: ProposalCreated): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = FlexFundingProposal.load(event.params.proposalId.toHexString())

    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new FlexFundingProposal(event.params.proposalId.toHexString())
    }

    // BigInt and BigDecimal math are supported
    // entity.count = entity.count + BigInt.fromI32(1)
    let flexFundingContract = FlexFundingAdapterContract.bind(event.address);
    let proposalInfo = flexFundingContract.Proposals((event.params.daoAddress),
        event.params.proposalId);

    // Entity fields can be set based on event parameters
    entity.proposalId = event.params.proposalId
    entity.daoAddress = event.params.daoAddress;
    entity.proposer = event.params.proposer;
    entity.tokenAddress = proposalInfo.getFundingInfo().tokenAddress;
    entity.minFundingAmount = proposalInfo.getFundingInfo().minFundingAmount;
    entity.maxFundingAmount = proposalInfo.getFundingInfo().maxFundingAmount;
    entity.minFundingAmountFromWei = entity.minFundingAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.maxFundingAmountFromWei = entity.maxFundingAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.escrow = proposalInfo.getFundingInfo().escrow;
    entity.returnTokenAddr = proposalInfo.getFundingInfo().returnTokenAddr;
    entity.returnTokenAmount = proposalInfo.getFundingInfo().returnTokenAmount;
    entity.returnTokenAmountFromWei = entity.returnTokenAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.price = proposalInfo.getFundingInfo().price;
    entity.minReturnAmount = proposalInfo.getFundingInfo().minReturnAmount;
    entity.maxReturnAmount = proposalInfo.getFundingInfo().maxReturnAmount;
    entity.minReturnAmountFromWei = entity.minReturnAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.maxReturnAmountFromWei = entity.maxReturnAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.approverAddr = proposalInfo.getFundingInfo().approverAddr;
    entity.recipientAddr = proposalInfo.getFundingInfo().tokenAddress;
    entity.vestingStartTime = proposalInfo.getVestInfo().vestingStartTime;
    entity.vestingCliffEndTime = proposalInfo.getVestInfo().vestingCliffEndTime;
    entity.vestingEndTime = proposalInfo.getVestInfo().vestingEndTime;
    entity.vestingInterval = proposalInfo.getVestInfo().vestingInterval;
    entity.vestingCliffLockAmount = proposalInfo.getVestInfo().vestingCliffLockAmount;
    entity.fundRaiseType = BigInt.fromI32(proposalInfo.getFundRaiseInfo().fundRaiseType);
    entity.fundRaiseStartTime = proposalInfo.getFundRaiseInfo().fundRaiseStartTime;
    entity.fundRaiseEndTime = proposalInfo.getFundRaiseInfo().fundRaiseEndTime;
    entity.fundRaiseStartTimeString = new Date(entity.fundRaiseStartTime.toI64() * 1000).toISOString();
    entity.fundRaiseEndTimeString = new Date(entity.fundRaiseEndTime.toI64() * 1000).toISOString();
    entity.minDepositAmount = proposalInfo.getFundRaiseInfo().minDepositAmount;
    entity.maxDepositAmount = proposalInfo.getFundRaiseInfo().maxDepositAmount;
    entity.minDepositAmountFromWei = entity.minDepositAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.maxDepositAmountFromWei = entity.maxDepositAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.backerIdentification = proposalInfo.getFundRaiseInfo().backerIdentification;
    entity.bType = BigInt.fromI32(proposalInfo.getFundRaiseInfo().bakckerIdentificationInfo.bType);
    entity.bChainId = proposalInfo.getFundRaiseInfo().bakckerIdentificationInfo.bChainId;
    entity.bTokanAddr = proposalInfo.getFundRaiseInfo().bakckerIdentificationInfo.bTokanAddr;
    entity.bTokenId = proposalInfo.getFundRaiseInfo().bakckerIdentificationInfo.bTokenId;
    entity.bMinHoldingAmount = proposalInfo.getFundRaiseInfo().bakckerIdentificationInfo.bMinHoldingAmount;
    entity.priorityDepositEnalbe = proposalInfo.getFundRaiseInfo().priorityDepositInfo.enable;
    entity.priorityDepositType = BigInt.fromI32(proposalInfo.getFundRaiseInfo().priorityDepositInfo.pType);
    entity.priorityDepositTokenAddr = proposalInfo.getFundRaiseInfo().priorityDepositInfo.token;
    entity.priorityDepositTokenId = proposalInfo.getFundRaiseInfo().priorityDepositInfo.tokenId;
    entity.priorityDepositAmount = proposalInfo.getFundRaiseInfo().priorityDepositInfo.amount;
    entity.tokenRewardAmount = proposalInfo.getProposerRewardInfo().tokenRewardAmount;
    entity.cashRewardAmount = proposalInfo.getProposerRewardInfo().cashRewardAmount;
    entity.startVoteTime = proposalInfo.getStartVoteTime();
    entity.stopVoteTime = proposalInfo.getStopVoteTime();
    entity.state = BigInt.fromI32(proposalInfo.getState());
    entity.createDateTime = new Date(event.block.timestamp.toI64() * 1000).toISOString();
    entity.stopVoteTimeString = new Date(proposalInfo.getStopVoteTime().toI64() * 1000).toISOString();
    entity.totalFund = BigInt.fromI32(0);
    entity.totalFundFromWei = "0";
    entity.investors = [];
    // Entities can be written to the store with `.save()`
    entity.save();
}

export function handleproposalExecuted(event: ProposalExecuted): void {
    let entity = FlexFundingProposal.load(event.params.proposalId.toHexString())

    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (entity) {
        entity.state = BigInt.fromI32(event.params.state);

        let flexFundingContract = FlexFundingAdapterContract.bind(event.address);
        let proposalInfo = flexFundingContract.Proposals((event.params.daoAddress),
            event.params.proposalId);

        entity.returnTokenAmount = proposalInfo.getFundingInfo().returnTokenAmount;
        entity.returnTokenAmountFromWei = entity.returnTokenAmount.div(BigInt.fromI64(10 ** 18)).toString();

        entity.save();

        if (entity.state == BigInt.fromI32(3)) {
            let FlexDaoStatisticsEntity = FlexDaoStatistic.load(event.params.daoAddress.toString());
            if (!FlexDaoStatisticsEntity) {
                FlexDaoStatisticsEntity = new FlexDaoStatistic(event.params.daoAddress.toString());

                FlexDaoStatisticsEntity.fundRaised = BigInt.fromI64(0);
                FlexDaoStatisticsEntity.fundRaisedFromWei = "0";
                FlexDaoStatisticsEntity.fundInvested = BigInt.fromI64(0);
                FlexDaoStatisticsEntity.fundInvestedFromWei = "0";
                FlexDaoStatisticsEntity.fundedVentures = BigInt.fromI64(0);
                FlexDaoStatisticsEntity.members = BigInt.fromI64(0);
                FlexDaoStatisticsEntity.daoAddr = event.params.daoAddress;
            }
            FlexDaoStatisticsEntity.fundInvested = FlexDaoStatisticsEntity.fundInvested.plus(entity.totalFund);
            FlexDaoStatisticsEntity.fundInvestedFromWei = FlexDaoStatisticsEntity.fundInvested.div(BigInt.fromI64(10 ** 18)).toString();
            FlexDaoStatisticsEntity.fundedVentures = FlexDaoStatisticsEntity.fundedVentures.plus(BigInt.fromI32(1));

            const daoContract = DaoRegistry.bind(event.params.daoAddress);
            const flexFundingPoolAdaptAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c"));
            const flexFundingPoolAdapt = FlexFundingPoolAdapterContract.bind(flexFundingPoolAdaptAddr);

            const raiseAmount = flexFundingPoolAdapt.getTotalFundByProposalId(event.params.daoAddress, event.params.proposalId);


            FlexDaoStatisticsEntity.fundRaised = FlexDaoStatisticsEntity.fundRaised.plus(raiseAmount);
            FlexDaoStatisticsEntity.fundRaisedFromWei = FlexDaoStatisticsEntity.fundRaised.div(BigInt.fromI64(10 ** 18)).toString();

            FlexDaoStatisticsEntity.save();
        }
    }
}
