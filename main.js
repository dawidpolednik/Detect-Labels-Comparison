/* import wymaganych bibliotek oraz modułów*/
var cognitive = require("./cognitive.js");
var rekognitionFile = require("./rekognition.js");
var vision = require("./vision.js");
const klawSync = require('klaw-sync');
var fs = require('fs');
let _ = require("lodash");
var Excel = require('exceljs');
const workbook = new Excel.Workbook({
    useStyles: true
})

/* Ustawienie nagłówków */
const headers = [
    { header: 'Plik', key: 'path', width: 40 },
    { header: 'Zwierze', key: 'name', width: 12 },
    { header: 'Prawdopodobienstwo(%)', key: 'confidence', width: 24 },
    { header: 'Czas odpowiedzi(s)', key: 'responseTime', width: 20 }
];

/*funkcja asynchroniczna realizująca tworzenie nowego arkusza kalkulacyjengo za pomocą biblioteki exceljs  */
async function makeExcel(file, sheet, responses) {
    const worksheet = workbook.addWorksheet(sheet);
    worksheet.columns = headers;
    for (let i = 0; i < responses.length; i++) {
        worksheet.addRow(responses[i]);
    }
    worksheet.getRow(1).style.font = { size: 12, name: 'Bahnschrift SemiBold SemiConden' }
    worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '993399' }
        },
            cell.style.font = {
                color: {
                    argb: 'ffffff'
                },
                size: 14,
            }
    })
    worksheet.eachRow((Row, rowNumber) => {
        Row.alignment = {
            horizontal: 'center',
        }
        Row.eachCell((Cell, cellNumber) => {
            Cell.alignment = {
                vertical: 'middle',
                horizontal: 'center'
            },
                Cell.border = {
                    top: { style: 'double', color: { argb: 'black' } },
                    left: { style: 'double', color: { argb: 'black' } },
                    bottom: { style: 'double', color: { argb: 'black' } },
                    right: { style: 'double', color: { argb: 'black' } }
                }
        })
    })
    worksheet.views = [
        { state: 'frozen', xSplit: 1, ySplit: 1, activeCell: 'B2' },
    ];
    await workbook.xlsx.writeFile(`./excel/${file}.xlsx`)
    console.log(`Arkusz ${sheet} w pliku ${file}.xlsx został poprawnie utworzony`);
}
exports.makeExcel = makeExcel;


const directoryToExplore = "./animals/with/bear/6"; // ustawienie folderu nadrzędnego
const files = klawSync(directoryToExplore, {
    nodir: true,
});
const arrayOfFiles = files.map(file => file.path); // mapowanie ścieżek  danych testowych

// wywoływanie rządań asynchronicznych dla wszystkich 3 usług
async function Cognitive() {
    let tab = [];
    for (let i = 0; i < arrayOfFiles.length; i++) {
        let x = await cognitive.cognitiveDetectLabels(arrayOfFiles[i]);
        tab.push(x)
    }

    return tab;
}
exports.Cognitive = Cognitive;


async function Rekognition() {
    let tab = [];

    for (let i = 0; i < arrayOfFiles.length; i++) {
        let x = await rekognitionFile.callaws(arrayOfFiles[i]);
        tab.push(x)
    }
    return tab;
}
exports.Rekognition = Rekognition;

async function Vision() {
    let tab = [];

    for (let i = 0; i < arrayOfFiles.length; i++) {
        let x = await vision.callVision(arrayOfFiles[i]);
        tab.push(x)
    }

    return tab;
}
exports.Vision = Vision;





