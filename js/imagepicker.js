document.addEventListener('DOMContentLoaded', () => {

    const imageUpload = document.getElementById('imageUpload');
    const previewImage = document.getElementById('previewImage');
    const previewPlaceholder = document.getElementById('previewPlaceholder');
    const previewBadge = document.getElementById('previewBadge');
    const uploadedInfo = document.getElementById('uploadedInfo');
    const uploadedFileName = document.getElementById('uploadedFileName');
    const colorDots = document.getElementById('colorDots');
    const paletteResult = document.getElementById('paletteResult');
    const saveImagePaletteBtn = document.getElementById('saveImagePaletteBtn');
    const exportImagePaletteBtn = document.getElementById('exportImagePaletteBtn');

    if (!imageUpload || !previewImage || !paletteResult) {
        console.error('Required elements missing — check your HTML IDs.');
        return;
    }

    let fullResCanvas = null;
    let fullResCtx = null;
    let userHasUploaded = false;
    let currentExtractedColors = [];
    let currentFileName = "Image Palette";

    const SAVED_PALETTES_KEY = "genPaletto_savedPalettes";


    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        userHasUploaded = true;

        currentFileName = file.name || "Image Palette";

        uploadedFileName.textContent = file.name;
        uploadedInfo.style.display = 'flex';

        const reader = new FileReader();

        reader.onload = (evt) => {
            previewImage.src = evt.target.result;
            previewImage.style.display = 'block';
            if (previewPlaceholder) previewPlaceholder.style.display = 'none';
        };

        reader.onerror = () => console.error('Failed to read the selected file.');
        previewImage.onerror = () => console.error('Failed to load image into <img>.');

        reader.readAsDataURL(file);
    });

    function handleImageReady() {
        fullResCanvas = document.createElement('canvas');
        fullResCanvas.width = previewImage.naturalWidth;
        fullResCanvas.height = previewImage.naturalHeight;
        fullResCtx = fullResCanvas.getContext('2d');
        fullResCtx.drawImage(previewImage, 0, 0);

        const result = extractPalette(previewImage);
        previewBadge.textContent = `image-picker · ${result.colors.length} colors`;
        renderDots(result.points, result.colors);
        renderPalette(result.colors);

        if (userHasUploaded) {
            document.querySelector('.picker-layout').scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }

    previewImage.onload = handleImageReady;


    if (previewImage.complete && previewImage.naturalWidth > 0) {
        handleImageReady();
    }

    function extractPalette(img, sampleSize = 80, numColors = 5) {
        const canvas = document.createElement('canvas');
        canvas.width = sampleSize;
        canvas.height = sampleSize * (img.naturalHeight / img.naturalWidth);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const buckets = {};

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
            if (a < 200) continue;

            const key = [Math.round(r / 24), Math.round(g / 24), Math.round(b / 24)].join(',');
            const pixelIndex = i / 4;
            const x = pixelIndex % canvas.width;
            const y = Math.floor(pixelIndex / canvas.width);

            if (!buckets[key]) buckets[key] = { r: 0, g: 0, b: 0, count: 0, x: 0, y: 0 };
            buckets[key].r += r;
            buckets[key].g += g;
            buckets[key].b += b;
            buckets[key].x += x;
            buckets[key].y += y;
            buckets[key].count++;
        }

        const sorted = Object.values(buckets).sort((a, b) => b.count - a.count).slice(0, numColors);

        const colors = sorted.map(b => rgbToHex(
            Math.round(b.r / b.count),
            Math.round(b.g / b.count),
            Math.round(b.b / b.count)
        ));

        const points = sorted.map(b => ({
            xPercent: (b.x / b.count / canvas.width) * 100,
            yPercent: (b.y / b.count / canvas.height) * 100
        }));

        return { colors, points };
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
    }


    function renderDots(points, colors) {
        colorDots.innerHTML = '';
        points.forEach((p, i) => {
            const dot = document.createElement('div');
            dot.className = 'color-dot';
            dot.dataset.index = i;
            dot.style.left = p.xPercent + '%';
            dot.style.top = p.yPercent + '%';
            dot.style.background = colors[i];
            colorDots.appendChild(dot);
            setTimeout(() => dot.classList.add('show'), 100 + i * 80);

            makeDotDraggable(dot, i);
        });
    }

    function makeDotDraggable(dot, index) {
        dot.style.setProperty('pointer-events', 'auto', 'important');
        dot.style.cursor = 'grab';

        dot.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dot.setPointerCapture(e.pointerId);
            dot.style.cursor = 'grabbing';
            dot.classList.add('dragging');

            const moveHandler = (moveEvent) => {
                const rect = colorDots.getBoundingClientRect();
                let xPercent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
                let yPercent = ((moveEvent.clientY - rect.top) / rect.height) * 100;

                xPercent = Math.max(0, Math.min(100, xPercent));
                yPercent = Math.max(0, Math.min(100, yPercent));

                dot.style.left = xPercent + '%';
                dot.style.top = yPercent + '%';

                const hex = samplePixelColor(xPercent, yPercent);
                if (hex) {
                    dot.style.background = hex;
                    updateSwatch(index, hex);
                }
            };

            const upHandler = () => {
                dot.style.cursor = 'grab';
                dot.classList.remove('dragging');
                document.removeEventListener('pointermove', moveHandler);
                document.removeEventListener('pointerup', upHandler);
            };

            document.addEventListener('pointermove', moveHandler);
            document.addEventListener('pointerup', upHandler);
        });
    }

    function samplePixelColor(xPercent, yPercent) {
        if (!fullResCtx) return null;

        const x = Math.floor((xPercent / 100) * fullResCanvas.width);
        const y = Math.floor((yPercent / 100) * fullResCanvas.height);

        const clampedX = Math.max(0, Math.min(fullResCanvas.width - 1, x));
        const clampedY = Math.max(0, Math.min(fullResCanvas.height - 1, y));

        const pixel = fullResCtx.getImageData(clampedX, clampedY, 1, 1).data;
        return rgbToHex(pixel[0], pixel[1], pixel[2]);
    }

    function updateSwatch(index, hex) {
        const card = paletteResult.children[index];
        if (!card) return;

        const colorBlock = card.querySelector('.swatch-color');
        const codeEl = card.querySelector('.swatch-code');

        colorBlock.style.background = hex;
        codeEl.dataset.hex = hex;
        codeEl.dataset.format = 'hex';
        codeEl.textContent = hex;

        currentExtractedColors[index] = hex;
    }

    function renderPalette(colors) {

        currentExtractedColors = colors.slice();

        paletteResult.innerHTML = '';
        colors.forEach(hex => {
            const card = document.createElement('div');
            card.className = 'color-card';
            card.innerHTML = `
                <div class="color-preview" style="background:${hex}"></div>
                <div class="color-details">
                    <span class="color-value" data-hex="${hex}" data-format="hex">${hex}
                    </span>
                    <div class="copy-btn" >
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                    </svg>       
                    </div>
                             </div>
        
            `;
            paletteResult.appendChild(card);
        });

        if (typeof gsap !== 'undefined') {
            gsap.from(".color-card", { y: 24, opacity: 0, duration: .5, stagger: .08, ease: "power3.out" });
        }
    }

    paletteResult.addEventListener('click', (e) => {
        const codeEl = e.target.closest('.color-value');
        if (codeEl) {
            const hex = codeEl.dataset.hex;
            const current = codeEl.dataset.format;
            const next = current === 'hex' ? 'hsl' : current === 'hsl' ? 'rgb' : 'hex';
            codeEl.dataset.format = next;
            codeEl.textContent = formatColor(hex, next);
            return;
        }

        const icon = e.target.closest('.copy-btn');
        if (icon) {
            const swatchInfo = icon.closest('.color-details');
            const relatedCode = swatchInfo ? swatchInfo.querySelector('.color-value') : null;
            if (!relatedCode) return;

            navigator.clipboard.writeText(relatedCode.textContent).then(() => {
                if (typeof showToast === 'function') {
                    showToast(`${relatedCode.textContent} copied to clipboard`);
                } else {
                    console.log('Copied:', relatedCode.textContent);
                }
            });
        }
    });

    function formatColor(hex, format) {
        const { r, g, b } = hexToRgb(hex);
        if (format === 'hex') return hex;
        if (format === 'hsl') {
            const { h, s, l } = rgbToHsl(r, g, b);
            return `hsl(${h}, ${s}%, ${l}%)`;
        }
        if (format === 'rgb') return `rgb(${r}, ${g}, ${b})`;
    }

    function hexToRgb(hex) {
        const bigint = parseInt(hex.replace('#', ''), 16);
        return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
    }

    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h *= 60;
        }
        return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
    }


    /* SAVED PALETTES */

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


    function saveImagePalette(){

        if(!currentExtractedColors.length){

            showToast("Extract a palette first.");
            return;

        }

        const saved = getSavedPalettes();

        const newEntry = {

            id: Date.now().toString(),
            title: currentFileName,
            colors: [...currentExtractedColors],
            savedAt: new Date().toISOString()

        };

        saved.unshift(newEntry);

        setSavedPalettes(saved);

        showToast("Palette saved");

    }


    if(saveImagePaletteBtn){

        saveImagePaletteBtn.addEventListener("click", saveImagePalette);

    }

    if(exportImagePaletteBtn){

        exportImagePaletteBtn.addEventListener("click", () => {

            if(!currentExtractedColors.length){

                showToast("Extract a palette first.");
                return;

            }

            openExportModal(currentFileName, currentExtractedColors);

        });

    }

});

/* EXPORT PALETTE */

let exportCurrentPalette = null;
let exportCurrentFormat = "css";


function buildCssExport(palette){

    const lines = palette.colors

    .map((hex, i) => `  --color-${i + 1}: ${hex};`)

    .join("\n");

    return `:root {\n${lines}\n}`;

}


function buildJsonExport(palette){

    const data = {

        name: palette.title,
        colors: palette.colors

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


function openExportModal(title, colors){

    if(!colors || !colors.length) return;

    exportCurrentPalette = { title, colors };
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