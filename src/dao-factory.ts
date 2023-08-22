/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2023-01-05 19:50:32
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-03-01 09:28:08
 */
import { BigInt } from "@graphprotocol/graph-ts"
import {
    DaoFactory,
    DAOCreated,
    OwnerChanged
} from "../generated/DaoFactory/DaoFactory"
import { DaoEntiy } from "../generated/schema"

export function handleDaoCreated(event: DAOCreated): void {
    let entity = DaoEntiy.load(event.params._name)

    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new DaoEntiy(event.params._name)

        entity.daoAddr = event.params._address;
        entity.daoName = event.params._name;
        entity.creator = event.params._creator;
        entity.daoType = "unknow";
        entity.createTimeStamp = event.block.timestamp;
        // entity.createDateTime = new Date(event.block.timestamp.toI64() * 1000).toISOString();
        entity.createDateTime = new Date(event.block.timestamp.toI64() * 1000).
            toString();

    }
    else {
        entity.daoName = event.params._name;
    }
    entity.save()
}

export function handleOwnerChanged(event: OwnerChanged): void {

}
