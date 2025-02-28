export const API_KEY = '';
export const CLIENT_PREFIX = '';

export const deviceType = {
    AIR_CONDITIONER: 'DEVICE_AIR_CONDITIONER',
};

export const property = {
    READABLE: "r",
    WRITABLE: "w",
};

export const ThinQAPIErrorCodes = {
    UNKNOWN_ERROR: "0000",
    BAD_REQUEST: "1000",
    MISSING_PARAMETERS: "1101",
    UNACCEPTABLE_PARAMETERS: "1102",
    INVALID_TOKEN: "1103",
    INVALID_MESSAGE_ID: "1104",
    NOT_REGISTERED_ADMIN: "1201",
    NOT_REGISTERED_USER: "1202",
    NOT_REGISTERED_SERVICE: "1203",
    NOT_SUBSCRIBED_EVENT: "1204",
    NOT_REGISTERED_DEVICE: "1205",
    NOT_SUBSCRIBED_PUSH: "1206",
    ALREADY_SUBSCRIBED_PUSH: "1207",
    NOT_REGISTERED_SERVICE_BY_ADMIN: "1208",
    NOT_REGISTERED_USER_IN_SERVICE: "1209",
    NOT_REGISTERED_DEVICE_IN_SERVICE: "1210",
    NOT_REGISTERED_DEVICE_BY_USER: "1211",
    NOT_OWNED_DEVICE: "1212",
    NOT_SUBSCRIBABLE_DEVICE: "1214",
    INCORRECT_HEADER: "1216",
    ALREADY_DEVICE_DELETED: "1217",
    INVALID_TOKEN_AGAIN: "1218",
    NOT_SUPPORTED_MODEL: "1219",
    NOT_SUPPORTED_FEATURE: "1220",
    NOT_SUPPORTED_PRODUCT: "1221",
    NOT_CONNECTED_DEVICE: "1222",
    INVALID_STATUS_DEVICE: "1223",
    INVALID_DEVICE_ID: "1224",
    DUPLICATE_DEVICE_ID: "1225",
    INVALID_SERVICE_KEY: "1301",
    NOT_FOUND_TOKEN: "1302",
    NOT_FOUND_USER: "1303",
    NOT_ACCEPTABLE_TERMS: "1304",
    NOT_ALLOWED_API: "1305",
    EXCEEDED_API_CALLS: "1306",
    NOT_SUPPORTED_COUNTRY: "1307",
    NO_CONTROL_AUTHORITY: "1308",
    NOT_ALLOWED_API_AGAIN: "1309",
    NOT_SUPPORTED_DOMAIN: "1310",
    BAD_REQUEST_FORMAT: "1311",
    EXCEEDED_NUMBER_OF_EVENT_SUBSCRIPTION: "1312",
    INTERNAL_SERVER_ERROR: "2000",
    NOT_SUPPORTED_MODEL_AGAIN: "2101",
    NOT_PROVIDED_FEATURE: "2201",
    NOT_SUPPORTED_PRODUCT_AGAIN: "2202",
    NOT_EXISTENT_MODEL_JSON: "2203",
    INVALID_DEVICE_STATUS: "2205",
    INVALID_COMMAND_ERROR: "2207",
    FAIL_DEVICE_CONTROL: "2208",
    DEVICE_RESPONSE_DELAY: "2209",
    RETRY_REQUEST: "2210",
    SYNCING: "2212",
    RETRY_AFTER_DELETING_DEVICE: "2213",
    FAIL_REQUEST: "2214",
    COMMAND_NOT_SUPPORTED_IN_REMOTE_OFF: "2301",
    COMMAND_NOT_SUPPORTED_IN_STATE: "2302",
    COMMAND_NOT_SUPPORTED_IN_ERROR: "2303",
    COMMAND_NOT_SUPPORTED_IN_POWER_OFF: "2304",
    COMMAND_NOT_SUPPORTED_IN_MODE: "2305",
};

export const countryCode = "IN";
export const regionCode = "KIC";


