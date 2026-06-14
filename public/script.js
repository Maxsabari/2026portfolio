// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {

    // 0. Preloader & Hardware Vibration Logic
    const preloader = document.getElementById('preloader');

    if (preloader) {
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

    // 5. Contact Form Submission (AJAX)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            const payload = {
                name: contactForm.name.value,
                email: contactForm.email.value,
                message: contactForm.message.value
            };

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (response.ok) {
                    showToast('Success!', result.message, 'success');
                    contactForm.reset();
                } else {
                    showToast('Error', result.error || 'Failed to send message.', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Error', 'An unexpected error occurred.', 'error');
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

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

    // 8. GitHub Repos Fetch & Slider Logic
    const projectWrapper = document.getElementById('project-wrapper');
    const loadingEl = document.getElementById('github-loading');

    const defaultProjects = `
        <div class="project-card glass-card hover-lift">
            <div class="project-img" style="background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80'); background-size: cover; background-position: center;">
                <div class="overlay">
                    <a href="https://github.com/maxsabari07" target="_blank" class="view-btn"><i class="fab fa-github"></i> Source</a>
                </div>
            </div>
            <div class="project-info">
                <h3>Electricity Intelligence</h3>
                <p>An end-to-end data analytics system with predictive ML modeling (regression), consumption forecasting, and interactive SQL queries for carbon footprint reports.</p>
                <div class="tech-stack">
                    <span>Python</span><span>Scikit-Learn</span><span>SQL</span><span>Pandas</span>
                </div>
            </div>
        </div>
        <div class="project-card glass-card hover-lift">
            <div class="project-img" style="background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80'); background-size: cover; background-position: center;">
                <div class="overlay">
                    <a href="https://github.com/maxsabari07" target="_blank" class="view-btn"><i class="fas fa-external-link-alt"></i> Live Dashboard</a>
                </div>
            </div>
            <div class="project-info">
                <h3>Simpliaxis Campaign ROI</h3>
                <p>An interactive business intelligence reporting tool analyzing Google Ads, LinkedIn Ads, and course conversion performance in the Bengaluru region.</p>
                <div class="tech-stack">
                    <span>Power BI</span><span>SQL</span><span>Python</span><span>Excel</span>
                </div>
            </div>
        </div>
        <div class="project-card glass-card hover-lift">
            <div class="project-img" style="background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80'); background-size: cover; background-position: center;">
                <div class="overlay">
                    <a href="https://github.com/maxsabari07" target="_blank" class="view-btn"><i class="fab fa-github"></i> Source</a>
                </div>
            </div>
            <div class="project-info">
                <h3>Feedback Sentiment Engine</h3>
                <p>A Python-based NLP system that ingests student feedback reviews from Simpliaxis courses, aggregates sentiment scores, and highlights curriculum gaps.</p>
                <div class="tech-stack">
                    <span>Python</span><span>NLTK</span><span>VADER</span><span>Matplotlib</span>
                </div>
            </div>
        </div>
        <div class="project-card glass-card hover-lift">
            <div class="project-img vidtube-bg">
                <div class="overlay">
                    <a href="https://github.com/maxsabari07" target="_blank" class="view-btn"><i class="fab fa-github"></i> Source</a>
                </div>
            </div>
            <div class="project-info">
                <h3>VidTube | YouTube Clone</h3>
                <p>A full-stack video hosting replica with user authentication, video uploads, commenting pipelines, custom search indexing, and a modern responsive grid UI.</p>
                <div class="tech-stack">
                    <span>HTML5</span><span>CSS3</span><span>Express</span><span>JavaScript</span>
                </div>
            </div>
        </div>
    `;

    async function fetchGitHubRepos() {
        try {
            // Using maxsabari07 (extracted from email) as GitHub username identifier.
            const resData = await fetch('https://api.github.com/users/maxsabari07/repos?sort=updated&per_page=6');
            if (!resData.ok) {
                throw new Error('Could not fetch GitHub repos directly');
            }

            const data = await resData.json();

            if (data.length > 0) {
                let html = '';
                data.forEach(repo => {
                    if (repo.fork) return;

                    // Assign a repeating cool background class
                    const bgClass = Math.random() > 0.5 ? 'portfolio-bg' : 'vidtube-bg';

                    html += `
                    <div class="project-card glass-card hover-lift">
                        <div class="project-img ${bgClass}">
                            <div class="overlay">
                                <a href="${repo.html_url}" target="_blank" class="view-btn"><i class="fab fa-github"></i> Source</a>
                            </div>
                        </div>
                        <div class="project-info">
                            <h3>${repo.name.replace(/-/g, ' ').replace(/_/g, ' ')}</h3>
                            <p>${repo.description || 'A stunning web project built with passion and modern technologies. Check out the source code!'}</p>
                            <div class="tech-stack">
                                <span>${repo.language || 'Code'}</span>
                                <span>⭐ ${repo.stargazers_count}</span>
                            </div>
                        </div>
                    </div>
                    `;
                });
                projectWrapper.innerHTML = html + defaultProjects;
            } else {
                projectWrapper.innerHTML = defaultProjects;
            }
        } catch (err) {
            console.error('GitHub API error:', err);
            projectWrapper.innerHTML = defaultProjects + `
                <div class="project-card glass-card hover-lift" style="display:flex; justify-content:center; align-items:center;">
                    <p style="text-align:center; color: var(--accent-secondary)">Update your GitHub username in script.js to auto-fetch your live repos!</p>
                </div>
            `;
        } finally {
            if (loadingEl) loadingEl.style.display = 'none';
            initSlider();
        }
    }

    fetchGitHubRepos();

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
