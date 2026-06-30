// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // 🎵 INTRO MUSIC SYSTEM
    // =============================================
    const introAudio = new Audio('intro.wav');
    introAudio.volume = 0.55;
    introAudio.loop = false;

    let musicEnabled = true;
    let musicStarted = false;

    // Create floating music toggle button
    const musicBtn = document.createElement('button');
    musicBtn.id = 'music-toggle-btn';
    musicBtn.setAttribute('aria-label', 'Toggle music');
    musicBtn.innerHTML = '<i class="fas fa-music"></i>';
    musicBtn.style.cssText = `
        position: fixed;
        bottom: 28px;
        right: 28px;
        z-index: 9999;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: none;
        background: linear-gradient(135deg, rgba(0,240,255,0.2), rgba(138,43,226,0.3));
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(0,240,255,0.35);
        color: #00f0ff;
        font-size: 1.1rem;
        cursor: pointer;
        box-shadow: 0 0 18px rgba(0,240,255,0.35), 0 4px 20px rgba(0,0,0,0.4);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    document.body.appendChild(musicBtn);

    // Pulsing ring animation via injected keyframes
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        @keyframes musicPulse {
            0% { box-shadow: 0 0 0 0 rgba(0,240,255,0.45), 0 4px 20px rgba(0,0,0,0.4); }
            70% { box-shadow: 0 0 0 14px rgba(0,240,255,0), 0 4px 20px rgba(0,0,0,0.4); }
            100% { box-shadow: 0 0 0 0 rgba(0,240,255,0), 0 4px 20px rgba(0,0,0,0.4); }
        }
        #music-toggle-btn.playing { animation: musicPulse 1.8s ease-out infinite; }
        #music-toggle-btn:hover { transform: scale(1.12); }
        #music-toggle-btn.muted { color: rgba(255,255,255,0.35); border-color: rgba(255,255,255,0.15); box-shadow: none; animation: none; }
    `;
    document.head.appendChild(styleTag);

    function startMusic() {
        if (musicStarted) return;
        musicStarted = true;
        introAudio.play()
            .then(() => {
                musicBtn.classList.add('playing');
            })
            .catch(() => {
                // Autoplay blocked — silently wait for first user interaction
                musicStarted = false;
            });
    }

    function stopMusic() {
        introAudio.pause();
        introAudio.currentTime = 0;
        musicBtn.classList.remove('playing');
    }

    introAudio.addEventListener('ended', () => {
        musicBtn.classList.remove('playing');
        musicStarted = false;
    });

    // Toggle on button click
    musicBtn.addEventListener('click', () => {
        if (!introAudio.paused) {
            stopMusic();
            musicEnabled = false;
            musicBtn.classList.add('muted');
            musicBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            musicEnabled = true;
            musicBtn.classList.remove('muted');
            musicBtn.innerHTML = '<i class="fas fa-music"></i>';
            musicStarted = false;
            startMusic();
        }
    });

    // First user interaction fallback (handles autoplay policy)
    const autoplayFallback = () => {
        if (musicEnabled && !musicStarted) startMusic();
        document.removeEventListener('click', autoplayFallback);
        document.removeEventListener('keydown', autoplayFallback);
        document.removeEventListener('touchstart', autoplayFallback);
    };
    document.addEventListener('click', autoplayFallback, { once: true });
    document.addEventListener('keydown', autoplayFallback, { once: true });
    document.addEventListener('touchstart', autoplayFallback, { once: true });

    // =============================================
    // 0. Preloader & Hardware Vibration Logic
    // =============================================
    const preloader = document.getElementById('preloader');

    if (preloader) {
        // Try to play music immediately with preloader
        startMusic();

        // Attempt physical device vibration (works on supported mobile browsers)
        if (navigator.vibrate) {
            // Pulse pattern in ms: [vibrate, pause, vibrate]
            navigator.vibrate([200, 100, 200]);
        }

        // Wait for the gorgeous smooth intro, then trigger fade out text
        setTimeout(() => {
            preloader.classList.add('stopping');
        }, 2200);

        // Entire preloader fades out completely
        setTimeout(() => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.remove(); // Remove from DOM
            }, 1000); // 1s CSS transition time
        }, 3000);
    }

    // 1. Navigation Scrolled State
    const nav = document.querySelector('.glass-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li a');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = hamburger.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // 3. Scroll Reveal Animations utilizing Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once revealed
                // revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select elements to reveal
    const sections = document.querySelectorAll('.section-reveal');
    const slideLefts = document.querySelectorAll('.slide-in-left');
    const slideRights = document.querySelectorAll('.slide-in-right');

    sections.forEach(sec => revealObserver.observe(sec));
    slideLefts.forEach(el => revealObserver.observe(el));
    slideRights.forEach(el => revealObserver.observe(el));

    // 4. Active Navigation Link on Scroll
    const allSections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        let current = '';
        allSections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });

    // 5. Contact Form Submission (AJAX removed for mailto functionality)

    // Custom Toast Notification Function
    function showToast(title, message, type) {
        const toast = document.createElement('div');
        toast.className = `custom-toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="${type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'} toast-icon"></i>
                <div class="toast-text">
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
            </div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

    // 6. Custom Cursor Logic
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');

    // Smooth follower mechanics
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Instant cursor update
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });

    // Animate follower to smoothly catch up to cursor
    function animateFollower() {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;

        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';

        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Add hover states for interactive elements
    const interactables = document.querySelectorAll('a, button, .project-card, .btn');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            follower.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            follower.classList.remove('hover');
        });
    });

    // 7. Interactive Dotted Canvas Background
    const canvas = document.getElementById('dots-canvas');
    const ctx = canvas.getContext('2d');

    let dots = [];
    const colors = ['rgba(0, 240, 255, 0.5)', 'rgba(138, 43, 226, 0.5)', 'rgba(255, 0, 85, 0.5)'];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Dot {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 1;
            this.vy = (Math.random() - 0.5) * 1;
            this.radius = Math.random() * 2 + 1;
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // Initialize dots based on screen size
    const numDots = Math.floor(window.innerWidth / 15);
    for (let i = 0; i < numDots; i++) {
        dots.push(new Dot());
    }

    function animateDots() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < dots.length; i++) {
            dots[i].update();
            dots[i].draw();

            // Connect dots near each other
            for (let j = i + 1; j < dots.length; j++) {
                const dx = dots[i].x - dots[j].x;
                const dy = dots[i].y - dots[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(dots[i].x, dots[i].y);
                    ctx.lineTo(dots[j].x, dots[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 - (distance / 1000)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }

            // Connect dots to mouse
            const hx = dots[i].x - mouseX;
            const hy = dots[i].y - mouseY;
            const mDistance = Math.sqrt(hx * hx + hy * hy);

            if (mDistance < 150) {
                ctx.beginPath();
                ctx.moveTo(dots[i].x, dots[i].y);
                ctx.lineTo(mouseX, mouseY);
                ctx.strokeStyle = `rgba(0, 240, 255, ${0.2 - (mDistance / 750)})`;
                ctx.lineWidth = 1;
                ctx.stroke();

                // Slight interaction push/pull based on distance
                if (mDistance < 50) {
                    dots[i].x += (dots[i].x - mouseX) * 0.05;
                    dots[i].y += (dots[i].y - mouseY) * 0.05;
                }
            }
        }

        requestAnimationFrame(animateDots);
    }


    animateDots();

    // Gamification Explosion
    window.addEventListener('click', (e) => {
        for(let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 2;
            const p = new Dot();
            p.x = e.clientX;
            p.y = e.clientY;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.radius = Math.random() * 4 + 2;
            p.color = colors[Math.floor(Math.random() * colors.length)];
            dots.push(p);
            
            // Limit dots array to prevent performance issues
            if (dots.length > 200) {
                dots.shift();
            }
        }
    });

    // 8. GitHub Repos Fetch & Slider Logic
    const projectWrapper = document.getElementById('project-wrapper');
    const loadingEl = document.getElementById('github-loading');

    const defaultProjects = `
        <div class="project-card glass-card hover-lift">
            <div class="project-img" style="background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('qrcode_guardian.png'); background-size: cover; background-position: center;">
                <div class="overlay">
                    <a href="https://qrcode-guardian-pwa.vercel.app/" target="_blank" class="view-btn"><i class="fas fa-external-link-alt"></i> Visit Site</a>
                </div>
            </div>
            <div class="project-info">
                <h3>QR Code Guardian</h3>
                <p>A modern, sleek, glowing QR code security application featuring a dark theme, neon accents, and a visually stunning glassmorphism interface.</p>
                <div class="tech-stack">
                    <span>PWA</span><span>Security</span><span>React</span><span>Glassmorphism</span>
                </div>
            </div>
        </div>
        <div class="project-card glass-card hover-lift">
            <div class="project-img" style="background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('sabaricode_arena.png'); background-size: cover; background-position: center;">
                <div class="overlay">
                    <a href="https://sabaricode-arena.vercel.app/" target="_blank" class="view-btn"><i class="fas fa-external-link-alt"></i> Visit Site</a>
                </div>
            </div>
            <div class="project-info">
                <h3>SabariCode Arena</h3>
                <p>A high-quality competitive coding platform interface featuring a futuristic code editor, glowing syntax highlighting, and dark mode gamification.</p>
                <div class="tech-stack">
                    <span>Web App</span><span>UI/UX</span><span>Gamified</span><span>Code Editor</span>
                </div>
            </div>
        </div>
    `;

    projectWrapper.innerHTML = defaultProjects;
    if (loadingEl) loadingEl.style.display = 'none';
    initSlider();

    function initSlider() {
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const cards = document.querySelectorAll('.project-card');

        let currentIndex = 0;

        function updateSliderPosition() {
            if (cards.length === 0) return;
            const cardWidth = cards[0].offsetWidth;
            const gap = parseFloat(window.getComputedStyle(projectWrapper).gap) || 40; // 2.5rem = 40px
            const moveAmount = cardWidth + gap;
            projectWrapper.style.transform = `translateX(-${currentIndex * moveAmount}px)`;
        }

        nextBtn.addEventListener('click', () => {
            const itemsVisible = window.innerWidth > 968 ? 3 : window.innerWidth > 600 ? 2 : 1;
            const maxIndex = Math.max(0, cards.length - itemsVisible);

            if (currentIndex < maxIndex) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            updateSliderPosition();
        });

        prevBtn.addEventListener('click', () => {
            const itemsVisible = window.innerWidth > 968 ? 3 : window.innerWidth > 600 ? 2 : 1;
            const maxIndex = Math.max(0, cards.length - itemsVisible);

            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = maxIndex;
            }
            updateSliderPosition();
        });

        window.addEventListener('resize', updateSliderPosition);
    }

    // 9. Interactive Analytics Sandbox
    const runQueryBtn = document.getElementById('run-query-btn');
    const sqlCodeEl = document.getElementById('sql-code');
    const consoleTextEl = document.getElementById('console-text');
    const queryTabs = document.querySelectorAll('.query-tab');
    
    const kpi1Label = document.getElementById('kpi-1-label');
    const kpi2Label = document.getElementById('kpi-2-label');
    const kpi3Label = document.getElementById('kpi-3-label');
    
    const kpi1Value = document.getElementById('kpi-1-value');
    const kpi2Value = document.getElementById('kpi-2-value');
    const kpi3Value = document.getElementById('kpi-3-value');
    
    const chartBarsContainer = document.getElementById('chart-bars-container');

    const datasets = {
        1: {
            sql: `SELECT course_name, SUM(sales) AS revenue, AVG(conversion_rate) AS conv_rate \nFROM simpliaxis_courses \nGROUP BY course_name \nORDER BY revenue DESC;`,
            kpis: {
                label1: "Total Revenue", value1: "$184,200",
                label2: "Avg. Conversion", value2: "21.6%",
                label3: "Total Enrollments", value3: "1,540"
            },
            chart: [
                { label: "CSM (Scrum Master)", value: 85, color: "var(--accent-main)", displayValue: "$85K" },
                { label: "CSPO (Product Owner)", value: 62, color: "#8a2be2", displayValue: "$62K" },
                { label: "SAFe POPM", value: 37, color: "var(--accent-secondary)", displayValue: "$37.2K" }
            ],
            console: `Executing SQL query...\nRows returned: 3\nExecution time: 4.8ms\nStatus: 200 OK\nFetched fields: [course_name, revenue, conv_rate]`
        },
        2: {
            sql: `SELECT lead_source, COUNT(*) AS lead_count, AVG(roi_percentage) AS roi \nFROM simpliaxis_marketing \nWHERE location = 'Bengaluru' \nGROUP BY lead_source;`,
            kpis: {
                label1: "Marketing Spend", value1: "$12,400",
                label2: "Avg. Campaign ROI", value2: "320%",
                label3: "Bengaluru Leads", value3: "4,820"
            },
            chart: [
                { label: "LinkedIn Ads", value: 92, color: "var(--accent-main)", displayValue: "92%" },
                { label: "Google Search", value: 78, color: "#8a2be2", displayValue: "78%" },
                { label: "Email Campaigns", value: 48, color: "var(--accent-secondary)", displayValue: "48%" }
            ],
            console: `Executing SQL query...\nRows returned: 3\nExecution time: 6.2ms\nStatus: 200 OK\nFilter: location = 'Bengaluru'`
        },
        3: {
            sql: `SELECT trainer_name, AVG(csat_score) AS avg_csat, COUNT(feedback_id) AS total_reviews \nFROM simpliaxis_feedback \nGROUP BY trainer_name;`,
            kpis: {
                label1: "Average CSAT", value1: "4.85 / 5.0",
                label2: "Satisfaction Rate", value2: "97.4%",
                label3: "Total Feedbacks", value3: "820"
            },
            chart: [
                { label: "Trainer A (Agile)", value: 97, color: "var(--accent-main)", displayValue: "4.85/5" },
                { label: "Trainer B (Scrum)", value: 94, color: "#8a2be2", displayValue: "4.70/5" },
                { label: "Trainer C (SAFe)", value: 89, color: "var(--accent-secondary)", displayValue: "4.45/5" }
            ],
            console: `Executing SQL query...\nRows returned: 3\nExecution time: 3.1ms\nStatus: 200 OK\nAggregated rows: 820 reviews`
        }
    };

    let activeQueryId = 1;

    function renderPlaygroundData(id) {
        const data = datasets[id];
        sqlCodeEl.textContent = data.sql;
        consoleTextEl.textContent = `> Ready. Click 'Run Query' to execute...`;
    }

    queryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            queryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeQueryId = parseInt(tab.getAttribute('data-query'));
            renderPlaygroundData(activeQueryId);
            
            // Auto click run when tab changes
            runQueryBtn.click();
        });
    });

    if (runQueryBtn) {
        runQueryBtn.addEventListener('click', () => {
            const data = datasets[activeQueryId];
            consoleTextEl.textContent = `> Running query...\n> Connecting to simpliaxis_db...\n`;
            
            runQueryBtn.disabled = true;
            runQueryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Executing...';

            setTimeout(() => {
                consoleTextEl.textContent = `> Query executed successfully.\n\n${data.console}`.trim();
                
                // Update KPIs
                kpi1Label.textContent = data.kpis.label1;
                kpi1Value.textContent = data.kpis.value1;
                kpi2Label.textContent = data.kpis.label2;
                kpi2Value.textContent = data.kpis.value2;
                kpi3Label.textContent = data.kpis.label3;
                kpi3Value.textContent = data.kpis.value3;

                // Update Chart
                chartBarsContainer.innerHTML = '';
                data.chart.forEach(item => {
                    const barWrapper = document.createElement('div');
                    barWrapper.className = 'chart-bar-wrapper';
                    
                    barWrapper.innerHTML = `
                        <div class="chart-bar-value">${item.displayValue}</div>
                        <div class="chart-bar" style="height: 0%; background: ${item.color}"></div>
                        <div class="chart-bar-label">${item.label}</div>
                    `;
                    chartBarsContainer.appendChild(barWrapper);
                    
                    // Trigger animation
                    setTimeout(() => {
                        const barEl = barWrapper.querySelector('.chart-bar');
                        if (barEl) barEl.style.height = `${item.value}%`;
                    }, 50);
                });

                runQueryBtn.disabled = false;
                runQueryBtn.innerHTML = '<i class="fas fa-play"></i> Run Query';
            }, 800);
        });
        
        // Initial setup
        setTimeout(() => {
            runQueryBtn.click();
        }, 500);
    }

});
