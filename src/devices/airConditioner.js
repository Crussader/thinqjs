import { ThinQApi } from '../api.js';
import { WRITABILITY, READABILITY, ConnectBaseDevice, ConnectDeviceProfile } from './base.js';
import { Property, Resource } from '../const.js';

class AirConditionerProfile extends ConnectDeviceProfile {
    constructor(profile) {
        super({
            profile: profile,
            resource_map: {
                airConJobMode: Resource.AIR_CON_JOB_MODE,
                operation: Resource.OPERATION,
                temperatureInUnits: Resource.TEMPERATURE,
                twoSetTemperature: Resource.TWO_SET_TEMPERATURE,
                twoSetTemperatureInUnits: Resource.TWO_SET_TEMPERATURE,
                timer: Resource.TIMER,
                sleepTimer: Resource.SLEEP_TIMER,
                powerSave: Resource.POWER_SAVE,
                airFlow: Resource.AIR_FLOW,
                airQualitySensor: Resource.AIR_QUALITY_SENSOR,
                filterInfo: Resource.FILTER_INFO,
                display: Resource.DISPLAY,
                windDirection: Resource.WIND_DIRECTION,
            },
            profile_map: {
                airConJobMode: {
                    currentJobMode: Property.CURRENT_JOB_MODE,
                },
                operation: {
                    airConOperationMode: Property.AIR_CON_OPERATION_MODE,
                    airCleanOperationMode: Property.AIR_CLEAN_OPERATION_MODE,
                },
                temperatureInUnits: {
                    currentTemperatureC: Property.CURRENT_TEMPERATURE_C,
                    currentTemperatureF: Property.CURRENT_TEMPERATURE_F,
                    targetTemperatureC: Property.TARGET_TEMPERATURE_C,
                    targetTemperatureF: Property.TARGET_TEMPERATURE_F,
                    heatTargetTemperatureC: Property.HEAT_TARGET_TEMPERATURE_C,
                    heatTargetTemperatureF: Property.HEAT_TARGET_TEMPERATURE_F,
                    coolTargetTemperatureC: Property.COOL_TARGET_TEMPERATURE_C,
                    coolTargetTemperatureF: Property.COOL_TARGET_TEMPERATURE_F,
                    unit: Property.TEMPERATURE_UNIT,
                },
                twoSetTemperature: {
                    twoSetEnabled: Property.TWO_SET_ENABLED,
                },
                twoSetTemperatureInUnits: {
                    heatTargetTemperatureC: Property.TWO_SET_HEAT_TARGET_TEMPERATURE_C,
                    heatTargetTemperatureF: Property.TWO_SET_HEAT_TARGET_TEMPERATURE_F,
                    coolTargetTemperatureC: Property.TWO_SET_COOL_TARGET_TEMPERATURE_C,
                    coolTargetTemperatureF: Property.TWO_SET_COOL_TARGET_TEMPERATURE_F,
                    unit: Property.TWO_SET_TEMPERATURE_UNIT,
                },
                timer: {
                    relativeHourToStart: Property.RELATIVE_HOUR_TO_START,
                    relativeMinuteToStart: Property.RELATIVE_MINUTE_TO_START,
                    relativeHourToStop: Property.RELATIVE_HOUR_TO_STOP,
                    relativeMinuteToStop: Property.RELATIVE_MINUTE_TO_STOP,
                    absoluteHourToStart: Property.ABSOLUTE_HOUR_TO_START,
                    absoluteMinuteToStart: Property.ABSOLUTE_MINUTE_TO_START,
                    absoluteHourToStop: Property.ABSOLUTE_HOUR_TO_STOP,
                    absoluteMinuteToStop: Property.ABSOLUTE_MINUTE_TO_STOP,
                },
                sleepTimer: {
                    relativeHourToStop: Property.SLEEP_TIMER_RELATIVE_HOUR_TO_STOP,
                    relativeMinuteToStop: Property.SLEEP_TIMER_RELATIVE_MINUTE_TO_STOP,
                },
                powerSave: {
                    powerSaveEnabled: Property.POWER_SAVE_ENABLED,
                },
                airFlow: {
                    windStrength: Property.WIND_STRENGTH,
                    windStep: Property.WIND_STEP,
                },
                airQualitySensor: {
                    PM1: Property.PM1,
                    PM2: Property.PM2,
                    PM10: Property.PM10,
                    odor: Property.ODOR,
                    odorLevel: Property.ODOR_LEVEL,
                    humidity: Property.HUMIDITY,
                    totalPollution: Property.TOTAL_POLLUTION,
                    totalPollutionLevel: Property.TOTAL_POLLUTION_LEVEL,
                    monitoringEnabled: Property.MONITORING_ENABLED,
                },
                filterInfo: {
                    usedTime: Property.USED_TIME,
                    filterLifetime: Property.FILTER_LIFETIME,
                    filterRemainPercent: Property.FILTER_REMAIN_PERCENT,
                },
                display: { light: Property.DISPLAY_LIGHT },
                windDirection: {
                    rotateUpDown: Property.WIND_ROTATE_UP_DOWN,
                    rotateLeftRight: Property.WIND_ROTATE_LEFT_RIGHT,
                },
            },
            custom_resources: ["twoSetTemperature", "temperatureInUnits", "twoSetTemperatureInUnits"],
        });

        this._CUSTOM_PROPERTY_MAPPING_TABLE = {
            [Property.CURRENT_TEMPERATURE_C]: "currentTemperature",
            [Property.CURRENT_TEMPERATURE_F]: "currentTemperature",
            [Property.TARGET_TEMPERATURE_C]: "targetTemperature",
            [Property.TARGET_TEMPERATURE_F]: "targetTemperature",
            [Property.HEAT_TARGET_TEMPERATURE_C]: "heatTargetTemperature",
            [Property.HEAT_TARGET_TEMPERATURE_F]: "heatTargetTemperature",
            [Property.COOL_TARGET_TEMPERATURE_C]: "coolTargetTemperature",
            [Property.COOL_TARGET_TEMPERATURE_F]: "coolTargetTemperature",
            [Property.TWO_SET_HEAT_TARGET_TEMPERATURE_C]: "heatTargetTemperature",
            [Property.TWO_SET_HEAT_TARGET_TEMPERATURE_F]: "heatTargetTemperature",
            [Property.TWO_SET_COOL_TARGET_TEMPERATURE_C]: "coolTargetTemperature",
            [Property.TWO_SET_COOL_TARGET_TEMPERATURE_F]: "coolTargetTemperature",
        };
    }

