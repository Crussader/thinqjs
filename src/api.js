/**
 * @fileOverview This file contains the ThinQAPI class for interacting with the LG ThinQ API.
 * It provides methods for device management, control, and event handling.
 */
import axios from 'axios';

import constants from './const';
import { v4 as uuidv4 } from 'uuid';

const methods = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
};

class ThinQAPIError extends Error {}

/**
 * @class ThinQAPI
 * @classdesc Represents the ThinQ API for interacting with LG devices.
 */
export class ThinQAPI {
  /**
   * 
   * @param {string} accessToken 
   * @param {string} countryCode 
   * @param {string} clientID 
   * @param {boolean} mockResponse 
   */
  constructor(accessToken, countryCode, clientID, mockResponse = false) {
    this.accessToken = accessToken;
    this.countryCode = countryCode;
    this.clientID = clientID;
    this.mockResponse = mockResponse;

    this.API_KEY = constants.API_KEY;
    this.countryCode = constants.countryCode;
    this.regionCode = constants.REGION_CODE;

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
        "x-service-phase": this.phase,
        ...headers,
    };
  }
  
  _generateMessageId() {
	// Used GPT to generate this function, not sure if it is correct
	const uuidValue = uuidv4();
	const hexUuid = uuidValue.replace(/-/g, '');
	const uuidBytes = Buffer.from(hexUuid, 'hex');
	const base64Str = uuidBytes.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');
	return base64Str.slice(0, -2);
  }

  async _makeRequest(method, url, headers = {}, extra = {}) {
    // Function that makes the request
    return await axios({
        method: method,
        url: url,
        headers: headers,
        ...extra,
    })
  }

  async _fetch(method, endpoint, headers = {}, data = {}) {
    // Function that prepares the data before making the request
    const url = this._getURLEndpoint(endpoint);

    headers = this._generateHeaders(headers);

    if (this.mockResponse) {
        return {"message": "Mock Response", "body": data.JSON};
    }

    const response = await this._makeRequest(method, url, headers, data);

    if (response.status !== 200) {
        console.error("Error: ", response);
        throw new ThinQAPIError(`Error: ${response.statusText}`);
    }

    return response.data;
  }

  async getDeviceList(timeout=15) {
	  return await this._fetch(methods.GET, 'devices', data={timeout: timeout});
  }

  async getDeviceProfile(deviceId, timeout=15) {
	  return await this._fetch(methods.GET, `devices/${deviceId}/profile`, data={timeout: timeout});
  }

  async getDeviceStatus(deviceId, timeout=15) {
	  return await this._fetch(methods.GET, `devices/${deviceId}/status`, data={timeout: timeout});
  }

  async postDeviceControl(deviceId, payload, timeout=15) {
	  const headers = {"x-conditional-control": "true"};

	  return await this._fetch(methods.POST, `devices/${deviceId}/control`, headers, data={json: payload, timeout: timeout});
  }

  async postClientRegister(payload, timeout=15) {
	  return await this._fetch(methods.POST, 'client', data={json: payload, timeout: timeout});
  }

  async deleteClientRegister(payload, timeout=15) {
	  return await this._fetch(methods.DELETE, 'client', data={json: payload, timeout: timeout});
  }

  async postClientCertificate(payload, timeout=15) {
	  return await this._fetch(methods.POST, 'client/certificate', data={json: payload, timeout: timeout});
  }

  async getPushList(timeout=15) {
	  return await this._fetch(methods.GET, 'push', data={timeout: timeout});
  }

  async postPushSubscribe(deviceId, timeout=15) {
	  return await this._fetch(methods.POST, `push/${deviceId}/subscribe`, data={timeout: timeout});
  }

  async deletePushSubscribe(deviceId, timeout=15) {
	  return await this._fetch(methods.DELETE, `push/${deviceId}/subscribe`, data={timeout: timeout});
  }

  async getEventList(timeout=15) {
	  return await this._fetch(methods.GET, 'event', data={timeout: timeout});
  }

  async postEventSubscribe(deviceId, timeout=15) {
    return await this._fetch(
      methods.POST, 
      `event/${deviceId}/subscribe`, 
      data={
        timeout: timeout, 
        json: {
          expire: {
            unit: "HOUR",
            timer: 4464
          }
        }
      }
	  );
  }

  async deleteEventSubscribe(deviceId, timeout=15) {
	  return await this._fetch(methods.DELETE, `event/${deviceId}/unsubscribe`, data={timeout: timeout});
  }

  async getPushDeviceList(timeout=15) {
	  return await this._fetch(methods.GET, 'push/devices', data={timeout: timeout});
  }

  async postPushDevicesSubscribe(timeout=15) {
	  return await this._fetch(methods.POST, `push/devices`, data={timeout: timeout});
  }

  async deletePushDevicesSubscribe(timeout=15) {
	  return await this._fetch(methods.DELETE, `push/devices`, data={timeout: timeout});
  }

  async getRoute(timeout=15) {
	  return await this._fetch(methods.GET, 'route', data={timeout: timeout});
  }
}