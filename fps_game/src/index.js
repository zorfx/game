import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import 'babylonjs-materials';
import 'babylonjs-gui';
import './styles.css';

// Import game modules
import Game from './game';

// Wait for the DOM to be ready
window.addEventListener('DOMContentLoaded', function() {
    // Get the canvas element
    const canvas = document.getElementById('renderCanvas');
    
    // Get loading screen elements
    const loadingScreen = document.getElementById('loadingScreen');
    const progressFill = document.getElementById('progressFill');
    const loadingText = document.getElementById('loadingText');
    const startButton = document.getElementById('startButton');
    
    // Create the game instance
    const game = new Game(canvas);
    
    // Set up loading screen
    game.engine.loadingUIBackgroundColor = "black";
    
    // Register a render loop to repeatedly render the scene
    game.engine.runRenderLoop(function() {
        if (game.scene) {
            game.scene.render();
        }
    });
    
    // Watch for browser/canvas resize events
    window.addEventListener('resize', function() {
        game.engine.resize();
    });
    
    // Handle loading progress
    game.scene.onReadyObservable.add(() => {
        // Hide loading screen when scene is ready
        loadingScreen.style.display = 'none';
    });
    
    // Set up loading progress tracking
    let totalAssets = 0;
    let loadedAssets = 0;
    
    // Track loading progress
    game.scene.onBeforeRenderObservable.add(() => {
        // Update loading progress
        const currentProgress = game.scene.getWaitingItemsCount();
        if (currentProgress > totalAssets) {
            totalAssets = currentProgress;
        }
        
        if (totalAssets > 0) {
            loadedAssets = totalAssets - currentProgress;
            const progressPercent = Math.min(100, Math.floor((loadedAssets / totalAssets) * 100));
            progressFill.style.width = progressPercent + '%';
            loadingText.textContent = `Loading Game... ${progressPercent}%`;
            
            // Show start button when loading is complete
            if (progressPercent >= 100) {
                startButton.style.display = 'block';
                loadingText.textContent = 'Game Ready!';
            }
        }
    });
    
    // Start game when button is clicked
    startButton.addEventListener('click', () => {
        loadingScreen.style.display = 'none';
        game.start();
        
        // Lock pointer for FPS controls
        canvas.addEventListener('click', () => {
            canvas.requestPointerLock = canvas.requestPointerLock || 
                                        canvas.mozRequestPointerLock || 
                                        canvas.webkitRequestPointerLock;
            canvas.requestPointerLock();
        });
    });
    
    // Handle fullscreen for mobile
    document.addEventListener('touchstart', () => {
        if (!document.fullscreenElement) {
            canvas.requestFullscreen = canvas.requestFullscreen || 
                                      canvas.mozRequestFullScreen || 
                                      canvas.webkitRequestFullscreen || 
                                      canvas.msRequestFullscreen;
            if (canvas.requestFullscreen) {
                canvas.requestFullscreen();
            }
        }
    }, { once: true });
    
    // Initialize the game
    game.initialize().then(() => {
        console.log('Game initialized successfully');
    }).catch(error => {
        console.error('Error initializing game:', error);
        loadingText.textContent = 'Error loading game. Please refresh.';
    });
});
