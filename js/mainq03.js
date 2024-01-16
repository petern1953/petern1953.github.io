// Új koncepció: minden mozgatás előtt létrehozzuk az svg-elemeket, és appendeljük az svg végére a megfelelő takarási sorrendben; 
// az előzőeket töröljük, az animációt pedig az új elemekkel végezzük.
//
// Az elemeket három csoportra osztjuk:
// 1. hátul vannak a mozdulatlan elemek, ezeket appendeljük elsőként (elegendő csak a látható elülsőket létrehozni)
// 2. középen van az aktuális (mozgatástól függő) szürke rombusz, ebből háromféle lehet (x-re, y-ra és z-re merőleges);
//    ez is mozdulatlan, feladata a belső test illúziójának keltése
// 3. legelöl vannak a mozgó elemek, ezeket appendeljük utoljára, hogy mozgás közben letakarják az alattuk levőket.
//
// A korábbi változattal ellentétben ezek az elemek a mozgatás előtt -- egy színmátrixból -- kapják meg a kitöltő színüket.
// Az egyes színek pozícióját nem maguk az elemek, hanem ez a színmátrix őrzi, a mozgatást követő adminisztrációt ott végezzük.

// const SVG = document.querySelector("svg");
// const ARROWSouter = document.getElementById('arrowsGroup').outerHTML;

// randomTurns(n) n forgatás véletlenszerűen
// lilaArrow balra is
// prelude(setupForLilaTurn) és Left egyszerűsítve
// prelude1(...args) tovább egyszerűsítve
// turn3InCircle(), turn2InCircle() egyszerűsítve
// showBacks(), showFores() a felső szövegben az "arrow" szóra vitt kurzor megjeleníti a hátsó színeket
// turnInOrder = turnAtWill kívánság szerinti színek forgatása a megadott sorrendben: pl. LJ, LB, SJ, PJ
// randomTurns(n), solve() véletlenszerű n forgatás, visszapörgetés a kiinduló állapotba (hibás)
// setupForPirosTurn egyszerűsítése
// a piros és a sárga balra forgatás is működik, a 6 arrows is funkcionál

const ellipseRATIO = 1 / Math.sqrt(3);

const ORIGO = { x: 300, y: 160 }; // lila Origo
const sargaORIGO = { x: 441.42, y: 404.95 };
const pirosORIGO = { x: 158.58, y: 404.95 };

const squareSIZE = 200;
const iMAX = 360 / 15;

const BIGperSMALL = Math.sqrt(2);
const degreeStep = Math.PI / 12;
const deg45 = Math.PI / 4;

const DURATION = 3000;
let finished = false;

// ellipszispontok, az animáció fázispontjai
let innerLilaX = [], outerLilaX = [];
let innerLilaY = [], outerLilaY = [];

let innerSargaX = [], outerSargaX = [];
let innerSargaY = [], outerSargaY = [];

let innerPirosX = [], outerPirosX = [];
let innerPirosY = [], outerPirosY = [];

// a lila és a kék lap közti síkon lévő ellipszisek pontjai
let innerMidLilaX = [], outerMidLilaX = [];
let innerMidLilaY = [], outerMidLilaY = [];

// a sárga és a narancs lap közti síkon lévő ellipszisek pontjai
let innerMidSargaX = [], outerMidSargaX = [];
let innerMidSargaY = [], outerMidSargaY = [];

// a piros és a zöld lap közti síkon lévő ellipszisek pontjai
let innerMidPirosX = [], outerMidPirosX = [];
let innerMidPirosY = [], outerMidPirosY = [];


let opacy = 1;

let PIROS = "rgba(255,0,0," + opacy + ")";
let LILA = "rgba(191,55,255," + opacy + ")";
let SARGA = "rgba(191,255,55," + opacy + ")"; 
let NARANCS = "rgba(255,128,5," + opacy + ")"; 
let ZOLD = "rgba(0,255,0," + opacy + ")"; 
let KEK = "rgba(0,0,255," + opacy + ")";

let SZURKE = "rgba(160,160,160,.5)";

let P = PIROS, L = LILA, S = SARGA, N = NARANCS, Z = ZOLD, K = KEK;

let COLORS = [[P, P, P, P], [L, L, L, L], [S, S, S, S], [N, N, N, N], [Z, Z, Z, Z], [K, K, K, K]];

// definiáljuk a 6 * 4 = 24 elemi kockát
let NS = "http://www.w3.org/2000/svg";
const SVG = document.getElementById('demo-svg');
let svgG;

// ez lesz a g containerünk
function newSVGg() {
    svgG = document.createElementNS(NS, "g");
    svgG.setAttribute("id", "newG");
    SVG.appendChild(svgG);
}

// a korábbi új lesz a régi, helyette mindig újat hozunk létre, ezt töröljük
function renameGtoOldg() {
    let oldG = document.getElementById('newG');
    oldG.setAttribute("id", "oldG");
}

// ez lesz az animációk alapja, egyben a lila oldal- és rétegpozíciók
fillStepPoints("Lila");
fillStepPoints("Sarga");
fillStepPoints("Piros");

// a választott színű forgatás előkészítése, a struktúra felépítése
function prelude(_setupColor) {
    renameGtoOldg();
    newSVGg();
    _setupColor();
    deleteOldG();
    finished = false;
}

function prelude1(...args) {
    renameGtoOldg();
    newSVGg();
    setupColor(...args);
    deleteOldG();
    finished = false;
}

function createPoly(id, points, color) {
    let poly = document.createElementNS(NS, "polyline");
    poly.setAttribute("points", points);
    poly.setAttribute("fill", color);
    poly.setAttribute("stroke", SZURKE);
    poly.setAttribute("stroke-width", 1);
    poly.setAttribute("opacity", 1);
    poly.setAttribute("id", id);
    poly.setAttribute("class", color);
    return poly;
}

let narancs4 = createPoly("narancs4", "158.58,241.35 300,159.7 300,-3.3 158.58,78.35", N);
let narancs3 = createPoly("narancs3", "158.58,241.35 158.58,78.35 17.16,160 17.16,322.6", N);
let narancs2 = createPoly("narancs2", "158.42,240.95 17,322.6 17,485.9 158.42,404.25", N);
let narancs1 = createPoly("narancs1", "158.42,240.95 299.84,159.3 299.84,322.6 158.42,404.25", N);

