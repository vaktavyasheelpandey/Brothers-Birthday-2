let scene, camera, renderer, cake, candles = [], candleLights = [];
let cakeClicked = false;
let scrollEnabled = false;

function initCake() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    camera.position.y = 5;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("cake-canvas").appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const cakeGroup = new THREE.Group();
    const vanillaColors = [0xfdf5e6, 0xffe4b5, 0xfff8dc];

    [5, 4, 3].forEach((radius, i) => {
        const geometry = new THREE.CylinderGeometry(radius, radius, 2, 32);
        const material = new THREE.MeshPhongMaterial({ color: vanillaColors[i] });
        const layer = new THREE.Mesh(geometry, material);
        layer.position.y = i * 2;
        cakeGroup.add(layer);
    });

    addFrosting(cakeGroup);
    addCandles(cakeGroup);

    cake = cakeGroup;
    scene.add(cake);

    animate();
    renderer.domElement.addEventListener("click", handleCakeClick);
}

function addFrosting(group) {
    [12, 10, 8].forEach((count, i) => {
        const radius = 5 - i;
        const height = 0.8 + i * 2;
        const size = 0.5 - i * 0.1;
        for (let j = 0; j < count; j++) {
            const angle = (j / count) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const frosting = new THREE.Mesh(
                new THREE.SphereGeometry(size, 8, 8),
                new THREE.MeshPhongMaterial({ color: 0xffffff })
            );
            frosting.position.set(x, height, z);
            group.add(frosting);
        }
    });
}

function addCandles(group) {
    const positions = [
        { x: 0, z: 0 }, { x: 1.5, z: 0 }, { x: -1.5, z: 0 },
        { x: 0, z: 1.5 }, { x: 0, z: -1.5 }
    ];

    positions.forEach(({ x, z }) => {
        const candle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 1, 16),
            new THREE.MeshPhongMaterial({ color: 0xf5deb3 })
        );
        candle.position.set(x, 5.5, z);
        group.add(candle);
        candles.push(candle);

        const light = new THREE.PointLight(0xffcc00, 1, 3);
        light.position.set(x, 6.2, z);
        group.add(light);
        candleLights.push(light);

        const flame = new THREE.Mesh(
            new THREE.ConeGeometry(0.15, 0.4, 16),
            new THREE.MeshPhongMaterial({
                color: 0xff9900,
                emissive: 0xff6600,
                transparent: true,
                opacity: 0.9
            })
        );
        flame.position.set(x, 6.2, z);
        group.add(flame);
        candles.push(flame);
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (cakeClicked) cake.rotation.y += 0.03;
    renderer.render(scene, camera);
}

function handleCakeClick() {
    if (cakeClicked) return;
    cakeClicked = true;
    document.getElementById("instructions").style.display = "none";
    document.getElementById("confetti-canvas").style.display = "block";
    createConfetti();

    // Hide flames
    candles.forEach((obj, i) => { if (i % 2 === 1) obj.visible = false; });
    candleLights.forEach(light => light.intensity = 0);

    // Play music
    const music = document.getElementById("bg-music");
    music.volume = 0.5;
    music.play().catch(e => console.warn("Autoplay blocked:", e));

    // Animate photo up to corner 🎉
    document.getElementById("photo").classList.add("visible");

    scrollEnabled = true;
    setTimeout(() => {
        document.getElementById("scroll-instruction").style.display = "block";
    }, 1000);
}

function createConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetti = Array.from({ length: 200 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 2 - canvas.height,
        size: Math.random() * 5 + 5,
        color: ["#ff4081", "#ff9e80", "#ffff8d", "#b9f6ca", "#80d8ff", "#8c9eff", "#ea80fc"][Math.floor(Math.random() * 7)],
        speed: Math.random() * 3 + 2,
        angle: Math.random() * 360,
        rotation: 0,
        rotationSpeed: Math.random() * 10 - 5
    }));

    (function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;
        confetti.forEach(c => {
            if (c.y < canvas.height) {
                active = true;
                ctx.save();
                ctx.translate(c.x, c.y);
                ctx.rotate((c.rotation * Math.PI) / 180);
                ctx.fillStyle = c.color;
                ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
                ctx.restore();
                c.y += c.speed;
                c.rotation += c.rotationSpeed;
            }
        });
        if (active) requestAnimationFrame(draw);
        else canvas.style.display = "none";
    })();
}

window.addEventListener("resize", () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

window.addEventListener("scroll", () => {
    if (!scrollEnabled) window.scrollTo(0, 0);
    const y = window.scrollY;
    if (y > 100) {
        document.getElementById("cake-canvas").style.transform = "translate(-40%, 0) scale(0.5)";
        document.getElementById("letter").style.right = "10%";
        document.getElementById("scroll-instruction").style.display = "none";
    } else {
        document.getElementById("cake-canvas").style.transform = "translate(0, 0) scale(1)";
        document.getElementById("letter").style.right = "-100%";
        if (cakeClicked) document.getElementById("scroll-instruction").style.display = "block";
    }
});

window.onload = initCake;
