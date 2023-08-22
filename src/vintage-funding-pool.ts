/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2023-01-06 11:00:10
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-08-22 17:02:05
 */
// import { BigInt } from "@graphprotocol/graph-ts"
// import { EnsResolver } from "ethers"
// import { EventLog } from "ethers/types/contract"
import { BigInt, Bytes, bigDecimal, log } from "@graphprotocol/graph-ts";
import {
    VintageFundingPoolAdapterContract,
    Deposit,
    WithDraw,
    RedeptionFeeCharged,
    ClearFund,
    ProcessFundRaise
} from "../generated/VintageFundingPoolAdapterContract/VintageFundingPoolAdapterContract"
import { DaoRegistry } from "../generated/DaoRegistry/DaoRegistry";
import {
    VintageRedempteEntity,
    VintageInvestorBalance,
    VintageInvestorAtivity,
    VintageNewFundProposal,
    VintageDaoStatistic,
    VintageClearFundEntity,
    VintageFundRoundStatistic,
    VintageSuccessedFundCounter,
    VintageFundRoundToNewFundProposalId
} from "../generated/schema"

export function handleDeposit(event: Deposit): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = VintageInvestorAtivity.load(event.transaction.hash.toHex())
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new VintageInvestorAtivity(event.transaction.hash.toHex())
    }
    let InvestorBalanceEntity = VintageInvestorBalance.load(event.params.daoAddress.toString() + event.params.account.toString());
    if (!InvestorBalanceEntity) {
        InvestorBalanceEntity = new VintageInvestorBalance(event.params.daoAddress.toString() + event.params.account.toString());
        InvestorBalanceEntity.balance = BigInt.fromI64(0);
        InvestorBalanceEntity.balanceFromWei = "0";
        InvestorBalanceEntity.daoAddr = event.params.daoAddress;
        InvestorBalanceEntity.account = event.params.account;
    }

    // Entity fields can be set based on event parameters
    entity.txHash = event.transaction.hash;
    entity.daoAddr = event.params.daoAddress;
    entity.account = event.params.account;
    entity.type = "deposit";
    entity.amount = event.params.amount;
    entity.amountFromWei = event.params.amount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.timeStamp = event.block.timestamp;
    entity.timeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();

    // Entities can be written to the store with `.save()`
    entity.save()

    InvestorBalanceEntity.balance = InvestorBalanceEntity.balance.plus(event.params.amount);
    InvestorBalanceEntity.balanceFromWei = InvestorBalanceEntity.balance.div(BigInt.fromI64(10 ** 18)).toString();
    InvestorBalanceEntity.save();
}

function contains(investors: string[], account: string): boolean {
    const index = investors.indexOf(account);
    if (index !== -1) return true;
    return false;
}

function remove(investors: string[], account: string): void {
    const index = investors.indexOf(account);
    if (index !== -1) investors.splice(index, 1);
}


export function handleWithDraw(event: WithDraw): void {

    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = VintageInvestorAtivity.load(event.transaction.hash.toHex())
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new VintageInvestorAtivity(event.transaction.hash.toHex())
    }
    let InvestorBalanceEntity = VintageInvestorBalance.load(
        event.params.daoAddress.toString() + event.params.account.toString()
    );
    if (!InvestorBalanceEntity) {
        InvestorBalanceEntity = new VintageInvestorBalance(
            event.params.daoAddress.toString() + event.params.account.toString()
        );
        InvestorBalanceEntity.balance = BigInt.fromI64(0);
        InvestorBalanceEntity.daoAddr = event.params.daoAddress;
        InvestorBalanceEntity.account = event.params.account;
    }

    // Entity fields can be set based on event parameters
    entity.txHash = event.transaction.hash;
    entity.daoAddr = event.params.daoAddress;
    entity.account = event.params.account;
    entity.type = "withdraw";
    entity.amount = event.params.amount;
    entity.amountFromWei = event.params.amount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.timeStamp = event.block.timestamp;
    entity.timeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();

    // Entities can be written to the store with `.save()`
    entity.save()


    InvestorBalanceEntity.balance = InvestorBalanceEntity.balance.minus(event.params.amount);
    InvestorBalanceEntity.balanceFromWei = InvestorBalanceEntity.balance.div(BigInt.fromI64(10 ** 18)).toString();
    InvestorBalanceEntity.save();

    // let flexFundingProposal = FlexFundingProposal.load(event.params.proposalId.toString())
    // if (flexFundingProposal) {
    //     flexFundingProposal.totalFund = flexFundingProposal.totalFund.minus(event.params.amount);
    //     flexFundingProposal.totalFundFromWei = flexFundingProposal.totalFund.div(BigInt.fromI64(10 ** 18)).toString();

    //     if (InvestorBalanceEntity.balance.le(BigInt.fromI64(0))) {
    //         let tem: string[] = [];
    //         if (flexFundingProposal.investors.length > 0) {
    //             for (var j = 0; j < flexFundingProposal.investors.length; j++) {
    //                 tem.push(flexFundingProposal.investors[j])
    //             }
    //         }
    //         remove(tem, event.params.account.toHexString());
    //         flexFundingProposal.investors = tem;
    //     }

    //     flexFundingProposal.save();
    // }
}

