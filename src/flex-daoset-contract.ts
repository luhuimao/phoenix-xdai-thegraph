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
    FlexDaoSetAdapterContract,
    ProposalCreated,
    ProposalProcessed
} from "../generated/FlexDaoSetAdapterContract/FlexDaoSetAdapterContract"
import { FlexDaoSetPollingAdapterContract } from "../generated/FlexDaoSetAdapterContract/FlexDaoSetPollingAdapterContract";
import { FlexDaoSetVotingAdapterContract } from "../generated/FlexDaoSetAdapterContract/FlexDaoSetVotingAdapterContract";
import { DaoRegistry } from "../generated/FlexDaoSetAdapterContract/DaoRegistry";
import { FlexDaosetProposal, FlexProposalVoteInfo, } from "../generated/schema"

export function handleProposalCreated(event: ProposalCreated): void {
    let entity = FlexDaosetProposal.load(event.params.proposalId.toHexString())

    if (!entity) {
        entity = new FlexDaosetProposal(event.params.proposalId.toHexString())
    }

    entity.daoAddr = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.proposalType = BigInt.fromI32(event.params.pType);
    switch (event.params.pType) {
        // PARTICIPANT_CAP,
        // GOVERNOR_MEMBERSHIP,
        // INVESTOR_MEMBERSHIP,
        // VOTING,
        // FEES,
        // PROPOSER_MEMBERHSIP,
        // POLL_FOR_INVESTMENT
        case 0:
            entity.proposalTypeString = "PARTICIPANT_CAP";
            break;
        case 1:
            entity.proposalTypeString = "GOVERNOR_MEMBERSHIP";
            break;
        case 2:
            entity.proposalTypeString = "INVESTOR_MEMBERSHIP";
            break;
        case 3:
            entity.proposalTypeString = "VOTING";
            break;
        case 4:
            entity.proposalTypeString = "FEES";
            break;
        case 5:
            entity.proposalTypeString = "PROPOSER_MEMBERHSIP";
            break;
        case 6:
            entity.proposalTypeString = "POLL_FOR_INVESTMENT";
            break;
        default:
            entity.proposalTypeString = "";
            break;
    }
    entity.state = BigInt.fromI32(0);
    entity.creationTime = event.block.timestamp;
    entity.createTimeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();
    entity.flexDaoEntity = event.params.daoAddr.toHexString();
    entity.save();
}

export function handleProposalProcessed(event: ProposalProcessed): void {
    let entity = FlexDaosetProposal.load(event.params.proposalId.toHexString())
    const flexDaosetContract = FlexDaoSetAdapterContract.bind(event.address);
    const daoContract = DaoRegistry.bind(event.params.daoAddr);
    const flexDaosetVotingContractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7"));
    const flexDaosetPollingContractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f"));
    const flexDaosetVotingContract = FlexDaoSetVotingAdapterContract.bind(flexDaosetVotingContractAddr);
    const flexDaosetPollingContract = FlexDaoSetPollingAdapterContract.bind(flexDaosetPollingContractAddr);
    let proposalState = BigInt.fromI32(0);
    if (entity) {
        switch (entity.proposalType.toI32()) {
            case 0:
                proposalState = BigInt.fromI32(flexDaosetContract.investorCapProposals(event.params.daoAddr,
                    event.params.proposalId).getState());
                break;
            case 1:
                proposalState = BigInt.fromI32(flexDaosetContract.governorMembershipProposals(event.params.daoAddr,
                    event.params.proposalId).getState());
                break;
            case 2:
                proposalState = BigInt.fromI32(flexDaosetContract.investorMembershipProposals(event.params.daoAddr,
                    event.params.proposalId).getState());
                break;
            case 3:
                proposalState = BigInt.fromI32(flexDaosetVotingContract.votingProposals(event.params.daoAddr,
                    event.params.proposalId).getState());
                break;
            case 4:
                entity.proposalTypeString = "FEES";
                proposalState = BigInt.fromI32(flexDaosetContract.feesProposals(event.params.daoAddr,
                    event.params.proposalId).getState());
                break;
            case 5:
                proposalState = BigInt.fromI32(flexDaosetContract.proposerMembershipProposals(event.params.daoAddr,
                    event.params.proposalId).getState());
                break;
            case 6:
                proposalState = BigInt.fromI32(flexDaosetPollingContract.pollForInvestmentProposals(event.params.daoAddr,
                    event.params.proposalId).getState());
                break;
            default:
                proposalState = BigInt.fromI32(0);
                break;
        }
        entity.state = proposalState;

        entity.save();
    }

    let voteInfoEntity = FlexProposalVoteInfo.load(event.params.proposalId.toHexString());

    if (voteInfoEntity) {
        voteInfoEntity.nbYes = event.params.nbYes;
        voteInfoEntity.nbNo = event.params.nbNo;
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }
}