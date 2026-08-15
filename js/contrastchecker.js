document.addEventListener('DOMContentLoaded', () => {

    const fgColorPicker = document.getElementById('fgColorPicker');
    const fgHexInput = document.getElementById('fgHexInput');

    const bgColorPicker = document.getElementById('bgColorPicker');
    const bgHexInput = document.getElementById('bgHexInput');

    const swapColorsBtn = document.getElementById('swapColorsBtn');

    const contrastPreview = document.getElementById('contrastPreview');

    const contrastRatioValue = document.getElementById('contrastRatioValue');

    const normalAA = document.getElementById('normalAA');
    const normalAAA = document.getElementById('normalAAA');
    const largeAA = document.getElementById('largeAA');
    const largeAAA = document.getElementById('largeAAA');

    function normalizeHex(hex){

        hex = hex.trim();

        if(!hex.startsWith("#")){
            hex = "#" + hex;
        }

        if(hex.length === 4){
            hex = "#" + hex[1]+hex[1] + hex[2]+hex[2] + hex[3]+hex[3];
        }

        return hex.toUpperCase();

    }


    function isValidHex(hex){

        return /^#([0-9A-F]{6})$/i.test(normalizeHex(hex));

    }


    function hexToRgb(hex){

        hex = normalizeHex(hex);

        return {
            r: parseInt(hex.slice(1,3),16),
            g: parseInt(hex.slice(3,5),16),
            b: parseInt(hex.slice(5,7),16)
        };

    }


    /* RELATIVE LUMINANCE*/

    function channelToLinear(c){

        c = c / 255;

        return c <= 0.03928
            ? c / 12.92
            : Math.pow((c + 0.055) / 1.055, 2.4);

    }


    function relativeLuminance({r,g,b}){

        const R = channelToLinear(r);
        const G = channelToLinear(g);
        const B = channelToLinear(b);

        return (0.2126 * R) + (0.7152 * G) + (0.0722 * B);

    }


    /* CONTRAST RATIO  */

    function getContrastRatio(hex1, hex2){

        const L1 = relativeLuminance(hexToRgb(hex1));
        const L2 = relativeLuminance(hexToRgb(hex2));

        const lighter = Math.max(L1, L2);
        const darker = Math.min(L1, L2);

        return (lighter + 0.05) / (darker + 0.05);

    }

    function setPill(el, passed, label){

        el.textContent = passed ? `${label} Pass` : `${label} Fail`;
        el.classList.remove("pill-pass", "pill-fail");
        el.classList.add(passed ? "pill-pass" : "pill-fail");

    }


    function updateContrast(){

        const fgHex = normalizeHex(fgHexInput.value);
        const bgHex = normalizeHex(bgHexInput.value);

        if(!isValidHex(fgHex) || !isValidHex(bgHex)){
            return;
        }

        fgColorPicker.value = fgHex;
        bgColorPicker.value = bgHex;

        contrastPreview.style.color = fgHex;
        contrastPreview.style.background = bgHex;

        const ratio = getContrastRatio(fgHex, bgHex);

        contrastRatioValue.textContent = `${ratio.toFixed(2)}:1`;

        // WCAG thresholds
        const normalAAPass = ratio >= 4.5;
        const normalAAAPass = ratio >= 7;
        const largeAAPass = ratio >= 3;
        const largeAAAPass = ratio >= 4.5;

        setPill(normalAA, normalAAPass, "AA");
        setPill(normalAAA, normalAAAPass, "AAA");
        setPill(largeAA, largeAAPass, "AA");
        setPill(largeAAA, largeAAAPass, "AAA");

    }


    /*  INPUT EVENTS*/

    fgColorPicker.addEventListener("input", () => {

        fgHexInput.value = fgColorPicker.value.toUpperCase();
        updateContrast();

    });


    fgHexInput.addEventListener("input", () => {

        if(isValidHex(fgHexInput.value)){
            updateContrast();
        }

    });


    bgColorPicker.addEventListener("input", () => {

        bgHexInput.value = bgColorPicker.value.toUpperCase();
        updateContrast();

    });


    bgHexInput.addEventListener("input", () => {

        if(isValidHex(bgHexInput.value)){
            updateContrast();
        }

    });


    swapColorsBtn.addEventListener("click", () => {

        const tempHex = fgHexInput.value;

        fgHexInput.value = bgHexInput.value;
        bgHexInput.value = tempHex;

        updateContrast();

    });
    updateContrast();

});