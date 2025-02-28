/* 
This file is responsible for providing support to LG ThinQ Connect API.
Bascially deals with querying the statues of the devices and controlling them.
*/

import axios from 'axios';
import { TextEncoder, TextDecoder } from 'node:util';
import { CLIENT_BODY, FILE_ROOT_CA, ROOT_CA_REPOSITORY, PRIVATE_KEY_SIZE } from "./const";
import { mqtt, io } from "aws-crt";
import crypto from 'node:crypto';


const connectionState = {
    CONNECTED: 'client_connected',
    DISCONNECTED: 'client_disconnected',
}

class MQTTClient {
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

        console.debug(`Root Certificate url: ${url}`);

        const response = await axios({
            method: 'GET',
            url: url,
            timeout: timeout
        });

        if (response.status != 200) {
            return null;
        }

        return response.data;
    }

    async _generateCSR() {
        const textEncoder = new TextEncoder();
        const textDecoder = new TextDecoder();

        const response = await this._getRootCertificate();
        
        if (response === null) {
            console.error("Failed to get the Root Certificate");
            return false;
        }

        this._bytesRootCA = textEncoder.encode(response);

        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: PRIVATE_KEY_SIZE,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });

        this._bytesPrivateKey = textEncoder.encode(privateKey);

        // not sure about this snippet
        const csr = crypto.createSign("sha512")
        csr.update("CN=lg_thinq");
        csr.update(publicKey); 
        csr.end();

        const signature = csr.sign(privateKey).toString();
        // Till here
        
        const matches = signature.match(/-----BEGIN CERTIFICATE REQUEST-----\s+([\s\S]+?)\s+-----END CERTIFICATE REQUEST-----/);
        if (!matches) {
            console.error("Failed to parse CSR PEM");
            return false;
        }
        const csrStr = matches[1].replace(/\n/g, '').trim();

        this._clientCSR = csrStr;

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

        const response = await this._thinqAPI.postClientCertificate(payload);
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
        const result = await this._thinqAPI.deleteClientRegister(payload=CLIENT_BODY);
        console.info("Deleted Client Register: %s",  result);
        self._state = connectionState.DISCONNECTED;
    }

    async init() {
        const routeResponse = await this._thinqAPI.getRoute();

        // Need to clean the string
        this._MQTTServer = routeResponse.mqttServer.replace("mqtts://", "").split(":")[0];
    }

    async prepareMQTT() {
        await this._thinqAPI.postClientRegister(payload=CLIENT_BODY);

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
