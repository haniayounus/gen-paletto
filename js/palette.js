const colorPicker = document.getElementById("colorPicker");
const hexInput = document.getElementById("hexInput");
const generateBtn = document.getElementById("generateBtn");

const paletteContainer = document.getElementById("paletteContainer");
const emptyState = document.getElementById("emptyState");

const template = document.getElementById("colorCardTemplate");


const state = {

    baseColor:"#C2428D",

    palettes:[]

};


/*  PALETTE TYPES */

const paletteTypes=[

    "Monochromatic",

    "Analogous",

    "Complementary",

    "Split Complementary",

    "Triadic",

    "Tetradic",

    "Square",

    "Tints",

    "Shades",

    "Tonal"

];

/* UTILITY FUNCTIONS*/

function clamp(value,min,max){

    return Math.min(Math.max(value,min),max);

}


function wrapHue(h){

    h%=360;

    if(h<0){

        h+=360;

    }

    return h;

}


function normalizeHex(hex){

    hex=hex.trim();

    if(!hex.startsWith("#")){

        hex="#"+hex;

    }

    if(hex.length===4){

        hex="#"+

        hex[1]+hex[1]+

        hex[2]+hex[2]+

        hex[3]+hex[3];

    }

    return hex.toUpperCase();

}


function isValidHex(hex){

    return /^#([0-9A-F]{6})$/i.test(

        normalizeHex(hex)

    );

}



/*HEX -> RGB */

function hexToRgb(hex){

    hex=normalizeHex(hex);

    return{

        r:parseInt(hex.slice(1,3),16),

        g:parseInt(hex.slice(3,5),16),

        b:parseInt(hex.slice(5,7),16)

    };

}



/* RGB -> HEX */

function rgbToHex(r,g,b){

    return "#"+

    [r,g,b]

    .map(v=>

        Math.round(v)

        .toString(16)

        .padStart(2,"0")

    )

    .join("")

    .toUpperCase();

}



/*RGB -> HSL*/

function rgbToHsl({r,g,b}){

    r/=255;
    g/=255;
    b/=255;

    const max=Math.max(r,g,b);

    const min=Math.min(r,g,b);

    let h,s,l;

    l=(max+min)/2;

    if(max===min){

        h=0;
        s=0;

    }

    else{

        const d=max-min;

        s=l>0.5

        ?d/(2-max-min)

        :d/(max+min);

        switch(max){

            case r:

            h=(g-b)/d+(g<b?6:0);

            break;

            case g:

            h=(b-r)/d+2;

            break;

            case b:

            h=(r-g)/d+4;

            break;

        }

        h/=6;

    }

    return{

        h:Math.round(h*360),

        s:Math.round(s*100),

        l:Math.round(l*100)

    };

}



/*  HSL -> RGB*/

function hslToRgb(h,s,l){

    h/=360;

    s/=100;

    l/=100;

    let r,g,b;

    if(s===0){

        r=g=b=l;

    }

    else{

        function hue2rgb(p,q,t){

            if(t<0)t+=1;

            if(t>1)t-=1;

            if(t<1/6)return p+(q-p)*6*t;

            if(t<1/2)return q;

            if(t<2/3)return p+(q-p)*(2/3-t)*6;

            return p;

        }

        const q=

        l<0.5

        ?l*(1+s)

        :l+s-l*s;

        const p=2*l-q;

        r=hue2rgb(p,q,h+1/3);

        g=hue2rgb(p,q,h);

        b=hue2rgb(p,q,h-1/3);

    }

    return{

        r:Math.round(r*255),

        g:Math.round(g*255),

        b:Math.round(b*255)

    };

}

/*HSL -> HEX*/

function hslToHex(h,s,l){

    const rgb=hslToRgb(h,s,l);

    return rgbToHex(

        rgb.r,

        rgb.g,

        rgb.b

    );

}


/*HEX -> HSL */

function hexToHsl(hex){

    return rgbToHsl(

        hexToRgb(hex)

    );

}

function createColor(h,s,l){

    return{

        hex:hslToHex(h,s,l),

        rgb:hslToRgb(h,s,l),

        hsl:{h,s,l},

        format:"hex"

    };

}
/*  PALETTE */

function monochromatic(h, s, l) {

    return [

        createColor(h, s, clamp(l - 30, 8, 95)),
        createColor(h, s, clamp(l - 18, 8, 95)),
        createColor(h, s, clamp(l - 8, 8, 95)),
        createColor(h, s, l),
        createColor(h, s, clamp(l + 10, 8, 95)),
        createColor(h, s, clamp(l + 22, 8, 95))

    ];

}


