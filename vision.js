/* import wymaganych bibliotek oraz modułów*/
let _ = require("lodash");
const rename = require("./renameProperties.js");
const { performance } = require('perf_hooks');

/*Funkcja filtrujaca otrzymane dane po uruchomieniu funkcjonalności etykietowania obrazu dla Vision  */
filterVisionTags = (response, path, responseTime) => {
  const animal = path.split('\\')[5];
  const result = response.filter(
    obj =>
      !!(animal.indexOf(obj.description.toLowerCase()) !== -1)
  );
  const filterProperties = result.map(obj =>
    _.pick(obj, ["description", "score"])
  );
  const newRenameProperties = filterProperties.map(obj =>
    rename.renameProperties("description", "name", "score", "confidence", obj)
  );
  const listOfResults = newRenameProperties.map(obj => ({ path: path.substr(path.indexOf('\animals')), name: obj.name, confidence: (obj.confidence * 100).toFixed(2), responseTime: responseTime }))
  return result.length === 0
    ? { path: path.substr(path.indexOf('\animals')), name: `${animal}`, confidence: 0, responseTime: responseTime }
    : listOfResults[0];
};

/*Funkcja asynchroniczna realizująca przetwarzanie obrazu w chmurze w usłudze Vision */
exports.callVision = async function visionDetectLabels(path) {

  const vision = require("@google-cloud/vision");

  const client = new vision.ImageAnnotatorClient({
    keyFilename: "./credentials/vision.json"
  });
  var start = performance.now();
  const [result] = await client.labelDetection(
    path
  );
  const responseTime = await ((performance.now() - start) / 1000).toFixed(2);

  const labels = result.labelAnnotations;

  return filterVisionTags(labels, path, responseTime);
  start = 0;
}

