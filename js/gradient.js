  const defaultColors = {
    2: ['#6366F1', '#EC4899'],
    3: ['#6366F1', '#8B5CF6', '#EC4899']
  };

  const state = {
    count: 3,
    colors: [...defaultColors[3]],
    angle: 135,
    type: 'linear',
    direction: '135deg'
  };

  const linearDirections = [
    { label: '↑', value: '0deg' },
    { label: '↗', value: '45deg' },
    { label: '→', value: '90deg' },
    { label: '↘', value: '135deg' },
    { label: '↓', value: '180deg' },
    { label: '↙', value: '225deg' },
    { label: '←', value: '270deg' },
    { label: '↖', value: '315deg' },
  ];

  const colorRows = document.getElementById('colorRows');
  const angleInput = document.getElementById('angle');
  const angleVal = document.getElementById('angleVal');
  const directionGrid = document.getElementById('directionGrid');
  const previewBox = document.getElementById('previewBox');
  const previewTag = document.getElementById('previewTag');
  const cssOutput = document.getElementById('cssOutput');
  const swatchStrip = document.getElementById('swatchStrip');
  const field = document.querySelector('.field');

  function buildColorRows(){
    colorRows.innerHTML = '';
    state.colors.forEach((color, i) => {
      const row = document.createElement('div');
      row.className = 'color-row';
      row.innerHTML = `
        <div class="swatch-wrap">
          <input type="color" value="${color}" data-index="${i}" class="colorPicker">
        </div>
        <div class="color-meta">
          <label>Stop ${i + 1}</label>
          <input type="text" value="${color.toUpperCase()}" data-index="${i}" class="hexInput" maxlength="7">
        </div>
        <div class="stop-position">${Math.round((i / (state.colors.length - 1)) * 100)}%</div>
      `;
      colorRows.appendChild(row);
    });

    document.querySelectorAll('.colorPicker').forEach(el => {
      el.addEventListener('input', e => {
        const i = +e.target.dataset.index;
        state.colors[i] = e.target.value;
        colorRows.querySelectorAll('.hexInput')[i].value = e.target.value.toUpperCase();
        render();
      });
    });

    document.querySelectorAll('.hexInput').forEach(el => {
      el.addEventListener('input', e => {
        const i = +e.target.dataset.index;
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#([0-9A-Fa-f]{6})$/.test(val)) {
          state.colors[i] = val;
          colorRows.querySelectorAll('.colorPicker')[i].value = val;
          render();
        }
      });
    });
  }

  function buildDirectionGrid(){
    directionGrid.innerHTML = '';
    linearDirections.forEach(dir => {
      const btn = document.createElement('button');
      btn.className = 'dir-btn' + (dir.value === state.direction ? ' active' : '');
      btn.innerHTML = `<span style="font-size:18px;font-weight:700;color:inherit">${dir.label}</span>`;
      btn.addEventListener('click', () => {
        state.direction = dir.value;
        state.angle = parseInt(dir.value);
        angleInput.value = state.angle;
        angleVal.textContent = state.angle + '°';
        buildDirectionGrid();
        render();
      });
      directionGrid.appendChild(btn);
    });
  }

  function currentGradientCSS(){
    const colorList = state.colors.join(', ');
    if (state.type === 'radial') {
      return `radial-gradient(circle, ${colorList})`;
    }
    return `linear-gradient(${state.angle}deg, ${colorList})`;
  }

  function render(){
    const gradient = currentGradientCSS();
    previewBox.style.background = gradient;
    previewTag.textContent = state.type === 'radial'
      ? 'radial-gradient · circle'
      : `linear-gradient · ${state.angle}°`;

    cssOutput.innerHTML =
`.element {
  <span class="prop">background</span>: <span class="val">${gradient};</span>
}`;

    swatchStrip.innerHTML = '';
    state.colors.forEach((c, i) => {
      const chip = document.createElement('div');
      chip.className = 'swatch-chip';
      chip.innerHTML = `
        <div class="dot" style="background:${c}"></div>
        <div>
          <span class="hexlabel">${c.toUpperCase()}</span>
          <span class="poslabel">Stop ${i + 1} · ${Math.round((i / (state.colors.length - 1)) * 100)}%</span>
        </div>
      `;
      swatchStrip.appendChild(chip);
    });

    field.style.display = state.type === 'radial' ? 'none' : 'block';
    directionGrid.style.display = state.type === 'radial' ? 'none' : 'grid';
  }

  angleInput.addEventListener('input', e => {
    state.angle = +e.target.value;
    angleVal.textContent = state.angle + '°';
    document.querySelectorAll('.dir-btn').forEach(b => b.classList.remove('active'));
    render();
  });

  document.getElementById('count2').addEventListener('click', () => switchCount(2));
  document.getElementById('count3').addEventListener('click', () => switchCount(3));

  function switchCount(n){
    state.count = n;
    state.colors = [...defaultColors[n]];
    document.getElementById('count2').classList.toggle('active', n === 2);
    document.getElementById('count3').classList.toggle('active', n === 3);
    buildColorRows();
    render();
  }

  document.getElementById('typeLinear').addEventListener('click', () => switchType('linear'));
  document.getElementById('typeRadial').addEventListener('click', () => switchType('radial'));

  function switchType(t){
    state.type = t;
    document.getElementById('typeLinear').classList.toggle('active', t === 'linear');
    document.getElementById('typeRadial').classList.toggle('active', t === 'radial');
    render();
  }

  function randomHex(){
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
    return color;
  }

  document.getElementById('randomizeBtn').addEventListener('click', () => {
    state.colors = state.colors.map(() => randomHex());
    buildColorRows();
    render();
  });

  function copyToClipboard(btn){
    const css = `.element {\n  background: ${currentGradientCSS()};\n}`;
    navigator.clipboard.writeText(css).then(() => {
      const original = btn.textContent;
      btn.textContent = 'Copied ✓';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('copied');
      }, 1500);
    });
  }
  document.getElementById('copyBtn').addEventListener('click', e => copyToClipboard(e.target));
  document.getElementById('copyMainBtn').addEventListener('click', e => copyToClipboard(e.target));


  buildColorRows();
  buildDirectionGrid();
  render();