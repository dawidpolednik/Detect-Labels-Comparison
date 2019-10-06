
/* import wymaganych bibliotek oraz modułów*/
const request = require("request");
const fs = require("fs");
let _ = require("lodash");

/*Funkcja filtrujaca otrzymane dane po uruchomieniu funkcjonalności etykietowania obrazu dla Cognitive Services  */
filterCognitiveTags = (response, path, responseTime) => {
    const extractTag = response.tags;
    const animal = path.split('\\')[5];
    const result = extractTag.filter(
        obj => !!(animal.indexOf(obj.name) !== -1)
    );
    const filterProperties = result.map(obj =>
        _.pick(obj, ["name", "confidence"])
    );

    const listOfResults = filterProperties.map(obj => ({ path: path.substr(path.indexOf('\animals')), name: obj.name, confidence: (obj.confidence * 100).toFixed(2), responseTime: responseTime }))

    return result.length === 0
        ? { path: path.substr(path.indexOf('\animals')), name: `${animal}`, confidence: 0, responseTime: responseTime }
        : listOfResults[0];
};

const CognitiveServicesSubscriptionKey = "/*** INSERT YOUR SUBSCRIPTIONKEY  HERE ***/", ; //kod subskrypcji klienta
const uriBaseAzure =
    "/*** INSERT YOUR REGION  HERE ***/", ; // ustawienie regionu

/*Funkcja asynchroniczna realizująca przetwarzanie obrazu w chmurze w usłudze Cognitive Services */
exports.cognitiveDetectLabels = path => {
    return new Promise((resolve, rejected) => {
        const options = {
            url: uriBaseAzure,
            qs: {
                visualFeatures: "Categories",
                details: "",
                language: "en"
            },
            headers: {
                "Content-Type": "application/octet-stream",
                "Ocp-Apim-Subscription-Key": CognitiveServicesSubscriptionKey
            },
            body: fs.readFileSync(path),
            time: true,
        };
        request.post(options, (error, res, body) => {
            if (error) {
                rejected(console.log("Error: ", error));
                return;
            }
            const jsonResponse = JSON.parse(body);
            const responseInSeconds = (res.elapsedTime / 1000).toFixed(2);

            resolve(filterCognitiveTags(jsonResponse, path, responseInSeconds)
            )
        });

    }
    );
};



