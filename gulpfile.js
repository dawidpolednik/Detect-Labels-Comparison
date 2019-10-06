const { series } = require('gulp'); // import wtyczki umożliwiającej uruchomienie 3 zadań jeden po drugim
const main = require('./main.js'); // import modułu main.js


async function Cognitive(cb) {                  //deklaracja zadania realizującego przetwarzanie obrazu w usłudze Cognitive Services
    const Cognitive = await main.Cognitive();
    await main.makeExcel(`Cognitive`, `Cognitive`, Cognitive);
    cb();
}

async function Rekognition(cb) {                //deklaracja zadania realizującego przetwarzanie obrazu w usłudze Rekognition
    const Rekognition = await main.Rekognition();
    await main.makeExcel('Rekognition', `Rekognition`, Rekognition);
    cb()

}

async function Vision(cb) {                     //deklaracja zadania realizującego przetwarzanie obrazu w usłudze Vision
    const Vision = await main.Vision();
    await main.makeExcel('Vision', 'Vision', Vision);
    cb();
}

async function all(cb) {                    //deklaracja zadania realizującego przetwarzanie obrazu we wszystkich 3 usługach
    const file = 'Wyniki';
    const Cognitive = await main.Cognitive();
    const Rekognition = await main.Rekognition();
    const Vision = await main.Vision();
    await main.makeExcel(file, `Cognitive`, Cognitive);
    await main.makeExcel(file, `Rekognition`, Rekognition);
    await main.makeExcel(file, 'Vision', Vision);
    cb();
}

exports.default = series(Cognitive, Rekognition, Vision);
exports.Cognitive = Cognitive;
exports.Rekognition = Rekognition;
exports.Vision = Vision;
exports.all = all;
