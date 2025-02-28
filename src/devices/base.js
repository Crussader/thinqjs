import { 
    PROPERTY_READABLE, 
    PROPERTY_WRITABLE, 
    DeviceLocation as Location, 
    Property, 
    Resource 
} from '../const';
import { BaseDevice } from '../device';
import { ThinQApi } from '../thinq_api';

const TYPE = "type";
const UNIT = "unit";
const READABILITY = "readable";
const WRITABILITY = "writable";
const READABLE_VALUES = "read_values";
const WRITABLE_VALUES = "write_values";

class ConnectDeviceProfile {
    constructor(
        profile,
        resourceMap = {},
        profileMap = {},
        locationMap = {},
        customResources = [],
        useExtensionProperty = false,
        useSubProfileOnly = false,
        useNotification = true
    ) {
        this._RESOURCE_MAP = resourceMap;
        this._LOCATION_MAP = locationMap;
        this._PROFILE = profileMap;
        this._CUSTOM_RESOURCES = customResources;

        this._properties = {};
        this._locationProperties = {};

        this.generateNotification(useNotification ? profile.notification : null);

        if (!useSubProfileOnly) {
            this.generateError(profile.error);
            this.generateProperties(
                profile[useExtensionProperty ? "extensionProperty" : "property"]
            );
            this.generatePropertyMap();
        } else {
            this._error = null;
        }
    }

    static _safeGet(data, ...keys) {
        for (const key of keys) {
            data = data[key];
            if (!data) {
                return null;
            }
        }
        return data;
    }

    static _isReadableProperty(property) {
        return (property.constructor != Object) || property.mode.includes('r');
    }

    static _isWritableProperty(property) {
        return (property.constructor == Object) && property.mode.includes('w');
    }

    static _disablePropModeValue(type) {
        return type === 'range' ? {} : [];
    }

    static _getReadonlyStringProperty(value) {
        return {
            [TYPE]: 'string',
            [READABILITY]: true,
            [WRITABILITY]: false,
            [READABLE_VALUES]: [value],
            [WRITABLE_VALUES]: [],
        };
    }
    static _getReadonlyEnumProperty(values) {
        return {
            [TYPE]: 'enum',
            [READABILITY]: true,
            [WRITABILITY]: false,
            [READABLE_VALUES]: values,
            [WRITABLE_VALUES]: [],
        };
    }

    static _getProperties(resourceProperty, key) {
        const _property = resourceProperty[key] || {};
        if (typeof _property === 'string') {
            return ConnectDeviceProfile._getReadonlyStringProperty(_property);
        }

        // Dont want undefined as a value rather null is better
        const _property_type = _property[TYPE] || null;
        const _property_unit = _property[UNIT] || resourceProperty[UNIT] || null;
        const prop = {
            [TYPE]: _property_type,
            [READABILITY]: ConnectDeviceProfile._isReadableProperty(_property),
            [WRITABILITY]: ConnectDeviceProfile._isWritableProperty(_property),
            ...(_property_unit ? { [UNIT]: _property_unit } : {}),
        };

        if (typeof _property === 'object' && ['enum', 'range', 'list'].includes(_property_type)) {
            prop[READABLE_VALUES] = prop[READABILITY]
                ? ConnectDeviceProfile._safeGet(resourceProperty, key, 'value', PROPERTY_READABLE)
                : ConnectDeviceProfile._disablePropModeValue(_property_type);
            prop[WRITABLE_VALUES] = prop[WRITABILITY]
                ? ConnectDeviceProfile._safeGet(resourceProperty, key, 'value', PROPERTY_WRITABLE)
                : ConnectDeviceProfile._disablePropModeValue(_property_type);
        }

        return prop;
    }

    get properties() {
        return this._properties;
    }

    get locationProperties() {
        return this._locationProperties;
    }

    get propertyMap() {
        return this._propertyMap;
    }

    get writableProperties() {
        const writableProps = [];
        for (const resource of Object.keys(this.properties)) {
            writableProps.push(...this[resource]["w"]);
        }
        return writableProps;
    }

    get notification() {
        return this._notification ? ConnectDeviceProfile._convertPropertyToProfile(this._notification) : null;
    }

    get error() {
        return this._error ? ConnectDeviceProfile._convertPropertyToProfile(this._error) : null;
    }

    get locations() {
        return Object.keys(this._locationProperties);
    }

    getSubProfile(locationName) {
        return this.locations.includes(locationName) ? this[locationName] : null;
    }

    getLocationKey(locationName) {
        for (const [key, name] of Object.entries(this._LOCATION_MAP)) {
            if (name === locationName) {
                return key;
            }
        }
        return null;
    }

