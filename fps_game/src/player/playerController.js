import * as BABYLON from 'babylonjs';

export class PlayerController {
    constructor(game) {
        this.game = game;
        this.camera = null;
        this.isGrounded = true;
        this.health = 100;
        this.maxHealth = 100;
        this.armor = 0;
        this.maxArmor = 100;
        this.footstepSound = null;
        this.jumpSound = null;
        this.hurtSound = null;
        this.deathSound = null;
        this.lastFootstepTime = 0;
        this.footstepInterval = 500; // ms between footstep sounds
    }

    async initialize() {
        // Create and position a free camera
        this.camera = new BABYLON.FreeCamera("playerCamera", 
            new BABYLON.Vector3(0, this.game.config.playerHeight, 0), 
            this.game.scene);
        
        // Configure camera
        this.camera.attachControl(this.game.canvas, true);
        this.camera.applyGravity = true;
        this.camera.checkCollisions = true;
        this.camera.ellipsoid = new BABYLON.Vector3(0.5, this.game.config.playerHeight / 2, 0.5);
        this.camera.minZ = this.game.config.cameraMinZ;
        this.camera.angularSensibility = this.game.isMobile ? 
            this.game.config.mobileAngularSensibility : 
            this.game.config.cameraAngularSensibility;
        this.camera.inertia = this.game.config.cameraInertia;
        
        // Set up collision detection
        this.setupCollisionDetection();
        
        // Load sounds
        if (this.game.audioManager) {
            this.footstepSound = await this.game.audioManager.loadSound("footstep", "assets/sounds/footstep.mp3");
            this.jumpSound = await this.game.audioManager.loadSound("jump", "assets/sounds/jump.mp3");
            this.hurtSound = await this.game.audioManager.loadSound("hurt", "assets/sounds/hurt.mp3");
            this.deathSound = await this.game.audioManager.loadSound("death", "assets/sounds/death.mp3");
        }
        
        // Set initial health and armor
        this.health = this.game.config.playerHealth;
        this.maxHealth = this.game.config.playerMaxHealth;
        
        // Register ground check in the render loop
        this.game.scene.registerBeforeRender(() => {
            this.checkGrounded();
        });
        
        console.log('Player Controller initialized');
        return Promise.resolve();
    }

    setupCollisionDetection() {
        // Set up collision detection with scene objects
        this.game.scene.collisionsEnabled = true;
        this.camera.checkCollisions = true;
        
        // Set up collision with ground and walls
        this.game.scene.onBeforeRenderObservable.add(() => {
            // Check for collisions with pickable objects (items, secrets, etc.)
            const ray = new BABYLON.Ray(this.camera.position, new BABYLON.Vector3(0, -1, 0), 2);
            const hit = this.game.scene.pickWithRay(ray);
            
            if (hit.pickedMesh && hit.pickedMesh.isPickable) {
                // Handle item pickup or secret discovery
                if (hit.pickedMesh.metadata && hit.pickedMesh.metadata.type) {
                    switch (hit.pickedMesh.metadata.type) {
                        case 'health':
                            this.pickupHealth(hit.pickedMesh.metadata.amount || 25);
                            hit.pickedMesh.dispose();
                            break;
                        case 'armor':
                            this.pickupArmor(hit.pickedMesh.metadata.amount || 25);
                            hit.pickedMesh.dispose();
                            break;
                        case 'ammo':
                            if (this.game.weaponSystem) {
                                this.game.weaponSystem.addAmmo(
                                    hit.pickedMesh.metadata.weaponType || 'all',
                                    hit.pickedMesh.metadata.amount || 20
                                );
                            }
                            hit.pickedMesh.dispose();
                            break;
                        case 'weapon':
                            if (this.game.weaponSystem) {
                                this.game.weaponSystem.acquireWeapon(hit.pickedMesh.metadata.weaponType);
                            }
                            hit.pickedMesh.dispose();
                            break;
                        case 'secret':
                            if (this.game.secretManager) {
                                this.game.secretManager.discoverSecret(hit.pickedMesh.metadata.id);
                            }
                            hit.pickedMesh.dispose();
                            break;
                    }
                }
            }
        });
    }

    checkGrounded() {
        // Cast a ray downward to check if player is on the ground
        const ray = new BABYLON.Ray(this.camera.position, new BABYLON.Vector3(0, -1, 0), 1.1);
        const hit = this.game.scene.pickWithRay(ray);
        
        const wasGrounded = this.isGrounded;
        this.isGrounded = hit.hit && hit.pickedMesh && !hit.pickedMesh.isPickable;
        
        // Play footstep sound when moving on ground
        if (this.isGrounded && this.isMoving() && this.game.audioManager) {
            const now = Date.now();
            if (now - this.lastFootstepTime > this.footstepInterval) {
                this.lastFootstepTime = now;
                this.game.audioManager.playSound(this.footstepSound);
            }
        }
    }

