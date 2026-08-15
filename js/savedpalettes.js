const SAVED_PALETTES_KEY = "genPaletto_savedPalettes";

let currentModalId = null;

let modalColors = [];


/* COLOR CONVERSION  */

function normalizeHex(hex){

    hex = hex.trim();

    if(!hex.startsWith("#")){
        hex = "#" + hex;
    }

    if(hex.length === 4){

        hex = "#" +
        hex[1] + hex[1] +
        hex[2] + hex[2] +
        hex[3] + hex[3];

    }

    return hex.toUpperCase();

}


function hexToRgb(hex){

    hex = normalizeHex(hex);

    return{

        r: parseInt(hex.slice(1,3),16),
        g: parseInt(hex.slice(3,5),16),
        b: parseInt(hex.slice(5,7),16)

    };

}


function rgbToHsl({r,g,b}){

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r,g,b);
    const min = Math.min(r,g,b);

    let h,s,l;

    l = (max + min) / 2;

    if(max === min){

        h = 0;
        s = 0;

    }
    else{

        const d = max - min;

        s = l > 0.5
        ? d / (2 - max - min)
        : d / (max + min);

        switch(max){

            case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;

            case g:
            h = (b - r) / d + 2;
            break;

            case b:
            h = (r - g) / d + 4;
            break;

        }

        h /= 6;

    }

    return{

        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)

    };

}


function hexToHsl(hex){

    return rgbToHsl(hexToRgb(hex));

}


function createColorFromHex(hex){

    return{

        hex: normalizeHex(hex),
        rgb: hexToRgb(hex),
        hsl: hexToHsl(hex),
        format: "hex"

    };

}


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


function deleteSavedPalette(id){

    const saved = getSavedPalettes()
        .filter(p => p.id !== id);

    setSavedPalettes(saved);

    renderSavedPalettes();

    showToast("Palette removed");

}


function copySwatchColor(hex){

    navigator.clipboard.writeText(hex)
        .then(() => showToast(`Copied ${hex} to clipboard`))
        .catch(() => showToast("Failed to copy."));

}


function createSavedPaletteCard(entry){

    const swatches = entry.colors

    .map(hex =>

        `<div class="saved-swatch" style="background:${hex}" data-hex="${hex}" title="Click to copy ${hex}"></div>`

    )

    .join("");

    const dateLabel = new Date(entry.savedAt)
        .toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

    return `

    <div class="saved-palette-card" data-id="${entry.id}">

        <div class="saved-swatches-row">

            ${swatches}

        </div>

        <div class="saved-palette-footer">

            <div>
                <span class="saved-palette-title">${entry.title}</span>
                <span class="saved-palette-date">${dateLabel}</span>
            </div>

            <button class="delete-saved-btn" data-id="${entry.id}" title="Delete">
         <svg xmlns="http://w3.org" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Lid top handle and main line -->
  <path d="M3 6h18" />
  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
</svg>

            </button>

        </div>

    </div>

    `;

}


function renderSavedPalettes(){

    const saved = getSavedPalettes();

    const container = document.getElementById("savedPalettesContainer");
    const emptyState = document.getElementById("savedPalettesEmpty");

    if(saved.length === 0){

        emptyState.style.display = "block";
        container.innerHTML = "";
        return;

    }

    emptyState.style.display = "none";

    container.innerHTML = saved

    .map(entry => createSavedPaletteCard(entry))

    .join("");

    container

    .querySelectorAll(".delete-saved-btn")

    .forEach(btn => {

        btn.addEventListener("click", (e) => {

            e.stopPropagation();

            const id = e.currentTarget.dataset.id;
            deleteSavedPalette(id);

        });

    });

    container

    .querySelectorAll(".saved-swatch")

    .forEach(swatch => {

        swatch.addEventListener("click", (e) => {

            e.stopPropagation();

            copySwatchColor(e.currentTarget.dataset.hex);

        });

    });

    container

    .querySelectorAll(".saved-palette-card")

    .forEach(card => {

        card.addEventListener("click", () => {

            openPaletteModal(card.dataset.id);

        });

    });

}


/* PALETTE MODAL */
function openPaletteModal(id){

    const saved = getSavedPalettes();
    const entry = saved.find(p => p.id === id);

    if(!entry) return;

    currentModalId = id;

    modalColors = entry.colors.map(hex => createColorFromHex(hex));

    const overlay = document.getElementById("paletteModalOverlay");
    const titleInput = document.getElementById("modalTitleInput");

    titleInput.value = entry.title;
    titleInput.readOnly = true;

    renderModalSwatches();

    overlay.classList.add("active");

}


