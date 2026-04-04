// Physics Engine for AntiGravity Mode

class AntiGravityEngine {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.objects = [];
        this.animationFrameId = null;
        this.isRunning = false;
        
        // Handle resize properly
        this.updateBounds();
        window.addEventListener('resize', () => this.updateBounds());
    }

    updateBounds() {
        // Prevent layout 0 values if starting from hidden states
        this.bounds = { 
            width: this.container.clientWidth || 800, 
            height: this.container.clientHeight || 400 
        };
    }

    // Add a bouncing DOM element
    addObject(domElement) {
        this.updateBounds(); // Recalculate anytime we add, just in case DOM unhid!
        
        // Random starting position avoiding immediate boundary clip
        const objWidth = 200; // Match css
        const objHeight = 50;
        
        const x = Math.random() * (this.bounds.width - objWidth);
        const y = Math.random() * (this.bounds.height - objHeight);
        
        // Random velocity (speed between 1 and 3 px per frame)
        const dx = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 2 + 1);
        const dy = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 2 + 1);

        this.objects.push({
            el: domElement,
            x, y, dx, dy,
            width: objWidth, height: objHeight
        });

        // initial position
        domElement.style.transform = `translate(${x}px, ${y}px)`;
        this.container.appendChild(domElement);
    }

    clear() {
        this.stop();
        this.container.innerHTML = '';
        this.objects = [];
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.loop();
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    loop() {
        if (!this.isRunning) return;

        this.objects.forEach(obj => {
            // Move
            obj.x += obj.dx;
            obj.y += obj.dy;

            // Bounce X
            if (obj.x <= 0) {
                obj.x = 0;
                obj.dx *= -1;
            } else if (obj.x + obj.width >= this.bounds.width) {
                obj.x = this.bounds.width - obj.width;
                obj.dx *= -1;
            }

            // Bounce Y
            if (obj.y <= 0) {
                obj.y = 0;
                obj.dy *= -1;
            } else if (obj.y + obj.height >= this.bounds.height) {
                obj.y = this.bounds.height - obj.height;
                obj.dy *= -1;
            }

            // Apply translation natively via GPU
            obj.el.style.transform = `translate(${obj.x}px, ${obj.y}px)`;
        });

        this.animationFrameId = requestAnimationFrame(() => this.loop());
    }

    freeze() {
        this.stop();
        // Keep them structurally on screen, just stop the loop
    }
}

// Attach to window so app.js can use it
window.AntiGravityEngine = AntiGravityEngine;