    isMoving() {
        const inputManager = this.game.inputManager;
        if (!inputManager) return false;
        
        return inputManager.inputMap["w"] || 
               inputManager.inputMap["a"] || 
               inputManager.inputMap["s"] || 
               inputManager.inputMap["d"] ||
               inputManager.inputMap["ArrowUp"] || 
               inputManager.inputMap["ArrowDown"] || 
               inputManager.inputMap["ArrowLeft"] || 
               inputManager.inputMap["ArrowRight"] ||
               (this.game.isMobile && inputManager.leftJoystick && inputManager.leftJoystick.pressed);
    }

    moveForward(distance) {
        if (!this.camera) return;
        this.camera.position.addInPlace(this.camera.getDirection(BABYLON.Vector3.Forward()).scale(distance));
    }

    moveBackward(distance) {
        if (!this.camera) return;
        this.camera.position.addInPlace(this.camera.getDirection(BABYLON.Vector3.Forward()).scale(-distance));
    }

    moveRight(distance) {
        if (!this.camera) return;
        this.camera.position.addInPlace(this.camera.getDirection(BABYLON.Vector3.Right()).scale(distance));
    }

    moveLeft(distance) {
        if (!this.camera) return;
        this.camera.position.addInPlace(this.camera.getDirection(BABYLON.Vector3.Right()).scale(-distance));
    }

    jump() {
        if (!this.camera || !this.isGrounded) return;
        
        this.camera.cameraDirection.y = this.game.config.playerJumpForce;
        this.isGrounded = false;
        
        // Play jump sound
        if (this.game.audioManager && this.jumpSound) {
            this.game.audioManager.playSound(this.jumpSound);
        }
    }

    takeDamage(amount) {
        // Reduce damage by armor if available
        let remainingDamage = amount;
        if (this.armor > 0) {
            const armorAbsorption = Math.min(this.armor, amount * 0.5); // Armor absorbs 50% of damage
            this.armor -= armorAbsorption;
            remainingDamage -= armorAbsorption;
        }
        
        // Apply remaining damage to health
        this.health = Math.max(0, this.health - remainingDamage);
        
        // Play hurt sound
        if (this.game.audioManager && this.hurtSound) {
            this.game.audioManager.playSound(this.hurtSound);
        }
        
        // Update UI
        if (this.game.uiManager) {
            this.game.uiManager.updateHealthDisplay(this.health, this.maxHealth);
            this.game.uiManager.updateArmorDisplay(this.armor, this.maxArmor);
        }
        
        // Check for death
        if (this.health <= 0) {
            this.die();
        }
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        
        // Update UI
        if (this.game.uiManager) {
            this.game.uiManager.updateHealthDisplay(this.health, this.maxHealth);
        }
    }

    pickupHealth(amount) {
        this.heal(amount);
        
        // Play pickup sound
        if (this.game.audioManager) {
            this.game.audioManager.playSound("pickup");
        }
    }

    pickupArmor(amount) {
        this.armor = Math.min(this.maxArmor, this.armor + amount);
        
        // Update UI
        if (this.game.uiManager) {
            this.game.uiManager.updateArmorDisplay(this.armor, this.maxArmor);
        }
        
        // Play pickup sound
        if (this.game.audioManager) {
            this.game.audioManager.playSound("pickup");
        }
    }

    die() {
        // Play death sound
        if (this.game.audioManager && this.deathSound) {
            this.game.audioManager.playSound(this.deathSound);
        }
        
        // Show death screen
        if (this.game.uiManager) {
            this.game.uiManager.showDeathScreen();
        }
        
        // Pause the game
        this.game.isPaused = true;
    }

    respawn() {
        // Reset health and armor
        this.health = this.maxHealth;
        this.armor = 0;
        
        // Update UI
        if (this.game.uiManager) {
            this.game.uiManager.updateHealthDisplay(this.health, this.maxHealth);
            this.game.uiManager.updateArmorDisplay(this.armor, this.maxArmor);
            this.game.uiManager.hideDeathScreen();
        }
        
        // Reset position
        if (this.game.levelManager && this.game.levelManager.currentLevel) {
            const spawnPoint = this.game.levelManager.currentLevel.spawnPoint;
            if (spawnPoint) {
                this.camera.position = spawnPoint.clone();
            } else {
                this.camera.position = new BABYLON.Vector3(0, this.game.config.playerHeight, 0);
            }
        }
        
        // Resume the game
        this.game.isPaused = false;
    }
}

export default PlayerController;