let zold4 = createPoly("zold4", "441.34,241.3 441.34,404.6 582.84,486.6 582.84,323.3", Z);
let zold3 = createPoly("zold3", "441.34,241.3 582.84,323.3 582.84,160 441.34,78", Z);
let zold2 = createPoly("zold2", "441.42,241.35 441.42,78.35 300,-3.3 300,159.7", Z);
let zold1 = createPoly("zold1", "441.58,240.95 441.58,404.25 300.16,322.6 300.16,159.30", Z);

let kek4 = createPoly("kek4", "300,486.5 441.42,568.15 582.84,486.5 441.42,404.85", K);
let kek3 = createPoly("kek3", "300,486.5 158.58,404.85 300,323.2 441.42,404.85", K);
let kek2 = createPoly("kek2", "300,486.25 158.5,404.6 17.16,486.6 158.58,568.25", K);
let kek1 = createPoly("kek1", "300,486.25 158.5,567.9 300,649.9 441.42,568.25", K);

let sarga4 = createPoly("sarga4", "441.42,404.95 441.42,241.65 582.84,160.00 582.84,323.30", S);
let sarga3 = createPoly("sarga3", "441.42,404.95 300.00,486.60 300.00,323.30 441.42,241.65", S);
let sarga2 = createPoly("sarga2", "441.42,404.95 441.42,568.25 300.00,649.90 300.00,486.60", S);
let sarga1 = createPoly("sarga1", "441.42,404.95 582.84,323.30 582.84,486.60 441.42,568.25", S);

let piros4 = createPoly("piros4", "158.58,404.95 300.00,486.60 300.00,649.9 158.58,568.25", P);
let piros3 = createPoly("piros3", "158.58,404.95 158.58,241.65 300.00,323.3 300.00,486.60", P);
let piros2 = createPoly("piros2", "158.58,404.95  17.16,323.30  17.16,160.0 158.58,241.65", P);
let piros1 = createPoly("piros1", "158.58,404.95 158.58,568.25  17.16,486.6  17.16,323.30", P);

let lila4 = createPoly("lila4", "300,160 441.42, 78.35 582.84,160.0 441.42,241.65", L);
let lila3 = createPoly("lila3", "300,160 158.58, 78.35 300.00, -3.3 441.42, 78.35", L);
let lila2 = createPoly("lila2", "300,160 158.58,241.65  17.16,160.0 158.58, 78.35", L);
let lila1 = createPoly("lila1", "300,160 441.42,241.65 300.00,323.3 158.58,241.65", L);

let lilaKoz = createPoly("lilaKoz", "300,486.3 17.16,323 300,159.7 582.84,323", SZURKE);
let sargaKoz = createPoly("sargaKoz", "441.34,404.6 158.5,567.9 158.5,241.3 441.34,78", SZURKE);
let pirosKoz = createPoly("pirosKoz", "441.34,567.9 158.5,404.6 158.5,78 441.34,241.3", SZURKE);

let lilaArrow = createPoly("lilaArrow", "107,189 126,180 125.5,193.7 146.5,198 144.8,212.5 125.5,200.5 124.8,214.2", SZURKE);
let lilaLArrow = createPoly("lilaLArrow", "214,243 235.6,253.4 235.6,243.4 258,262.5 234,273 235,261.8 213.5,256.5", SZURKE);
let sargaArrow = createPoly("sargaArrow", "324.23 417.88 335.24 430.22 325.4 434.9 326.27 454.61 314.27 457.91 319.64 436.82 306.74 440.42", SZURKE);
let sargaLArrow = createPoly("sargaLArrow", "332.3,514.7 322,517 326,495 314.3,498.3 316.7,518.7 306.3,521 318,535.7", SZURKE);
let pirosArrow = createPoly("pirosArrow", "49.23 282.88 60.24 295.22 50.4 299.9 51.27 319.61 39.27 322.91 44.64 301.82 31.74 305.42", SZURKE);
let pirosLArrow = createPoly("pirosLArrow", "56.3,373.7 46,376 50,354 38.3,357.3 40.7,377.7 30.3,380 42,394.7", SZURKE);

lilaArrow.setAttribute("onclick", "lilaTurn()"); 
lilaLArrow.setAttribute("onclick", "lilaTurnLeft()");
sargaArrow.setAttribute("onclick", "sargaTurn()");
sargaLArrow.setAttribute("onclick", "sargaTurnLeft()");
pirosArrow.setAttribute("onclick", "pirosTurn()");
pirosLArrow.setAttribute("onclick", "pirosTurnLeft()");

lilaArrow.setAttribute("class", "arrow");
lilaLArrow.setAttribute("class", "arrow");
sargaArrow.setAttribute("class", "arrow");
sargaLArrow.setAttribute("class", "arrow");
pirosArrow.setAttribute("class", "arrow");
pirosLArrow.setAttribute("class", "arrow");

// temp ***** a tesztelés idótartamára
// piros1.setAttribute("visibility", "hidden");
// piros2.setAttribute("visibility", "hidden");
// piros3.setAttribute("visibility", "hidden");
// piros4.setAttribute("visibility", "hidden");

// sarga1.setAttribute("visibility", "hidden");
// sarga2.setAttribute("visibility", "hidden");
// sarga3.setAttribute("visibility", "hidden");
// sarga4.setAttribute("visibility", "hidden");

// lila1.setAttribute("visibility", "hidden");
// lila2.setAttribute("visibility", "hidden");
// lila3.setAttribute("visibility", "hidden");
// lila4.setAttribute("visibility", "hidden");
// *************

function deleteOldG() {
    oldG = document.getElementById('oldG');
    oldG.remove();
}

function showArrows() {
    svgG.appendChild(lilaArrow);
    svgG.appendChild(lilaLArrow);
    svgG.appendChild(sargaArrow);
    svgG.appendChild(sargaLArrow);
    svgG.appendChild(pirosArrow);
    svgG.appendChild(pirosLArrow);
}

function arrowsOff() {
    lilaArrow.setAttribute("visibility", "hidden");
    lilaLArrow.setAttribute("visibility", "hidden");
    sargaArrow.setAttribute("visibility", "hidden");
    sargaLArrow.setAttribute("visibility", "hidden");
    pirosArrow.setAttribute("visibility", "hidden");
    pirosLArrow.setAttribute("visibility", "hidden");
}

function arrowsOn() {
    lilaArrow.setAttribute("visibility", "visible");
    lilaLArrow.setAttribute("visibility", "visible");
    sargaArrow.setAttribute("visibility", "visible");
    sargaLArrow.setAttribute("visibility", "visible");
    pirosArrow.setAttribute("visibility", "visible");
    pirosLArrow.setAttribute("visibility", "visible");
}