    check_attribute_writable(prop_attr) {
        return (
            [Property.TEMPERATURE_UNIT, Property.TWO_SET_TEMPERATURE_UNIT].includes(prop_attr) ||
            this._get_prop_attr(prop_attr)[WRITABILITY]
        );
    }

    _get_attribute_payload(attribute, value) {
        for (const [resource, props] of Object.entries(this._PROFILE)) {
            for (const [prop_key, prop_attr] of Object.entries(props)) {
                if (prop_attr === attribute) {
                    return attribute in this._CUSTOM_PROPERTY_MAPPING_TABLE
                        ? { [resource]: { [this._CUSTOM_PROPERTY_MAPPING_TABLE[attribute]]: value } }
                        : { [resource]: { [prop_key]: value } };
                }
            }
        }
    }

    _generate_custom_resource_properties(resource_key, resource_property, props) {
        const readable_props = [];
        const writable_props = [];

        if (!this._CUSTOM_RESOURCES.includes(resource_key)) {
            return [readable_props, writable_props];
        }

        if (resource_key === "twoSetTemperature") {
            for (const [prop_key, prop_attr] of Object.entries(props)) {
                const prop = this._get_properties(resource_property, prop_key);
                if (prop[READABILITY]) readable_props.push(String(prop_attr));
                if (prop[WRITABILITY]) writable_props.push(String(prop_attr));
                this._set_prop_attr(prop_attr, prop);
            }
            return [readable_props, writable_props];
        }

        const units = [];

        for (const temperatures of resource_property) {
            const unit = temperatures.unit;
            for (const [prop_key, prop_attr] of Object.entries(props)) {
                if (prop_key.slice(-1) !== unit) continue;
                const prop = this._get_properties(temperatures, prop_key.slice(0, -1));
                if (prop[READABILITY]) readable_props.push(String(prop_attr));
                if (prop[WRITABILITY]) writable_props.push(String(prop_attr));
                this._set_prop_attr(prop_attr, prop);
            }
            units.push(unit);
        }

        const prop_attr = props.unit;
        const prop = this._get_readonly_enum_property(units);
        if (prop[READABILITY]) readable_props.push(String(prop_attr));
        if (prop[WRITABILITY]) writable_props.push(String(prop_attr));
        this._set_prop_attr(prop_attr, prop);

        return [readable_props, writable_props];
    }
}

