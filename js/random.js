 function parseHsl(hslStr) {
        const matches = hslStr.match(/\d+/g);
        if (!matches) return { h: 0, s: 0, l: 0 };
        return {
            h: parseInt(matches[0]),
            s: parseInt(matches[1]),
            l: parseInt(matches[2])
        };
    }

    function hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    function hslToRgbChannels(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color);
        };
        return [f(0), f(8), f(4)];
    }

   document.body.addEventListener("click", function (e) {
    const copyBtn = e.target.closest(".copy-btn");
    if (copyBtn) {
        const colorBox = copyBtn.closest(".color-card");
        const currentText = colorBox.querySelector(".color-value").textContent.trim();

        if (currentText && currentText !== "UNDEFINED") {
            navigator.clipboard.writeText(currentText);
            showToast("Copied to clipboard: " + currentText);
        }
        return;
    }

    const valueSpan = e.target.closest(".color-value");
    if (valueSpan) {
        const currentText = valueSpan.textContent.trim();
        if (currentText === "UNDEFINED" || currentText === "") return;

        const colorBox = valueSpan.closest(".color-card");
        const rawHsl = colorBox.dataset.hsl;
        const { h, s, l } = parseHsl(rawHsl);

        if (currentText.startsWith("#")) {
            const [r, g, b] = hslToRgbChannels(h, s, l);
            valueSpan.innerText = `rgb(${r}, ${g}, ${b})`;
        } else if (currentText.startsWith("rgb(")) {
            valueSpan.innerText = rawHsl;
        } else if (currentText.startsWith("hsl(")) {
            valueSpan.innerText = hslToHex(h, s, l);
        }
    }
});

    function getRandomHsl() {
        return `hsl(${Math.floor(Math.random() * 360)}, ${Math.floor(Math.random() * 30) + 60}%, ${Math.floor(Math.random() * 30) + 45}%)`;
    }

    function getColors(type) {
        const baseHue = Math.floor(Math.random() * 360);
        const sat = 75; 
        
        if (type === 'shades') {
            return [
                `hsl(${baseHue}, ${sat}%, 20%)`,
                `hsl(${baseHue}, ${sat}%, 40%)`,
                `hsl(${baseHue}, ${sat}%, 55%)`,
                `hsl(${baseHue}, ${sat}%, 70%)`,
                `hsl(${baseHue}, ${sat}%, 85%)`
            ];
        } 
        
        if (type === 'matching') {
            const oppositeHue = (baseHue + 180) % 360;
            return [
                `hsl(${baseHue}, ${sat}%, 45%)`,
                `hsl(${baseHue}, ${sat}%, 65%)`,
                `hsl(${oppositeHue}, ${sat}%, 40%)`,
                `hsl(${oppositeHue}, ${sat}%, 60%)`,
                `hsl(${oppositeHue}, ${sat}%, 80%)`
            ];
        }

        return [getRandomHsl(), getRandomHsl(), getRandomHsl(), getRandomHsl(), getRandomHsl()];
    }

  function renderPalette(type) {
    const colors = getColors(type);

    const targetContainer = document.getElementById(`section-${type}`);
    if (!targetContainer) return; 
    const allBoxes = targetContainer.querySelectorAll('.color-card');

    allBoxes.forEach((box, index) => {
        const colorDiv = box.querySelector('.color-preview');
        const textSpan = box.querySelector('.color-value');
        const selectedColor = colors[index];

        const { h, s, l } = parseHsl(selectedColor);
        const hexColor = hslToHex(h, s, l);

        box.dataset.hsl = selectedColor;
        colorDiv.style.backgroundColor = selectedColor;
        textSpan.innerText = hexColor;
    });
}

    renderPalette('random');
    renderPalette('shades');
    renderPalette('matching');


/* SAVED PALETTES */

const SAVED_PALETTES_KEY = "genPaletto_savedPalettes";

