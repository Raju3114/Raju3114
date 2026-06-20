document.addEventListener('DOMContentLoaded', () => {

  // 1. MOBILE MENU TOGGLE
  const menuToggle = document.getElementById('menu-toggle-btn');
  const navbarLinks = document.getElementById('navbar-links');

  if (menuToggle && navbarLinks) {
    menuToggle.addEventListener('click', () => {
      navbarLinks.classList.toggle('active-mobile');
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


  // 2. CANVAS SPACE CONSTELLATION BACKGROUND (With Gravitational Lens Warping)
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');

  let starsArray = [];
  let mouse = {
    x: null,
    y: null,
    radius: 150 // Radius of gravitational lens
  };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
  }
  window.addEventListener('resize', resizeCanvas);
  
  window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Star Class
  class Star {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      // Actual rendered position (incorporates lens warping)
      this.renderX = x;
      this.renderY = y;
      
      this.size = Math.random() * 2 + 0.5;
      
      // Floating celestial drift speed
      this.speedX = (Math.random() * 0.2) - 0.1;
      this.speedY = (Math.random() * 0.2) - 0.1;
      
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulseValue = Math.random();
      
      // Deep space colors
      this.colorType = Math.random();
    }

    draw() {
      // Create glowing alpha
      let alpha = 0.3 + Math.abs(Math.sin(this.pulseValue)) * 0.5;
      
      if (this.colorType > 0.6) {
        ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`; // Cyan Star
      } else if (this.colorType > 0.2) {
        ctx.fillStyle = `rgba(0, 112, 243, ${alpha})`; // Blue Star
      } else {
        ctx.fillStyle = `rgba(138, 43, 226, ${alpha})`; // Purple Nebula Star
      }

      ctx.beginPath();
      // Draw stars as glowing nodes
      if (this.size > 2) {
        ctx.arc(this.renderX, this.renderY, this.size * 1.5, 0, Math.PI * 2);
        ctx.shadowBlur = 8;
        ctx.shadowColor = ctx.fillStyle;
      } else {
        ctx.arc(this.renderX, this.renderY, this.size, 0, Math.PI * 2);
        ctx.shadowBlur = 0;
      }
      ctx.closePath();
      ctx.fill();
    }

    update() {
      // Star float drift
      this.x += this.speedX;
      this.y += this.speedY;

      // Pulse value increment
      this.pulseValue += this.pulseSpeed;

      // Warp around screens
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;

      // Gravitational Lens Calculation
      this.renderX = this.x;
      this.renderY = this.y;

      if (mouse.x !== null && mouse.y !== null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          // Gravitational push factor (warping space around mouse)
          let force = (mouse.radius - distance) / mouse.radius;
          
          // Displace render coordinate away from mouse (gravitational lens)
          this.renderX -= (dx / distance) * force * 45;
          this.renderY -= (dy / distance) * force * 45;
        }
      }
    }
  }

  // Populate space starfield
  function initStars() {
    starsArray = [];
    let numberOfStars = (canvas.width * canvas.height) / 9000;
    numberOfStars = Math.min(Math.max(numberOfStars, 80), 160);

    for (let i = 0; i < numberOfStars; i++) {
      let x = Math.random() * canvas.width;
      let y = Math.random() * canvas.height;
      starsArray.push(new Star(x, y));
    }
  }

  // Connect constellation lines
  function drawConstellations() {
    let maxDistance = 110;
    for (let a = 0; a < starsArray.length; a++) {
      for (let b = a; b < starsArray.length; b++) {
        let dx = starsArray[a].renderX - starsArray[b].renderX;
        let dy = starsArray[a].renderY - starsArray[b].renderY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          let alpha = (maxDistance - distance) / maxDistance * 0.12;
          ctx.strokeStyle = `rgba(0, 112, 243, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(starsArray[a].renderX, starsArray[a].renderY);
          ctx.lineTo(starsArray[b].renderX, starsArray[b].renderY);
          ctx.stroke();
        }
      }
    }
  }

  // Animating Constellation Loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Reset shadow values for standard connections
    ctx.shadowBlur = 0;
    
    for (let i = 0; i < starsArray.length; i++) {
      starsArray[i].update();
      starsArray[i].draw();
    }
    
    ctx.shadowBlur = 0;
    drawConstellations();
    requestAnimationFrame(animate);
  }

  // Start Background
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initStars();
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
      typewriterTarget.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      typewriterTarget.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      typingSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typingSpeed = 500;
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
      
      const mouseX = e.clientX - cardRect.left;
      const mouseY = e.clientY - cardRect.top;
      
      const rotateX = ((cardHeight / 2 - mouseY) / (cardHeight / 2)) * 8;
      const rotateY = ((mouseX - cardWidth / 2) / (cardWidth / 2)) * 8;
      
      innerCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      innerCard.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      innerCard.style.transition = 'transform 0.5s ease-out';
    });
    
    card.addEventListener('mouseenter', () => {
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
      
      submitBtn.disabled = true;
      submitText.textContent = 'CONNECTING...';
      formStatusLog.className = 'form-status-log';
      formStatusLog.innerHTML = `<span class="c-prompt">guest@raju3114:~$</span> ping -c 3 mail-server.local`;

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
        formStatusLog.classList.add('success');
        formStatusLog.innerHTML = `<span class="c-prompt">system@raju3114:~$</span> [SUCCESS] Message transmitted successfully to rajkumar.3114h@gmail.com!`;
        
        submitBtn.disabled = false;
        submitText.textContent = 'TRANSMIT_MESSAGE';
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
      if (window.pageYOffset >= (sectionTop - 200)) {
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