function renderModalSwatches(){

    const swatchRow = document.getElementById("modalSwatchRow");

    swatchRow.innerHTML = modalColors

    .map((color, index) => `
        <div class="color-card">

            <div class="color-preview" style="background:${color.hex}"></div>

            <div class="color-details">

                <button
                    class="color-value"
                    data-index="${index}">

                    ${getColorValue(color)}

                </button>

                <button class="copy-btn" data-index="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                    </svg>
                </button>

            </div>

        </div>
    `)

    .join("");

    swatchRow

    .querySelectorAll(".color-value")

    .forEach(button => {

        button.addEventListener("click", switchModalFormat);

    });

    swatchRow

    .querySelectorAll(".copy-btn")

    .forEach(button => {

        button.addEventListener("click", (e) => {

            const index = Number(e.currentTarget.dataset.index);
            const color = modalColors[index];

            copySwatchColor(getColorValue(color));

        });

    });

}


function switchModalFormat(event){

    const index = Number(event.currentTarget.dataset.index);
    const color = modalColors[index];

    if(color.format === "hex"){
        color.format = "rgb";
    }
    else if(color.format === "rgb"){
        color.format = "hsl";
    }
    else{
        color.format = "hex";
    }

    renderModalSwatches();

}


function closePaletteModal(){

    document.getElementById("paletteModalOverlay").classList.remove("active");
    currentModalId = null;

}


function saveModalTitle(){

    if(!currentModalId) return;

    const titleInput = document.getElementById("modalTitleInput");
    const newTitle = titleInput.value.trim();

    if(!newTitle) return;

    const saved = getSavedPalettes();
    const entry = saved.find(p => p.id === currentModalId);

    if(!entry) return;

    entry.title = newTitle;

    setSavedPalettes(saved);

    renderSavedPalettes();

    showToast("Palette name updated");

}


document

.getElementById("modalCloseBtn")

.addEventListener("click", closePaletteModal);


document

.getElementById("paletteModalOverlay")

.addEventListener("click", (e) => {

    if(e.target.id === "paletteModalOverlay"){

        closePaletteModal();

    }

});


document

.getElementById("modalEditNameBtn")

.addEventListener("click", () => {

    const titleInput = document.getElementById("modalTitleInput");

    titleInput.readOnly = false;
    titleInput.focus();
    titleInput.select();

});


document

.getElementById("modalTitleInput")

.addEventListener("blur", (e) => {

    saveModalTitle();
    e.currentTarget.readOnly = true;

});


document

.getElementById("modalTitleInput")

.addEventListener("keydown", (e) => {

    if(e.key === "Enter"){

        e.preventDefault();
        e.currentTarget.blur();

    }

});

renderSavedPalettes();

/*EXPORT PALETTE*/

let exportCurrentEntry = null;
let exportCurrentFormat = "css";


function buildCssExport(entry){

    const lines = entry.colors

    .map((hex, i) => `  --color-${i + 1}: ${hex};`)

    .join("\n");

    return `:root {\n${lines}\n}`;

}


function buildJsonExport(entry){

    const data = {

        name: entry.title,
        colors: entry.colors

    };

    return JSON.stringify(data, null, 2);

}


function renderExportCode(){

    const codeBlock = document.getElementById("exportCodeBlock");

    if(!exportCurrentEntry){
        codeBlock.textContent = "";
        return;
    }

    codeBlock.textContent =

    exportCurrentFormat === "css"

        ? buildCssExport(exportCurrentEntry)

        : buildJsonExport(exportCurrentEntry);

}


function openExportModal(entry){

    exportCurrentEntry = entry;
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
    exportCurrentEntry = null;

}


document.getElementById("modalExportBtn").addEventListener("click", () => {

    if(!currentModalId) return;

    const saved = getSavedPalettes();
    const entry = saved.find(p => p.id === currentModalId);

    if(entry){
        openExportModal(entry);
    }

});


document

.querySelectorAll(".export-tab-btn")

.forEach(btn => {

    btn.addEventListener("click", () => {

        document.querySelectorAll(".export-tab-btn").forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        exportCurrentFormat = btn.dataset.tab;

        renderExportCode();

    });

});


document.getElementById("exportModalCloseBtn").addEventListener("click", closeExportModal);


document.getElementById("exportModalOverlay").addEventListener("click", (e) => {

    if(e.target.id === "exportModalOverlay"){
        closeExportModal();
    }

});


document.getElementById("copyExportBtn").addEventListener("click", () => {

    const code = document.getElementById("exportCodeBlock").textContent;

    navigator.clipboard.writeText(code)
        .then(() => showToast(`Copied ${exportCurrentFormat.toUpperCase()} to clipboard`))
        .catch(() => showToast("Failed to copy."));

});


document.getElementById("downloadExportBtn").addEventListener("click", () => {

    if(!exportCurrentEntry) return;

    const code = document.getElementById("exportCodeBlock").textContent;

    const extension = exportCurrentFormat === "css" ? "css" : "json";
    const mimeType = exportCurrentFormat === "css" ? "text/css" : "application/json";

    const fileNameBase = exportCurrentEntry.title.toLowerCase().replace(/\s+/g, "-");

    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileNameBase}-palette.${extension}`;
    a.click();

    URL.revokeObjectURL(url);

    showToast(`Downloaded ${extension.toUpperCase()} file`);

});

