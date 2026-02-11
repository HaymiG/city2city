// script.js
// -------------------------------------------
// Meridian Travel Co. - Primary JavaScript
// Includes: Dark Mode, Nav Toggle, Slider, Forms
// -------------------------------------------

// Global DOM Selectors
const html = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');

// --- 1. Dark Mode Logic ---

/**
 * Sets the theme attribute on the HTML element and persists the choice in localStorage.
 * @param {string} theme - 'light' or 'dark'
 */
function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update the icon and ARIA label
    const icon = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    themeToggle.querySelector('i').className = icon;
    themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
}

/**
 * Initializes the theme based on localStorage or OS preference.
 */
function initTheme() {
    const storedTheme = localStorage.getItem('theme');
    // Check localStorage first, then OS preference
    if (storedTheme) {
        setTheme(storedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
}

// Toggle handler
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });
    // Run theme initialization on load
    initTheme();
}


// --- 2. Mobile Nav Toggle ---
if (navToggle) {
    navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        
        // Toggle ARIA attributes and data-visible state
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.setAttribute('data-visible', !isExpanded);
        
        // Change icon from hamburger to X
        navToggle.querySelector('i').className = isExpanded ? 'fas fa-bars' : 'fas fa-times';
    });
}


// --- 3. Testimonials Slider Logic (Home Page Only) ---
const slider = document.getElementById('testimonial-slider');
if (slider) {
    const slides = Array.from(slider.querySelectorAll('.testimonial-slide'));
    const prevButton = document.querySelector('.slider-control.prev');
    const nextButton = document.querySelector('.slider-control.next');
    const dotsContainer = document.querySelector('.slider-dots');
    const dots = Array.from(dotsContainer.querySelectorAll('.dot'));
    let currentIndex = 0;
    let autoSlideInterval;
    const intervalTime = 4000;

    /**
     * Updates the slider display to the new index, normalizing the index.
     * @param {number} newIndex
     */
    function updateSlider(newIndex) {
        if (newIndex >= slides.length) { newIndex = 0; } 
        else if (newIndex < 0) { newIndex = slides.length - 1; }
        
        // Hide all slides and dots (important for accessibility/focus)
        slides.forEach(slide => {
            slide.classList.remove('active');
            slide.setAttribute('tabindex', '-1');
        });
        dots.forEach(dot => dot.classList.remove('active'));

        // Show current slide and dot
        slides[newIndex].classList.add('active');
        slides[newIndex].setAttribute('tabindex', '0');
        dots[newIndex].classList.add('active');

        currentIndex = newIndex;
    }
    
    function nextSlide() { updateSlider(currentIndex + 1); }

    function startAutoSlide() {
        if (!autoSlideInterval) {
            autoSlideInterval = setInterval(nextSlide, intervalTime);
        }
    }

    function pauseAutoSlide() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }

    // Attach listeners
    prevButton.addEventListener('click', () => { pauseAutoSlide(); updateSlider(currentIndex - 1); startAutoSlide(); });
    nextButton.addEventListener('click', () => { pauseAutoSlide(); nextSlide(); startAutoSlide(); });
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => { pauseAutoSlide(); updateSlider(index); startAutoSlide(); });
    });

    // Pause on hover/focus (for the whole slider container)
    const sliderContainer = slider.closest('.testimonial-slider-container');
    sliderContainer.addEventListener('mouseenter', pauseAutoSlide);
    sliderContainer.addEventListener('mouseleave', startAutoSlide);
    sliderContainer.addEventListener('focusin', pauseAutoSlide);
    sliderContainer.addEventListener('focusout', startAutoSlide);

    // Initial start
    updateSlider(currentIndex);
    startAutoSlide();
}


// --- 4. Form Validation Logic (Newsletter & Contact) ---

/**
 * Validates a single input field.
 * @param {HTMLInputElement|HTMLTextAreaElement} input - The form control element.
 * @returns {boolean} - True if valid, false otherwise.
 */
function validateField(input) {
    const formGroup = input.closest('.form-group');
    const errorMessage = formGroup ? formGroup.querySelector('.error-message') : null;
    let valid = true;
    let message = '';
    
    input.classList.remove('invalid');
    if (errorMessage) errorMessage.textContent = '';

    const value = input.value.trim();
    const fieldName = input.name.charAt(0).toUpperCase() + input.name.slice(1);
    
    if (input.hasAttribute('required') && value === '') {
        valid = false;
        message = `${fieldName} is required.`;
    } else if (input.type === 'email' && value !== '') {
        const emailPattern = new RegExp(input.pattern || "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$", "i");
        if (!emailPattern.test(value)) {
            valid = false;
            message = `Please enter a valid email address.`;
        }
    }
    
    if (!valid) {
        input.classList.add('invalid');
        if (errorMessage) errorMessage.textContent = message;
    }
    
    return valid;
}

// Contact Form Submission and Demo Success
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    const inputs = contactForm.querySelectorAll('input, textarea');
    const successMessage = document.getElementById('form-success-message');
    
    // Real-time validation on blur
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
    });
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let formIsValid = true;
        // Validate all fields on submit
        inputs.forEach(input => {
            if (!validateField(input)) {
                formIsValid = false;
            }
        });
        
        if (formIsValid) {
            // Success: Display the demo message and reset the form
            contactForm.reset();
            // Clear any error messages that might be visible
            contactForm.querySelectorAll('.error-message').forEach(err => err.textContent = '');
            
            successMessage.style.display = 'block';
            successMessage.focus(); // Accessibility: announce success
            
            // Hide message after a few seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 7000);
        } else {
            // Focus on the first invalid field
            const firstInvalid = contactForm.querySelector('.invalid');
            if (firstInvalid) firstInvalid.focus();
            successMessage.style.display = 'none';
        }
    });
}

// Newsletter Form Submission and Toast Message
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
    const emailInput = document.getElementById('newsletter-email');
    const messageContainer = document.getElementById('newsletter-message');
    
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Use the general validation function
        if (validateField(emailInput)) {
            // Success: Show confirmation message
            messageContainer.textContent = `Thank you for subscribing, ${emailInput.value}!`;
            messageContainer.style.display = 'block';
            
            // Clear input and hide message after a delay
            emailInput.value = '';
            setTimeout(() => {
                messageContainer.style.display = 'none';
                messageContainer.textContent = '';
            }, 5000);
        }
    });
}