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
import { DaoEntiy, VintageDaoEntity, VintageDaoEntityCounter } from "../generated/schema"

export function handleVintageDaoCreated(event: VintageDaoCreated): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let vintageDaoEntity = VintageDaoEntity.load(event.params.daoAddr.toHexString())
    let counterEntity = VintageDaoEntityCounter.load(event.address.toHexString());
    let entity = DaoEntiy.load(event.params.daoAddr.toHexString());

    if (entity) {
        entity.daoType = "vintage";
        entity.save();
    }

    if (!counterEntity) {
        counterEntity = new VintageDaoEntityCounter(event.address.toHexString());
        counterEntity.count = BigInt.fromI32(0);
    }
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!vintageDaoEntity) {
        vintageDaoEntity = new VintageDaoEntity(event.params.daoAddr.toHexString())

        // // Entity fields can be set based on event parameters
        vintageDaoEntity.daoAddr = event.params.daoAddr;
        vintageDaoEntity.daoName = event.params.name;
        vintageDaoEntity.creator = event.params.creator;
        vintageDaoEntity.createTimeStamp = event.block.timestamp;
        vintageDaoEntity.createDateTime = new Date(event.block.timestamp.toI64() * 1000).toISOString();
        vintageDaoEntity.save();

        counterEntity.count = counterEntity.count.plus(BigInt.fromI32(1));
        counterEntity.save();
    }
}