export function handleClearFund(event: ClearFund): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = VintageClearFundEntity.load(event.transaction.hash.toHex())
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new VintageClearFundEntity(event.transaction.hash.toHex())
    }

    entity.daoAddr = event.params.dao;
    entity.amount = event.params.amount;
    entity.executor = event.params.executor;
    entity.timeStamp = event.block.timestamp;

    entity.save();
}

export function handleRedeptionFeeCharged(event: RedeptionFeeCharged): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = VintageRedempteEntity.load(event.transaction.hash.toHex())
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new VintageRedempteEntity(event.transaction.hash.toHex())
    }

    entity.chargedFee = event.params.redemptionFee;
    entity.account = event.params.account;
    entity.timeStamp = event.block.timestamp;

    entity.save();
}

export function handleProcessFundRaise(event: ProcessFundRaise): void {
    const fundingPoolAdapt = VintageFundingPoolAdapterContract.bind(event.address);
    const daoContract = DaoRegistry.bind(event.params.dao);
    const fundRaisedState = fundingPoolAdapt.daoFundRaisingStates(event.params.dao);
    let successedFundCounter = VintageSuccessedFundCounter.load(event.params.dao.toString());
    if (!successedFundCounter) {
        successedFundCounter = new VintageSuccessedFundCounter(event.params.dao.toString());
        successedFundCounter.daoAddr = event.params.dao;
        successedFundCounter.counter = BigInt.fromI32(0);
    }
    const totoalRaised = event.params.fundRaisedAmount;
    const round = event.params.fundRound
    const roundProposalIdEntity = VintageFundRoundToNewFundProposalId.load(event.params.dao.toHexString() + round.toString());
    if (roundProposalIdEntity) {
        let newFundEntity = VintageNewFundProposal.load(roundProposalIdEntity.proposalId.toHexString());
        if (newFundEntity) {
            newFundEntity.totalFund = totoalRaised;
            newFundEntity.totalFundFromWei = newFundEntity!.totalFund.div(BigInt.fromI64(10 ** 18)).toString();
            newFundEntity.save();
        }
    }
    // log.debug("fundRaisedState {}", [fundRaisedState.toString()]);
    if (fundRaisedState == 2) {
        successedFundCounter.counter = successedFundCounter.counter.plus(BigInt.fromI32(1));

        let fundRoundEntity = new VintageFundRoundStatistic(event.params.dao.toString() + event.params.fundRound.toString());
        fundRoundEntity.daoAddr = event.params.dao;
        fundRoundEntity.fundInvested = BigInt.fromI32(0);
        fundRoundEntity.fundRaised = event.params.fundRaisedAmount;
        fundRoundEntity.fundRound = successedFundCounter.counter;
        fundRoundEntity.fundedVentures = BigInt.fromI32(0);
        fundRoundEntity.tokenAddress = daoContract.getAddressConfiguration(
            Bytes.fromHexString("0x7fa36390a0e9b8b8004035572fd8345b1128cea12d1763a1baf8fbd4fb7b2027")
        );
        // fundingPoolAdapt.getFundInvestors(event.params.dao, event.params.fundRound);
        let VintageDaoStatisticsEntity = VintageDaoStatistic.load(event.params.dao.toString());
        if (!VintageDaoStatisticsEntity) {
            VintageDaoStatisticsEntity = new VintageDaoStatistic(event.params.dao.toString());
            VintageDaoStatisticsEntity.fundRaised = BigInt.fromI64(0);
            VintageDaoStatisticsEntity.fundRaisedFromWei = "0";
            VintageDaoStatisticsEntity.fundInvestedFromWei = "0";
            VintageDaoStatisticsEntity.fundInvested = BigInt.fromI64(0);
            VintageDaoStatisticsEntity.fundedVentures = BigInt.fromI64(0);
            VintageDaoStatisticsEntity.members = BigInt.fromI64(0);
            VintageDaoStatisticsEntity.daoAddr = event.params.dao;
        }
        VintageDaoStatisticsEntity.fundRaised = VintageDaoStatisticsEntity.fundRaised.plus(event.params.fundRaisedAmount);
        VintageDaoStatisticsEntity.fundRaisedFromWei = VintageDaoStatisticsEntity.fundRaised.div(BigInt.fromI64(10 ** 18)).toString();
        VintageDaoStatisticsEntity.save();
        fundRoundEntity.save();
    }
    successedFundCounter.save();
}