    static _convertPropertyToProfile(prop) {
        if (prop[READABLE_VALUES] || prop[WRITABLE_VALUES]) {
            return {
                [TYPE]: prop[TYPE],
                [PROPERTY_READABLE]: prop[READABLE_VALUES],
                [PROPERTY_WRITABLE]: prop[WRITABLE_VALUES],
                ...(prop[UNIT] ? { [UNIT]: prop[UNIT] } : {}),
            };
        }
        return { [TYPE]: prop[TYPE], [PROPERTY_READABLE]: prop[READABILITY], [PROPERTY_WRITABLE]: prop[WRITABILITY] };
    }

    getProperty(propertyName) {
        const prop = this._getPropAttr(propertyName);
        return ConnectDeviceProfile._convertPropertyToProfile(prop);
    }

    getProfile() {
        return this._PROFILE;
    }

    generateError(errors) {
        this._error = errors ? this.constructor._getReadonlyEnumProperty(errors) : null;
    }

    generateNotification(notification) {
        const notificationPush = notification && notification.push;
        this._notification = notificationPush ? this.constructor._getReadonlyEnumProperty(notificationPush) : null;
    }

    _getPropAttr(key) {
        return this[`__${key}`];
    }

    _setPropAttr(key, prop) {
        this[`__${key}`] = prop;
    }

    _setResourceProps(resource, props) {
        if (this.hasOwnProperty(resource)) {
            const oldProps = this[resource];
            if (oldProps && props) {
                for (const mode of ["r", "w"]) {
                    props[mode] = oldProps[mode].concat(props[mode]);
                }
            } else if (oldProps) {
                props = oldProps;
            }
        }
        this[resource] = props;
    }

    _setSubProfile(locationName, subProfile) {
        this[locationName] = subProfile;
    }

    _setProperties(resource, value) {
        this._properties[resource.value] = (this._properties[resource.value] || []).concat(value);
    }

    _setLocationProperties(location, value) {
        this._locationProperties[location.value] = value;
    }

    _generateCustomResourceProperties(resourceKey, resourceProperty, props) {
        const readableProps = [];
        const writableProps = [];
        // Need to be implemented by child classes
        return [readableProps, writableProps];
    }

    _generateResourceProperties(resourceProperty, props) {
        const readableProps = [];
        const writableProps = [];

        for (const [propKey, propAttr] of Object.entries(props)) {
            const prop = this.constructor._getProperties(resourceProperty, propKey);
            if (prop[READABILITY]) {
                readableProps.push(String(propAttr));
            }
            if (prop[WRITABILITY]) {
                writableProps.push(String(propAttr));
            }
            this._setPropAttr(propAttr, prop);
        }
        return [readableProps, writableProps];
    }

    generateProperties(property) {
        if (!property) {
            throw new Error("Property value is None");
        }
        for (const [resource, props] of Object.entries(this._PROFILE)) {
            const resourceProperty = property[resource];
            const readable = null;
            const writable = null;
            if (resourceProperty) {
                if (this._CUSTOM_RESOURCES.includes(resource)) {
                    [readable, writable] = this._generateCustomResourceProperties(resource, resourceProperty, props);
                } else if (typeof resourceProperty === 'object') {
                    [readable, writable] = this._generateResourceProperties(resourceProperty, props);
                }
                const readableList = readable || [];
                const writableList = writable || [];
                if (readableList.length || writableList.length) {
                    this._setProperties(this._RESOURCE_MAP[resource], [...new Set([...readableList, ...writableList])]);
                }
                this._setResourceProps(this._RESOURCE_MAP[resource], { r: readable, w: writable });
            } else {
                this._setResourceProps(this._RESOURCE_MAP[resource], null);
                for (const propAttr of Object.values(props)) {
                    this._setPropAttr(propAttr, { [READABILITY]: false, [WRITABILITY]: false });
                }
            }
        }
    }

    generatePropertyMap() {
        this._propertyMap = {};
        for (const properties of Object.values(this.properties)) {
            for (const prop of properties) {
                this._propertyMap[prop] = this.getProperty(prop);
            }
        }
        if (this.notification) {
            this._propertyMap["notification"] = this.notification;
        }
        if (this.error) {
            this._propertyMap["error"] = this.error;
        }
    }

    checkAttributeReadable(propAttr) {
        return this._getPropAttr(propAttr)[READABILITY];
    }

    checkAttributeWritable(propAttr) {
        return this._getPropAttr(propAttr)[WRITABILITY];
    }

    checkRangeAttributeWritable(propAttr, value) {
        const values = this._getPropAttr(propAttr)[WRITABLE_VALUES];
        if (!values) {
            return false;
        }
        const { min, max, step = 1, except = [] } = values;
        return min <= value && value <= max && (value - min) % step === 0 && !except.includes(value);
    }

