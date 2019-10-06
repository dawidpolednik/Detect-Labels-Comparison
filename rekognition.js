/* import wymaganych bibliotek oraz modułów*/
const AWS = require('aws-sdk');
const fs = require('fs');
let _ = require("lodash");
const { performance } = require('perf_hooks');
const rename = require("./renameProperties.js");
AWS.config.loadFromPath('./credentials/rekognition.json');
const rekognition = new AWS.Rekognition();

/*Funkcja asynchroniczna realizująca przetwarzanie obrazu w chmurze w usłudze Rekognition */
exports.callaws = file => {
    return new Promise((resolve, rejected) => {
        getBase64BufferFromFile(file).then(bufferImage => {
            const params = {
                Image: {
                    Bytes: bufferImage
                }
                ,
                MinConfidence: 0.00,
            };
            let start = performance.now();
            rekognition.detectLabels(params, (err, data) => {
                if (err) {
                    rejected(console.log(err, err.stack));
                    return;
                }
                resolve(filterRekognitionTags(data, file, ((performance.now() - start) / 1000).toFixed(2)));
                start = '';
            });
        })
    })
}
/*Funkcja filtrujaca otrzymane dane po uruchomieniu funkcjonalności etykietowania obrazu dla Rekognition */
filterRekognitionTags = (response, path, responseTime) => {
    const extractTag = response.Labels;
    const animalToFind = path.split('\\')[5];
    const result = extractTag.filter(
        obj => !!(animalToFind.indexOf(obj.Name.toLowerCase()) !== -1)
    );
    const filterProperties = result.map(obj =>
        _.pick(obj, ["Name", "Confidence"])
    );
    const newRenameProperties = filterProperties.map(obj =>
        rename.renameProperties("Name", "name", "Confidence", "confidence", obj)
    );

    const listOfResults = newRenameProperties.map(obj => ({ path: path.substr(path.indexOf('\animals')), name: obj.name, confidence: obj.confidence.toFixed(2), responseTime: responseTime }))

    return result.length === 0
        ? { path: path.substr(path.indexOf('\animals')), name: `${animalToFind}`, confidence: 0, responseTime: responseTime }
        : listOfResults[0];
}
/*Funkcja realizująca kodowanie Base64 na pojdyńczym obrazie */
getBase64BufferFromFile = filename => {
    return (new Promise((resolve, reject) => {
        fs.readFile(filename, 'base64', (err, data) => {
            if (err) reject(err);
            resolve(Buffer.from(data, 'base64'));
        });
    })).catch(error => {
        console.log('[ERROR]', error);
    });
}
