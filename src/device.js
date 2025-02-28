/**
 * @class BaseDevice
 */
export class BaseDevice {
    /**
     * @param {ThinQApi} thinqApi
     * @param {string} deviceId
     * @param {string} deviceType
     * @param {string} modelName
     * @param {string} alias
     * @param {boolean} reportable
     */
    constructor(thinqApi, deviceId, deviceType, modelName, alias, reportable) {
        this.thinqApi = thinqApi;
        this.deviceId = deviceId;
        this.deviceType = deviceType;
        this.modelName = modelName;
        this.alias = alias;
        this.reportable = reportable;
    }

    /**
     * @type {string}
     */
    get deviceType() {
        return this._deviceType;
    }

    /**
     * @param {string} deviceType
     */
    set deviceType(deviceType) {
        this._deviceType = deviceType;
    }

    /**
     * @type {string}
     */
    get modelName() {
        return this._modelName;
    }

    /**
     * @param {string} modelName
     */
    set modelName(modelName) {
        this._modelName = modelName;
    }

    /**
     * @type {string}
     */
    get alias() {
        return this._alias;
    }

    /**
     * @param {string} alias
     */
    set alias(alias) {
        this._alias = alias;
    }

    /**
     * @type {boolean}
     */
    get reportable() {
        return this._reportable;
    }

    /**
     * @param {boolean} reportable
     */
    set reportable(reportable) {
        this._reportable = reportable;
    }

    /**
     * @type {string}
     */
    get deviceId() {
        return this._deviceId;
    }

    /**
     * @param {string} deviceId
     */
    set deviceId(deviceId) {
        this._deviceId = deviceId;
    }
}