function analogous(h, s, l) {

    return [

        createColor(wrapHue(h - 40), s, l),
        createColor(wrapHue(h - 20), s, l),
        createColor(h, s, l),
        createColor(wrapHue(h + 20), s, l),
        createColor(wrapHue(h + 40), s, l)

    ];

}


function complementary(h, s, l) {

    return [

        createColor(h, s, clamp(l + 18, 10, 95)),
        createColor(h, s, l),
        createColor(wrapHue(h + 180), s, l),
        createColor(wrapHue(h + 180), s, clamp(l - 15, 10, 95))

    ];

}


function splitComplementary(h, s, l) {

    return [

        createColor(h, s, l),
        createColor(wrapHue(h + 150), s, l),
        createColor(wrapHue(h + 210), s, l),
        createColor(wrapHue(h + 150), s, clamp(l + 18, 10, 95)),
        createColor(wrapHue(h + 210), s, clamp(l - 18, 10, 95))

    ];

}


function triadic(h, s, l) {

    return [

        createColor(h, s, l),
        createColor(wrapHue(h + 120), s, l),
        createColor(wrapHue(h + 240), s, l),
        createColor(h, s, clamp(l + 18, 10, 95)),
        createColor(wrapHue(h + 120), s, clamp(l + 18, 10, 95)),
        createColor(wrapHue(h + 240), s, clamp(l + 18, 10, 95))

    ];

}


function tetradic(h, s, l) {

    return [

        createColor(h, s, l),
        createColor(wrapHue(h + 90), s, l),
        createColor(wrapHue(h + 180), s, l),
        createColor(wrapHue(h + 270), s, l)

    ];

}


function square(h, s, l) {

    return [

        createColor(h, s, l),
        createColor(wrapHue(h + 90), s, l),
        createColor(wrapHue(h + 180), s, l),
        createColor(wrapHue(h + 270), s, l)

    ];

}


function tints(h, s, l) {

    return [

        createColor(h, s, 95),
        createColor(h, s, 88),
        createColor(h, s, 80),
        createColor(h, s, 72),
        createColor(h, s, 64),
        createColor(h, s, l)

    ];

}


function shades(h, s, l) {

    return [

        createColor(h, s, l),
        createColor(h, s, 50),
        createColor(h, s, 40),
        createColor(h, s, 30),
        createColor(h, s, 20),
        createColor(h, s, 10)

    ];

}


function tonal(h, s, l) {

    return [

        createColor(h, 20, l),
        createColor(h, 35, l),
        createColor(h, 50, l),
        createColor(h, 65, l),
        createColor(h, 80, l),
        createColor(h, 95, l)

    ];

}


/*    GENERATE ALL PALETTES */

function generateAllPalettes(hex) {

    const { h, s, l } = hexToHsl(hex);

    return [

        {
            title: "Monochromatic",
            colors: monochromatic(h, s, l)
        },

        {
            title: "Analogous",
            colors: analogous(h, s, l)
        },

        {
            title: "Complementary",
            colors: complementary(h, s, l)
        },

        {
            title: "Split Complementary",
            colors: splitComplementary(h, s, l)
        },

        {
            title: "Triadic",
            colors: triadic(h, s, l)
        },

        {
            title: "Tetradic",
            colors: tetradic(h, s, l)
        },

        {
            title: "Square",
            colors: square(h, s, l)
        },

        {
            title: "Tints",
            colors: tints(h, s, l)
        },

        {
            title: "Shades",
            colors: shades(h, s, l)
        },

        {
            title: "Tonal",
            colors: tonal(h, s, l)
        }

    ];

}
/*  UI RENDERING*/

