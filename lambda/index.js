const Alexa = require('ask-sdk-core');
const data = require('./data');
const permissions = ['read::alexa:device:all:address:country_and_postal_code'];
var moment = require('moment');
var momentDurationFormatSetup = require('moment-duration-format');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;
        const consentToken = requestEnvelope.context.System.user.permissions
        && requestEnvelope.context.System.user.permissions.consentToken;

        if (!consentToken) {
            return responseBuilder
              .speak("Perfavore abilita i permessi di localizzazione dall'app di alexa prima di utilizzare questa skill.")
              .withAskForPermissionsConsentCard(['read::alexa:device:all:address:country_and_postal_code'])
              .getResponse();
        }
        else {
            try {

                const { deviceId } = requestEnvelope.context.System.device;
                const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
                const address = await deviceAddressServiceClient.getCountryAndPostalCode(deviceId);
    
                const response2 = await data.getHttps('https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-province.json');
                const response = await data.getHttps('https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale-latest.json');
                var jsonResponse = JSON.parse(response);
                var jsonResponse2 = JSON.parse(response2);
                var long2 = jsonResponse2.length;
    
                const indici = data.getIndici(long2, data.getProvincia(address.postalCode), jsonResponse2, 'denominazione_provincia');
                
                const speakOutput = 'Benvenuto, i nuovi contagiati in Italia sono ' + jsonResponse[0].nuovi_positivi + ' e nella provincia di ' + jsonResponse2[indici['max']].denominazione_provincia + ' sono ' + (jsonResponse2[indici['max']].totale_casi-jsonResponse2[indici['min']].totale_casi) + '. Vuoi chiedermi altro?';
    
                handlerInput.responseBuilder
                    .speak(speakOutput)
                   
            } catch(error) {
                handlerInput.responseBuilder
                    .speak('Errore HTTPS: ' + error.message)
            }
        }
       
        return handlerInput.responseBuilder
            .reprompt('Se ti serve aiuto dimmi "Aiuto". Vuoi chiedermi altro?')
            .getResponse();
    }   
        
};

const contagiOdierniHandler = {
    canHandle(handlerInput){
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'contagiOdierni';
    },
    async handle(handlerInput) {
       
        try {
            
            const response = await data.getHttps('https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json');
            var jsonResponse = JSON.parse(response);
            var long = jsonResponse.length;

            const dataAlexa = handlerInput.requestEnvelope.request.timestamp;
            const dataDati = jsonResponse[long-1].data;


            //Alexa -> 2020-11-18T02:28:16Z GitHub -> 2020-03-10T18:00:00

            var ms = moment(dataAlexa,"YYYY/MM/DDTHH:mm:ssZ").diff(moment(dataDati,"YYYY/MM/DDTHH:mm:ss"));
            var d = moment.duration(ms);
            var s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");

            let speakOutput = jsonResponse[long-1].nuovi_positivi + ' casi con ' + (jsonResponse[long-1].tamponi - jsonResponse[long-2].tamponi) + ' tamponi, ' + (jsonResponse[long-1].deceduti - jsonResponse[long-2].deceduti) + ' morti e ' + (jsonResponse[long-1].dimessi_guariti - jsonResponse[long-2].dimessi_guariti) + ' guariti in Italia (ultimo aggiornamento ' + d.asHours().toFixed(0) + ' ore fa). Vuoi chiedermi altro?';

            handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt('Se ti serve aiuto dimmi "Aiuto". Vuoi chiedermi altro?')
                .getResponse();
               
        } catch(error) {
            handlerInput.responseBuilder
                .speak('Errore HTTPS: ' + error.message)
        }
       
        return handlerInput.responseBuilder
            .getResponse();
    }
};

const bollettinoCompletoHandler = {
    canHandle(handlerInput){
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'bollettinoCompleto';
    },
    async handle(handlerInput) {
       
        try {
            
            const response = await data.getHttps('https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json');
            var jsonResponse = JSON.parse(response);
            var long = jsonResponse.length;

            let speakOutput = jsonResponse[long-1].ricoverati_con_sintomi + ' ricoverati con sintomi, ' + jsonResponse[long-1].terapia_intensiva + ' in terapia intensiva, ' + jsonResponse[long-1].totale_ospedalizzati + ' totale ospedalizzati, ' + jsonResponse[long-1].isolamento_domiciliare + ' in isolamento domiciliare, ' + jsonResponse[long-1].totale_positivi + ' totali positivi, ' + jsonResponse[long-1].variazione_totale_positivi + ' variazione dei positivi, ' + jsonResponse[long-1].nuovi_positivi + ' nuovi positivi, ' + jsonResponse[long-1].dimessi_guariti + ' totale dimessi guariti, ' + jsonResponse[long-1].deceduti + ' totale deceduti, ' + jsonResponse[long-1].totale_casi + ' casi totali e ' + jsonResponse[long-1].tamponi + " tamponi totali. Vuoi chiedermi altro?";

            handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt('Se ti serve aiuto dimmi "Aiuto". Vuoi chiedermi altro?')
                .getResponse();
               
        } catch(error) {
            handlerInput.responseBuilder
                .speak('Errore HTTPS: ' + error.message)
        }
       
        return handlerInput.responseBuilder
            .getResponse();
    }
};