// Constants for the MQTT Client
export const FILE_ROOT_CA = "AmazonRootCA1.pem"
export const ROOT_CA_REPOSITORY = "https://www.amazontrust.com/repository"
export const PRIVATE_KEY_SIZE = 2048
export const CLIENT_BODY = {
    "type": "MQTT",
    "service-code": "SVC202",
    "device-type": "607",
    "allowExist": true
}
export const Resource = {
    AIR_CON_JOB_MODE: 'air_con_job_mode',
    AIR_FAN_JOB_MODE: 'air_fan_job_mode',
    AIR_FLOW: 'air_flow',
    AIR_PURIFIER_JOB_MODE: 'air_purifier_job_mode',
    AIR_QUALITY_SENSOR: 'air_quality_sensor',
    BATTERY: 'battery',
    BOILER_JOB_MODE: 'boiler_job_mode',
    COOK: 'cook',
    COOKING_ZONE: 'cooking_zone',
    CYCLE: 'cycle',
    DEHUMIDIFIER_JOB_MODE: 'dehumidifier_job_mode',
    DETERGENT: 'detergent',
    DISH_WASHING_COURSE: 'dish_washing_course',
    DISH_WASHING_STATUS: 'dish_washing_status',
    DISPLAY: 'display',
    DOOR_STATUS: 'door_status',
    ECO_FRIENDLY: 'eco_friendly',
    FILTER_INFO: 'filter_info',
    HUMIDIFIER_JOB_MODE: 'humidifier_job_mode',
    HUMIDITY: 'humidity',
    INFO: 'info',
    LAMP: 'lamp',
    LIGHT: 'light',
    MISC: 'misc',
    MOOD_LAMP: 'mood_lamp',
    OPERATION: 'operation',
    POWER: 'power',
    POWER_SAVE: 'power_save',
    PREFERENCE: 'preference',
    RECIPE: 'recipe',
    REFRIGERATION: 'refrigeration',
    REMOTE_CONTROL_ENABLE: 'remote_control_enable',
    ROBOT_CLEANER_JOB_MODE: 'robot_cleaner_job_mode',
    RUN_STATE: 'run_state',
    SABBATH: 'sabbath',
    SLEEP_TIMER: 'sleep_timer',
    STICK_CLEANER_JOB_MODE: 'stick_cleaner_job_mode',
    TEMPERATURE: 'temperature',
    TIMER: 'timer',
    TWO_SET_TEMPERATURE: 'two_set_temperature',
    HOT_WATER_TEMPERATURE: 'hot_water_temperature',
    ROOM_TEMPERATURE: 'room_temperature',
    VENTILATION: 'ventilation',
    WATER_FILTER_INFO: 'water_filter_info',
    WATER_HEATER_JOB_MODE: 'water_heater_job_mode',
    WATER_INFO: 'water_info',
    WIND_DIRECTION: 'wind_direction',
};

