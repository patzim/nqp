'use strict';

const globalContext = require('./global-context.js');

const NQPObject = require('./nqp-object.js');

/**
 * A serialization context holds a list of objects and code references that live
 * within a serialization boundary.
 */

/**
 * @constructor
 * @public handle The handle of this SC.
 * @public description Description (probably the file name) if any.
 * @public rootObjects The root set of objects that live in this SC.
 * @public rootSTables The root set of STables that live in this SC.
 * @public rootCodes The root set of code refs that live in this SC.
 * @public repIndexes Repossession info. The following lists have matching indexes, each
 * representing the integer of an object in our root set along with the SC
 * that the object was originally from.
 * @public repScs
*/

class SerializationContext extends NQPObject {
  constructor(handle) {
    super();
    this.description = '???';
    this.handle = handle;
    this.rootObjects = [];
    this.rootSTables = [];
    this.rootCodes = [];
    this.repIndexes = [];
    this.repScs = [];
    /* Some things we deserialize (BOOTArray, BOOTHash) are not directly in an SC, root set, but
     * rather are owned by others. This is mostly thanks to Parrot legacy,
     * where not everything was a 6model object. This maps such owned
     * objects to their owner. It is used to determine what object should
     * be repossessed in the case a write barrier is hit. */

    this.ownedObjects = new Map();
  }

  setObj(idx, obj) {
    this.rootObjects[idx] = obj;
    if (!obj.$$STable.$$SC) {
      this.rootSTables.push(obj.$$STable);
      obj.$$STable.$$SC = this;
    }
  }

  getCodeIndex(codeRef) {
    return this.rootCodes.indexOf(codeRef);
  }

  repossessSTable(STable) {
    const newSlot = this.rootSTables.length;
    this.rootSTables.push(STable);

    this.repIndexes.push((newSlot << 1) | 1);
    this.repScs.push(STable.$$SC);

    STable.$$SC = this;
  }

  repossessObject(obj) {
    const newSlot = this.rootObjects.length;
    this.rootObjects.push(obj);

    this.repIndexes.push((newSlot << 1));
    this.repScs.push(obj.$$SC);

    obj.$$SC = this;
  }

  $$toBool(ctx) {
    return 1;
  }
};

module.exports = SerializationContext;