function getColorValue(color){

    switch(color.format){

        case "rgb":

            return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;

        case "hsl":

            return `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;

        default:

            return color.hex;

    }

}


/* COLOR CARD*/

function createColorCard(color,paletteIndex,colorIndex){

    return `

    <div class="color-card">

        <div
            class="color-preview"
            style="background:${color.hex}">
        </div>

        <div class="color-details">

         

            <button
                class="color-value"
                data-palette="${paletteIndex}"
                data-color="${colorIndex}">

                ${getColorValue(color)}

            </button>

            <button
                class="copy-btn"
                data-palette="${paletteIndex}"
                data-color="${colorIndex}">

                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                    </svg>

            </button>

        </div>

    </div>

    `;

}


/* PALETTE GROUP */
function createPaletteGroup(palette,index){

    return `

    <div class="palette-group">

        <div class="palette-group-header">

            <h2>
                ${palette.title}
            </h2>

            <div class="palette-group-actions">

                <button
                    class="export-palette-btn"
                    data-palette="${index}"
                    title="Export this palette">

                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>

                </button>

                <button
                    class="save-palette-btn"
                    data-palette="${index}"
                    title="Save this palette">

                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>

                </button>

            </div>

        </div>

        <div class="palette-row">
            ${palette.colors.map((color,colorIndex)=> createColorCard(color, index, colorIndex)).join("")}
        </div>

    </div>

    `;

}
/*  ALL PALETTES */

let hasGeneratedOnce = false;

function renderPalettes(){

    emptyState.style.display="none";

    paletteContainer.style.display="block";

    paletteContainer.innerHTML=

    state.palettes

    .map(

        (palette,index)=>

        createPaletteGroup(

            palette,

            index

        )

    )

    .join("");



    attachEvents();

    if (hasGeneratedOnce) {
const firstGroup = paletteContainer.querySelector(".palette-group");
if (firstGroup) {
    firstGroup.scrollIntoView({ behavior: "smooth", block: "start" });
}    }

    hasGeneratedOnce = true;

}

/*BUILD PALETTE*/

function buildPalette(){

    const hex=

    normalizeHex(

        hexInput.value

    );



    if(

        !isValidHex(hex)

    ){

        alert(

            "Invalid HEX Color"

        );

        return;

    }



    state.baseColor=hex;



    colorPicker.value=hex;



    state.palettes=

    generateAllPalettes(

        hex

    );



    renderPalettes();

}
/*   FORMAT SWITCHING*/

function switchFormat(event){

    const paletteIndex = Number(

        event.currentTarget.dataset.palette

    );

    const colorIndex = Number(

        event.currentTarget.dataset.color

    );

    const color =

    state.palettes[paletteIndex]

    .colors[colorIndex];



    if(color.format==="hex"){

        color.format="rgb";

    }

    else if(color.format==="rgb"){

        color.format="hsl";

    }

    else{

        color.format="hex";

    }



    renderPalettes();

}



/*  COPY COLOR*/

async function copyColor(event){

    const paletteIndex = Number(event.currentTarget.dataset.palette);

    const colorIndex = Number(event.currentTarget.dataset.color);

    const color = state.palettes[paletteIndex].colors[colorIndex];

    const value = getColorValue(color);

    try {

        await navigator.clipboard.writeText(value);

        showToast(`Copied to clipboard: ${value}`);

    }

    catch(error){

        console.error(error);

        showToast("Failed to copy.");

    }

}
/*  ATTACH EVENTS*/
function attachEvents(){

    document.querySelectorAll(".color-value").forEach(button=>{
        button.addEventListener("click", switchFormat);
    });

    document.querySelectorAll(".copy-btn").forEach(button=>{
        button.addEventListener("click", copyColor);
    });

    document.querySelectorAll(".save-palette-btn").forEach(button=>{

        button.addEventListener("click", (e) => {

            const paletteIndex = Number(e.currentTarget.dataset.palette);
            savePalette(paletteIndex);

        });

    });

    document.querySelectorAll(".export-palette-btn").forEach(button=>{

        button.addEventListener("click", (e) => {

            const paletteIndex = Number(e.currentTarget.dataset.palette);
            openExportModal(paletteIndex);

        });

    });

}

/*INPUT EVENTS */

colorPicker.addEventListener("input", () => {

    const color = colorPicker.value.toUpperCase();

    hexInput.value = color;

});


hexInput.addEventListener("input", () => {

    let value = normalizeHex(hexInput.value);

    if (isValidHex(value)) {

        colorPicker.value = value;

    }

});



/*GENERATE BUTTON*/

generateBtn.addEventListener("click", () => {

    buildPalette();

});


hexInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        buildPalette();

    }

});


function showEmptyState() {

    emptyState.style.display = "block";

    paletteContainer.innerHTML = "";

}


function hideEmptyState() {

    emptyState.style.display = "none";

}



/* INITIALIZE APP */

function initialize() {

    colorPicker.value = state.baseColor;

    hexInput.value = state.baseColor;

    showEmptyState();

}


initialize();



/*Validate and normalize HEX*/

function getBaseColor() {

    let hex = normalizeHex(hexInput.value);

    if (!isValidHex(hex)) {

        hex = "#6366F1";

        hexInput.value = hex;

        colorPicker.value = hex;

    }

    return hex;

}

function generate() {

    state.baseColor = getBaseColor();

    state.palettes = generateAllPalettes(

        state.baseColor

    );

    hideEmptyState();

    renderPalettes();

}


/* UPDATE BUTTON */

generateBtn.removeEventListener(

    "click",

    buildPalette

);

generateBtn.addEventListener(

    "click",

    generate

);


hexInput.removeEventListener(

    "keydown",

    buildPalette

);

hexInput.addEventListener(

    "keydown",

    function (e) {

        if (e.key === "Enter") {

            generate();

        }

    }

);


colorPicker.addEventListener(

    "change",

    function () {

        hexInput.value =

        colorPicker.value.toUpperCase();

    }

);

generate();

/* SAVED PALETTES  */

const SAVED_PALETTES_KEY = "genPaletto_savedPalettes";


function getSavedPalettes(){

    try{

        const raw = localStorage.getItem(SAVED_PALETTES_KEY);

        return raw ? JSON.parse(raw) : [];

    }
    catch(error){

        console.error("Failed to read saved palettes:", error);
        return [];

    }

}


function setSavedPalettes(palettes){

    try{

        localStorage.setItem(

            SAVED_PALETTES_KEY,

            JSON.stringify(palettes)

        );

    }
    catch(error){

        console.error("Failed to save palettes:", error);

    }

}


function savePalette(paletteIndex){

    const palette = state.palettes[paletteIndex];

    if(!palette) return;

    const saved = getSavedPalettes();

    const newEntry = {

        id: Date.now().toString(),
        title: palette.title,
        colors: palette.colors.map(c => c.hex),
        savedAt: new Date().toISOString()

    };

    saved.unshift(newEntry);

    setSavedPalettes(saved);

    showToast(`Saved "${palette.title}" palette`);

}


/*  EXPORT PALETTE  */

let exportCurrentPalette = null;
let exportCurrentFormat = "css";


function buildCssExport(palette){

    const lines = palette.colors

    .map((color, i) => `  --color-${i + 1}: ${color.hex};`)

    .join("\n");

    return `:root {\n${lines}\n}`;

}


function buildJsonExport(palette){

    const data = {

        name: palette.title,
        colors: palette.colors.map(c => c.hex)

    };

    return JSON.stringify(data, null, 2);

}


function renderExportCode(){

    const codeBlock = document.getElementById("exportCodeBlock");

    if(!exportCurrentPalette){
        codeBlock.textContent = "";
        return;
    }

    codeBlock.textContent =

    exportCurrentFormat === "css"

        ? buildCssExport(exportCurrentPalette)

        : buildJsonExport(exportCurrentPalette);

}


function openExportModal(paletteIndex){

    const palette = state.palettes[paletteIndex];

    if(!palette) return;

    exportCurrentPalette = palette;
    exportCurrentFormat = "css";

    document

    .querySelectorAll(".export-tab-btn")

    .forEach(btn => {

        btn.classList.toggle("active", btn.dataset.tab === "css");

    });

    renderExportCode();

    document.getElementById("exportModalOverlay").classList.add("active");

}


function closeExportModal(){

    document.getElementById("exportModalOverlay").classList.remove("active");
    exportCurrentPalette = null;

}


document

.querySelectorAll(".export-tab-btn")

.forEach(btn => {

    btn.addEventListener("click", () => {

        document

        .querySelectorAll(".export-tab-btn")

        .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        exportCurrentFormat = btn.dataset.tab;

        renderExportCode();

    });

});


document

.getElementById("exportModalCloseBtn")

.addEventListener("click", closeExportModal);


document

.getElementById("exportModalOverlay")

.addEventListener("click", (e) => {

    if(e.target.id === "exportModalOverlay"){
        closeExportModal();
    }

});


document

.getElementById("copyExportBtn")

.addEventListener("click", () => {

    const code = document.getElementById("exportCodeBlock").textContent;

    navigator.clipboard.writeText(code)
        .then(() => showToast(`Copied ${exportCurrentFormat.toUpperCase()} to clipboard`))
        .catch(() => showToast("Failed to copy."));

});


document

.getElementById("downloadExportBtn")

.addEventListener("click", () => {

    if(!exportCurrentPalette) return;

    const code = document.getElementById("exportCodeBlock").textContent;

    const extension = exportCurrentFormat === "css" ? "css" : "json";
    const mimeType = exportCurrentFormat === "css" ? "text/css" : "application/json";

    const fileNameBase = exportCurrentPalette.title

    .toLowerCase()

    .replace(/\s+/g, "-");

    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileNameBase}-palette.${extension}`;
    a.click();

    URL.revokeObjectURL(url);

    showToast(`Downloaded ${extension.toUpperCase()} file`);

});