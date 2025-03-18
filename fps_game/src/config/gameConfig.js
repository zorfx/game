// Game configuration settings
export class GameConfig {
    constructor() {
        // Physics settings
        this.gravity = new BABYLON.Vector3(0, -9.81, 0);
        
        // Player settings
        this.playerHeight = 1.8;
        this.playerSpeed = 0.2;
        this.playerJumpForce = 0.3;
        this.playerHealth = 100;
        this.playerMaxHealth = 100;
        
        // Camera settings
        this.cameraAngularSensibility = 2000;
        this.mobileAngularSensibility = 250;
        this.cameraInertia = 0.5;
        this.cameraMinZ = 0.1;
        
        // Weapon settings
        this.weaponSwitchTime = 500;
        
        // Enemy settings
        this.enemySpawnRate = 5000;
        this.enemyMaxCount = 20;
        
        // Secret settings
        this.secretMinDistance = 10;
        
        // Debug settings
        this.debugMode = true;
        
        // Mobile settings
        this.mobileControlsSize = 100;
        this.mobileControlsOpacity = 0.6;
    }
    
    // Load configuration from storage if available
    loadFromStorage() {
        const savedConfig = localStorage.getItem('gameConfig');
        if (savedConfig) {
            const parsedConfig = JSON.parse(savedConfig);
            Object.assign(this, parsedConfig);
        }
    }
    
    // Save configuration to storage
    saveToStorage() {
        localStorage.setItem('gameConfig', JSON.stringify(this));
    }
    
    // Reset to default settings
    resetToDefaults() {
        this.constructor();
        this.saveToStorage();
    }
}

export default GameConfig;