    checkEnumAttributeWritable(propAttr, value) {
        return this._getPropAttr(propAttr)[WRITABILITY] && this._getPropAttr(propAttr)[WRITABLE_VALUES].includes(value);
    }

    _getAttributePayload(attribute, value) {
        for (const [resource, props] of Object.entries(this._PROFILE)) {
            for (const [propKey, propAttr] of Object.entries(props)) {
                if (propAttr === attribute) {
                    return { [resource]: { [propKey]: value } };
                }
            }
        }
    }

    getAttributePayload(attribute, value) {
        if (!this.checkAttributeWritable(attribute)) {
            throw new Error(`Not support ${attribute}`);
        }
        return this._getAttributePayload(attribute, value);
    }

    getRangeAttributePayload(attribute, value) {
        if (!this.checkRangeAttributeWritable(attribute, value)) {
            throw new Error(`Not support ${attribute} : ${value}`);
        }
        return this._getAttributePayload(attribute, value);
    }

    getEnumAttributePayload(attribute, value) {
        if (!this.checkEnumAttributeWritable(attribute, value)) {
            throw new Error(`Not support ${attribute} : ${value}`);
        }
        return this._getAttributePayload(attribute, value);
    }
}

class ConnectSubDeviceProfile extends ConnectDeviceProfile {
    constructor(
        profile,
        locationName,
        resourceMap = {},
        profileMap = {},
        customResources = [],
        useSubNotification = false
    ) {
        super(
            profile,
            resourceMap,
            profileMap,
            {},
            customResources,
            false,
            false,
            useSubNotification
        );
        this._locationName = locationName;
    }
}

class ConnectBaseDevice extends BaseDevice {
    static _CUSTOM_SET_PROPERTY_NAME = {};

    constructor(
        thinqApi,
        deviceId,
        deviceType,
        modelName,
        alias,
        reportable,
        profiles
    ) {
        super(
            thinqApi,
            deviceId,
            deviceType,
            modelName,
            alias,
            reportable
        );
        this._profiles = profiles;
        this._subDevices = {};
    }
    
    get profiles() {
        return this._profiles;
    }

    getPropertyKey(resource, originKey) {
        const resourceProfile = this.profiles.getProfile()[resource] || {};
        const propKey = resourceProfile[originKey];
        return propKey ? String(propKey) : null;
    }

    __returnExistFunName(fnName) {
        return typeof this[fnName] === 'function' ? fnName : null;
    }

    getPropertySetFn(propertyName) {
        let fnName = null;
        if (!Object.keys(ConnectBaseDevice._CUSTOM_SET_PROPERTY_NAME).includes(propertyName)) {
            fnName = this.__returnExistFunName(`set_${propertyName}`);
        } else {
            fnName = this.__returnExistFunName(`set_${ConnectBaseDevice._CUSTOM_SET_PROPERTY_NAME[propertyName]}`);
        }
        return fnName;
    }

    getSubDevice(locationName) {
        return this._profiles.locations.includes(locationName) ? this._subDevices[locationName] : null;
    }

    __setPropertyStatus(resourceStatus, resource, propKey, propAttr, isUpdated = false) {
        if (propAttr === "locationName") {
            return;
        }

        let value = null;
        if (resourceStatus !== null) {
            if (this._profiles._CUSTOM_RESOURCES.includes(resource)) {
                if (this._setCustomResources(propKey, propAttr, resourceStatus, isUpdated)) {
                    return;
                }
            }
            if (typeof resourceStatus === 'object' && resourceStatus !== null) {
                value = resourceStatus[propKey];
            }
            if (isUpdated) {
                if (propKey in resourceStatus) {
                    this._setStatusAttr(propAttr, value);
                }
                return;
            }
        }

        this._setStatusAttr(propAttr, value);
    }

    _setStatusAttr(propertyName, value) {
        this[propertyName] = value;
    }

    __setErrorStatus(status) {
        if (this._profiles.error) {
            this._setStatusAttr("error", status["error"]);
        }
    }

    __setStatus(status) {
        for (const [resource, props] of Object.entries(this._profiles.getProfile())) {
            const resourceStatus = status[resource];
            for (const [propKey, propAttr] of Object.entries(props)) {
                this.__setPropertyStatus(resourceStatus, resource, propKey, propAttr);
            }
        }
    }

    __updateStatus(status) {
        const deviceProfile = this._profiles.getProfile();
        for (const [resource, resourceStatus] of Object.entries(status)) {
            if (!(resource in deviceProfile)) {
                continue;
            }
            for (const [propKey, propAttr] of Object.entries(deviceProfile[resource])) {
                this.__setPropertyStatus(resourceStatus, resource, propKey, propAttr, true);
            }
        }
    }

