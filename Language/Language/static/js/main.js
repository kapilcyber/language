// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const languageBtn = document.getElementById('language-btn');
const languageDropdown = document.getElementById('language-dropdown');

// Check for saved user preferences
document.addEventListener('DOMContentLoaded', function() {
    // Theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        updateThemeIcon(true);
    }

    // Initialize tooltips and popovers if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });

        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });
    }

    // Animation for page elements
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(function(element, index) {
        setTimeout(function() {
            element.style.opacity = 1;
        }, 100 * index);
    });

    const slideElements = document.querySelectorAll('.slide-in-up');
    slideElements.forEach(function(element, index) {
        setTimeout(function() {
            element.style.opacity = 1;
            element.style.transform = 'translateY(0)';
        }, 100 * index);
    });
});

// Theme Toggle Functionality
if (themeToggle) {
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');
        
        // Save preference to localStorage
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        
        // Update icon
        updateThemeIcon(isDarkMode);
    });
}

function updateThemeIcon(isDarkMode) {
    if (themeToggle) {
        themeToggle.innerHTML = isDarkMode 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    }
}

// Language Dropdown Toggle
if (languageBtn) {
    languageBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        languageDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (languageDropdown.classList.contains('show') && !languageBtn.contains(e.target)) {
            languageDropdown.classList.remove('show');
        }
    });
}

// Form Validation
const forms = document.querySelectorAll('.needs-validation');
if (forms.length > 0) {
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        }, false);
    });
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 70, // Adjust for fixed header
                behavior: 'smooth'
            });
        }
    });
});

// Responsive Navigation
const navbarToggler = document.querySelector('.navbar-toggler');
if (navbarToggler) {
    navbarToggler.addEventListener('click', function() {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        navbarCollapse.classList.toggle('show');
    });
}

// Accessibility Improvements
// Add focus styles for keyboard navigation
const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
focusableElements.forEach(element => {
    element.addEventListener('focus', function() {
        this.classList.add('keyboard-focus');
    });
    
    element.addEventListener('blur', function() {
        this.classList.remove('keyboard-focus');
    });
});