// alapértelmezett a lila szín
prelude1(sarga1, sarga2, piros4, piros1, lilaKoz, narancs3, narancs4, zold2, zold3, piros3, piros2, sarga4, sarga3, lila4, lila3, lila2, lila1);

function setupColor(...args) {
    for (let i = 0; i < arguments.length; i++) {
        svgG.appendChild(arguments[i]);
    }
    showArrows();
}

// lila forgatás eszközei
function lilaTurn() {
    arrowsOff();
    prelude1(sarga1, sarga2, piros4, piros1, lilaKoz, narancs3, narancs4, zold2, zold3, piros3, piros2, sarga4, sarga3, lila4, lila3, lila2, lila1);
    turnLilaRight90();
    turnPiros1();
    turnPiros2();
    turnSarga1();
    turnSarga2();
    turnNarancs1();
    turnNarancs2();
    turnGreen1(); 
    turnGreen2();
}

function lilaTurnLeft() {
    arrowsOff();
    prelude1(sarga1, sarga2, piros4, piros1, lilaKoz, zold2, zold3, narancs3, narancs4, sarga4, sarga3,  piros3, piros2,lila4, lila3, lila2, lila1);
    turnLilaLeft90();
    turnPiros1Left();
    turnPiros2Left();
    turnSarga1Left();
    turnSarga2Left();
    turnNarancs1Left();
    turnNarancs2Left();
    turnGreen1Left(); 
    turnGreen2Left();
}

function turnLilaRight90() {
    turnLilaRight(6, DURATION);
};

function turnLilaLeft90() {
    turnLilaLeft(6, DURATION);
};

