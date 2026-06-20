document.addEventListener('DOMContentLoaded', () => {

  // 1. MOBILE MENU TOGGLE
  const menuToggle = document.getElementById('menu-toggle-btn');
  const navbarLinks = document.getElementById('navbar-links');

  if (menuToggle && navbarLinks) {
    menuToggle.addEventListener('click', () => {
      navbarLinks.classList.toggle('active-mobile');
      // Simple toggle styling for mobile nav in JS or CSS
      if (navbarLinks.classList.contains('active-mobile')) {
        navbarLinks.style.display = 'flex';
        navbarLinks.style.flexDirection = 'column';
        navbarLinks.style.position = 'absolute';
        navbarLinks.style.top = '100%';
        navbarLinks.style.left = '0';
        navbarLinks.style.width = '100%';
        navbarLinks.style.background = 'var(--bg-base)';
        navbarLinks.style.borderBottom = '1px solid var(--border-color)';
        navbarLinks.style.padding = '1.5rem 8%';
        navbarLinks.style.gap = '1.2rem';
        menuToggle.innerHTML = '<i class="ph ph-x"></i>';
      } else {
        navbarLinks.removeAttribute('style');
        menuToggle.innerHTML = '<i class="ph ph-list"></i>';
      }
    });

    // Close menu on link click
    navbarLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (navbarLinks.classList.contains('active-mobile')) {
          navbarLinks.classList.remove('active-mobile');
          navbarLinks.removeAttribute('style');
          menuToggle.innerHTML = '<i class="ph ph-list"></i>';
        }
      });
    });
  }


  // 2. CANVAS PARTICLE BACKGROUND (With Mouse Repulsion)
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');

  let particlesArray = [];
  let mouse = {
    x: null,
    y: null,
    radius: 120
  };

  // Adjust canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }
  window.addEventListener('resize', resizeCanvas);
  
  // Track mouse coordinates
  window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Particle Class
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 2 + 1;
      // Normal float speeds
      this.baseSpeedX = (Math.random() * 0.6) - 0.3;
      this.baseSpeedY = (Math.random() * 0.6) - 0.3;
      this.speedX = this.baseSpeedX;
      this.speedY = this.baseSpeedY;
      
      // Store original coordinates for returning logic
      this.originX = x;
      this.originY = y;
      this.density = (Math.random() * 30) + 15; // Mass / resistance
    }

    draw() {
      ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
      // Some particles will match the primary or secondary neon theme
      if (this.density > 40) {
        ctx.fillStyle = 'rgba(138, 43, 226, 0.45)'; // Violet
      } else if (this.density < 20) {
        ctx.fillStyle = 'rgba(244, 63, 161, 0.45)'; // Pink
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    update() {
      // Mouse interaction (Repelling)
      if (mouse.x !== null && mouse.y !== null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          let forceDirectionX = dx / distance;
          let forceDirectionY = dy / distance;
          
          // The closer the mouse, the stronger the force pushing away
          let force = (mouse.radius - distance) / mouse.radius;
          let directionX = forceDirectionX * force * this.density * 0.5;
          let directionY = forceDirectionY * force * this.density * 0.5;
          
          // Repel particle (subtract direction since we want to push AWAY)
          this.x -= directionX;
          this.y -= directionY;
        }
      }

      // Smooth float drift
      this.x += this.speedX;
      this.y += this.speedY;

      // Wrap around bounds
      if (this.x < 0) {
        this.x = canvas.width;
      } else if (this.x > canvas.width) {
        this.x = 0;
      }
      
      if (this.y < 0) {
        this.y = canvas.height;
      } else if (this.y > canvas.height) {
        this.y = 0;
      }
    }
  }

  // Populate particles
  function initParticles() {
    particlesArray = [];
    // Adjust density based on screen width
    let numberOfParticles = (canvas.width * canvas.height) / 10000;
    numberOfParticles = Math.min(Math.max(numberOfParticles, 60), 150);

    for (let i = 0; i < numberOfParticles; i++) {
      let x = Math.random() * canvas.width;
      let y = Math.random() * canvas.height;
      particlesArray.push(new Particle(x, y));
    }
  }

  // Draw lines connecting close particles
  function connectParticles() {
    let maxDistance = 100;
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a; b < particlesArray.length; b++) {
        let dx = particlesArray[a].x - particlesArray[b].x;
        let dy = particlesArray[a].y - particlesArray[b].y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          // Connect with translucent gradients/lines
          let alpha = (maxDistance - distance) / maxDistance * 0.15;
          ctx.strokeStyle = `rgba(138, 43, 226, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
        }
      }
    }
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw();
    }
    connectParticles();
    requestAnimationFrame(animate);
  }

  // Start Canvas
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
  animate();


  // 3. TYPEWRITER EFFECT
  const words = ["Java Developer", "Backend Enthusiast", "AI/Quantum ML Explorer"];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typewriterTarget = document.getElementById('typewriter-text');
  let typingSpeed = 100;

  function type() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      // Deleting character
      typewriterTarget.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50; // Deletes faster
    } else {
      // Adding character
      typewriterTarget.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100; // Normal typing speed
    }

    // Word complete
    if (!isDeleting && charIndex === currentWord.length) {
      typingSpeed = 2000; // Pause at full word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typingSpeed = 500; // Brief pause before typing next
    }

    setTimeout(type, typingSpeed);
  }

  if (typewriterTarget) {
    setTimeout(type, 1000);
  }


  // 4. INTERSECTION OBSERVER FOR SCROLL REVEAL
  const revealElements = document.querySelectorAll('.reveal-element');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Once revealed, no need to observe again
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });


  // 5. 3D TILT EFFECT ON PROJECT CARDS
  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach(card => {
    const innerCard = card.querySelector('.project-card-inner');
    
    card.addEventListener('mousemove', (e) => {
      const cardRect = card.getBoundingClientRect();
      const cardWidth = cardRect.width;
      const cardHeight = cardRect.height;
      
      // Mouse coordinate inside the card
      const mouseX = e.clientX - cardRect.left;
      const mouseY = e.clientY - cardRect.top;
      
      // Calculate rotate angles (max 10 degrees)
      const rotateX = ((cardHeight / 2 - mouseY) / (cardHeight / 2)) * 8;
      const rotateY = ((mouseX - cardWidth / 2) / (cardWidth / 2)) * 8;
      
      // Apply transforms
      innerCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      // Smoothly reset transformations
      innerCard.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      innerCard.style.transition = 'transform 0.5s ease-out';
    });
    
    card.addEventListener('mouseenter', () => {
      // Remove transitions temporarily during hover for reactive movement
      innerCard.style.transition = 'none';
    });
  });


  // 6. TERMINAL CONTACT FORM SIMULATION
  const contactForm = document.getElementById('portfolio-contact-form');
  const formStatusLog = document.getElementById('form-status-log');

  if (contactForm && formStatusLog) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('form-submit-btn');
      const submitText = submitBtn.querySelector('.btn-text');
      
      // Disable form buttons & inputs during simulation
      submitBtn.disabled = true;
      submitText.textContent = 'CONNECTING...';
      formStatusLog.className = 'form-status-log';
      formStatusLog.innerHTML = `<span class="c-prompt">guest@raju3114:~$</span> ping -c 3 mail-server.local`;

      // Simulating connection steps
      setTimeout(() => {
        formStatusLog.innerHTML += `<br>64 bytes from mail-server.local: icmp_seq=1 ttl=64 time=0.045 ms`;
      }, 400);

      setTimeout(() => {
        formStatusLog.innerHTML += `<br>64 bytes from mail-server.local: icmp_seq=2 ttl=64 time=0.038 ms`;
      }, 800);

      setTimeout(() => {
        formStatusLog.innerHTML += `<br><span class="c-prompt">guest@raju3114:~$</span> sending_packet --payload="message"`;
      }, 1200);

      setTimeout(() => {
        // Success execution
        formStatusLog.classList.add('success');
        formStatusLog.innerHTML = `<span class="c-prompt">system@raju3114:~$</span> [SUCCESS] Message transmitted successfully to raj3114kumar@gmail.com!`;
        
        // Reset button
        submitBtn.disabled = false;
        submitText.textContent = 'TRANSMIT_MESSAGE';
        
        // Clear inputs
        contactForm.reset();
      }, 1800);
    });
  }

  // Active Link Tracking based on scroll position
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= (sectionTop - 200)) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });

});
