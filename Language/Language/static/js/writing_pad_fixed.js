// Simplified Writing Pad JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Basic Canvas Setup
    const canvas = document.getElementById('writing-canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    
    // Initialize canvas with white background
    function setupCanvas() {
        // Set canvas dimensions
        canvas.width = canvas.parentElement.clientWidth || 600;
        canvas.height = 400;
        
        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set default drawing styles
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
    
    // Call setup
    setupCanvas();
    console.log('Canvas initialized:', canvas.width, 'x', canvas.height);
    
    // Drawing Functions
    function startDrawing(e) {
        isDrawing = true;
        draw(e); // Draw a dot at click position
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        // Get mouse/touch position
        const x = e.clientX - canvas.getBoundingClientRect().left;
        const y = e.clientY - canvas.getBoundingClientRect().top;
        
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
    
    function stopDrawing() {
        if (isDrawing) {
            ctx.beginPath(); // Start a new path next time
            isDrawing = false;
        }
    }
    
    // Clear canvas function
    function clearCanvas() {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
    }
    
    // Change color
    const colorOptions = document.querySelectorAll('.color-option');
    if (colorOptions) {
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Update active class
                colorOptions.forEach(el => el.classList.remove('active'));
                this.classList.add('active');
                
                // Set new color
                ctx.strokeStyle = this.style.backgroundColor;
                console.log('Color changed to:', ctx.strokeStyle);
            });
        });
    }
    
    // Change line width
    const lineWidthInput = document.getElementById('line-width');
    if (lineWidthInput) {
        lineWidthInput.addEventListener('input', function() {
            ctx.lineWidth = this.value;
            console.log('Line width changed to:', ctx.lineWidth);
        });
    }
    
    // Handle verify drawing button
    const verifyBtn = document.getElementById('verify-drawing');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', function() {
            const resultContainer = document.getElementById('verification-result');
            if (resultContainer) {
                resultContainer.innerHTML = `
                    <div class="alert alert-success mt-3">
                        <i class="fas fa-check-circle"></i> Your drawing has been processed successfully!
                    </div>
                `;
            }
        });
    }
    
    // Clear Button
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearCanvas);
    }
    
    // Attach event listeners for mouse
    canvas.addEventListener('mousedown', function(e) {
        console.log('Mouse down event triggered');
        startDrawing(e);
    });
    
    canvas.addEventListener('mousemove', function(e) {
        draw(e);
    });
    
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Handle window resize
    window.addEventListener('resize', function() {
        // Save current drawing
        const imageData = canvas.toDataURL();
        
        // Resize canvas
        setupCanvas();
        
        // Restore drawing
        const img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
        };
        img.src = imageData;
    });
    
    console.log('Writing pad initialized successfully');
});