const contagiCittaHandler = {
    canHandle(handlerInput){
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'contagiCitta';
    },
    async handle(handlerInput) {
       
        try {

            const response = await data.getHttps('https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-province.json');
            var jsonResponse = JSON.parse(response);
            var long = jsonResponse.length;

            const indici = data.getIndici(long, handlerInput.requestEnvelope.request.intent.slots.citta.value, jsonResponse, 'denominazione_provincia');

            const speakOutput = (jsonResponse[indici['max']].totale_casi - jsonResponse[indici['min']].totale_casi) + ' nuovi casi e ' + jsonResponse[indici['max']].totale_casi + ' casi totali a ' + jsonResponse[indici['max']].denominazione_provincia + '. Vuoi chiedermi altro?'; 

            handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt('Se ti serve aiuto dimmi "Aiuto". Vuoi chiedermi altro?')
                .getResponse();
               
        } catch(error) {
            handlerInput.responseBuilder
                .speak('Errore HTTPS: ' + error.message)
        }
       
        return handlerInput.responseBuilder
            .getResponse();
    }
};

const contagiRegioneHandler = {
    canHandle(handlerInput){
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'contagiRegione';
    },
    async handle(handlerInput) {
       
        try {

            const response = await data.getHttps('https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni.json');
            var jsonResponse = JSON.parse(response);
            var long = jsonResponse.length;

            var indici;
            var regione = handlerInput.requestEnvelope.request.intent.slots.regione.value;
            var speakOutput;

            if(regione.toUpperCase()=='TRENTINO-ALTO ADIGE' || regione.toUpperCase()=='TRENTINO ALTO ADIGE' || regione.toUpperCase()=='TRENTINO'){
                indicitrento = data.getIndici(long, 'P.A. Bolzano', jsonResponse, 'denominazione_regione');  
                indicibolzano = data.getIndici(long, 'P.A. Trento', jsonResponse, 'denominazione_regione'); 
                speakOutput = 'Trentino-Alto Adige: ' + (jsonResponse[indicitrento['max']].nuovi_positivi + jsonResponse[indicibolzano['max']].nuovi_positivi) + ' casi con ' + ((jsonResponse[indicitrento['max']].tamponi - jsonResponse[indicitrento['min']].tamponi) + (jsonResponse[indicibolzano['max']].tamponi - jsonResponse[indicibolzano['min']].tamponi)) + ' tamponi, '+ ((jsonResponse[indicitrento['max']].deceduti-jsonResponse[indicitrento['min']].deceduti) + (jsonResponse[indicibolzano['max']].deceduti-jsonResponse[indicibolzano['min']].deceduti)) + ' morti e ' + ((jsonResponse[indicitrento['max']].dimessi_guariti - jsonResponse[indicitrento['min']].dimessi_guariti) + (jsonResponse[indicibolzano['max']].dimessi_guariti - jsonResponse[indicibolzano['min']].dimessi_guariti)) + ' guariti, nelle ultime 24 ore. Vuoi chiedermi altro?'; 
            }else{
                indici = data.getIndici(long, handlerInput.requestEnvelope.request.intent.slots.regione.value, jsonResponse, 'denominazione_regione');  
                speakOutput = jsonResponse[indici['max']].denominazione_regione +': ' + jsonResponse[indici['max']].nuovi_positivi + ' casi con ' + (jsonResponse[indici['max']].tamponi - jsonResponse[indici['min']].tamponi) + ' tamponi, '+ (jsonResponse[indici['max']].deceduti-jsonResponse[indici['min']].deceduti) + ' morti e ' + (jsonResponse[indici['max']].dimessi_guariti - jsonResponse[indici['min']].dimessi_guariti) + ' guariti, nelle ultime 24 ore. Vuoi chiedermi altro?'; 
            }
            
            handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt('Se ti serve aiuto dimmi "Aiuto". Vuoi chiedermi altro?')
                .getResponse();
               
        } catch(error) {
            handlerInput.responseBuilder
                .speak('Errore HTTPS: ' + error.message)
        }
       
        return handlerInput.responseBuilder
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Chiedimi pure il bollettino completo o riassuntivo dei contagi. Oppure chiedimi i contagi per provincia o per regione.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Spero di rivederti presto!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Scusa, non so cosa fare. Riprova. Se ti serve aiuto dimmi "Aiuto".';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `Hai appena avviato ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Errore.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        contagiOdierniHandler,
        bollettinoCompletoHandler,
        contagiCittaHandler,
        contagiRegioneHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withApiClient(new Alexa.DefaultApiClient())
    .lambda();