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
            try {
                data = data[key];
            } catch (e) {
                if (e instanceof TypeError || e instanceof KeyError) {
                    return null;
                }
                throw e;
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

