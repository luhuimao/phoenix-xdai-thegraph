/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2023-01-06 11:00:10
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-08-22 17:48:13
 */
// import { BigInt } from "@graphprotocol/graph-ts"
// import { EnsResolver } from "ethers"
// import { EventLog } from "ethers/types/contract"
import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
    EscrowFund as EscorwFundEvent,
    WithDraw as WithDrawEvent
} from "../generated/vintageEscrowFundAdapterContract/vintageEscrowFundAdapterContract"
import { VintageEscrowFundEntity, VintageFundRoundToNewFundProposalId, VintageNewFundProposal } from "../generated/schema"


export function handleWithDraw(event: WithDrawEvent): void {
    let entity = VintageEscrowFundEntity.load(event.params.dao.toHexString() + event.params.account.toHexString() + event.params.fundRound.toHexString());
    if (entity) {
        entity.amount = BigInt.fromI32(0);
        entity.withdrawTimeStamp = event.block.timestamp;
        entity.withdrawTxHash = event.transaction.hash;

        entity.save();
    }
}

export function handleEscrowFund(event: EscorwFundEvent): void {
    let entity = VintageEscrowFundEntity.load(event.params.dao.toHexString() + event.params.account.toHexString() + event.params.fundRound.toHexString());

    if (!entity) {
        entity = new VintageEscrowFundEntity(event.params.dao.toHexString() + event.params.account.toHexString() + event.params.fundRound.toHexString());
    }
    let newFundEntity: VintageNewFundProposal | null;
    let minfundgoal = BigInt.fromI32(0);
    let finalraised = BigInt.fromI32(0);
    const roundProposalIdEntity = VintageFundRoundToNewFundProposalId.load(event.params.dao.toHexString() + event.params.fundRound.toString());
    if (roundProposalIdEntity) {
        const newFundProposalId = roundProposalIdEntity.proposalId;
        newFundEntity = VintageNewFundProposal.load(newFundProposalId.toHexString());
        if (newFundEntity) {
            minfundgoal = newFundEntity.fundRaiseTarget;
            finalraised = newFundEntity.totalFund;
        }
    }


    entity.daoAddr = event.params.dao;
    entity.account = event.params.account;
    entity.fundRound = event.params.fundRound;
    entity.token = event.params.token;
    entity.createTimeStamp = event.block.timestamp;
    entity.withdrawTimeStamp = BigInt.fromI32(0);
    entity.amount = event.params.amount;
    entity.withdrawTxHash = Bytes.empty();
    entity.minFundGoal = minfundgoal;
    entity.finalRaised = finalraised;
    entity.save();
}