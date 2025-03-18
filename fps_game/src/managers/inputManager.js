import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

export class InputManager {
    constructor(game) {
        this.game = game;
        this.inputMap = {};
        this.isPointerLocked = false;
        this.leftJoystick = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.advancedTexture = null;
        this.mobileButtons = {};
    }

    async initialize() {
        // Set up keyboard/mouse input handling for desktop
        this.setupKeyboardInput();
        this.setupMouseInput();
        
        // Set up touch controls for mobile
        if (this.game.isMobile) {
            this.setupTouchControls();
        }
        
        // Register movement handling in the render loop
        this.setupMovementHandling();
        
        console.log('Input Manager initialized');
        return Promise.resolve();
    }

    setupKeyboardInput() {
        // Key down/up events
        this.game.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    this.inputMap[kbInfo.event.key] = true;
                    
                    // Handle weapon switching with number keys
                    if (kbInfo.event.key >= '1' && kbInfo.event.key <= '7') {
                        const weaponIndex = parseInt(kbInfo.event.key) - 1;
                        if (this.game.weaponSystem && weaponIndex < this.game.weaponSystem.weapons.length) {
                            this.game.weaponSystem.switchWeapon(weaponIndex);
                        }
                    }
                    
                    // Handle pause with Escape key
                    if (kbInfo.event.key === 'Escape') {
                        if (this.game.isPaused) {
                            this.game.resume();
                        } else {
                            this.game.pause();
                        }
                    }
                    break;
                    
                case BABYLON.KeyboardEventTypes.KEYUP:
                    this.inputMap[kbInfo.event.key] = false;
                    break;
            }
        });
    }

    setupMouseInput() {
        // Mouse down event
        this.game.scene.onPointerDown = (evt) => {
            // Lock pointer on click if not already locked
            if (!this.isPointerLocked) {
                this.lockPointer();
            }
            
            // Handle shooting with left click
            if (evt.button === 0 && !this.game.isPaused) {
                if (this.game.weaponSystem) {
                    this.game.weaponSystem.fireCurrentWeapon();
                }
            }
        };
        
        // Handle pointer lock changes
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.game.canvas;
        });
        
        document.addEventListener('pointerlockerror', () => {
            console.error('Pointer lock error');
        });
    }

    setupTouchControls() {
        // Create virtual joystick for movement
        this.leftJoystick = new BABYLON.VirtualJoystick(true);
        
        // Create touch areas for looking around
        this.game.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                this.touchStartX = touch.clientX;
                this.touchStartY = touch.clientY;
            }
        });
        
        this.game.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0 && !this.game.isPaused) {
                const touch = e.touches[0];
                const deltaX = touch.clientX - this.touchStartX;
                const deltaY = touch.clientY - this.touchStartY;
                
                if (this.game.playerController && this.game.playerController.camera) {
                    this.game.playerController.camera.rotation.y += deltaX / this.game.config.mobileAngularSensibility;
                    this.game.playerController.camera.rotation.x += deltaY / this.game.config.mobileAngularSensibility;
                }
                
                this.touchStartX = touch.clientX;
                this.touchStartY = touch.clientY;
            }
        });
        
        // Create UI for mobile controls
        this.createMobileUI();
    }

    createMobileUI() {
        this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("MobileControlsUI");
        
        // Fire button
        this.mobileButtons.fire = GUI.Button.CreateSimpleButton("fireButton", "FIRE");
        this.mobileButtons.fire.width = `${this.game.config.mobileControlsSize}px`;
        this.mobileButtons.fire.height = `${this.game.config.mobileControlsSize}px`;
        this.mobileButtons.fire.color = "white";
        this.mobileButtons.fire.cornerRadius = this.game.config.mobileControlsSize / 2;
        this.mobileButtons.fire.background = "red";
        this.mobileButtons.fire.alpha = this.game.config.mobileControlsOpacity;
        this.mobileButtons.fire.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.mobileButtons.fire.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.mobileButtons.fire.left = `-50px`;
        this.mobileButtons.fire.top = `-50px`;
        
        this.mobileButtons.fire.onPointerDownObservable.add(() => {
            if (this.game.weaponSystem && !this.game.isPaused) {
                this.game.weaponSystem.fireCurrentWeapon();
            }
        });
        
        this.advancedTexture.addControl(this.mobileButtons.fire);
        
        // Jump button
        this.mobileButtons.jump = GUI.Button.CreateSimpleButton("jumpButton", "JUMP");
        this.mobileButtons.jump.width = `${this.game.config.mobileControlsSize}px`;
        this.mobileButtons.jump.height = `${this.game.config.mobileControlsSize}px`;
        this.mobileButtons.jump.color = "white";
        this.mobileButtons.jump.cornerRadius = this.game.config.mobileControlsSize / 2;
        this.mobileButtons.jump.background = "blue";
        this.mobileButtons.jump.alpha = this.game.config.mobileControlsOpacity;
        this.mobileButtons.jump.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.mobileButtons.jump.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.mobileButtons.jump.left = `-170px`;
        this.mobileButtons.jump.top = `-50px`;
        
        this.mobileButtons.jump.onPointerDownObservable.add(() => {
            if (this.game.playerController && !this.game.isPaused) {
                this.game.playerController.jump();
            }
        });
        
        this.advancedTexture.addControl(this.mobileButtons.jump);
        
        // Weapon switch button
        this.mobileButtons.weapon = GUI.Button.CreateSimpleButton("weaponButton", "WEAPON");
        this.mobileButtons.weapon.width = `${this.game.config.mobileControlsSize}px`;
        this.mobileButtons.weapon.height = `${this.game.config.mobileControlsSize / 2}px`;
        this.mobileButtons.weapon.color = "white";
        this.mobileButtons.weapon.cornerRadius = 10;
        this.mobileButtons.weapon.background = "green";
        this.mobileButtons.weapon.alpha = this.game.config.mobileControlsOpacity;
        this.mobileButtons.weapon.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.mobileButtons.weapon.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.mobileButtons.weapon.left = `50px`;
        this.mobileButtons.weapon.top = `-50px`;
        
        this.mobileButtons.weapon.onPointerDownObservable.add(() => {
            if (this.game.weaponSystem && !this.game.isPaused) {
                const nextWeapon = (this.game.weaponSystem.currentWeaponIndex + 1) % this.game.weaponSystem.weapons.length;
                this.game.weaponSystem.switchWeapon(nextWeapon);
            }
        });
        
        this.advancedTexture.addControl(this.mobileButtons.weapon);
    }

    setupMovementHandling() {
        // Register before render to handle movement
        this.game.scene.registerBeforeRender(() => {
            if (this.game.isPaused || !this.game.playerController) return;
            
            // Handle keyboard movement
            this.handleKeyboardMovement();
            
            // Handle joystick movement on mobile
            if (this.game.isMobile && this.leftJoystick && this.leftJoystick.pressed) {
                this.handleJoystickMovement();
            }
        });
    }

    handleKeyboardMovement() {
        if (!this.game.playerController.camera) return;
        
        const speed = this.game.config.playerSpeed;
        
        // Handle WASD movement
        if (this.inputMap["w"] || this.inputMap["ArrowUp"]) {
            this.game.playerController.moveForward(speed);
        }
        if (this.inputMap["s"] || this.inputMap["ArrowDown"]) {
            this.game.playerController.moveBackward(speed);
        }
        if (this.inputMap["a"] || this.inputMap["ArrowLeft"]) {
            this.game.playerController.moveLeft(speed);
        }
        if (this.inputMap["d"] || this.inputMap["ArrowRight"]) {
            this.game.playerController.moveRight(speed);
        }
        
        // Handle jumping
        if (this.inputMap[" "] || this.inputMap["Space"]) {
            this.game.playerController.jump();
        }
    }

    handleJoystickMovement() {
        if (!this.game.playerController.camera) return;
        
        const deltaX = this.leftJoystick.deltaPosition.x * this.game.config.playerSpeed * 0.1;
        const deltaZ = this.leftJoystick.deltaPosition.y * this.game.config.playerSpeed * 0.1;
        
        this.game.playerController.moveRight(deltaX);
        this.game.playerController.moveBackward(deltaZ);
    }

    lockPointer() {
        if (this.game.canvas.requestPointerLock) {
            this.game.canvas.requestPointerLock();
        } else if (this.game.canvas.msRequestPointerLock) {
            this.game.canvas.msRequestPointerLock();
        } else if (this.game.canvas.mozRequestPointerLock) {
            this.game.canvas.mozRequestPointerLock();
        } else if (this.game.canvas.webkitRequestPointerLock) {
            this.game.canvas.webkitRequestPointerLock();
        }
    }

    unlockPointer() {
        if (document.exitPointerLock) {
            document.exitPointerLock();
        } else if (document.msExitPointerLock) {
            document.msExitPointerLock();
        } else if (document.mozExitPointerLock) {
            document.mozExitPointerLock();
        } else if (document.webkitExitPointerLock) {
            document.webkitExitPointerLock();
        }
    }
}

export default InputManager;
