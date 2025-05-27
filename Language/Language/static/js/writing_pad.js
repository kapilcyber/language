// WritingPad: A canvas-based writing pad for practicing letters, numbers, and characters

// Canvas object and configuration
let canvas, ctx;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let lineWidth = 2;
let lineColor = '#000000';
let canvasHistory = [];
let historyIndex = -1;
let maxHistorySize = 10;

// Document elements
const clearBtn = document.getElementById('clear-pad');
const undoBtn = document.getElementById('undo-pad');
const redoBtn = document.getElementById('redo-pad');
const colorPicker = document.getElementById('color-picker');
const widthSlider = document.getElementById('width-slider');
const widthValue = document.getElementById('width-value');
const saveBtn = document.getElementById('save-pad');
const verifyBtn = document.getElementById('verify-pad');
const resultArea = document.getElementById('verification-result');

// Initialize the drawing pad
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('writing-pad');
    if (!canvas) return; // Exit if canvas doesn't exist
    
    ctx = canvas.getContext('2d');
    
    // Set canvas dimensions (responsive)
    resizeCanvas();
    
    // Event listeners for drawing
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch support for mobile devices
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
    
    // Event listeners for controls
    if (clearBtn) clearBtn.addEventListener('click', clearCanvas);
    if (undoBtn) undoBtn.addEventListener('click', undo);
    if (redoBtn) redoBtn.addEventListener('click', redo);
    if (saveBtn) saveBtn.addEventListener('click', saveDrawing);
    if (verifyBtn) verifyBtn.addEventListener('click', verifyDrawing);
    
    // Color and width controls
    if (colorPicker) colorPicker.addEventListener('change', updateColor);
    if (widthSlider) {
        widthSlider.addEventListener('input', updateWidth);
        widthSlider.value = lineWidth; // Set initial value
        if (widthValue) widthValue.textContent = lineWidth;
    }
    
    // Window resize listener
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize with a blank state in history
    saveState();
    updateUndoRedoButtons();
});

// Canvas resizing function
function resizeCanvas() {
    if (!canvas) return;
    
    // Get the container width
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    
    // Set canvas size (with a max height)
    canvas.width = containerWidth;
    canvas.height = Math.min(containerWidth * 0.7, 400);
    
    // Redraw canvas content after resize
    redrawCanvas();
}

// Start drawing
function startDrawing(e) {
    isDrawing = true;
    const { x, y } = getCoordinates(e);
    lastX = x;
    lastY = y;
}

// Draw on the canvas
function draw(e) {
    if (!isDrawing) return;
    
    // Prevent scrolling on touch devices
    e.preventDefault();
    
    const { x, y } = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    lastX = x;
    lastY = y;
}

// Stop drawing
function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        saveState();
    }
}

// Handle touch start events
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    startDrawing(mouseEvent);
}

// Handle touch move events
function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    draw(mouseEvent);
}

// Get coordinates from mouse or touch event
function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
    
    // Reset verification result if any
    if (resultArea) {
        resultArea.textContent = '';
        resultArea.style.display = 'none';
    }
}

// Save the current state for undo/redo
function saveState() {
    // If we're not at the end of the history, remove future states
    if (historyIndex < canvasHistory.length - 1) {
        canvasHistory = canvasHistory.slice(0, historyIndex + 1);
    }
    
    // Add current state to history
    canvasHistory.push(canvas.toDataURL());
    
    // Limit history size
    if (canvasHistory.length > maxHistorySize) {
        canvasHistory.shift();
    } else {
        historyIndex++;
    }
    
    updateUndoRedoButtons();
}

// Undo the last action
function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        loadState(canvasHistory[historyIndex]);
    }
    updateUndoRedoButtons();
}

// Redo a previously undone action
function redo() {
    if (historyIndex < canvasHistory.length - 1) {
        historyIndex++;
        loadState(canvasHistory[historyIndex]);
    }
    updateUndoRedoButtons();
}

// Load a saved state
function loadState(dataURL) {
    const img = new Image();
    img.src = dataURL;
    img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
}

// Update the drawing color
function updateColor(e) {
    lineColor = e.target.value;
}

// Update the line width
function updateWidth(e) {
    lineWidth = parseInt(e.target.value);
    if (widthValue) widthValue.textContent = lineWidth;
}

// Enable/disable undo/redo buttons based on history
function updateUndoRedoButtons() {
    if (undoBtn) undoBtn.disabled = historyIndex <= 0;
    if (redoBtn) redoBtn.disabled = historyIndex >= canvasHistory.length - 1;
}

// Redraw the canvas (after resize)
function redrawCanvas() {
    if (canvasHistory.length > 0 && historyIndex >= 0) {
        loadState(canvasHistory[historyIndex]);
    }
}

// Save the drawing as an image
function saveDrawing() {
    // Create a temporary link
    const link = document.createElement('a');
    link.download = 'my-drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Verify the drawing (placeholder for character recognition)
function verifyDrawing() {
    if (!resultArea) return;
    
    // In a real application, this would send the drawing to a recognition service
    // For this demo, we'll show a placeholder response
    
    // Show loading state
    resultArea.textContent = 'Analyzing your drawing...';
    resultArea.style.display = 'block';
    
    // Simulate processing time
    setTimeout(() => {
        // Get the target character from the exercise if available
        const targetChar = document.getElementById('target-character');
        const targetText = targetChar ? targetChar.textContent : null;
        
        if (targetText) {
            resultArea.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i> Great job! Your drawing looks like "${targetText}".
                </div>
                <div class="mt-2">
                    Keep practicing to improve your handwriting!
                </div>
            `;
        } else {
            resultArea.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> Nice drawing! 
                </div>
                <div class="mt-2">
                    In the full version, we would analyze your writing and provide feedback.
                </div>
            `;
        }
    }, 1500);
}