const paletteTitles = {

    random: "Random Palette",
    shades: "Monochromatic Shades",
    matching: "Harmonious Complementary"

};


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

        localStorage.setItem(SAVED_PALETTES_KEY, JSON.stringify(palettes));

    }
    catch(error){

        console.error("Failed to save palettes:", error);

    }

}


function saveRandomPalette(type){

    const targetContainer = document.getElementById(`section-${type}`);
    if(!targetContainer) return;

    const boxes = targetContainer.querySelectorAll(".color-card");

    const colors = Array.from(boxes)
        .map(box => box.querySelector(".color-value").textContent.trim())
        .filter(hex => hex && hex !== "UNDEFINED");

    if(!colors.length){

        showToast("Generate a palette first.");
        return;

    }

    const saved = getSavedPalettes();

    const newEntry = {

        id: Date.now().toString(),
        title: paletteTitles[type] || "Palette",
        colors: colors,
        savedAt: new Date().toISOString()

    };

    saved.unshift(newEntry);

    setSavedPalettes(saved);

    showToast(`Saved "${newEntry.title}"`);

}


document

.querySelectorAll(".save-palette-btn")

.forEach(button => {

    button.addEventListener("click", () => {

        const section = button.closest("section");
        if(!section) return;

        const type = section.id.replace("section-", "");
        saveRandomPalette(type);

    });

});

/*EXPORT PALETTE */

let exportCurrentColors = null;
let exportCurrentTitle = "";
let exportCurrentFormat = "css";


function buildCssExport(colors){

    const lines = colors

    .map((hex, i) => `  --color-${i + 1}: ${hex};`)

    .join("\n");

    return `:root {\n${lines}\n}`;

}


function buildJsonExport(colors, title){

    const data = {

        name: title,
        colors: colors

    };

    return JSON.stringify(data, null, 2);

}


function renderExportCode(){

    const codeBlock = document.getElementById("exportCodeBlock");

    if(!exportCurrentColors){
        codeBlock.textContent = "";
        return;
    }

    codeBlock.textContent =

    exportCurrentFormat === "css"

        ? buildCssExport(exportCurrentColors)

        : buildJsonExport(exportCurrentColors, exportCurrentTitle);

}


function openExportModal(type){

    const targetContainer = document.getElementById(`section-${type}`);
    if(!targetContainer) return;

    const boxes = targetContainer.querySelectorAll(".color-card");

    const colors = Array.from(boxes)
        .map(box => box.querySelector(".color-value").textContent.trim())
        .filter(hex => hex && hex !== "UNDEFINED");

    if(!colors.length){
        showToast("Generate a palette first.");
        return;
    }

    exportCurrentColors = colors;
    exportCurrentTitle = paletteTitles[type] || "Palette";
    exportCurrentFormat = "css";

    document.querySelectorAll(".export-tab-btn").forEach(btn => {

        btn.classList.toggle("active", btn.dataset.tab === "css");

    });

    renderExportCode();

    document.getElementById("exportModalOverlay").classList.add("active");

}


function closeExportModal(){

    document.getElementById("exportModalOverlay").classList.remove("active");
    exportCurrentColors = null;

}


document.querySelectorAll(".export-palette-btn").forEach(button => {

    button.addEventListener("click", () => {

        openExportModal(button.dataset.type);

    });

});


document.querySelectorAll(".export-tab-btn").forEach(btn => {

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

    if(!exportCurrentColors) return;

    const code = document.getElementById("exportCodeBlock").textContent;

    const extension = exportCurrentFormat === "css" ? "css" : "json";
    const mimeType = exportCurrentFormat === "css" ? "text/css" : "application/json";

    const fileNameBase = exportCurrentTitle.toLowerCase().replace(/\s+/g, "-");

    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileNameBase}-palette.${extension}`;
    a.click();

    URL.revokeObjectURL(url);

    showToast(`Downloaded ${extension.toUpperCase()} file`);

});
