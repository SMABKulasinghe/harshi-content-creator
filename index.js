/* ═══════════════════════════════════════════════════════
   HARSHIII PORTFOLIO — Advanced Three.js + UI Logic
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ─────────────────────────────────────────────────────
    // 1. LOADER
    // ─────────────────────────────────────────────────────
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('done');
    }, 1800);

    // ─────────────────────────────────────────────────────
    // 2. NAVBAR SCROLL
    // ─────────────────────────────────────────────────────
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // ─────────────────────────────────────────────────────
    // 3. HAMBURGER / MOBILE MENU
    // ─────────────────────────────────────────────────────
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');

    hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
    });

    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
        });
    });

    // ─────────────────────────────────────────────────────
    // 4. SCROLL-REVEAL OBSERVER
    // ─────────────────────────────────────────────────────
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-animate]').forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.05}s`;
        revealObserver.observe(el);
    });

    // ─────────────────────────────────────────────────────
    // 5. ANIMATED COUNTER
    // ─────────────────────────────────────────────────────
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'));
        const duration = 1600;
        const start = performance.now();

        function update(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = target;
        }
        requestAnimationFrame(update);
    }

    document.querySelectorAll('.counter').forEach(el => {
        counterObserver.observe(el);
    });

    // ─────────────────────────────────────────────────────
    // 6. REACH CARD ANIMATION
    // ─────────────────────────────────────────────────────
    const reachObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.reach-card').forEach(card => {
        reachObserver.observe(card);
    });

    // ─────────────────────────────────────────────────────
    // 7. BRAND CARD BAR ANIMATION
    // ─────────────────────────────────────────────────────
    const brandObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                brandObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.brand-card').forEach(card => {
        brandObserver.observe(card);
    });

    // ─────────────────────────────────────────────────────
    // 8. YOUTUBE DATA API — Free, no OAuth needed
    //    Channel ID for @bole98 — uses public API key
    //    ⚠️  Replace YOUR_API_KEY below with a Google Cloud API key
    //        (enable YouTube Data API v3 in Google Cloud Console)
    // ─────────────────────────────────────────────────────
    const YT_CHANNEL_ID = 'UCLwXLtSNhHI7GrPzCfC26WA'; // @bole98 channel ID
    const YT_API_KEY    = 'AIzaSyD_PLACEHOLDER_REPLACE_ME'; // ← replace with real key

    async function fetchYouTubeStats() {
        if (YT_API_KEY === 'AIzaSyD_PLACEHOLDER_REPLACE_ME') {
            // No key provided — show helpful placeholder
            displayYTStats(null);
            return;
        }
        try {
            const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${YT_CHANNEL_ID}&key=${YT_API_KEY}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            if (data.items && data.items.length > 0) {
                displayYTStats(data.items[0]);
            } else {
                displayYTStats(null);
            }
        } catch (e) {
            console.warn('YouTube API fetch failed:', e);
            displayYTStats(null);
        }
    }

    function formatNumber(n) {
        n = parseInt(n);
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
        if (n >= 1_000)     return (n / 1_000).toFixed(1)     + 'K';
        return n.toString();
    }

    function displayYTStats(item) {
        const subCountEl    = document.getElementById('yt-sub-count');
        const subSuffixEl   = document.getElementById('yt-sub-suffix');
        const heroSubEl     = document.getElementById('yt-subscribers');
        const livePanel     = document.getElementById('yt-live-panel');

        if (!item) {
            // Fallback statistics when no API key is provided
            if (subCountEl)  subCountEl.textContent  = '10.4';
            if (subSuffixEl) subSuffixEl.textContent = 'K';
            if (heroSubEl)   heroSubEl.textContent   = '10.4K';
            return;
        }

        const stats   = item.statistics;
        const snippet = item.snippet;
        const subs    = parseInt(stats.subscriberCount || 0);
        const views   = parseInt(stats.viewCount       || 0);
        const videos  = parseInt(stats.videoCount      || 0);

        // Hero stat
        if (heroSubEl) heroSubEl.textContent = formatNumber(subs);

        // Reach card
        if (subCountEl) {
            if (subs >= 1000) {
                subCountEl.textContent  = (subs / 1000).toFixed(1);
                if (subSuffixEl) subSuffixEl.textContent = 'K';
            } else {
                subCountEl.textContent  = subs;
                if (subSuffixEl) subSuffixEl.textContent = '';
            }
        }

        // YouTube fill bar (relative to 10K max for display)
        const fillEl = document.getElementById('yt-fill');
        if (fillEl) {
            const pct = Math.min((subs / 10000) * 100, 100);
            fillEl.style.width = pct + '%';
        }

        // Live panel
        if (livePanel) {
            livePanel.style.display = 'block';
            const channelNameEl  = document.getElementById('yt-channel-name');
            const subsFullEl     = document.getElementById('yt-subs-full');
            const viewsEl        = document.getElementById('yt-views');
            const videoCountEl   = document.getElementById('yt-video-count');

            if (channelNameEl)  channelNameEl.textContent  = snippet.title || '@bole98';
            if (subsFullEl)     subsFullEl.textContent      = subs.toLocaleString();
            if (viewsEl)        viewsEl.textContent         = views.toLocaleString();
            if (videoCountEl)   videoCountEl.textContent    = videos.toLocaleString();
        }
    }

    // Kick off YouTube fetch
    fetchYouTubeStats();

    // ─────────────────────────────────────────────────────
    // 9. THREE.JS SCENE — Dark Immersive 3D Background
    // ─────────────────────────────────────────────────────
    if (typeof THREE === 'undefined') return;

    const canvas = document.getElementById('three-canvas');
    const W = window.innerWidth;
    const H = window.innerHeight;

    // Scene + Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xfff5f8, 0.016);

    const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 400);
    camera.position.set(0, 0, 28);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: false,
        antialias: true,
        powerPreference: 'high-performance',
    });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xfff5f8, 1);
    renderer.shadowMap.enabled = false;

    // ── Lights ──────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffe8f4, 2.5));

    const pinkLight = new THREE.PointLight(0xff7eb9, 3, 60);
    pinkLight.position.set(-8, 6, 12);
    scene.add(pinkLight);

    const roseLight = new THREE.PointLight(0xffb3d6, 2, 50);
    roseLight.position.set(12, -4, 8);
    scene.add(roseLight);

    const warmLight = new THREE.PointLight(0xffe4f0, 2, 80);
    warmLight.position.set(0, -15, -10);
    scene.add(warmLight);

    // ── Particle Galaxy ──────────────────────────────────
    const PARTICLE_COUNT = 3000;
    const pGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors    = new Float32Array(PARTICLE_COUNT * 3);
    const sizes     = new Float32Array(PARTICLE_COUNT);

    const pinkColor  = new THREE.Color(0xff7eb9);
    const roseColor  = new THREE.Color(0xffb3d6);
    const blushColor = new THREE.Color(0xffe4f0);
    const whiteColor = new THREE.Color(0xffffff);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Distribute in a wide shell
        const r     = 25 + Math.random() * 55;
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos((Math.random() * 2) - 1);

        positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // Soft feminine color variation
        const t = Math.random();
        let col;
        if (t < 0.35)      col = pinkColor;
        else if (t < 0.6)  col = roseColor;
        else if (t < 0.82) col = blushColor;
        else                col = whiteColor;

        colors[i * 3]     = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;

        sizes[i] = Math.random() * 0.8 + 0.1;
    }

    pGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    pGeometry.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    const pMaterial = new THREE.PointsMaterial({
        size: 0.22,
        vertexColors: true,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true,
        depthWrite: false,
    });

    const particles = new THREE.Points(pGeometry, pMaterial);
    scene.add(particles);

    // ── Floating Glass Orbs ───────────────────────────────
    const orbConfigs = [
        { r: 6.0,  pos: [-12,  3, -8],  speed: 0.4,  phase: 0.0,  pink: true  },
        { r: 4.2,  pos: [10,  -2, -5],  speed: 0.6,  phase: 1.8,  pink: true  },
        { r: 3.0,  pos: [-2,   8,  0],  speed: 0.9,  phase: 0.6,  pink: true  },
        { r: 5.0,  pos: [-7,  -7, -12], speed: 0.35, phase: 2.5,  pink: false },
        { r: 2.5,  pos: [15,   5, -8],  speed: 1.1,  phase: 3.3,  pink: true  },
        { r: 3.8,  pos: [0,  -10, -4],  speed: 0.7,  phase: 4.1,  pink: false },
        { r: 2.0,  pos: [-16,  0,  2],  speed: 1.3,  phase: 1.0,  pink: true  },
    ];

    const orbs = orbConfigs.map(cfg => {
        const geo = new THREE.SphereGeometry(cfg.r, 80, 80);

        // Outer glass shell
        const mat = new THREE.MeshPhongMaterial({
            color:             cfg.pink ? 0xffcce6 : 0xffe0f0,
            emissive:          cfg.pink ? 0xff7eb9 : 0xffb3d6,
            emissiveIntensity: 0.12,
            specular:          0xffffff,
            shininess:         260,
            transparent:       true,
            opacity:           0.28,
            side:              THREE.FrontSide,
            depthWrite:        false,
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...cfg.pos);

        // Inner glow core
        const innerGeo = new THREE.SphereGeometry(cfg.r * 0.5, 32, 32);
        const innerMat = new THREE.MeshBasicMaterial({
            color:       cfg.pink ? 0xff7eb9 : 0xffb3d6,
            transparent: true,
            opacity:     0.08,
            depthWrite:  false,
        });
        mesh.add(new THREE.Mesh(innerGeo, innerMat));

        // Highlight cap
        const capGeo = new THREE.SphereGeometry(cfg.r * 0.4, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.35);
        const capMat = new THREE.MeshBasicMaterial({
            color:       0xffffff,
            transparent: true,
            opacity:     0.22,
            side:        THREE.FrontSide,
            depthWrite:  false,
        });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.set(-cfg.r * 0.15, cfg.r * 0.28, cfg.r * 0.7);
        mesh.add(cap);

        mesh.userData = {
            speed:   cfg.speed,
            phase:   cfg.phase,
            originX: cfg.pos[0],
            originY: cfg.pos[1],
            originZ: cfg.pos[2],
        };

        scene.add(mesh);
        return mesh;
    });

    // ── Flowing Torus Rings ───────────────────────────────
    const rings = [];
    const ringData = [
        { r: 9,  tube: 0.08, pos: [0,  0, -15], rot: [0.3, 0.5, 0] },
        { r: 6,  tube: 0.06, pos: [-5, 3, -10], rot: [1.0, 0.2, 0.8] },
        { r: 14, tube: 0.1,  pos: [4, -5, -20], rot: [0.1, 1.2, 0.4] },
    ];

    ringData.forEach(rd => {
        const geo = new THREE.TorusGeometry(rd.r, rd.tube, 16, 120);
        const mat = new THREE.MeshBasicMaterial({
            color:       0xff7eb9,
            transparent: true,
            opacity:     0.25,
            depthWrite:  false,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...rd.pos);
        mesh.rotation.set(...rd.rot);
        scene.add(mesh);
        rings.push(mesh);
    });

    // ── Grid / Wave Plane ─────────────────────────────────
    const waveGeo = new THREE.PlaneGeometry(100, 100, 90, 90);
    const waveMat = new THREE.MeshBasicMaterial({
        color:       0xffb3d6,
        wireframe:   true,
        transparent: true,
        opacity:     0.12,
        depthWrite:  false,
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.rotation.x = -Math.PI / 2.4;
    waveMesh.position.y = -18;
    scene.add(waveMesh);

    // ── Mouse Parallax ────────────────────────────────────
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;

    window.addEventListener('mousemove', e => {
        targetMouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // ── Scroll-driven camera drift ────────────────────────
    let scrollProgress = 0;
    window.addEventListener('scroll', () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress = window.scrollY / maxScroll;
    }, { passive: true });

    // ── Animation Loop ─────────────────────────────────────
    const clock = new THREE.Clock();
    const wavePositions = waveGeo.attributes.position;

    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Smooth mouse
        mouseX += (targetMouseX - mouseX) * 0.06;
        mouseY += (targetMouseY - mouseY) * 0.06;

        // Animate orbs
        orbs.forEach((orb, i) => {
            const { speed, phase, originX, originY } = orb.userData;
            orb.position.x = originX + Math.cos(t * speed * 0.6 + phase) * 2.2;
            orb.position.y = originY + Math.sin(t * speed + phase) * 2.5;
            orb.rotation.y += 0.002;
            orb.rotation.x += 0.001;
        });

        // Animate rings
        rings.forEach((ring, i) => {
            ring.rotation.x += 0.003 * (i % 2 === 0 ? 1 : -1);
            ring.rotation.y += 0.002 * (i % 2 === 0 ? -1 : 1);
            ring.rotation.z += 0.001;
        });

        // Wave vertices
        for (let i = 0; i < wavePositions.count; i++) {
            const x = wavePositions.getX(i);
            const y = wavePositions.getY(i);
            wavePositions.setZ(i,
                Math.sin(x * 0.2 + t * 0.5) * 1.2 +
                Math.cos(y * 0.2 + t * 0.4) * 0.8
            );
        }
        wavePositions.needsUpdate = true;

        // Rotate particle cloud slowly
        particles.rotation.y += 0.0006;
        particles.rotation.x += 0.0002;

        // Pulse main pink light
        pinkLight.intensity = 3 + Math.sin(t * 1.2) * 0.8;
        roseLight.intensity = 2 + Math.cos(t * 0.8) * 0.6;

        // Camera: parallax + scroll drift
        camera.position.x += (mouseX * 4  - camera.position.x) * 0.035;
        camera.position.y += (-mouseY * 3 - camera.position.y) * 0.035;
        // Gentle scroll-driven zoom out
        camera.position.z = 28 + scrollProgress * 12;

        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    animate();

    // ── Resize Handler ────────────────────────────────────
    window.addEventListener('resize', () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // ─────────────────────────────────────────────────────
    // 8. SECTION SEPARATOR OBSERVER
    //    (staggered animate for pkg-card and brand-card)
    // ─────────────────────────────────────────────────────
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const children = entry.target.querySelectorAll('.pkg-card, .brand-card, .connect-card, .reach-card');
                children.forEach((child, i) => {
                    setTimeout(() => child.setAttribute('data-animate', ''), i * 80);
                    setTimeout(() => {
                        child.style.opacity = '0';
                        child.style.transform = 'translateY(28px)';
                        child.style.transition = `opacity 0.6s ease, transform 0.6s ease`;
                        requestAnimationFrame(() => {
                            child.style.opacity = '1';
                            child.style.transform = 'translateY(0)';
                        });
                    }, i * 80);
                });
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.packages-grid, .brands-grid, .connect-grid, .reach-grid').forEach(el => {
        staggerObserver.observe(el);
    });

});
