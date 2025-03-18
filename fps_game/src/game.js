// Game architecture with modular components
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import 'babylonjs-materials';
import * as GUI from 'babylonjs-gui';

// Import game modules
import { GameConfig } from './config/gameConfig';
import { InputManager } from './managers/inputManager';
import { WeaponSystem } from './weapons/weaponSystem';
import { PlayerController } from './player/playerController';
import { LevelManager } from './levels/levelManager';
import { UIManager } from './ui/uiManager';
import { PhysicsManager } from './physics/physicsManager';
import { AudioManager } from './audio/audioManager';
import { SecretManager } from './gameplay/secretManager';
import { EnemyManager } from './enemies/enemyManager';

// Main Game class
class Game {
    constructor() {
        // Core engine components
        this.canvas = null;
        this.engine = null;
        this.scene = null;
        
        // Game systems
        this.config = new GameConfig();
        this.inputManager = null;
        this.playerController = null;
        this.weaponSystem = null;
        this.levelManager = null;
        this.uiManager = null;
        this.physicsManager = null;
        this.audioManager = null;
        this.secretManager = null;
        this.enemyManager = null;
        
        // Game state
        this.isLoading = true;
        this.isPaused = false;
        this.isMobile = false;
        this.debugMode = true;
    }
    
    // Initialize the game
    async initialize() {
        // Check if running on mobile
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Get canvas and initialize the engine
        this.canvas = document.getElementById('renderCanvas');
        this.engine = new BABYLON.Engine(this.canvas, true, { 
            preserveDrawingBuffer: true, 
            stencil: true,
            adaptToDeviceRatio: true
        });
        
        // Create loading screen
        this.uiManager = new UIManager(this);
        this.uiManager.showLoadingScreen();
        
        // Create the main scene
        this.scene = new BABYLON.Scene(this.engine);
        
        // Initialize physics
        this.physicsManager = new PhysicsManager(this);
        await this.physicsManager.initialize();
        
        // Initialize managers
        this.inputManager = new InputManager(this);
        this.playerController = new PlayerController(this);
        this.weaponSystem = new WeaponSystem(this);
        this.levelManager = new LevelManager(this);
        this.audioManager = new AudioManager(this);
        this.secretManager = new SecretManager(this);
        this.enemyManager = new EnemyManager(this);
        
        // Initialize all systems
        await this.inputManager.initialize();
        await this.playerController.initialize();
        await this.weaponSystem.initialize();
        await this.levelManager.initialize();
        await this.audioManager.initialize();
        await this.secretManager.initialize();
        await this.enemyManager.initialize();
        
        // Load the first level
        await this.levelManager.loadLevel('level1');
        
        // Hide loading screen
        this.isLoading = false;
        this.uiManager.hideLoadingScreen();
        
        // Start the render loop
        this.startRenderLoop();
        
        // Handle browser/canvas resize events
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
        
        console.log('Game initialized successfully');
    }
    
    // Start the render loop
    startRenderLoop() {
        this.engine.runRenderLoop(() => {
            if (!this.isPaused) {
                this.scene.render();
                
                // Update FPS counter in debug mode
                if (this.debugMode) {
                    this.uiManager.updateFPSCounter(this.engine.getFps().toFixed(2));
                }
            }
        });
    }
    
    // Pause the game
    pause() {
        this.isPaused = true;
        this.uiManager.showPauseMenu();
    }
    
    // Resume the game
    resume() {
        this.isPaused = false;
        this.uiManager.hidePauseMenu();
    }
    
    // Clean up resources
    dispose() {
        this.scene.dispose();
        this.engine.dispose();
    }
}

// Initialize the game when the DOM is loaded
window.addEventListener('DOMContentLoaded', async () => {
    const game = new Game();
    await game.initialize();
    
    // Make game accessible globally for debugging
    window.game = game;
});

export default Game;
