/* 
This file is responsible for providing support to LG ThinQ Connect API.
Bascially deals with querying the statues of the devices and controlling them.
*/

import axios, { Axios } from 'axios';
import { TextEncoder } from 'node:util';
import { CLIENT_BODY, FILE_ROOT_CA, ROOT_CA_REPOSITORY, PRIVATE_KEY_SIZE } from "./const.js";
import { ThinQAPI } from "./api.js";
import { mqtt, iot } from "aws-crt";
import forge from 'node-forge';


const connectionState = {
    CONNECTED: 'client_connected',
    DISCONNECTED: 'client_disconnected',
}


export class MQTTClient {
    /**
     * Creates an instance of the MQTT connection handler.
     * 
     * @param {Axios} instance
     * @param {ThinQAPI} thinqAPI - The ThinQ API instance.
     * @param {string} clientId - The client ID for the MQTT connection.
     * @param {function} onMessageArrived - Callback function to handle incoming messages.
     * @param {function} onConnectionInterrupted - Callback function to handle connection interruptions.
     * @param {function} onConnectionSuccess - Callback function to handle successful connections.
     * @param {function} onConnectionFailure - Callback function to handle connection failures.
     * @param {function} onConnectionClosed - Callback function to handle connection closures.
     */
    constructor(
        instance,
        thinqAPI,
        clientId,
        onMessageArrived,
        onConnectionInterrupted,
        onConnectionSuccess,
        onConnectionFailure,
        onConnectionClosed
    ) {
        this.instance = instance;
        this.thinqAPI = thinqAPI;
        this.clientId = clientId;

        this.onMessageArrived = onMessageArrived;

        this.onConnectionInterrupted = onConnectionInterrupted;
        this.onConnectionSuccess = onConnectionSuccess;
        this.onConnectionFailure = onConnectionFailure;
        this.onConnectionClosed = onConnectionClosed;

        this._MQTTConnection = null;
        this._MQTTServer = null;
        this._bytesRootCA = null;
        this._bytesPrivateKey = null;
        this._bytesCertificate = null;
        this._clientCSR = null;
        this._topicSubscription = null;
        

        this._state = connectionState.DISCONNECTED;
    }

    isConnected() {
        return this._state === connectionState.CONNECTED;
    }

    async _getRootCertificate(timeout=15) {
        const url = `${ROOT_CA_REPOSITORY}/${FILE_ROOT_CA}`;

        console.debug(`Fetching root certificate from ${url}...`);

        const response = await this.instance.request({
            method: 'GET',
            url: url,
            timeout: timeout * 1000
        });

        if (response.status != 200) {
            console.error(`Error fetching root certificate (${response.status}): `, response.statusText);
            return null;
        }

        console.info("Root certificate fetched successfully.");
        console.debug("Root certificate data: \n", response.data);
        return response.data;
    }

    async _generateCSR() {
        // Step 1: Retrieve the root certificate
        const certData = await this._getRootCertificate();
        if (!certData) {
            return false;
        }
        this._bytesRootCA = certData;
    
        // Step 2: Generate RSA key pair
        const keyPair = forge.pki.rsa.generateKeyPair(PRIVATE_KEY_SIZE);
        const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
        // Need to change the attribute names accordingly
        this._bytesPrivateKey = privateKeyPem;
    
        // Step 3: Create CSR
        const csr = forge.pki.createCertificationRequest();
        csr.publicKey = keyPair.publicKey;
        csr.setSubject([
            {
                name: 'commonName',
                value: 'lg_thinq'
            }
        ]);
        csr.sign(keyPair.privateKey, forge.md.sha512.create());
    
        // Step 4: Convert CSR to PEM format
        const csrPem = forge.pki.certificationRequestToPem(csr);
    
        // Step 5: Extract base64-encoded CSR content
        const csrMatch = csrPem.match(/-----BEGIN CERTIFICATE REQUEST-----([\s\S]+?)-----END CERTIFICATE REQUEST-----/);
        if (!csrMatch) {
            
            return false;
        }
        this._clientCSR = csrMatch[1].replace(/\r?\n|\r/g, '').trim();
        
        if (this._clientCSR && this._bytesPrivateKey && this._bytesRootCA) {
            console.info("Generated CSR, Private Key and Root CA successfully.");
        } else {
            console.error("Failed to generate CSR, Private Key or Root CA.");
            return false;
        }

        return true;
    }

    async _issueCertificate() {
        if (!this._clientCSR) {
            console.error("Client CSR is not generated. Can not issue certificate.");
            return false;
        }

        const payload = {
            "service-code": "SVC202",
            "csr": this._clientCSR
        }

        const certificateResponse = await this.thinqAPI.postClientCertificate(payload);
        if (!certificateResponse) {
            console.error("Error issuing certificate: \n", certificateResponse);
            return false;
        }
        console.debug("Certificate response: \n", certificateResponse);     

        const certificatePem = certificateResponse.response.result.certificatePem;
        const subscriptions = certificateResponse.response.result.subscriptions;
        if (!certificatePem || !subscriptions) {
            
            return false;
        }

        // Need to change the attribute names accordingly
        this._bytesCertificate = certificatePem;
        this._topicSubscription = subscriptions[0];

        return true;
    }

    async _onDisconnect() {
        const result = await this.thinqAPI.deleteClientRegister(CLIENT_BODY);
        this._state = connectionState.DISCONNECTED;
    }

    async init() {
        const routeResponse = await this.thinqAPI.getRoute();
        console.info("Route response: \n", routeResponse);
        // Need to clean the string
        this._MQTTServer = routeResponse.response.mqttServer.replace("mqtts://", "").split(":", 2)[0];
    }

    async prepareMQTT() {
        await this.thinqAPI.postClientRegister(CLIENT_BODY);

        if (!await this._generateCSR()) {
            return false;
        }

        if (!await this._issueCertificate()) {
            return false;
        }

        return true;
    }

    async connectMQTT() {

        // Build the config
        const builder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder(
            this._bytesCertificate, this._bytesPrivateKey
        );
        builder.with_clean_session(false);
        builder.with_certificate_authority(this._bytesRootCA);
        builder.with_client_id(this.clientId);
        builder.with_keep_alive_seconds(6);
        builder.with_endpoint(this._MQTTServer);
        
        const config = builder.build();

        console.info("MQTT Config: \n", config);

        // Create the connection
        this._MQTTConnection = new mqtt.MqttClient().new_connection(config);

        try {
            const connect = await this._MQTTConnection.connect();
            
            if (connect) {
                // Boolean is True and hence the connection is new
                console.info("MQTT connection established successfully.");
            } else {
                // Boolean is False and hence the connection is being resumed.
                
            }
        } catch ( err ) {
            
            this._MQTTConnection = null;
            return;
        }

        this._state = connectionState.CONNECTED;
        
        console.info("MQTT topic subscription: ", this._topicSubscription);
        this._MQTTConnection.subscribe(
            this._topicSubscription, 
            mqtt.QoS.AtLeastOnce,
            this.onMessageArrived
        ).catch((reason) => {
            
        }).then((value) => {
            
        })

    }

    async disconnectMQTT() {
        if (this._MQTTConnection != null) {
            this._MQTTConnection.unsubscribe(this._topicSubscription);
            await this._onDisconnect()
        }
    }


    
}