class AirConditionerDevice extends ConnectBaseDevice {
    /**
     * Constructs an instance of the AirConditioner class.
     * 
     * @param {ThinQApi} thinq_api - The ThinQ API instance.
     * @param {string} device_id - The unique identifier for the device.
     * @param {string} device_type - The type of the device.
     * @param {string} model_name - The model name of the device.
     * @param {string} alias - The alias name for the device.
     * @param {boolean} reportable - Indicates if the device is reportable.
     * @param {ConnectDeviceProfile} profile - The profile configuration for the air conditioner.
     */
    constructor(thinq_api, device_id, device_type, model_name, alias, reportable, profile) {
        super({
            thinq_api: thinq_api,
            device_id: device_id,
            device_type: device_type,
            model_name: model_name,
            alias: alias,
            reportable: reportable,
            profiles: new AirConditionerProfile(profile),
        });

        this._CUSTOM_SET_PROPERTY_NAME = {
            [Property.RELATIVE_HOUR_TO_START]: "relative_time_to_start",
            [Property.RELATIVE_MINUTE_TO_START]: "relative_time_to_start",
            [Property.RELATIVE_HOUR_TO_STOP]: "relative_time_to_stop",
            [Property.RELATIVE_MINUTE_TO_STOP]: "relative_time_to_stop",
            [Property.ABSOLUTE_HOUR_TO_START]: "absolute_time_to_start",
            [Property.ABSOLUTE_MINUTE_TO_START]: "absolute_time_to_start",
            [Property.ABSOLUTE_HOUR_TO_STOP]: "absolute_time_to_stop",
            [Property.ABSOLUTE_MINUTE_TO_STOP]: "absolute_time_to_stop",
            [Property.SLEEP_TIMER_RELATIVE_HOUR_TO_STOP]: "sleep_timer_relative_time_to_stop",
            [Property.SLEEP_TIMER_RELATIVE_MINUTE_TO_STOP]: "sleep_timer_relative_time_to_stop",
        };
    }

    get profiles() {
        return this._profiles;
    }

    _set_custom_resources(prop_key, attribute, resource_status, is_updated = false) {
        if (attribute === Property.TWO_SET_ENABLED) {
            return false;
        }

        for (const temperature_status of resource_status) {
            const unit = temperature_status.unit;
            if ([Property.TEMPERATURE_UNIT, Property.TWO_SET_TEMPERATURE_UNIT].includes(attribute)) {
                if (unit === "C") {
                    this._set_status_attr(attribute, unit);
                }
            } else if (attribute.slice(-1).toUpperCase() === unit) {
                const temperature_map = this.profiles._PROFILE.temperatureInUnits;
                const two_set_temperature_map = this.profiles._PROFILE.twoSetTemperatureInUnits;
                let _prop_key = null;

                if (Object.values(temperature_map).includes(attribute)) {
                    _prop_key = Object.keys(temperature_map).find(key => temperature_map[key] === attribute);
                } else if (Object.values(two_set_temperature_map).includes(attribute)) {
                    _prop_key = Object.keys(two_set_temperature_map).find(key => two_set_temperature_map[key] === attribute);
                }

                if (!_prop_key) {
                    var _attribute_value = null;
                } else if (!temperature_status.hasOwnProperty(_prop_key.slice(0, -1)) && is_updated) {
                    continue;
                } else {
                    _attribute_value = temperature_status[_prop_key.slice(0, -1)];
                }
                this._set_status_attr(attribute, _attribute_value);
            }
        }
        return true;
    }

    async set_current_job_mode(mode) {
        return await this.do_enum_attribute_command(Property.CURRENT_JOB_MODE, mode);
    }

    async set_air_con_operation_mode(operation) {
        return await this.do_enum_attribute_command(Property.AIR_CON_OPERATION_MODE, operation);
    }

    async set_air_clean_operation_mode(operation) {
        return await this.do_enum_attribute_command(Property.AIR_CLEAN_OPERATION_MODE, operation);
    }

    async _set_target_temperature(temperature, unit) {
        return await this.do_multi_attribute_command({
            [unit === "C" ? Property.TARGET_TEMPERATURE_C : Property.TARGET_TEMPERATURE_F]: temperature,
            [Property.TEMPERATURE_UNIT]: unit,
        });
    }

    async _set_heat_target_temperature(temperature, unit) {
        return await this.do_multi_attribute_command({
            [unit === "C" ? Property.HEAT_TARGET_TEMPERATURE_C : Property.HEAT_TARGET_TEMPERATURE_F]: temperature,
            [Property.TEMPERATURE_UNIT]: unit,
        });
    }

    async _set_cool_target_temperature(temperature, unit) {
        return await this.do_multi_attribute_command({
            [unit === "C" ? Property.COOL_TARGET_TEMPERATURE_C : Property.COOL_TARGET_TEMPERATURE_F]: temperature,
            [Property.TEMPERATURE_UNIT]: unit,
        });
    }

    async set_heat_target_temperature_c(temperature) {
        return await this._set_heat_target_temperature(temperature, "C");
    }

    async set_heat_target_temperature_f(temperature) {
        return await this._set_heat_target_temperature(temperature, "F");
    }