export const Property = {
    ABSOLUTE_HOUR_TO_START: 'absolute_hour_to_start',
    ABSOLUTE_HOUR_TO_STOP: 'absolute_hour_to_stop',
    ABSOLUTE_MINUTE_TO_START: 'absolute_minute_to_start',
    ABSOLUTE_MINUTE_TO_STOP: 'absolute_minute_to_stop',
    AIR_CLEAN_OPERATION_MODE: 'air_clean_operation_mode',
    AIR_CON_OPERATION_MODE: 'air_con_operation_mode',
    AIR_FAN_OPERATION_MODE: 'air_fan_operation_mode',
    AIR_PURIFIER_OPERATION_MODE: 'air_purifier_operation_mode',
    AUTO_MODE: 'auto_mode',
    BATTERY_LEVEL: 'battery_level',
    BATTERY_PERCENT: 'battery_percent',
    BEER_REMAIN: 'beer_remain',
    BOILER_OPERATION_MODE: 'boiler_operation_mode',
    BRIGHTNESS: 'brightness',
    CEILING_FAN_OPERATION_MODE: 'ceiling_fan_operation_mode',
    CLEAN_LIGHT_REMINDER: 'clean_light_reminder',
    CLEAN_OPERATION_MODE: 'clean_operation_mode',
    COCK_STATE: 'cock_state',
    COOK_MODE: 'cook_mode',
    COOL_MAX_TEMPERATURE: 'cool_max_temperature',
    COOL_MAX_TEMPERATURE_C: 'cool_max_temperature_c',
    COOL_MAX_TEMPERATURE_F: 'cool_max_temperature_f',
    COOL_MIN_TEMPERATURE: 'cool_min_temperature',
    COOL_MIN_TEMPERATURE_C: 'cool_min_temperature_c',
    COOL_MIN_TEMPERATURE_F: 'cool_min_temperature_f',
    COOL_TARGET_TEMPERATURE: 'cool_target_temperature',
    COOL_TARGET_TEMPERATURE_C: 'cool_target_temperature_c',
    COOL_TARGET_TEMPERATURE_F: 'cool_target_temperature_f',
    CURRENT_DISH_WASHING_COURSE: 'current_dish_washing_course',
    CURRENT_HUMIDITY: 'current_humidity',
    CURRENT_JOB_MODE: 'current_job_mode',
    CURRENT_STATE: 'current_state',
    CURRENT_TEMPERATURE: 'current_temperature',
    CURRENT_TEMPERATURE_C: 'current_temperature_c',
    CURRENT_TEMPERATURE_F: 'current_temperature_f',
    CYCLE_COUNT: 'cycle_count',
    DAY_TARGET_TEMPERATURE: 'day_target_temperature',
    DEHUMIDIFIER_OPERATION_MODE: 'dehumidifier_operation_mode',
    DETERGENT_SETTING: 'detergent_setting',
    DISH_WASHER_OPERATION_MODE: 'dish_washer_operation_mode',
    DISPLAY_LIGHT: 'display_light',
    DOOR_STATE: 'door_state',
    DRYER_OPERATION_MODE: 'dryer_operation_mode',
    DURATION: 'duration',
    ECO_FRIENDLY_MODE: 'eco_friendly_mode',
    ELAPSED_DAY_STATE: 'elapsed_day_state',
    ELAPSED_DAY_TOTAL: 'elapsed_day_total',
    END_HOUR: 'end_hour',
    END_MINUTE: 'end_minute',
    EXPRESS_FRIDGE: 'express_fridge',
    EXPRESS_MODE: 'express_mode',
    EXPRESS_MODE_NAME: 'express_mode_name',
    FAN_SPEED: 'fan_speed',
    FILTER_LIFETIME: 'filter_lifetime',
    FILTER_REMAIN_PERCENT: 'filter_remain_percent',
    FLAVOR_CAPSULE_1: 'flavor_capsule_1',
    FLAVOR_CAPSULE_2: 'flavor_capsule_2',
    FLAVOR_INFO: 'flavor_info',
    FRESH_AIR_FILTER: 'fresh_air_filter',
    GROWTH_MODE: 'growth_mode',
    HEAT_MAX_TEMPERATURE: 'heat_max_temperature',
    HEAT_MAX_TEMPERATURE_C: 'heat_max_temperature_c',
    HEAT_MAX_TEMPERATURE_F: 'heat_max_temperature_f',
    HEAT_MIN_TEMPERATURE: 'heat_min_temperature',
    HEAT_MIN_TEMPERATURE_C: 'heat_min_temperature_c',
    HEAT_MIN_TEMPERATURE_F: 'heat_min_temperature_f',
    HEAT_TARGET_TEMPERATURE: 'heat_target_temperature',
    HEAT_TARGET_TEMPERATURE_C: 'heat_target_temperature_c',
    HEAT_TARGET_TEMPERATURE_F: 'heat_target_temperature_f',
    HOOD_OPERATION_MODE: 'hood_operation_mode',
    HOP_OIL_CAPSULE_1: 'hop_oil_capsule_1',
    HOP_OIL_CAPSULE_2: 'hop_oil_capsule_2',
    HOP_OIL_INFO: 'hop_oil_info',
    HOT_WATER_MODE: 'hot_water_mode',
    HOT_WATER_CURRENT_TEMPERATURE_C: 'hot_water_current_temperature_c',
    HOT_WATER_CURRENT_TEMPERATURE_F: 'hot_water_current_temperature_f',
    HOT_WATER_MAX_TEMPERATURE_C: 'hot_water_max_temperature_c',
    HOT_WATER_MAX_TEMPERATURE_F: 'hot_water_max_temperature_f',
    HOT_WATER_MIN_TEMPERATURE_C: 'hot_water_min_temperature_c',
    HOT_WATER_MIN_TEMPERATURE_F: 'hot_water_min_temperature_f',
    HOT_WATER_TARGET_TEMPERATURE_C: 'hot_water_target_temperature_c',
    HOT_WATER_TARGET_TEMPERATURE_F: 'hot_water_target_temperature_f',
    HOT_WATER_TEMPERATURE_UNIT: 'hot_water_temperature_unit',
    HUMIDIFIER_OPERATION_MODE: 'humidifier_operation_mode',
    HUMIDITY: 'humidity',
    HYGIENE_DRY_MODE: 'hygiene_dry_mode',
    LAMP_BRIGHTNESS: 'lamp_brightness',
    LIGHT_BRIGHTNESS: 'light_brightness',
    LIGHT_STATUS: 'light_status',
    MACHINE_CLEAN_REMINDER: 'machine_clean_reminder',
    MONITORING_ENABLED: 'monitoring_enabled',
    MOOD_LAMP_STATE: 'mood_lamp_state',
    NIGHT_TARGET_TEMPERATURE: 'night_target_temperature',
    ODOR: 'odor',
    ODOR_LEVEL: 'odor_level',
    ONE_TOUCH_FILTER: 'one_touch_filter',
    OPERATION_MODE: 'operation_mode',
    OPTIMAL_HUMIDITY: 'optimal_humidity',
    OVEN_OPERATION_MODE: 'oven_operation_mode',
    OVEN_TYPE: 'oven_type',
    PERSONALIZATION_MODE: 'personalization_mode',
    PM1: 'pm1',
    PM10: 'pm10',
    PM2: 'pm2',
    POWER_LEVEL: 'power_level',
    POWER_SAVE_ENABLED: 'power_save_enabled',
    RAPID_FREEZE: 'rapid_freeze',
    RECIPE_NAME: 'recipe_name',
    RELATIVE_HOUR_TO_START: 'relative_hour_to_start',
    RELATIVE_HOUR_TO_STOP: 'relative_hour_to_stop',
    RELATIVE_MINUTE_TO_START: 'relative_minute_to_start',
    RELATIVE_MINUTE_TO_STOP: 'relative_minute_to_stop',
    REMAIN_HOUR: 'remain_hour',
    REMAIN_MINUTE: 'remain_minute',
    REMAIN_SECOND: 'remain_second',
    REMOTE_CONTROL_ENABLED: 'remote_control_enabled',
    RINSE_LEVEL: 'rinse_level',
    RINSE_REFILL: 'rinse_refill',
    ROOM_TEMP_MODE: 'room_temp_mode',
    ROOM_WATER_MODE: 'room_water_mode',
    ROOM_AIR_COOL_MAX_TEMPERATURE_C: 'room_air_cool_max_temperature_c',
    ROOM_AIR_COOL_MAX_TEMPERATURE_F: 'room_air_cool_max_temperature_f',
    ROOM_AIR_COOL_MIN_TEMPERATURE_C: 'room_air_cool_min_temperature_c',
    ROOM_AIR_COOL_MIN_TEMPERATURE_F: 'room_air_cool_min_temperature_f',
    ROOM_AIR_COOL_TARGET_TEMPERATURE_C: 'room_air_cool_target_temperature_c',
    ROOM_AIR_COOL_TARGET_TEMPERATURE_F: 'room_air_cool_target_temperature_f',
    ROOM_AIR_CURRENT_TEMPERATURE_C: 'room_air_current_temperature_c',
    ROOM_AIR_CURRENT_TEMPERATURE_F: 'room_air_current_temperature_f',
    ROOM_AIR_HEAT_MAX_TEMPERATURE_C: 'room_air_heat_max_temperature_c',
    ROOM_AIR_HEAT_MAX_TEMPERATURE_F: 'room_air_heat_max_temperature_f',
    ROOM_AIR_HEAT_MIN_TEMPERATURE_C: 'room_air_heat_min_temperature_c',
    ROOM_AIR_HEAT_MIN_TEMPERATURE_F: 'room_air_heat_min_temperature_f',
    ROOM_AIR_HEAT_TARGET_TEMPERATURE_C: 'room_air_heat_target_temperature_c',
    ROOM_AIR_HEAT_TARGET_TEMPERATURE_F: 'room_air_heat_target_temperature_f',
    ROOM_CURRENT_TEMPERATURE_C: 'room_current_temperature_c',
    ROOM_CURRENT_TEMPERATURE_F: 'room_current_temperature_f',
    ROOM_IN_WATER_CURRENT_TEMPERATURE_C: 'room_in_water_current_temperature_c',
    ROOM_IN_WATER_CURRENT_TEMPERATURE_F: 'room_in_water_current_temperature_f',
    ROOM_OUT_WATER_CURRENT_TEMPERATURE_C: 'room_out_water_current_temperature_c',
    ROOM_OUT_WATER_CURRENT_TEMPERATURE_F: 'room_out_water_current_temperature_f',
    ROOM_TARGET_TEMPERATURE_C: 'room_target_temperature_c',
    ROOM_TARGET_TEMPERATURE_F: 'room_target_temperature_f',
    ROOM_TEMPERATURE_UNIT: 'room_temperature_unit',
    ROOM_WATER_COOL_MAX_TEMPERATURE_C: 'room_water_cool_max_temperature_c',
    ROOM_WATER_COOL_MAX_TEMPERATURE_F: 'room_water_cool_max_temperature_f',
    ROOM_WATER_COOL_MIN_TEMPERATURE_C: 'room_water_cool_min_temperature_c',
    ROOM_WATER_COOL_MIN_TEMPERATURE_F: 'room_water_cool_min_temperature_f',
    ROOM_WATER_COOL_TARGET_TEMPERATURE_C: 'room_water_cool_target_temperature_c',
    ROOM_WATER_COOL_TARGET_TEMPERATURE_F: 'room_water_cool_target_temperature_f',
    ROOM_WATER_HEAT_MAX_TEMPERATURE_C: 'room_water_heat_max_temperature_c',
    ROOM_WATER_HEAT_MAX_TEMPERATURE_F: 'room_water_heat_max_temperature_f',
    ROOM_WATER_HEAT_MIN_TEMPERATURE_C: 'room_water_heat_min_temperature_c',
    ROOM_WATER_HEAT_MIN_TEMPERATURE_F: 'room_water_heat_min_temperature_f',
    ROOM_WATER_HEAT_TARGET_TEMPERATURE_C: 'room_water_heat_target_temperature_c',
    ROOM_WATER_HEAT_TARGET_TEMPERATURE_F: 'room_water_heat_target_temperature_f',
    RUNNING_HOUR: 'running_hour',
    RUNNING_MINUTE: 'running_minute',
    SABBATH_MODE: 'sabbath_mode',
    SIGNAL_LEVEL: 'signal_level',
    SLEEP_MODE: 'sleep_mode',
    SLEEP_TIMER_RELATIVE_HOUR_TO_STOP: 'sleep_timer_relative_hour_to_stop',
    SLEEP_TIMER_RELATIVE_MINUTE_TO_STOP: 'sleep_timer_relative_minute_to_stop',
    SOFTENING_LEVEL: 'softening_level',
    START_HOUR: 'start_hour',
    START_MINUTE: 'start_minute',
    STERILIZING_STATE: 'sterilizing_state',
    STYLER_OPERATION_MODE: 'styler_operation_mode',
    TARGET_HOUR: 'target_hour',
    TARGET_HUMIDITY: 'target_humidity',
    TARGET_MINUTE: 'target_minute',
    TARGET_SECOND: 'target_second',
    TARGET_TEMPERATURE: 'target_temperature',
    TARGET_TEMPERATURE_C: 'target_temperature_c',
    TARGET_TEMPERATURE_F: 'target_temperature_f',
    TEMPERATURE: 'temperature',
    TEMPERATURE_STATE: 'temperature_state',
    TEMPERATURE_UNIT: 'temperature_unit',
    TIMER_HOUR: 'timer_hour',
    TIMER_MINUTE: 'timer_minute',
    TIMER_SECOND: 'timer_second',
    TOTAL_HOUR: 'total_hour',
    TOTAL_MINUTE: 'total_minute',
    TOTAL_POLLUTION: 'total_pollution',
    TOTAL_POLLUTION_LEVEL: 'total_pollution_level',
    TWO_SET_ENABLED: 'two_set_enabled',
    TWO_SET_COOL_TARGET_TEMPERATURE: 'two_set_cool_target_temperature',
    TWO_SET_COOL_TARGET_TEMPERATURE_C: 'two_set_cool_target_temperature_c',
    TWO_SET_COOL_TARGET_TEMPERATURE_F: 'two_set_cool_target_temperature_f',
    TWO_SET_CURRENT_TEMPERATURE: 'two_set_current_temperature',
    TWO_SET_CURRENT_TEMPERATURE_C: 'two_set_current_temperature_c',
    TWO_SET_CURRENT_TEMPERATURE_F: 'two_set_current_temperature_f',
    TWO_SET_HEAT_TARGET_TEMPERATURE: 'two_set_heat_target_temperature',
    TWO_SET_HEAT_TARGET_TEMPERATURE_C: 'two_set_heat_target_temperature_c',
    TWO_SET_HEAT_TARGET_TEMPERATURE_F: 'two_set_heat_target_temperature_f',
    TWO_SET_TEMPERATURE_UNIT: 'two_set_temperature_unit',
    USED_TIME: 'used_time',
    UV_NANO: 'uv_nano',
    WARM_MODE: 'warm_mode',
    WASHER_OPERATION_MODE: 'washer_operation_mode',
    WATER_FILTER_INFO_UNIT: 'water_filter_info_unit',
    WATER_HEATER_OPERATION_MODE: 'water_heater_operation_mode',
    WATER_TYPE: 'water_type',
    WIND_ANGLE: 'wind_angle',
    WIND_ROTATE_LEFT_RIGHT: 'wind_rotate_left_right',
    WIND_ROTATE_UP_DOWN: 'wind_rotate_up_down',
    WIND_STEP: 'wind_step',
    WIND_STRENGTH: 'wind_strength',
    WIND_TEMPERATURE: 'wind_temperature',
    WIND_VOLUME: 'wind_volume',
    WORT_INFO: 'wort_info',
    YEAST_INFO: 'yeast_info',
};

