/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-16 17:01:41
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-10-08 13:46:14
 */
import {
    AllocateToken as AllocateTokenEvent,
    ConfigureDao as ConfigureDaoEvent,
    VintageAllocationAdapterContract
} from "../generated/VintageAllocationAdapterContract/VintageAllocationAdapterContract"
import {
    VintageFundingProposalInfo,
    VintageVestingEligibleUsers,
    VintageUserVestInfo
} from "../generated/schema"
import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"

export function handleAllocateToken(event: AllocateTokenEvent): void {
    let entity = VintageVestingEligibleUsers.load(event.params.proposalId.toHexString())
    if (!entity) {
        entity = new VintageVestingEligibleUsers(event.params.proposalId.toHexString())
    }

    entity.proposalId = event.params.proposalId
    entity.proposer = event.params.proposer

    let tem: string[] = [];

    if (event.params.lps.length > 0) {
        for (var j = 0; j < event.params.lps.length; j++) {
            tem.push(event.params.lps[j].toHexString())
        }
    }
    entity.lps = tem;
    entity.save()


    let vintageFundingProposalEntity = VintageFundingProposalInfo.load(event.params.proposalId.toHexString())
    if (vintageFundingProposalEntity) {
        const vestingStartTime = vintageFundingProposalEntity.vestingStartTime;
        const vestingCliffEndTime = vintageFundingProposalEntity.vestingCliffEndTime;
        const vestingInterval = vintageFundingProposalEntity.vestingInterval;
        const vestingEndTime = vintageFundingProposalEntity.vetingEndTime;

        let allocContract = VintageAllocationAdapterContract.bind(event.address);

        for (var i = 0; i < entity.lps.length; i++) {
            let vintageUserVestInfo = new VintageUserVestInfo(entity.proposalId.toHexString() + "-" + entity.lps[i]);
            vintageUserVestInfo.daoAddr = event.params.daoAddr;
            vintageUserVestInfo.fundingProposalId = event.params.proposalId;
            vintageUserVestInfo.recipient = Bytes.fromHexString(entity.lps[i]);
            let vestInfo = allocContract.vestingInfos(
                event.params.daoAddr,
                vintageUserVestInfo.fundingProposalId,
                Address.fromBytes(vintageUserVestInfo.recipient)
            );
            vintageUserVestInfo.vestingStartTime = vestingStartTime;
            vintageUserVestInfo.vestingCliffEndTime = vestingCliffEndTime;
            vintageUserVestInfo.vestingInterval = vestingInterval;
            vintageUserVestInfo.vestingEndTime = vestingEndTime;
            vintageUserVestInfo.totalAmount = vestInfo.getTokenAmount();
            vintageUserVestInfo.created = false;

            vintageUserVestInfo.save();
        }
    }

}

export function handleConfigureDao(event: ConfigureDaoEvent): void { }

