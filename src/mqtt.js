/* 
This file is responsible for providing support to LG ThinQ Connect API.
Bascially deals with querying the statues of the devices and controlling them.
*/

import axios from 'axios';
import { TextEncoder } from 'node:util';
import { CLIENT_BODY, FILE_ROOT_CA, ROOT_CA_REPOSITORY, PRIVATE_KEY_SIZE } from "./const.js";
import { ThinQAPI } from "./api.js";
import { mqtt, io } from "aws-crt";
// import crypto from 'node:crypto';
import forge from 'node-forge';


const connectionState = {
    CONNECTED: 'client_connected',
    DISCONNECTED: 'client_disconnected',
}


export class MQTTClient {
    /**
     * Creates an instance of the MQTT connection handler.
     * 
     * @param {ThinQAPI} thinqAPI - The ThinQ API instance.
     * @param {string} clientId - The client ID for the MQTT connection.
     * @param {function} onMessageArrived - Callback function to handle incoming messages.
     * @param {function} onConnectionInterrupted - Callback function to handle connection interruptions.
     * @param {function} onConnectionSuccess - Callback function to handle successful connections.
     * @param {function} onConnectionFailure - Callback function to handle connection failures.
     * @param {function} onConnectionClosed - Callback function to handle connection closures.
     */
    constructor(
        thinqAPI,
        clientId,
        onMessageArrived,
        onConnectionInterrupted,
        onConnectionSuccess,
        onConnectionFailure,
        onConnectionClosed
    ) {
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

        console.info(`Root Certificate url: ${url}`);

        const response = await axios({
            method: 'GET',
            url: url,
            timeout: timeout * 1000
        });

        if (response.status != 200) {
            console.error(`Failed to fetch Root Certificate: ${response.statusText}`);
            return null;
        }

        return response.data;
    }

    async _generateCSR() {
        // Step 1: Retrieve the root certificate
        const certData = await this._getRootCertificate();
        if (!certData) {
            console.error('Root certificate download failed');
            return false;
        }
        const bytesRootCA = Buffer.from(certData, 'utf8');
    
        // Step 2: Generate RSA key pair
        const keyPair = forge.pki.rsa.generateKeyPair(2048);
        const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
        const bytesPrivateKey = Buffer.from(privateKeyPem, 'utf8');
    
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
            console.error('Failed to extract CSR content');
            return false;
        }
        const csrStr = csrMatch[1].replace(/\r?\n|\r/g, '').trim();
    
        // Output the results
        console.info('Root CA Bytes:', bytesRootCA);
        console.info('Private Key Bytes:', bytesPrivateKey);
        console.info('CSR String:', csrStr);
    
        return true;
    }

    async _issueCertificate() {
        if (!this._clientCSR) {
            console.error("CSR not generated");
            return false;
        }

        const payload = {
            "service-code": "SVC202",
            "csr": this._clientCSR
        }

        console.info(`Request client body: ${payload}`)

        const response = await this.thinqAPI.postClientCertificate(payload);
        if (!response) {
            console.error("Failed to issue certificate");
            return false;
        }

        console.debug(`Request client certificate: ${response}`)

        const certificatePem = response.result.certificatePem;
        const subscriptions = response.result.subscriptions;
        if (!certificatePem || !subscriptions) {
            console.error("Certificate PEM or subscriptions not found");
            return false;
        }

        this._bytesCertificate = new TextEncoder().encode(certificatePem);
        this._topicSubscription = subscriptions[0];

        return true;
    }

    async _onDisconnect() {
        const result = await this.thinqAPI.deleteClientRegister(CLIENT_BODY);
        console.info("Deleted Client Register: %s",  result);
        self._state = connectionState.DISCONNECTED;
    }

    async init() {
        const routeResponse = await this.thinqAPI.getRoute();

        // Need to clean the string
        this._MQTTServer = routeResponse.mqttServer.replace("mqtts://", "").split(":")[0];
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
        const bootstrap = new io.ClientBootstrap();
        const client = new mqtt.MqttClient(bootstrap);

        const config = {
            endpoint: this._MQTTServer,
            cert: this._bytesCertificate,
            key: this._bytesPrivateKey,
            ca: this._bytesRootCA,
            client_id: this.clientId,
            clean_session: false,
            keep_alive: 6,
            on_connection_interrupted: this.onConnectionInterrupted,
            on_connection_success: this.onConnectionSuccess,
            on_connection_failure: this.onConnectionFailure,
            on_connection_closed: this.onConnectionClosed,
        };

        this._MQTTConnection = client.new_connection(config);
        
        console.debug(`Connecting to endpoint: ${this._MQTTServer} and client id: ${this.clientId}`);

        try {
            const connect = await this._MQTTConnection.connect()
            
            if (connect) {
                // Boolean is True and hence the connection is new
                console.info("Created a new session.");
            } else {
                // Boolean is False and hence the connection is being resumed.
                console.info("Resuming the session.")
            }
        } catch ( err ) {
            console.error("Failed to connect to endpoint: %s", err);
            this._MQTTConnection = null;
            return;
        }

        this._state = connectionState.CONNECTED;
        
        this._MQTTConnection.subscribe(
            this._topicSubscription, 
            mqtt.QoS.AtLeastOnce,
            this.onMessageArrived
        ).catch((reason) => {
            console.error("Error making subscription request: %s", reason)
        }).then((value) => {
            console.info(`Successfully made subscription request: ${value}`)
        })

    }

    async disconnectMQTT() {
        if (this._MQTTConnection != null) {
            this._MQTTConnection.unsubscribe(this._topicSubscription);
            await this._onDisconnect()
        }
    }


    
}
