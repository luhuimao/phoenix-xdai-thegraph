/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2023-01-05 19:50:32
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-02-08 15:26:44
 */
import { BigInt } from "@graphprotocol/graph-ts"
import {
    SummonVintageDao,
    VintageDaoCreated
} from "../generated/SummonVintageDao/SummonVintageDao"
import { DaoEntiy } from "../generated/schema"



export function handleVintageDaoCreated(event: VintageDaoCreated): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = DaoEntiy.load(event.params.name)

    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new DaoEntiy(event.params.name)

        // Entity fields can be set based on event parameters
        entity.daoAddr = event.params.daoAddr;
        entity.daoName = event.params.name;
        entity.creator = event.params.creator;
        entity.daoType = "vintage";
        entity.createTimeStamp = event.block.timestamp;
        entity.createDateTime = new Date(event.block.timestamp.toI64() * 1000).toISOString();
    } else {
        entity.daoType = "vintage";
    }
    // Entities can be written to the store with `.save()`
    // entity.save()
}
