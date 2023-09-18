const Alexa = require('ask-sdk-core');
const https = require('https');
const fs = require('fs');

const getHttps = function(url) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, response => {
            response.setEncoding('utf8');
           
            let returnData = '';
            if (response.statusCode < 200 || response.statusCode >= 300) {
                return reject(new Error(`${response.statusCode}: ${response.req.getHeader('host')} ${response.req.path}`));
            }
           
            response.on('data', chunk => {
                returnData += chunk;
            });
           
            response.on('end', () => {
                resolve(returnData);
            });
           
            response.on('error', error => {
                reject(error);
            });
        });
        request.end();
    });
}

const getProvincia = function(postalCode){
    var rawdata = fs.readFileSync('province.json');
            let province = JSON.parse(rawdata);
            var provincia;

            for(var i = 0; i < province.length; i++)
                if(postalCode >= province[i].min && postalCode <= province[i].max)
                    provincia = province[i].denominazione_provincia;

    return provincia;
}

const getIndici = function(l, dato, lista, par){

    var t = 0;
    var d = 0;

    for(var i = 0; i < l; i++){
    
        if(dato.toUpperCase() == lista[i][par].toUpperCase())
        if(i%2==0)
            t=i;
        else
            d=i;
    }
        
    if(t<d){
        let temp = t;
        t = d;
        d = temp;
    }

    var indici = new Object();
    indici['min'] = d;
    indici['max'] = t;

    return indici;

}

module.exports = {
    getHttps, getProvincia, getIndici
};