    _setStatus(status, isUpdated = false) {
        if (typeof status !== 'object' || status === null) {
            return;
        }
        this.__setErrorStatus(status);
        if (isUpdated) {
            this.__updateStatus(status);
        } else {
            this.__setStatus(status);
        }
    }

    getStatus(propertyName) {
        return (
            this.hasOwnProperty(propertyName) && (propertyName === "error" || this.profiles.checkAttributeReadable(propertyName))
                ? this[propertyName]
                : null
        );
    }

    setStatus(status) {
        this._setStatus(status);
    }

    updateStatus(status) {
        this._setStatus(status, true);
    }

    async _doAttributeCommand(payload) {
        return await this.thinqApi.asyncPostDeviceControl(this.deviceId, payload);
    }

    async doAttributeCommand(attribute, value) {
        return await this._doAttributeCommand(this.profiles.getAttributePayload(attribute, value));
    }

    async doMultiAttributeCommand(attributes) {
        const payload = {};
        for (const [attr, value] of Object.entries(attributes)) {
            const attributePayload = this.profiles.getAttributePayload(attr, value);
            for (const key in attributePayload) {
                if (payload[key]) {
                    Object.assign(payload[key], attributePayload[key]);
                } else {
                    payload[key] = attributePayload[key];
                }
            }
        }
        return await this._doAttributeCommand(payload);
    }

    async doRangeAttributeCommand(attribute, value) {
        return await this._doAttributeCommand(this.profiles.getRangeAttributePayload(attribute, value));
    }

    async doMultiRangeAttributeCommand(attributes) {
        const payload = {};
        for (const [attr, value] of Object.entries(attributes)) {
            const attributePayload = this.profiles.getRangeAttributePayload(attr, value);
            for (const key in attributePayload) {
                if (payload[key]) {
                    Object.assign(payload[key], attributePayload[key]);
                } else {
                    payload[key] = attributePayload[key];
                }
            }
        }
        return await this._doAttributeCommand(payload);
    }

    async doEnumAttributeCommand(attribute, value) {
        return await this._doAttributeCommand(this.profiles.getEnumAttributePayload(attribute, value));
    }
}

class ConnectMainDevice extends ConnectBaseDevice {
    constructor(
        thinqApi,
        deviceId,
        deviceType,
        modelName,
        alias,
        reportable,
        profiles,
        subDeviceType
    ) {
        super(
            thinqApi,
            deviceId,
            deviceType,
            modelName,
            alias,
            reportable,
            profiles
        );
        this._subDevices = {};
        for (const locationName of this._profiles.locations) {
            const _subDevice = new subDeviceType(
                thinqApi,
                deviceId,
                deviceType,
                modelName,
                alias,
                reportable,
                this._profiles.getSubProfile(locationName),
                this._profiles.getLocationKey(locationName)
            );
            this._setSubDevice(locationName, _subDevice);
            this._subDevices[locationName] = _subDevice;
        }
    }

    _setSubDevice(locationName, subDevice) {
        this[locationName] = subDevice;
    }

    setStatus(status) {
        super.setStatus(status);
        for (const subDevice of Object.values(this._subDevices)) {
            subDevice.setStatus(status);
        }
    }

    updateStatus(status) {
        super.updateStatus(status);
        for (const subDevice of Object.values(this._subDevices)) {
            subDevice.updateStatus(status);
        }
    }
}

class ConnectSubDevice extends ConnectBaseDevice {
    constructor(
        profiles,
        locationName,
        thinqApi,
        deviceId,
        deviceType,
        modelName,
        alias,
        reportable,
        isSingleResource = false
    ) {
        super(thinqApi, deviceId, deviceType, modelName, alias, reportable, profiles);
        this._locationName = locationName;
        this._isSingleResource = isSingleResource;
    }

    get locationName() {
        return this._locationName;
    }

    _getLocationNameFromStatus(locationStatus) {
        if (this._isSingleResource) {
            return locationStatus?.locationName || null;
        } else {
            return locationStatus?.location?.locationName || null;
        }
    }

    _isCurrentLocationStatus(locationStatus) {
        return this._getLocationNameFromStatus(locationStatus) === this._locationName;
    }

    _setStatus(status, isUpdated = false) {
        if (Array.isArray(status)) {
            for (const locationStatus of status) {
                if (!this._isCurrentLocationStatus(locationStatus)) {
                    continue;
                }
                super._setStatus(locationStatus, isUpdated);
                return;
            }
            return;
        }
        for (const resource of this._profiles._CUSTOM_RESOURCES) {
            for (const locationStatus of status?.[resource] || []) {
                if (!this._isCurrentLocationStatus(locationStatus)) {
                    continue;
                }
                super._setStatus({ [resource]: locationStatus }, isUpdated);
                return;
            }
        }
    }
}