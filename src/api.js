/**
 * @fileOverview This file contains the ThinQAPI class for interacting with the LG ThinQ API.
 * It provides methods for device management, control, and event handling.
 */
import { Axios } from 'axios';
import { v4 as uuidv4 } from 'uuid';

import { 
  API_KEY as CONST_API_KEY, 
  countryCode as CONST_COUNTRY_CODE, 
  regionCode as CONST_REGION_CODE,
  ThinQAPIErrorCodes
} from './const.js';

const methods = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
};

class ThinQAPIError extends Error {
    constructor(code, message, headers) {
        super(message);
        this.code = code;
        this.message = message;
        this.headers = headers;
        this.error_name = ThinQAPIErrorCodes[code] || "UNKNOWN_ERROR";
    }
}

/**
 * @class ThinQAPI
 * @classdesc Represents the ThinQ API for interacting with LG devices.
 */
export class ThinQAPI {
    /**
     * 
     * @param {Axios} instance - The Axios instance for making HTTP requests.
     * @param {string} accessToken - The access token for authentication. ThinqPAT.
     * @param {string} countryCode - The country code for the API requests.
     * @param {string} clientID - The client ID for the API requests. UUID V4.
     * @param {boolean} mockResponse - Flag to indicate if mock responses should be used.
     */
    constructor(instance, accessToken, countryCode, clientID, mockResponse = false) {
        this.instance = instance;
        this.accessToken = accessToken;
        this.countryCode = countryCode;
        this.clientID = clientID;
        this.mockResponse = mockResponse;

        this.API_KEY = CONST_API_KEY;
        this.countryCode = countryCode ? countryCode : CONST_COUNTRY_CODE;
        this.regionCode = CONST_REGION_CODE;
        this._phase = "OP";

    }

    _getURLEndpoint(endpoint) {
        return `https://api-${this.regionCode.toLowerCase()}.lgthinq.com/${endpoint}`;
    }

    _generateHeaders(headers = {}) {


        return {
            "Authorization": `Bearer ${this.accessToken}`,
            "x-country": this.countryCode,
            "x-message-id": this._generateMessageId(),
            "x-client-id": this.clientID,
            "x-api-key": this.API_KEY,
            "x-service-phase": this._phase,
            "Content-Type": "application/json",
            ...headers,
        };
    }
  
    _generateMessageId() {
        // Used GPT to generate this function, not sure if it is correct
        const uuidValue = uuidv4();
        const uuidBytes = Buffer.from(uuidValue);
        const base64 = encodeURI(uuidBytes.toString('base64'));
        return base64.slice(0, 22);
    }

    async _makeRequest(method, url, headers = {}, extra = {}) {
        console.log(`Making ${method} request to: ${url}`);
        console.log("Headers: \n", headers);
        console.log("Extra: \n", extra);

        const response = await this.instance.request({
            method: method,
            url: url,
            headers: headers,
            ...extra,
        });

        console.log("Response: ", response.data);

        return response
    }

    async _fetch(method, endpoint, headers = {}, data = {}) {
        // Function that prepares the data before making the request
        const url = this._getURLEndpoint(endpoint);

        headers = this._generateHeaders(headers);

        if (this.mockResponse) {
            return {"message": "Mock Response", "body": data.json};
        }
        try {
            const response = await this._makeRequest(method, url, headers, data);

            if (response.status !== 200) {
                throw new ThinQAPIError(response.error.code, response.error.message, response.headers);
            }
            return response.data;
        } catch (error) {
            console.error(error);
            console.error(`${error.name} (${error.code}): ${error.message} - ${error.error_name}`);
            return null;
        }
    }

    async getDeviceList(timeout=15) {
        return await this._fetch(methods.GET, 'devices', {}, {timeout: timeout * 1000});
    }

    async getDeviceProfile(deviceId, timeout=15) {
        return await this._fetch(methods.GET, `devices/${deviceId}/profile`, {}, {timeout: timeout * 1000});
    }

    async getDeviceStatus(deviceId, timeout=15) {
        return await this._fetch(methods.GET, `devices/${deviceId}/state`, {}, {timeout: timeout * 1000});
    }

    async postDeviceControl(deviceId, payload, timeout=15) {
        const headers = {"x-conditional-control": "true"};

        return await this._fetch(methods.POST, `devices/${deviceId}/control`, headers, {data: payload, timeout: timeout * 1000});
    }

    async postClientRegister(payload, timeout=15) {
        return await this._fetch(methods.POST, 'client', {}, {data: payload, timeout: timeout * 1000});
    }

    async deleteClientRegister(payload, timeout=15) {
        return await this._fetch(methods.DELETE, 'client', {}, {data: payload, timeout: timeout * 1000});
    }

    async postClientCertificate(payload, timeout=15) {
        return await this._fetch(methods.POST, 'client/certificate', {}, {data: payload, timeout: timeout * 1000});
    }

    async getPushList(timeout=15) {
        return await this._fetch(methods.GET, 'push', {}, {timeout: timeout * 1000});
    }

    async postPushSubscribe(deviceId, timeout=15) {
        return await this._fetch(methods.POST, `push/${deviceId}/subscribe`, {}, {timeout: timeout * 1000});
    }

    async deletePushSubscribe(deviceId, timeout=15) {
        return await this._fetch(methods.DELETE, `push/${deviceId}/subscribe`, {}, {timeout: timeout * 1000});
    }

    async getEventList(timeout=15) {
        return await this._fetch(methods.GET, 'event', {}, {timeout: timeout * 1000});
    }

    async postEventSubscribe(deviceId, timeout=15) {
        return await this._fetch(
        methods.POST, 
        `event/${deviceId}/subscribe`, 
        {},
        {
            timeout: timeout, 
            data: {
            expire: {
                unit: "HOUR",
                timer: 4464
            }
            }
        }
        );
    }

    async deleteEventSubscribe(deviceId, timeout=15) {
        return await this._fetch(methods.DELETE, `event/${deviceId}/unsubscribe`, {}, data={timeout: timeout});
    }

    async getPushDeviceList(timeout=15) {
        return await this._fetch(methods.GET, 'push/devices', {}, {timeout: timeout * 1000});
    }

    async postPushDevicesSubscribe(timeout=15) {
        return await this._fetch(methods.POST, `push/devices`, {}, {timeout: timeout * 1000});
    }

    async deletePushDevicesSubscribe(timeout=15) {
        return await this._fetch(methods.DELETE, `push/devices`, {}, {timeout: timeout * 1000});
    }

    async getRoute(timeout=15) {
        return await this._fetch(methods.GET, 'route', {}, {timeout: timeout * 1000});
    }
}