(function () {
    // Configuration & State
    const config = {
        size: 80,         // Source resolution
        scale: 6,         // Visual Scale
        gap: 1,
        isCircleMask: true,
        animType: 'none',
        speed: 5,
        opacity: 0.4,
        beamSize: 120,
        angleDeg: 25,
        tick: 0
    };

    const canvas = document.getElementById("px-canvas");
    if (!canvas) return;

    canvas.width = config.size * config.scale;
    canvas.height = config.size * config.scale;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "https://raw.githubusercontent.com/Rainier-PS/rainier-ps.github.io/main/images/site/Rainier%20Pearson%20Saputra-Avatar.svg";

    let sourceData = null;
    let baseImageCanvas = document.createElement("canvas");

    let currentRandomEffect = 'linear';
    let lastRandomSwitch = 0;
    const randomInterval = 3000;
    const strategies = ['linear', 'radar', 'spotlight', 'pulse'];

    img.onload = () => {
        const loader = document.getElementById("px-loading");
        if (loader) loader.style.display = "none";

        const temp = document.createElement("canvas");
        temp.width = config.size;
        temp.height = config.size;
        const tctx = temp.getContext("2d");
        tctx.imageSmoothingEnabled = false;
        tctx.drawImage(img, 0, 0, config.size, config.size);
        sourceData = tctx.getImageData(0, 0, config.size, config.size).data;

        generateBaseLayer();
        requestAnimationFrame(drawLoop);
    };

    function generateBaseLayer() {
        baseImageCanvas.width = canvas.width;
        baseImageCanvas.height = canvas.height;
        const bctx = baseImageCanvas.getContext("2d");

        bctx.clearRect(0, 0, baseImageCanvas.width, baseImageCanvas.height);

        const cx = config.size / 2;
        const cy = config.size / 2;
        const maskRadiusSq = (cx) * (cx);

        for (let y = 0; y < config.size; y++) {
            for (let x = 0; x < config.size; x++) {
                if (config.isCircleMask) {
                    const dx = x - cx + 0.5;
                    const dy = y - cy + 0.5;
                    if (dx * dx + dy * dy > maskRadiusSq) continue;
                }

                const i = (y * config.size + x) * 4;
                if (sourceData[i + 3] < 50) continue;

                bctx.fillStyle = `rgb(${sourceData[i]},${sourceData[i + 1]},${sourceData[i + 2]})`;

                const pX = x * config.scale + (config.scale / 2);
                const pY = y * config.scale + (config.scale / 2);
                const rad = Math.max(0.5, (config.scale - config.gap) / 2);

                bctx.beginPath();
                bctx.arc(pX, pY, rad, 0, Math.PI * 2);
                bctx.fill();
            }
        }
    }

    function drawLoop(timestamp) {
        if (!canvas.isConnected) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(baseImageCanvas, 0, 0);

        ctx.globalCompositeOperation = "source-atop";
        config.tick += config.speed;

        let effectiveAnim = config.animType;

        if (effectiveAnim === 'random') {
            if (!lastRandomSwitch) lastRandomSwitch = timestamp || 0;
            if ((timestamp || 0) - lastRandomSwitch > randomInterval) {
                lastRandomSwitch = timestamp;
                let next = currentRandomEffect;
                while (next === currentRandomEffect) {
                    next = strategies[Math.floor(Math.random() * strategies.length)];
                }
                currentRandomEffect = next;
            }
            effectiveAnim = currentRandomEffect;
        }

        if (effectiveAnim !== 'none') {
            switch (effectiveAnim) {
                case 'linear': drawLinearEffect(); break;
                case 'radar': drawRadarEffect(); break;
                case 'spotlight': drawSpotlightEffect(); break;
                case 'pulse': drawPulseEffect(); break;
            }
        }

        ctx.globalCompositeOperation = "source-over";
        requestAnimationFrame(drawLoop);
    }

    function drawLinearEffect() {
        ctx.save();
        const angleRad = config.angleDeg * (Math.PI / 180);
        const cycle = canvas.width * 2.5;
        let pos = (config.tick * 2) % cycle;
        pos -= (canvas.width * 0.75);

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angleRad);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        const grad = ctx.createLinearGradient(pos, 0, pos + config.beamSize, 0);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(0.5, `rgba(255,255,255,${config.opacity})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");

        ctx.fillStyle = grad;
        ctx.fillRect(-1000, -1000, 4000, 4000);
        ctx.restore();
    }

    function drawRadarEffect() {
        ctx.save();
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const rotation = (config.tick * 0.02) % (Math.PI * 2);

        ctx.translate(cx, cy);
        ctx.rotate(rotation);

        const grad = ctx.createLinearGradient(0, -config.beamSize, 0, 0);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(1, `rgba(255,255,255,${config.opacity})`);

        ctx.fillStyle = grad;
        ctx.fillRect(-canvas.width, 0, canvas.width * 2, config.beamSize / 2);

        ctx.restore();
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);

        const tailGrad = ctx.createLinearGradient(0, 0, 0, canvas.width / 1.5);
        tailGrad.addColorStop(0, `rgba(255,255,255,${config.opacity})`);
        tailGrad.addColorStop(1, "rgba(255,255,255,0)");

        ctx.fillStyle = tailGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-config.beamSize, canvas.width);
        ctx.lineTo(config.beamSize, canvas.width);
        ctx.fill();
        ctx.restore();
    }

    function drawSpotlightEffect() {
        const t = config.tick * 0.01;
        const cx = canvas.width / 2 + Math.sin(t) * (canvas.width * 0.3);
        const cy = canvas.height / 2 + Math.cos(t * 1.3) * (canvas.height * 0.3);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, config.beamSize);
        grad.addColorStop(0, `rgba(255,255,255,${config.opacity})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawPulseEffect() {
        const t = config.tick * 0.05;
        const pulse = (Math.sin(t) + 1) / 2;
        ctx.fillStyle = `rgba(255,255,255,${pulse * config.opacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // UI Logic
    const panel = document.getElementById("px-panel");
    const trigger = document.getElementById("px-settings-trigger");
    const closeBtn = document.getElementById("px-panel-close");

    function setPanelState(isOpen) {
        if (panel) panel.classList.toggle("open", isOpen);
        if (trigger) trigger.classList.toggle("hidden", isOpen);
    }

    if (trigger) trigger.onclick = () => setPanelState(true);
    if (closeBtn) closeBtn.onclick = () => setPanelState(false);

    function bind(id, key, displayId) {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", (e) => {
            let val = parseFloat(e.target.value);
            config[key] = val;
            const disp = document.getElementById(displayId);
            if (disp) disp.textContent = val + (key === 'angleDeg' ? '°' : '');
            if (key === 'gap') generateBaseLayer();
        });
    }

    bind("px-speed", "speed", "px-speed-val");
    bind("px-opacity", "opacity", "px-opacity-val");
    bind("px-width", "beamSize", "px-width-val");
    bind("px-angle", "angleDeg", "px-angle-val");
    bind("px-gap", "gap", "px-gap-val");

    const animSelect = document.getElementById("px-anim-type");
    if (animSelect) animSelect.addEventListener("change", (e) => {
        config.animType = e.target.value;
    });

    document.querySelectorAll(".px-shape-option").forEach(opt => {
        opt.addEventListener("click", () => {
            document.querySelectorAll(".px-shape-option").forEach(o => o.classList.remove("active"));
            opt.classList.add("active");
            config.isCircleMask = (opt.dataset.shape === "circle");
            generateBaseLayer();
        });
    });

})();