    async set_cool_target_temperature_c(temperature) {
        return await this._set_cool_target_temperature(temperature, "C");
    }

    async set_cool_target_temperature_f(temperature) {
        return await this._set_cool_target_temperature(temperature, "F");
    }

    async _set_two_set_heat_target_temperature(temperature, unit) {
        const heat_target_prop = unit === "C" ? Property.TWO_SET_HEAT_TARGET_TEMPERATURE_C : Property.TWO_SET_HEAT_TARGET_TEMPERATURE_F;
        const cool_target_prop = unit === "C" ? Property.TWO_SET_COOL_TARGET_TEMPERATURE_C : Property.TWO_SET_COOL_TARGET_TEMPERATURE_F;
        return await this.do_multi_attribute_command({
            [heat_target_prop]: temperature,
            [cool_target_prop]: this.get_status(cool_target_prop),
            [Property.TWO_SET_TEMPERATURE_UNIT]: unit,
        });
    }

    async _set_two_set_cool_target_temperature(temperature, unit) {
        const heat_target_prop = unit === "C" ? Property.TWO_SET_HEAT_TARGET_TEMPERATURE_C : Property.TWO_SET_HEAT_TARGET_TEMPERATURE_F;
        const cool_target_prop = unit === "C" ? Property.TWO_SET_COOL_TARGET_TEMPERATURE_C : Property.TWO_SET_COOL_TARGET_TEMPERATURE_F;
        return await this.do_multi_attribute_command({
            [heat_target_prop]: this.get_status(heat_target_prop),
            [cool_target_prop]: temperature,
            [Property.TWO_SET_TEMPERATURE_UNIT]: unit,
        });
    }

    async set_two_set_heat_target_temperature_c(temperature) {
        return await this._set_two_set_heat_target_temperature(temperature, "C");
    }

    async set_two_set_heat_target_temperature_f(temperature) {
        return await this._set_two_set_heat_target_temperature(temperature, "F");
    }

    async set_two_set_cool_target_temperature_c(temperature) {
        return await this._set_two_set_cool_target_temperature(temperature, "C");
    }

    async set_two_set_cool_target_temperature_f(temperature) {
        return await this._set_two_set_cool_target_temperature(temperature, "F");
    }

    async set_relative_time_to_start(hour, minute) {
        return await this.do_multi_attribute_command({
            [Property.RELATIVE_HOUR_TO_START]: hour,
            [Property.RELATIVE_MINUTE_TO_START]: minute,
        });
    }

    async set_relative_time_to_stop(hour, minute) {
        return await this.do_multi_attribute_command({
            [Property.RELATIVE_HOUR_TO_STOP]: hour,
            ...(minute !== 0 && { [Property.RELATIVE_MINUTE_TO_STOP]: minute }),
        });
    }

    async set_absolute_time_to_start(hour, minute) {
        return await this.do_multi_attribute_command({
            [Property.ABSOLUTE_HOUR_TO_START]: hour,
            [Property.ABSOLUTE_MINUTE_TO_START]: minute,
        });
    }

    async set_absolute_time_to_stop(hour, minute) {
        return await this.do_multi_attribute_command({
            [Property.ABSOLUTE_HOUR_TO_STOP]: hour,
            [Property.ABSOLUTE_MINUTE_TO_STOP]: minute,
        });
    }

    async set_sleep_timer_relative_time_to_stop(hour, minute) {
        return await this.do_multi_attribute_command({
            [Property.SLEEP_TIMER_RELATIVE_HOUR_TO_STOP]: hour,
            [Property.SLEEP_TIMER_RELATIVE_MINUTE_TO_STOP]: minute,
        });
    }

    async set_power_save_enabled(power_save_enabled) {
        return await this.do_attribute_command(Property.POWER_SAVE_ENABLED, power_save_enabled);
    }

    async set_wind_strength(wind_strength) {
        return await this.do_enum_attribute_command(Property.WIND_STRENGTH, wind_strength);
    }

    async set_wind_step(wind_step) {
        return await this.do_range_attribute_command(Property.WIND_STEP, wind_step);
    }

    async set_monitoring_enabled(monitoring_enabled) {
        return await this.do_enum_attribute_command(Property.MONITORING_ENABLED, monitoring_enabled);
    }

    async set_display_light(display_light) {
        return await this.do_enum_attribute_command(Property.DISPLAY_LIGHT, display_light);
    }

    async set_wind_rotate_up_down(wind_rotate_up_down) {
        return await this.do_attribute_command(Property.WIND_ROTATE_UP_DOWN, wind_rotate_up_down);
    }

    async set_wind_rotate_left_right(wind_rotate_left_right) {
        return await this.do_attribute_command(Property.WIND_ROTATE_LEFT_RIGHT, wind_rotate_left_right);
    }
}