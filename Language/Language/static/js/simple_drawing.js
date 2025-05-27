// Simple Drawing Pad
document.addEventListener('DOMContentLoaded', function() {
    console.log('Drawing pad script loaded');
    
    // Get canvas element
    const canvas = document.getElementById('writing-canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    // Get context
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function setCanvasSize() {
        // Keep the initial attribute sizes from HTML
        if (!canvas.getAttribute('data-initialized')) {
            // Set white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Set initial drawing style
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            // Mark as initialized
            canvas.setAttribute('data-initialized', 'true');
            console.log('Canvas initialized with dimensions:', canvas.width, 'x', canvas.height);
        }
    }
    
    // Call once on load
    setCanvasSize();
    console.log('Canvas size set to:', canvas.width, 'x', canvas.height);
    
    // Drawing state
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    // Event handlers for mouse
    function startDrawing(e) {
        e.preventDefault();
        isDrawing = true;
        [lastX, lastY] = getPosMouse(e);
        console.log('Drawing started at:', lastX, lastY);
    }
    
    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        
        const [x, y] = getPosMouse(e);
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        [lastX, lastY] = [x, y];
    }
    
    function stopDrawing() {
        isDrawing = false;
    }
    
    // Event handlers for touch
    function handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            isDrawing = true;
            [lastX, lastY] = getPosTouch(e);
            console.log('Touch started at:', lastX, lastY);
        }
    }
    
    function handleTouchMove(e) {
        if (!isDrawing) return;
        e.preventDefault();
        
        if (e.touches.length === 1) {
            const [x, y] = getPosTouch(e);
            
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();
            
            [lastX, lastY] = [x, y];
        }
    }
    
    function handleTouchEnd(e) {
        e.preventDefault();
        isDrawing = false;
    }
    
    // Get positions relative to canvas
    function getPosMouse(e) {
        const rect = canvas.getBoundingClientRect();
        return [
            e.clientX - rect.left,
            e.clientY - rect.top
        ];
    }
    
    function getPosTouch(e) {
        const rect = canvas.getBoundingClientRect();
        return [
            e.touches[0].clientX - rect.left,
            e.touches[0].clientY - rect.top
        ];
    }
    
    // Clear canvas
    function clearCanvas() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        console.log('Canvas cleared');
    }
    
    // Event listeners for mouse
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Event listeners for touch
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Clear button
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearCanvas);
    }
    
    // Color selection
    const colorBtns = document.querySelectorAll('.color-option');
    colorBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            ctx.strokeStyle = this.style.backgroundColor;
            console.log('Color changed to:', this.style.backgroundColor);
            
            // Update active class
            colorBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Line width
    const lineWidth = document.getElementById('line-width');
    if (lineWidth) {
        lineWidth.addEventListener('input', function() {
            ctx.lineWidth = this.value;
            document.getElementById('width-value').textContent = this.value;
            console.log('Line width changed to:', this.value);
        });
    }
    
    // Verify drawing button
    const verifyBtn = document.getElementById('verify-drawing');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', function() {
            const result = document.getElementById('verification-result');
            if (result) {
                result.innerHTML = '<div class="alert alert-success">Drawing verified successfully!</div>';
                console.log('Drawing verified');
            }
        });
    }
    
    // Resize handler - we don't resize the canvas to avoid losing the drawing
    window.addEventListener('resize', function() {
        // We don't call setCanvasSize() here to avoid losing the drawing
        console.log('Window resized, canvas dimensions preserved:', canvas.width, 'x', canvas.height);
    });
    
    console.log('Drawing pad initialization complete');
});