function turnLilaRight(steps, duration) {
    anime({
        targets: lila1,
        points: animPoints.slice(4, steps + 4),
        easing: 'linear',
        duration: duration,
        loop: false
    });
    anime({
        targets: lila2,
        points: animPoints.slice(10, steps + 10),
        easing: 'linear',
        duration: duration,
        loop: false
    });
    anime({
        targets: lila3,
        points: animPoints.slice(16, steps + 16),
        easing: 'linear',
        duration: duration,
        loop: false
    });
    anime({
        targets: lila4,
        points: animPoints.slice(22, steps + 22),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnLilaLeft(steps, duration) {
    anime({
        targets: lila1,
        points: lilaLAnimPoints.slice(21, steps + 21),
        easing: 'linear',
        duration: duration,
        loop: false
    });
    anime({
        targets: lila2,
        points: lilaLAnimPoints.slice(15, steps + 15),
        easing: 'linear',
        duration: duration,
        loop: false
    });
    anime({
        targets: lila3,
        points: lilaLAnimPoints.slice(9, steps + 9),
        easing: 'linear',
        duration: duration,
        loop: false
    });
    anime({
        targets: lila4,
        points: lilaLAnimPoints.slice(3, steps + 3),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

// az id-kkel operálunk
function adminLilaTurn() {
    // lila lap
    let l = lila1;
    lila1 = lila4;
    lila4 = lila3;
    lila3 = lila2;
    lila2 = l;

    // lila réteg
    // narancsot elmentjük
    let safe = [narancs3, narancs4];
    // narancsból piros
    narancs3 = piros3; narancs4 = piros2;
    // pirosból sárga
    piros2 = sarga3; piros3 = sarga4;
    // sárgából zöld
    sarga3 = zold3; sarga4 = zold2;
    // zöldbe a narancs mentése
    zold2 = safe[0]; zold3 = safe[1];
}
// csak bambán másolva, ténylegesíteni kell
function adminLilaTurnLeft() {
    // lila lap
    let l = lila1;
    lila1 = lila2;
    lila2 = lila3;
    lila3 = lila4;
    lila4 = l;

    // lila réteg
    // zöldet elmentjük
    let safe = [zold3, zold2];
    // zöldből sárga
    zold3 = sarga3; zold2 = sarga4;
    // sárgából piros
    sarga3 = piros2; sarga4 = piros3;
    // pirosból narancs
    piros2 = narancs4; piros3 = narancs3;
    // narancsba a zöld mentése
    narancs4 = safe[0]; narancs3 = safe[1];
}

function pirosTurn() {
    arrowsOff();
    prelude1(lila3, lila4, sarga4, sarga1, pirosKoz, kek1, kek2, narancs2, narancs3, sarga3, sarga2, lila2, lila1, piros4, piros3, piros2, piros1);
    turnPirosRight90();
    turnPlila1();
    turnPlila0();
    turnPsarga2();
    turnPsarga1();
    turnPkek0();
    turnPkek1();
    turnPnarancs1();
    turnPnarancs2();
}

function pirosTurnLeft() {
    arrowsOff();
    prelude1(lila3, lila4, sarga4, sarga1, pirosKoz, narancs2, narancs3, kek1, kek2, lila2, lila1, sarga3, sarga2, piros4, piros3, piros2, piros1);
    turnPirosLeft90();
    turnPlila1Left();
    turnPlila0Left();
    turnPsarga2Left();
    turnPsarga1Left();
    turnPkek0Left();
    turnPkek1Left();
    turnPnarancs1Left();
    turnPnarancs2Left();
}

function turnPirosRight90() {
    turnPirosRight(6, DURATION);
};

function turnPirosLeft90() {
    turnPirosLeft(6, DURATION);
};

function turnPirosRight(steps, duration) {
    anime({
        targets: piros1,
        points: pirosAnimPoints.slice(4, steps + 4),
        easing: 'linear',
        duration: duration,
        loop: false
    });
    anime({
        targets: piros2,
        points: pirosAnimPoints.slice(10, steps + 10),
        easing: 'linear',
        duration: duration,
        loop: false
    });
    anime({
        targets: piros3,
        points: pirosAnimPoints.slice(16, steps + 16),
        easing: 'linear',
        duration: duration,
        loop: false
    });
    anime({
        targets: piros4,
        points: pirosAnimPoints.slice(22, steps + 22),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnPirosLeft(steps, duration) {
    anime({
        targets: piros1,
        points: pirosLAnimPoints.slice(21, steps + 21),
        easing: 'linear',
        duration: duration,
        loop: false
    });
    anime({
        targets: piros2,
        points: pirosLAnimPoints.slice(15, steps + 15),
        easing: 'linear',
        duration: duration,
        loop: false
    });
    anime({
        targets: piros3,
        points: pirosLAnimPoints.slice(9, steps + 9),
        easing: 'linear',
        duration: duration,
        loop: false
    });
    anime({
        targets: piros4,
        points: pirosLAnimPoints.slice(3, steps + 3),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

// az id-kkel operálunk
function adminPirosTurn() {
    // piros lap
    let p = piros1;
    piros1 = piros4;
    piros4 = piros3;
    piros3 = piros2;
    piros2 = p;

    // piros réteg
    // lilát elmentjük
    let safe = [lila2, lila1];
    // lilából narancs
    lila2 = narancs2; lila1 = narancs3;
    // narancsból kék
    narancs2 = kek1; narancs3 = kek2;
    // kékből sárga
    kek1 = sarga3; kek2 = sarga2;
    // sárgából a lila mentése
    sarga2 = safe[1]; sarga3 = safe[0];
}

function adminPirosTurnLeft() {
    // piros lap
    let p = piros1;
    piros1 = piros2;
    piros2 = piros3;
    piros3 = piros4;
    piros4 = p;

    // piros réteg
    // lilát elmentjük
    let safe = [lila2, lila1];
    // lilából sárga
    lila2 = sarga3; lila1 = sarga2;
    // sárgából kék
    sarga3 = kek1; sarga2 = kek2;
    // kékből narancs
    kek1 = narancs2; kek2 = narancs3;
    // narancsból a lila mentése
    narancs2 = safe[0]; narancs3 = safe[1];
}

function sargaTurn() {
    arrowsOff();
    prelude1(lila2, lila3, piros1, piros2, sargaKoz, zold3, zold4, kek4, kek1, lila1, lila4, piros4, piros3, sarga4, sarga3, sarga2, sarga1);
    turnSargaRight90();
    turnRed1();
    turnRed2();
    turnLila1();
    turnLila2();
    turnZold1();
    turnZold2();
    turnKek1();
    turnKek2();
}

function sargaTurnLeft() {
    arrowsOff();
    prelude1(lila2, lila3, piros1, piros2, sargaKoz, kek4, kek1, zold3, zold4, piros4, piros3, lila1, lila4, sarga4, sarga3, sarga2, sarga1);
    turnSargaLeft90();
    turnRed1Left();
    turnRed2Left();
    turnLila1Left();
    turnLila2Left();
    turnZold1Left();
    turnZold2Left();
    turnKek1Left();
    turnKek2Left();
}

function turnSargaRight90() {
    turnSargaRight(6, DURATION);
};

function turnSargaLeft90() {
    turnSargaLeft(6, DURATION);
};

// az id-kkel operálunk az adminisztráció során
function adminSargaTurn() {
    // sárga lap
    // console.log("admin");
    let s = sarga1;
    sarga1 = sarga4;
    sarga4 = sarga3;
    sarga3 = sarga2;
    sarga2 = s;

    // sárga réteg
    // a lilát elmentjük
    let safe = [lila4, lila1];
    // lilából piros
    lila4 = piros3; lila1 = piros4;
    // pirosból kék
    piros3 = kek1; piros4 = kek4;
    // kékből zold
    kek1 = zold4; kek4 = zold3;
    // zöldből a lila mentése
    zold4 = safe[0]; zold3 = safe[1];
}

function adminSargaTurnLeft() {
    // sárga lap
    // console.log("admin");
    let s = sarga1;
    sarga1 = sarga2;
    sarga2 = sarga3;
    sarga3 = sarga4;
    sarga4 = s;

    // sárga réteg
    // a lilát elmentjük
    let safe = [lila4, lila1];
    // lilából zöld
    lila4 = zold4; lila1 = zold3;
    // zöldből kék
    zold4 = kek1; zold3 = kek4;
    // kékből piros
    kek1 = piros3; kek4 = piros4;
    // pirosból a lila mentése
    piros3 = safe[0]; piros4 = safe[1];
}
// forgatási eszközök vége

function fillStepPoints(color) {
    let coordsI = document.getElementById("tempI" + color);
    let coordsO = document.getElementById("tempO" + color);
    let coordsIM = document.getElementById("tempIM" + color);
    let coordsOM = document.getElementById("tempOM" + color);

    for (let i = 0; i < iMAX; i++) {
        eval("inner" + color + "X[i] = coordsI.points[i].x");
        eval("inner" + color + "Y[i] = coordsI.points[i].y");

        eval("outer" + color + "X[i] = coordsO.points[i].x");
        eval("outer" + color + "Y[i] = coordsO.points[i].y");
        
        eval("innerMid" + color + "X[i] = coordsIM.points[i].x");
        eval("innerMid" + color + "Y[i] = coordsIM.points[i].y");

        eval("outerMid" + color + "X[i] = coordsOM.points[i].x");
        eval("outerMid" + color + "Y[i] = coordsOM.points[i].y");
    };
};

let newCoordinates = [];
function fillCoordinates() {
    for (let i = 0; i < iMAX; i++) {
        newCoordinates[i] = `${ORIGO.x},${ORIGO.y} ${innerLilaX[i]},${innerLilaY[i]} ${outerLilaX[(i + 3) % iMAX]},${outerLilaY[(i + 3) % iMAX]} ${innerLilaX[(i + 6) % iMAX]},${innerLilaY[(i + 6) % iMAX]}`;
    }
}
fillCoordinates();

let animPoints = [], lilaLAnimPoints = [];

function fillAnimPoints() {
    for (let i = 0; i < iMAX; i++) {
        animPoints[i] = { value: newCoordinates[i] };
        lilaLAnimPoints[i] = { value: newCoordinates[iMAX-i-1] };
    };
};

function fillAnimPointsOver() {
    for (let i = 0; i < 12; i++) {
        animPoints[i + 24] = { value: newCoordinates[i] };
        lilaLAnimPoints[i + 24] = lilaLAnimPoints[i];
    };
};

fillAnimPoints();
fillAnimPointsOver();

// function removeOffAttributes() {
//     for (let i = 0; i < iMAX + 6; i++) {
//         delete animPoints[i].delay;
//         delete animPoints[i].endDelay;
//     };
// }

// removeOffAttributes();

let newSargaCoordinates = [];
function fillSargaCoordinates() {
    for (let i = 0; i < iMAX; i++) {
        newSargaCoordinates[i] = `${sargaORIGO.x}, ${sargaORIGO.y} ${innerSargaX[i]}, ${innerSargaY[i]} ${outerSargaX[(i + 3) % iMAX]}, ${outerSargaY[(i + 3) % iMAX]} ${innerSargaX[(i + 6) % iMAX]}, ${innerSargaY[(i + 6) % iMAX]}`;
    }
}
fillSargaCoordinates();

let sargaAnimPoints = [], sargaLAnimPoints = [];

function fillSargaAnimPoints() {
    for (let i = 0; i < iMAX; i++) {
        sargaAnimPoints[i] = { value: newSargaCoordinates[i] };
        sargaLAnimPoints[i] = { value: newSargaCoordinates[iMAX-i-1] };
    };
};

function fillSargaAnimPointsOver() {
    for (let i = 0; i < 12; i++) {
        sargaAnimPoints[i + 24] = { value: newSargaCoordinates[i] };
        sargaLAnimPoints[i + 24] = sargaLAnimPoints[i];
    };
};

fillSargaAnimPoints();
fillSargaAnimPointsOver();

function shiftSargaAnimPoints(n) {
    let toBack = {};
    for (let i = 0; i < n; i++) {
        toBack = sargaAnimPoints.slice(0, 1);
        sargaAnimPoints.push(toBack);
    }
};

let newPirosCoordinates = [];
function fillPirosCoordinates() {
    for (let i = 0; i < iMAX; i++) {
        newPirosCoordinates[i] = `${pirosORIGO.x}, ${pirosORIGO.y} ${innerPirosX[i]}, ${innerPirosY[i]} ${outerPirosX[(i + 3) % iMAX]}, ${outerPirosY[(i + 3) % iMAX]} ${innerPirosX[(i + 6) % iMAX]}, ${innerPirosY[(i + 6) % iMAX]}`;
    }
}
fillPirosCoordinates();

let pirosAnimPoints = [], pirosLAnimPoints = [];

function fillPirosAnimPoints() {
    for (let i = 0; i < iMAX; i++) {
        pirosAnimPoints[i] = { value: newPirosCoordinates[i] };
        pirosLAnimPoints[i] = { value: newPirosCoordinates[iMAX-i-1] };
    };
};

function fillPirosAnimPointsOver() {
    for (let i = 0; i < 12; i++) {
        pirosAnimPoints[i + 24] = { value: newPirosCoordinates[i] };
        pirosLAnimPoints[i + 24] = pirosLAnimPoints[i];
    };
};

fillPirosAnimPoints();
fillPirosAnimPointsOver();

function shiftPirosAnimPoints(n) {
    let toBack = {};
    for (let i = 0; i < n; i++) {
        toBack = pirosAnimPoints.slice(0, 1);
        pirosAnimPoints.push(toBack);
    }
};

function turnSargaRight(steps, duration) {
    anime({
        targets: sarga1,
        points: sargaAnimPoints.slice(4, steps + 4),
        easing: 'linear',
        duration: duration,
        loop: false
    });
    anime({
        targets: sarga2,
        points: sargaAnimPoints.slice(10, steps + 10),
        easing: 'linear',
        duration: duration,
        loop: false
    });
    anime({
        targets: sarga3,
        points: sargaAnimPoints.slice(16, steps + 16),
        easing: 'linear',
        duration: duration,
        loop: false
    });
    anime({
        targets: sarga4,
        points: sargaAnimPoints.slice(22, steps + 22),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnSargaLeft(steps, duration) {
    anime({
        targets: sarga1,
        points: sargaLAnimPoints.slice(21, steps + 21),
        easing: 'linear',
        duration: duration,
        loop: false
    });
    anime({
        targets: sarga2,
        points: sargaLAnimPoints.slice(15, steps + 15),
        easing: 'linear',
        duration: duration,
        loop: false
    });
    anime({
        targets: sarga3,
        points: sargaLAnimPoints.slice(9, steps + 9),
        easing: 'linear',
        duration: duration,
        loop: false
    });
    anime({
        targets: sarga4,
        points: sargaLAnimPoints.slice(3, steps + 3),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

// a sárgával határos réteg (a kis négyzetek) animált pontjai 
// a szomszédos piros, lila, zöld és kék kis négyzetek mozgatásához
let newSargaMidCoordinates1 = [], newSargaMidCoordinates2 = [];
function fillSargaMidCoordinates() {
    for (let i = 0; i < iMAX; i++) {
        newSargaMidCoordinates1[i] = `${innerMidSargaX[(i + 15) % iMAX]},${innerMidSargaY[(i + 15) % iMAX]} ${innerSargaX[(i + 15) % iMAX]},${innerSargaY[(i + 15) % iMAX]} ${outerSargaX[(i + 12) % iMAX]},${outerSargaY[(i + 12) % iMAX]} ${outerMidSargaX[(i + 12) % iMAX]},${outerMidSargaY[(i + 12) % iMAX]}`;
        // az alsó ás a fölső négyzetet eltérő módon kell animálni    
        newSargaMidCoordinates2[i] = `${innerMidSargaX[(i + 15) % iMAX]},${innerMidSargaY[(i + 15) % iMAX]} ${outerMidSargaX[(i + 18) % iMAX]},${outerMidSargaY[(i + 18) % iMAX]} ${outerSargaX[(i + 18) % iMAX]},${outerSargaY[(i + 18) % iMAX]} ${innerSargaX[(i + 15) % iMAX]},${innerSargaY[(i + 15) % iMAX]}`;
    }
}
fillSargaMidCoordinates();

// a lilával határos réteg (akis négyzetek) animált pontjai 
// a szomszédos piros, narancs, zöld és sárga kis négyzetek mozgatásához
let newLilaMidCoordinates1 = [], newLilaMidCoordinates2 = [];
function fillLilaMidCoordinates() {
    for (let i = 0; i < iMAX; i++) {
        newLilaMidCoordinates1[i] = `${innerMidLilaX[(i + 3) % iMAX]},${innerMidLilaY[(i + 3) % iMAX]} ${innerLilaX[(i + 3) % iMAX]},${innerLilaY[(i + 3) % iMAX]} ${outerLilaX[(i) % iMAX]},${outerLilaY[(i) % iMAX]} ${outerMidLilaX[(i) % iMAX]},${outerMidLilaY[(i) % iMAX]}`;
        // a két négyzetet eltérő módon kell animálni    
        newLilaMidCoordinates2[i] = `${innerMidLilaX[(i + 3) % iMAX]},${innerMidLilaY[(i + 3) % iMAX]} ${outerMidLilaX[(i + 6) % iMAX]},${outerMidLilaY[(i + 6) % iMAX]} ${outerLilaX[(i + 6) % iMAX]},${outerLilaY[(i + 6) % iMAX]} ${innerLilaX[(i + 3) % iMAX]},${innerLilaY[(i + 3) % iMAX]}`;
    }
}
fillLilaMidCoordinates();

// a pirossal határos réteg (a kis négyzetek) animált pontjai 
// a szomszédos lila, sárga, kék és narancs kis négyzetek mozgatásához
let newPirosMidCoordinates1 = [], newPirosMidCoordinates2 = [];
function fillPirosMidCoordinates() {
    for (let i = 0; i < iMAX; i++) {
        newPirosMidCoordinates1[i] = `${innerMidPirosX[(i + 3) % iMAX]},${innerMidPirosY[(i + 3) % iMAX]} ${innerPirosX[(i + 3) % iMAX]},${innerPirosY[(i + 3) % iMAX]} ${outerPirosX[(i) % iMAX]},${outerPirosY[(i) % iMAX]} ${outerMidPirosX[(i) % iMAX]},${outerMidPirosY[(i) % iMAX]}`;
        // az alsó ás a fölső négyzetet eltérő módon kell animálni    
        newPirosMidCoordinates2[i] = `${innerMidPirosX[(i + 3) % iMAX]},${innerMidPirosY[(i + 3) % iMAX]} ${outerMidPirosX[(i + 6) % iMAX]},${outerMidPirosY[(i + 6) % iMAX]} ${outerPirosX[(i + 6) % iMAX]},${outerPirosY[(i + 6) % iMAX]} ${innerPirosX[(i + 3) % iMAX]},${innerPirosY[(i + 3) % iMAX]}`;
    }
}
fillPirosMidCoordinates();


let sargaMidAnimPoints1 = [], sargaMidAnimPoints2 = [];
let sargaLMidAnimPoints1 = [], sargaLMidAnimPoints2 = [];

function fillSargaMidAnimPoints() {
    for (let i = 0; i < iMAX; i++) {
        sargaMidAnimPoints1[i] = { value: newSargaMidCoordinates1[i] };
        sargaMidAnimPoints2[i] = { value: newSargaMidCoordinates2[i] };

        sargaLMidAnimPoints1[i] = { value: newSargaMidCoordinates1[iMAX-i-1] };
        sargaLMidAnimPoints2[i] = { value: newSargaMidCoordinates2[iMAX-i-1] };
    };
};
fillSargaMidAnimPoints();


let lilaMidAnimPoints1 = [], lilaMidAnimPoints2 = [];
let lilaLMidAnimPoints1 = [], lilaLMidAnimPoints2 = [];

function fillLilaMidAnimPoints() {
    for (let i = 0; i < iMAX; i++) {
        lilaMidAnimPoints1[i] = { value: newLilaMidCoordinates1[i] };
        lilaMidAnimPoints2[i] = { value: newLilaMidCoordinates2[i] };

        lilaLMidAnimPoints1[i] = { value: newLilaMidCoordinates1[iMAX-i-1] };
        lilaLMidAnimPoints2[i] = { value: newLilaMidCoordinates2[iMAX-i-1] };
    };
};
fillLilaMidAnimPoints();

// *****************
function fillAnimPoints() {
    for (let i = 0; i < iMAX; i++) {
        animPoints[i] = { value: newCoordinates[i] };
        lilaLAnimPoints[i] = { value: newCoordinates[iMAX-i-1] };
    };
};
// *******************


let pirosMidAnimPoints1 = [], pirosMidAnimPoints2 = [];
let pirosLMidAnimPoints1 = [], pirosLMidAnimPoints2 = [];

function fillPirosMidAnimPoints() {
    for (let i = 0; i < iMAX; i++) {
        pirosMidAnimPoints1[i] = { value: newPirosMidCoordinates1[i] };
        pirosMidAnimPoints2[i] = { value: newPirosMidCoordinates2[i] };

        pirosLMidAnimPoints1[i] = { value: newPirosMidCoordinates1[iMAX-i-1] };
        pirosLMidAnimPoints2[i] = { value: newPirosMidCoordinates2[iMAX-i-1] };
    };
};
fillPirosMidAnimPoints();

// temporarily 6 helyett iMAX (=24)! , hogy minden szín körbeforgatását ki lehessen próbálni
function fillSargaMidAnimPointsOver() {
    for (let i = 0; i < iMAX; i++) {
        sargaMidAnimPoints1[i + 24] = { value: newSargaMidCoordinates1[i] };
        sargaMidAnimPoints2[i + 24] = { value: newSargaMidCoordinates2[i] };
    };
};
fillSargaMidAnimPointsOver();

// temporarily 6 helyett iMAX (=24)! , hogy minden szín körbeforgatását ki lehessen próbálni
function fillLilaMidAnimPointsOver() {
    for (let i = 0; i < iMAX; i++) {
        lilaMidAnimPoints1[i + 24] = { value: newLilaMidCoordinates1[i] };
        lilaMidAnimPoints2[i + 24] = { value: newLilaMidCoordinates2[i] };
    };
};
fillLilaMidAnimPointsOver();

// temporarily 6 helyett iMAX (=24)! , hogy minden szín körbeforgatását ki lehessen próbálni
function fillPirosMidAnimPointsOver() {
    for (let i = 0; i < iMAX; i++) {
        pirosMidAnimPoints1[i + 24] = { value: newPirosMidCoordinates1[i] };
        pirosMidAnimPoints2[i + 24] = { value: newPirosMidCoordinates2[i] };
    };
};
fillPirosMidAnimPointsOver();

// sarga reteg kezdete
function turnRed1() {
    steps = 6; duration = DURATION;
    anime({
        targets: piros4,
        points: sargaMidAnimPoints1.slice(1, steps + 1),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnRed1Left() {
    steps = 6; duration = DURATION;
    anime({
        targets: piros4,
        points: sargaLMidAnimPoints1.slice(0, steps + 0),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnRed2() {
    steps = 6; duration = DURATION;
    anime({
        targets: piros3,
        points: sargaMidAnimPoints2.slice(1, steps + 1),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnRed2Left() {
    steps = 6; duration = DURATION;
    anime({
        targets: piros3,
        points: sargaLMidAnimPoints2.slice(0, steps + 0),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnLila1() {
    steps = 6; duration = DURATION;
    anime({
        targets: lila1,
        points: sargaMidAnimPoints1.slice(7, steps + 7),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnLila1Left() {
    steps = 6; duration = DURATION;
    anime({
        targets: lila1,
        points: sargaLMidAnimPoints1.slice(18, steps + 18),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnLila2() {
    steps = 6; duration = DURATION;
    anime({
        targets: lila4,
        points: sargaMidAnimPoints2.slice(7, steps + 7),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnLila2Left() {
    steps = 6; duration = DURATION;
    anime({
        targets: lila4,
        points: sargaLMidAnimPoints2.slice(18, steps + 18),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnZold1() {
    steps = 6; duration = DURATION;
    anime({
        targets: zold3, // sargaOldal[4],
        points: sargaMidAnimPoints1.slice(13, steps + 13),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnZold1Left() {
    steps = 6; duration = DURATION;
    anime({
        targets: zold3, // sargaOldal[4],
        points: sargaLMidAnimPoints1.slice(12, steps + 12),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnZold2() {
    steps = 6; duration = DURATION;
    anime({
        targets: zold4, // sargaOldal[5],
        points: sargaMidAnimPoints2.slice(13, steps + 13),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnZold2Left() {
    steps = 6; duration = DURATION;
    anime({
        targets: zold4, // sargaOldal[5],
        points: sargaLMidAnimPoints2.slice(12, steps + 12),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnKek1() {
    steps = 6; duration = DURATION;
    anime({
        targets: kek4, // sargaOldal[6],
        points: sargaMidAnimPoints1.slice(19, steps + 19),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnKek1Left() {
    steps = 6; duration = DURATION;
    anime({
        targets: kek4, // sargaOldal[6],
        points: sargaLMidAnimPoints1.slice(6, steps + 6),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnKek2() {
    steps = 6; duration = DURATION;
    anime({
        targets: kek1, // sargaOldal[7],
        points: sargaMidAnimPoints2.slice(19, steps + 19),
        easing: 'linear',
        duration: duration,
        loop: false,
        complete: function(anim) {
            console.log(anim.completed);
            arrowsOn();
            adminSargaTurn(); 
            finished = anim.completed;
        }
    });
};

function turnKek2Left() {
    steps = 6; duration = DURATION;
    anime({
        targets: kek1, // sargaOldal[7],
        points: sargaLMidAnimPoints2.slice(6, steps + 6),
        easing: 'linear',
        duration: duration,
        loop: false,
        complete: function(anim) {
            console.log(anim.completed);
            arrowsOn();
            adminSargaTurnLeft(); 
            finished = anim.completed;
        }
    });
};
// sárga réteg vége

// ezek tartoznak a lila réteghez
function turnSarga1() {
    steps = 6; duration = DURATION;
    anime({
        targets: sarga4,
        points: lilaMidAnimPoints1.slice(1, steps + 1),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnSarga1Left() {
    steps = 6; duration = DURATION;
    anime({
        targets: sarga4,
        points: lilaLMidAnimPoints1.slice(0, steps + 0),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnSarga2() {
    steps = 6; duration = DURATION;
    anime({
        targets: sarga3,
        points: lilaMidAnimPoints2.slice(1, steps + 1),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnSarga2Left() {
    steps = 6; duration = DURATION;
    anime({
        targets: sarga3,
        points: lilaLMidAnimPoints2.slice(0, steps + 0),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnPiros1() {
    steps = 6; duration = DURATION;
    anime({
        easing: 'linear',
        duration: duration,
        loop: false,
        targets: piros3,
        points: lilaMidAnimPoints1.slice(7, steps + 7)
    });
};

function turnPiros1Left() {
    steps = 6; duration = DURATION;
    anime({
        easing: 'linear',
        duration: duration,
        loop: false,
        targets: piros3,
        points: lilaLMidAnimPoints1.slice(18, steps + 18)
    });
};

function turnPiros2() {
    steps = 6; duration = DURATION;
    anime({
        easing: 'linear',
        duration: duration,
        loop: false,
        targets: piros2,
        points: lilaMidAnimPoints2.slice(7, steps + 7)
    });
};

function turnPiros2Left() {
    steps = 6; duration = DURATION;
    anime({
        easing: 'linear',
        duration: duration,
        loop: false,
        targets: piros2,
        points: lilaLMidAnimPoints2.slice(18, steps + 18)
    });
};

function turnNarancs1() {
    steps = 6; duration = DURATION;
    anime({
        targets: narancs3, // lilaOldal[4],
        points: lilaMidAnimPoints1.slice(13, steps + 13),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnNarancs1Left() {
    steps = 6; duration = DURATION;
    anime({
        targets: narancs3, // lilaOldal[4],
        points: lilaLMidAnimPoints1.slice(12, steps + 12),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnNarancs2() {
    steps = 6; duration = DURATION;
    anime({
        targets: narancs4,
        points: lilaMidAnimPoints2.slice(13, steps + 13),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnNarancs2Left() {
    steps = 6; duration = DURATION;
    anime({
        targets: narancs4,
        points: lilaLMidAnimPoints2.slice(12, steps + 12),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnGreen1() {
    steps = 6; duration = DURATION;
    anime({
        easing: 'linear',
        duration: duration,
        loop: false,
        targets: zold2,
        points: lilaMidAnimPoints1.slice(19, steps + 19),
    });
};

function turnGreen1Left() {
    steps = 6; duration = DURATION;
    anime({
        easing: 'linear',
        duration: duration,
        loop: false,
        targets: zold2,
        points: lilaLMidAnimPoints1.slice(6, steps + 6),
    });
};

function turnGreen2() {
    steps = 6; duration = DURATION;
    anime({
        easing: 'linear',
        duration: duration,
        loop: false,
        targets: zold3,
        points: lilaMidAnimPoints2.slice(19, steps + 19),
        complete: function (anim) {
            console.log(anim.completed);
            arrowsOn();
            adminLilaTurn();
            finished = anim.completed;
        }
    })
};

function turnGreen2Left() {
    steps = 6; duration = DURATION;
    anime({
        easing: 'linear',
        duration: duration,
        loop: false,
        targets: zold3,
        points: lilaLMidAnimPoints2.slice(6, steps + 6),
        complete: function (anim) {
            console.log(anim.completed);
            arrowsOn();
            adminLilaTurnLeft();
            finished = anim.completed;
        }
    })
};

// ezek tartoznak a piros réteghez
function turnPlila1() {
    steps = 6; duration = DURATION;
    anime({
        targets: lila2, // pirosOldal[0],
        points: pirosMidAnimPoints1.slice(13, steps + 13),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnPlila1Left() {
    steps = 6; duration = DURATION;
    anime({
        targets: lila2,
        points: pirosLMidAnimPoints1.slice(12, steps + 12),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnPlila0() {
    steps = 6; duration = DURATION;
    anime({
        targets: lila1, // pirosOldal[1],
        points: pirosMidAnimPoints2.slice(13, steps + 13),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnPlila0Left() {
    steps = 6; duration = DURATION;
    anime({
        targets: lila1,
        points: pirosLMidAnimPoints2.slice(12, steps + 12),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnPsarga2() {
    steps = 6; duration = DURATION;
    var tl = anime.timeline({
        easing: 'linear',
        duration: duration,
        loop: false
    }).add({
        targets: sarga3,
        points: pirosMidAnimPoints1.slice(19, steps + 19),
    });
};

function turnPsarga2Left() {
    steps = 6; duration = DURATION;
    var tl = anime.timeline({
        easing: 'linear',
        duration: duration,
        loop: false
    }).add({
        targets: sarga3, // pirosOldal[2],
        points: pirosLMidAnimPoints1.slice(6, steps + 6),
    });
};

function turnPsarga1() {
    steps = 6; duration = DURATION;
    var tl = anime.timeline({
        easing: 'linear',
        duration: duration,
        loop: false
    }).add({
        targets: sarga2,
        points: pirosMidAnimPoints2.slice(19, steps + 19),
    });
};

function turnPsarga1Left() {
    steps = 6; duration = DURATION;
    var tl = anime.timeline({
        easing: 'linear',
        duration: duration,
        loop: false
    }).add({
        targets: sarga2,
        points: pirosLMidAnimPoints2.slice(6, steps + 6),
    });
};

function turnPkek0() {
    steps = 6; duration = DURATION;
    anime({
        targets: kek1,
        points: pirosMidAnimPoints1.slice(25, steps + 25),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnPkek0Left() {
    steps = 6; duration = DURATION;
    anime({
        targets: kek1,
        points: pirosLMidAnimPoints1.slice(0, steps + 0),
        easing: 'linear',
        duration: duration,
        loop: false
    });
};

function turnPkek1() {
    steps = 6; duration = DURATION;
    anime({
        targets: kek2,
        points: pirosMidAnimPoints2.slice(25, steps + 25),
        easing: 'linear',
        duration: duration,
        loop: false,
    });
};

function turnPkek1Left() {
    steps = 6; duration = DURATION;
    anime({
        targets: kek2,
        points: pirosLMidAnimPoints2.slice(0, steps + 0),
        easing: 'linear',
        duration: duration,
        loop: false,
    });
};

function turnPnarancs1() {
    steps = 6; duration = DURATION;
    var tl = anime.timeline({
        easing: 'linear',
        duration: duration,
        loop: false
    }).add({
        targets: narancs2,
        points: pirosMidAnimPoints1.slice(31, steps + 31),
    });
};

function turnPnarancs1Left() {
    steps = 6; duration = DURATION;
    var tl = anime.timeline({
        easing: 'linear',
        duration: duration,
        loop: false
    }).add({
        targets: narancs2,
        points: pirosLMidAnimPoints1.slice(18, steps + 18),
    });
};

function turnPnarancs2() {
    steps = 6; duration = DURATION;
    anime({
        targets: narancs3,
        points: pirosMidAnimPoints2.slice(31, steps + 31),
        easing: 'linear',
        duration: duration,
        loop: false,
        complete: function(anim) {
            console.log(anim.completed);
            arrowsOn();
            adminPirosTurn(); 
            finished = anim.completed;
        }});
};

function turnPnarancs2Left() {
    steps = 6; duration = DURATION;
    anime({
        targets: narancs3,
        points: pirosLMidAnimPoints2.slice(18, steps + 18),
        easing: 'linear',
        duration: duration,
        loop: false,
        complete: function(anim) {
            console.log(anim.completed);
            arrowsOn();
            adminPirosTurnLeft(); 
            finished = anim.completed;
        }});
};

function turn3InCircle(n) {
    let wait = 4000, i = 0;
    for (let j = 0; j < n; j++) {
        setTimeout(sargaTurn, (i++)*wait);
        setTimeout(lilaTurn, (i++)*wait); 
        setTimeout(pirosTurn, (i++)*wait);
    }
}

function turn2InCircle(n) {
    let wait = 4000, i = 0;
    for (let j = 0; j < n; j++) {
        setTimeout(sargaTurn, (i++) * wait);
        setTimeout(lilaTurn, (i++) * wait);
    }
}

function turnAtWill(...turns) {
    let wait = 4000, i = 0;
    for (let j = 0; j < arguments.length; j++) {
        setTimeout(arguments[i], (i++) * wait);
    }
}

let turnInOrder = turnAtWill;

let memory = [];
function randomTurns(n) {
    let wait = 4000, lastTurn = 999;
    for ( let i = 0; i < n; ) {
        let choice = Math.floor(Math.random() * 6);
        if ((lastTurn - choice) * (lastTurn - choice) == 9) {
            console.log("LastTurn: ", lastTurn, "Choice: ", choice);
            continue;
        }
        switch (choice) {
            case 0: setTimeout(sargaTurn, (i++) * wait);
            break;
            case 1: setTimeout(lilaTurn, (i++) * wait);
            break;
            case 2: setTimeout(pirosTurn, (i++) * wait);
            break;
            case 3: setTimeout(sargaTurnLeft, (i++) * wait);
            break;
            case 4: setTimeout(lilaTurnLeft, (i++) * wait);
            break;
            case 5: setTimeout(pirosTurnLeft, (i++) * wait);
            break;
            default:
                console.log("bad random");
            };
            console.log("memory.length: ", memory.length, "choice: ", choice);

            memory[memory.length] = choice;
            lastTurn = choice;
    }
    console.log(memory);
}

function solve() {
    if (memory.length == 0) {
        alert("Ezt nem tudom megoldani!");
        return;
    }
    let wait = 4000, i = 0;
    for (let j = memory.length - 1; j >= 0;) {
        switch (memory[j]) {
            case 0: setTimeout(sargaTurnLeft, (i++) * wait);
            break;
            case 1: setTimeout(lilaTurnLeft, (i++) * wait);
            break;
            case 2: setTimeout(pirosTurnLeft, (i++) * wait);
            break;
            case 3: setTimeout(sargaTurn, (i++) * wait);
            break;
            case 4: setTimeout(lilaTurn, (i++) * wait);
            break;
            case 5: setTimeout(pirosTurn, (i++) * wait);
            break;
            default:
                console.log("bad random");
            };
            j--;
    }
}

function showBacks() {
    prelude1(narancs1,narancs2,narancs3,narancs4,zold1,zold2,zold3,zold4,kek1,kek2,kek3,kek4,)
}

function showFores() {
    prelude1(piros1,piros2,piros3,piros4,lila1,lila2,lila3,lila4,sarga1,sarga2,sarga3,sarga4,)
}

let LJ = lilaTurn, LB = lilaTurnLeft, PJ = pirosTurn, PB = pirosTurnLeft, SJ = sargaTurn;