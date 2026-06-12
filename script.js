/* ==========================================================================
   Kusal Rimal Portfolio Interactive JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // ------------------------------------------------------------------------
  // 1. Custom Cursor physics tracking
  // ------------------------------------------------------------------------
  const cursorDot = document.getElementById('cursorDot');
  const cursorOutline = document.getElementById('cursorOutline');
  
  let mouseX = 0;
  let mouseY = 0;
  let outlineX = 0;
  let outlineY = 0;
  let outlineWidth = 24;
  let outlineHeight = 24;
  
  let isHovered = false;
  let snapElement = null;
  
  // Speed parameter controls the lag/spring smoothing rate
  const speed = 0.15;
  

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    document.documentElement.style.setProperty('--mouse-screen-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-screen-y', `${e.clientY}px`);
  });

  function updateCursor() {
    let targetX = mouseX;
    let targetY = mouseY;
    let targetWidth = 24;
    let targetHeight = 24;

    if (snapElement) {
      const rect = snapElement.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
      targetWidth = rect.width + 16; // Add padding around the element
      targetHeight = rect.height + 16;
    } else if (isHovered) {
      targetWidth = 38;
      targetHeight = 38;
    }

    // Interpolate positions
    outlineX += (targetX - outlineX) * speed;
    outlineY += (targetY - outlineY) * speed;
    
    // Interpolate dimensions
    outlineWidth += (targetWidth - outlineWidth) * speed;
    outlineHeight += (targetHeight - outlineHeight) * speed;

    if (cursorDot) {
      cursorDot.style.transform = `translate3d(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%), 0)`;
    }
    
    if (cursorOutline) {
      cursorOutline.style.transform = `translate3d(calc(${outlineX}px - 50%), calc(${outlineY}px - 50%), 0)`;
      cursorOutline.style.width = `${outlineWidth}px`;
      cursorOutline.style.height = `${outlineHeight}px`;
    }
    
    requestAnimationFrame(updateCursor);
  }
  
  // Start the physics animation loop
  if (window.matchMedia('(pointer: fine)').matches) {
    requestAnimationFrame(updateCursor);
  }

  // ------------------------------------------------------------------------
  // 2. Custom Cursor Hover States (delegated listeners)
  // ------------------------------------------------------------------------
  if (window.matchMedia('(pointer: fine)').matches) {
    const hoverSelectors = 'a, button, .btn, .timeline-item, .blog-card, .social-link, .social-icon-link, .hover-target';
    
    document.addEventListener('mouseover', (e) => {
      const isInputField = e.target.closest('input[type="text"], input[type="email"], textarea');
      if (isInputField) {
        cursorOutline.classList.add('hidden');
        cursorDot.classList.add('hidden');
        return;
      } else {
        cursorOutline.classList.remove('hidden');
        cursorDot.classList.remove('hidden');
      }

      const projectRow = e.target.closest('.project-row');
      const projectCard = e.target.closest('.project-card');
      const snapTarget = projectRow || projectCard;
      
      const hoverTarget = e.target.closest(hoverSelectors);
      
      if (snapTarget) {
        snapElement = snapTarget;
        isHovered = false;
        cursorOutline.classList.add('snapped');
        cursorOutline.classList.remove('hovered');
        cursorDot.classList.add('snapped');
      } else if (hoverTarget) {
        snapElement = null;
        isHovered = true;
        cursorOutline.classList.add('hovered');
        cursorOutline.classList.remove('snapped');
        cursorDot.classList.remove('snapped');
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      const relatedInput = e.relatedTarget ? e.relatedTarget.closest('input[type="text"], input[type="email"], textarea') : null;
      if (relatedInput) {
        cursorOutline.classList.add('hidden');
        cursorDot.classList.add('hidden');
        return;
      } else {
        cursorOutline.classList.remove('hidden');
        cursorDot.classList.remove('hidden');
      }

      const relatedSnap = e.relatedTarget ? (e.relatedTarget.closest('.project-row') || e.relatedTarget.closest('.project-card')) : null;
      const relatedHover = e.relatedTarget ? e.relatedTarget.closest(hoverSelectors) : null;
      
      if (!relatedSnap) {
        snapElement = null;
        cursorOutline.classList.remove('snapped');
        cursorDot.classList.remove('snapped');
      }
      if (!relatedHover && !relatedSnap) {
        isHovered = false;
        cursorOutline.classList.remove('hovered');
      }
    });
  }

  // Hide custom cursor when focusing inputs/textareas so the native caret is visible
  document.addEventListener('focusin', (e) => {
    if (e.target && (e.target.matches('input, textarea, [contenteditable]') || e.target.closest('.form-group'))) {
      if (cursorDot) cursorDot.classList.add('hidden');
      if (cursorOutline) cursorOutline.classList.add('hidden');
    }
  });

  document.addEventListener('focusout', (e) => {
    if (e.target && (e.target.matches('input, textarea, [contenteditable]') || e.target.closest('.form-group'))) {
      if (cursorDot) cursorDot.classList.remove('hidden');
      if (cursorOutline) cursorOutline.classList.remove('hidden');
    }
  });

  // ------------------------------------------------------------------------
  // 3. Project Card Spotlight Hover Effect (interactive radial gradient)
  // ------------------------------------------------------------------------
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // ------------------------------------------------------------------------
  // 4. Reveal on Scroll (Intersection Observer API)
  // ------------------------------------------------------------------------
  const observerOptions = {
    root: null, // use viewport
    threshold: 0.05, // trigger when 5% is visible
    rootMargin: '0px 0px -50px 0px' // offset bottom triggers slightly
  };

  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // stop observing once animated
      }
    });
  }, observerOptions);

  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach(el => {
    sectionObserver.observe(el);
  });

  // ------------------------------------------------------------------------
  // 5. Smooth Scroll Navigation Anchors
  // ------------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerOffset = 20;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ------------------------------------------------------------------------
  // 6. Back-to-Top Interaction
  // ------------------------------------------------------------------------
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ------------------------------------------------------------------------
  // 7. Contact Modal & Toast Notifications
  // ------------------------------------------------------------------------
  const contactModal = document.getElementById('contactModal');
  const contactForm = document.getElementById('contactForm');
  const closeModalBtn = document.getElementById('closeModalBtn');
  
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  function showToast(title, desc) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      </div>
      <div class="toast-content">
        <span class="toast-title">${title}</span>
        <span class="toast-desc">${desc}</span>
      </div>
    `;
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 50);
    
    // Remove after 4 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // Bind get in touch buttons and mailto links (except inside modal footer) to open the modal
  const contactTriggers = Array.from(document.querySelectorAll('a, button')).filter(el => {
    const text = el.textContent.trim().toLowerCase();
    const href = el.getAttribute('href') || '';
    const isModalFooterLink = el.closest('.modal-footer') !== null;
    
    return (text.includes('get in touch') || href.startsWith('mailto:')) && !isModalFooterLink;
  });

  contactTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (contactModal) {
        contactModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scroll
      }
    });
  });

  if (closeModalBtn && contactModal) {
    closeModalBtn.addEventListener('click', () => {
      contactModal.classList.remove('active');
      document.body.style.overflow = ''; // Restore scroll
    });
    
    // Close on overlay click
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) {
        contactModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Handle Form Submission
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('.form-submit-btn');
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      const formData = {
        name: document.getElementById('formName').value,
        email: document.getElementById('formEmail').value,
        message: document.getElementById('formMessage').value,
        _subject: "New Message from Portfolio Website",
        _captcha: "false"
      };

      try {
        // Send to FormSubmit email delivery service
        const response = await fetch('https://formsubmit.co/ajax/kushalprimal@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          showToast('Message Sent!', 'Thank you! Kusal will get in touch with you shortly.');
        } else {
          throw new Error('Server returned error');
        }
      } catch (error) {
        // Fallback for static environment
        console.warn('Backend server not available, saving to localStorage:', error);
        
        // Save to localStorage
        const storedMessages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
        storedMessages.push({
          id: Date.now(),
          ...formData,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('contact_messages', JSON.stringify(storedMessages));
        
        showToast('Message Received!', 'Your message has been saved locally. Thank you!');
      } finally {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        contactForm.reset();
        if (contactModal) {
          contactModal.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });
  }

  // ------------------------------------------------------------------------
  // 8. Theme Toggle Logic (Light / Dark Mode)
  // ------------------------------------------------------------------------
  const themeToggle = document.getElementById('themeToggle');
  const moonIcon = document.querySelector('.moon-icon');
  const sunIcon = document.querySelector('.sun-icon');

  function setTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      if (moonIcon) moonIcon.style.display = 'none';
      if (sunIcon) sunIcon.style.display = 'block';
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (moonIcon) moonIcon.style.display = 'block';
      if (sunIcon) sunIcon.style.display = 'none';
    }
    localStorage.setItem('theme', theme);
  }

  // Check saved theme, default to system setting or dark theme
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  setTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    });
  }

});

