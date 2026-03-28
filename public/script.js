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
            <div class="project-img vidtube-bg">
                <div class="overlay">
                    <a href="#" class="view-btn"><i class="fab fa-github"></i> Source</a>
                </div>
            </div>
            <div class="project-info">
                <h3>VidTube | YouTube Clone</h3>
                <p>A responsive video streaming platform replicating YouTube’s core features. Includes custom video playback interfaces, live search functionality, and sleek UI components.</p>
                <div class="tech-stack">
                    <span>HTML5</span><span>CSS3</span><span>JavaScript</span>
                </div>
            </div>
        </div>
        <div class="project-card glass-card hover-lift">
            <div class="project-img portfolio-bg">
                <div class="overlay">
                    <a href="#" class="view-btn"><i class="fas fa-external-link-alt"></i> Live View</a>
                </div>
            </div>
            <div class="project-info">
                <h3>Premium Portfolio</h3>
                <p>A full-stack personal portfolio demonstrating expertise in modern web aesthetics. Features custom glassmorphism, glowing hover interactions, API fetching, and scrolling animations.</p>
                <div class="tech-stack">
                    <span>Node.js</span><span>Express</span><span>Vanilla UI</span>
                </div>
            </div>
        </div>
        <div class="project-card glass-card hover-lift">
            <div class="project-img vidtube-bg" style="background: linear-gradient(135deg, #111, #222);">
                <div class="overlay">
                    <a href="#" class="view-btn"><i class="fas fa-external-link-alt"></i> Live View</a>
                </div>
            </div>
            <div class="project-info">
                <h3>E-Commerce Dashboard</h3>
                <p>A highly interactive admin dashboard for managing products and sales data. Includes real-time charts, dark mode, and a fully responsive grid system.</p>
                <div class="tech-stack">
                    <span>React JS</span><span>Tailwind</span><span>Recharts</span>
                </div>
            </div>
        </div>
        <div class="project-card glass-card hover-lift">
            <div class="project-img portfolio-bg" style="background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);">
                <div class="overlay">
                    <a href="#" class="view-btn"><i class="fab fa-github"></i> Source</a>
                </div>
            </div>
            <div class="project-info">
                <h3>AI Task Manager</h3>
                <p>A smart productivity application that leverages AI to sort, prioritize, and manage daily to-dos. Includes JWT authentication and a seamless draggable UI.</p>
                <div class="tech-stack">
                    <span>Vue.js</span><span>Express</span><span>MongoDB</span>
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

});