export const DeviceLocation = {
    CENTER: 'center',
    CENTER_FRONT: 'center_front',
    CENTER_REAR: 'center_rear',
    LEFT_FRONT: 'left_front',
    LEFT_REAR: 'left_rear',
    RIGHT_FRONT: 'right_front',
    RIGHT_REAR: 'right_rear',
    BURNER_1: 'burner_1',
    BURNER_2: 'burner_2',
    BURNER_3: 'burner_3',
    BURNER_4: 'burner_4',
    BURNER_5: 'burner_5',
    BURNER_6: 'burner_6',
    BURNER_7: 'burner_7',
    BURNER_8: 'burner_8',
    INDUCTION_1: 'induction_1',
    INDUCTION_2: 'induction_2',
    SOUSVIDE_1: 'sousvide_1',
    TOP: 'top',
    MIDDLE: 'middle',
    BOTTOM: 'bottom',
    LEFT: 'left',
    RIGHT: 'right',
    SINGLE: 'single',
    OVEN: 'oven',
    UPPER: 'upper',
    LOWER: 'lower',
    MAIN: 'main',
    MINI: 'mini',
    FRIDGE: 'fridge',
    FREEZER: 'freezer',
    CONVERTIBLE: 'convertible',
    DRYER: 'dryer',
    WASHER: 'washer',
};
