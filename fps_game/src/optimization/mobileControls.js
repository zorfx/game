import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

export class MobileControls {
    constructor(game) {
        this.game = game;
        this.isMobileDevice = false;
        this.touchInterface = null;
        this.virtualJoystick = null;
        this.fireButton = null;
        this.jumpButton = null;
        this.weaponSwitchButtons = [];
        this.currentTouches = {};
        this.lookSensitivity = 0.05;
        this.moveSensitivity = 0.01;
        this.doubleTapTime = 300; // ms
        this.lastTapTime = 0;
        this.controlsEnabled = true;
        this.controlsVisible = true;
        this.controlsOpacity = 0.6;
        this.controlsScale = 1.0;
    }

    async initialize() {
        // Detect if running on mobile device
        this.detectMobileDevice();
        
        // Create mobile controls if on mobile
        if (this.isMobileDevice) {
            this.createTouchInterface();
        }
        
        console.log('Mobile Controls initialized');
        return Promise.resolve();
    }

    detectMobileDevice() {
        // Check if mobile device based on user agent
        this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Also check for touch support
        if (!this.isMobileDevice && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
            this.isMobileDevice = true;
        }
        
        console.log(`Mobile device detected: ${this.isMobileDevice}`);
    }

    createTouchInterface() {
        // Create fullscreen UI for touch controls
        this.touchInterface = GUI.AdvancedDynamicTexture.CreateFullscreenUI("touchUI", true, this.game.scene);
        
        // Create virtual joystick for movement
        this.createVirtualJoystick();
        
        // Create fire button
        this.createFireButton();
        
        // Create jump button
        this.createJumpButton();
        
        // Create weapon switch buttons
        this.createWeaponSwitchButtons();
        
        // Create look controls (right side of screen)
        this.setupLookControls();
        
        // Create additional UI elements
        this.createAdditionalControls();
        
        // Set initial visibility and opacity
        this.setControlsVisibility(true);
        this.setControlsOpacity(this.controlsOpacity);
    }

    createVirtualJoystick() {
        // Create container for joystick
        const joystickContainer = new GUI.Rectangle("joystickContainer");
        joystickContainer.width = "200px";
        joystickContainer.height = "200px";
        joystickContainer.cornerRadius = 100;
        joystickContainer.color = "white";
        joystickContainer.thickness = 2;
        joystickContainer.background = "black";
        joystickContainer.alpha = 0.5;
        joystickContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        joystickContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        joystickContainer.left = "50px";
        joystickContainer.top = "-50px";
        
        // Create joystick thumb
        this.virtualJoystick = new GUI.Ellipse("virtualJoystick");
        this.virtualJoystick.width = "80px";
        this.virtualJoystick.height = "80px";
        this.virtualJoystick.color = "white";
        this.virtualJoystick.thickness = 2;
        this.virtualJoystick.background = "white";
        this.virtualJoystick.alpha = 0.8;
        
        // Add joystick to container
        joystickContainer.addControl(this.virtualJoystick);
        this.touchInterface.addControl(joystickContainer);
        
        // Store initial position
        this.joystickContainer = joystickContainer;
        this.joystickDefaultX = 0;
        this.joystickDefaultY = 0;
        this.joystickPointerID = null;
        
        // Add event listeners for joystick
        joystickContainer.onPointerDownObservable.add((eventData) => {
            if (this.joystickPointerID === null && this.controlsEnabled) {
                this.joystickPointerID = eventData.pointerId;
                this.updateJoystickPosition(eventData.x, eventData.y);
            }
        });
        
        this.game.scene.onPointerMoveObservable.add((eventData) => {
            if (this.joystickPointerID === eventData.pointerId && this.controlsEnabled) {
                this.updateJoystickPosition(eventData.x, eventData.y);
            }
        });
        
        this.game.scene.onPointerUpObservable.add((eventData) => {
            if (this.joystickPointerID === eventData.pointerId) {
                this.joystickPointerID = null;
                this.resetJoystick();
            }
        });
    }

    updateJoystickPosition(x, y) {
        // Convert screen coordinates to local joystick container coordinates
        const containerRect = this.joystickContainer._currentMeasure;
        const containerLeft = containerRect.left;
        const containerTop = containerRect.top;
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        // Calculate joystick position relative to center of container
        let relativeX = (x - (containerLeft + containerWidth / 2));
        let relativeY = (y - (containerTop + containerHeight / 2));
        
        // Limit joystick movement to container radius
        const radius = containerWidth / 2 - 40; // Adjust for joystick thumb size
        const distance = Math.sqrt(relativeX * relativeX + relativeY * relativeY);
        
        if (distance > radius) {
            const ratio = radius / distance;
            relativeX *= ratio;
            relativeY *= ratio;
        }
        
        // Update joystick position
        this.virtualJoystick.left = relativeX + "px";
        this.virtualJoystick.top = relativeY + "px";
        
        // Calculate movement input values (-1 to 1)
        const inputX = relativeX / radius;
        const inputY = relativeY / radius;
        
        // Apply movement to player controller
        if (this.game.playerController) {
            this.game.playerController.setMobileMovementInput(inputX, -inputY);
        }
    }

    resetJoystick() {
        // Reset joystick to center position
        this.virtualJoystick.left = this.joystickDefaultX + "px";
        this.virtualJoystick.top = this.joystickDefaultY + "px";
        
        // Reset movement input
        if (this.game.playerController) {
            this.game.playerController.setMobileMovementInput(0, 0);
        }
    }

    createFireButton() {
        // Create fire button
        this.fireButton = new GUI.Ellipse("fireButton");
        this.fireButton.width = "120px";
        this.fireButton.height = "120px";
        this.fireButton.cornerRadius = 60;
        this.fireButton.color = "white";
        this.fireButton.thickness = 2;
        this.fireButton.background = "red";
        this.fireButton.alpha = 0.6;
        this.fireButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.fireButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.fireButton.left = "-50px";
        this.fireButton.top = "-50px";
        
        // Add text to button
        const fireText = new GUI.TextBlock("fireText");
        fireText.text = "FIRE";
        fireText.color = "white";
        fireText.fontSize = 20;
        fireText.fontFamily = "Arial";
        this.fireButton.addControl(fireText);
        
        // Add button to interface
        this.touchInterface.addControl(this.fireButton);
        
        // Add event listeners for fire button
        this.fireButton.onPointerDownObservable.add(() => {
            if (this.controlsEnabled) {
                if (this.game.weaponSystem) {
                    this.game.weaponSystem.startFiring();
                }
            }
        });
        
        this.fireButton.onPointerUpObservable.add(() => {
            if (this.game.weaponSystem) {
                this.game.weaponSystem.stopFiring();
            }
        });
    }

    createJumpButton() {
        // Create jump button
        this.jumpButton = new GUI.Ellipse("jumpButton");
        this.jumpButton.width = "100px";
        this.jumpButton.height = "100px";
        this.jumpButton.cornerRadius = 50;
        this.jumpButton.color = "white";
        this.jumpButton.thickness = 2;
        this.jumpButton.background = "blue";
        this.jumpButton.alpha = 0.6;
        this.jumpButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.jumpButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.jumpButton.left = "-180px";
        this.jumpButton.top = "-80px";
        
        // Add text to button
        const jumpText = new GUI.TextBlock("jumpText");
        jumpText.text = "JUMP";
        jumpText.color = "white";
        jumpText.fontSize = 18;
        jumpText.fontFamily = "Arial";
        this.jumpButton.addControl(jumpText);
        
        // Add button to interface
        this.touchInterface.addControl(this.jumpButton);
        
        // Add event listeners for jump button
        this.jumpButton.onPointerDownObservable.add(() => {
            if (this.controlsEnabled && this.game.playerController) {
                this.game.playerController.jump();
            }
        });
    }

    createWeaponSwitchButtons() {
        // Create weapon switch buttons
        const weaponCount = 7; // Based on our 7 weapons
        const buttonSize = 60;
        const spacing = 10;
        const totalWidth = weaponCount * (buttonSize + spacing) - spacing;
        
        // Create container for weapon buttons
        const weaponContainer = new GUI.Rectangle("weaponContainer");
        weaponContainer.width = totalWidth + "px";
        weaponContainer.height = buttonSize + "px";
        weaponContainer.thickness = 0;
        weaponContainer.background = "transparent";
        weaponContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        weaponContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        weaponContainer.top = "-10px";
        
        this.touchInterface.addControl(weaponContainer);
        
        // Create buttons for each weapon
        const weaponNames = ["1", "2", "3", "4", "5", "6", "7"];
        
        for (let i = 0; i < weaponCount; i++) {
            const weaponButton = new GUI.Ellipse(`weaponButton${i}`);
            weaponButton.width = buttonSize + "px";
            weaponButton.height = buttonSize + "px";
            weaponButton.cornerRadius = buttonSize / 2;
            weaponButton.color = "white";
            weaponButton.thickness = 2;
            weaponButton.background = "gray";
            weaponButton.alpha = 0.6;
            weaponButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            weaponButton.left = (i * (buttonSize + spacing)) + "px";
            
            // Add text to button
            const weaponText = new GUI.TextBlock(`weaponText${i}`);
            weaponText.text = weaponNames[i];
            weaponText.color = "white";
            weaponText.fontSize = 24;
            weaponText.fontFamily = "Arial";
            weaponButton.addControl(weaponText);
            
            // Add button to container
            weaponContainer.addControl(weaponButton);
            this.weaponSwitchButtons.push(weaponButton);
            
            // Add event listeners for weapon button
            weaponButton.onPointerDownObservable.add(() => {
                if (this.controlsEnabled && this.game.weaponSystem) {
                    this.game.weaponSystem.switchToWeapon(i);
                    
                    // Highlight selected weapon
                    this.highlightSelectedWeapon(i);
                }
            });
        }
        
        // Highlight initial weapon
        this.highlightSelectedWeapon(0);
    }

    highlightSelectedWeapon(index) {
        // Update appearance of weapon buttons to highlight selected weapon
        this.weaponSwitchButtons.forEach((button, i) => {
            if (i === index) {
                button.background = "orange";
                button.alpha = 0.8;
            } else {
                button.background = "gray";
                button.alpha = 0.6;
            }
        });
    }

    setupLookControls() {
        // Set up touch area for looking around (right side of screen)
        const lookArea = new GUI.Rectangle("lookArea");
        lookArea.width = "50%";
        lookArea.height = "100%";
        lookArea.thickness = 0;
        lookArea.background = "transparent";
        lookArea.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        lookArea.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        lookArea.isPointerBlocker = false; // Allow events to pass through
        
        this.touchInterface.addControl(lookArea);
        
        // Variables to track look touch
        this.lookPointerID = null;
        this.lastLookPosition = { x: 0, y: 0 };
        
        // Add event listeners for look controls
        lookArea.onPointerDownObservable.add((eventData) => {
            if (this.lookPointerID === null && this.controlsEnabled) {
                this.lookPointerID = eventData.pointerId;
                this.lastLookPosition.x = eventData.x;
                this.lastLookPosition.y = eventData.y;
                
                // Check for double tap to toggle aim mode
                const currentTime = Date.now();
                if (currentTime - this.lastTapTime < this.doubleTapTime) {
                    if (this.game.weaponSystem) {
                        this.game.weaponSystem.toggleAimMode();
                    }
                }
                this.lastTapTime = currentTime;
            }
        });
        
        this.game.scene.onPointerMoveObservable.add((eventData) => {
            if (this.lookPointerID === eventData.pointerId && this.controlsEnabled) {
                // Calculate delta movement
                const deltaX = eventData.x - this.lastLookPosition.x;
                const deltaY = eventData.y - this.lastLookPosition.y;
                
                // Apply look rotation
                if (this.game.playerController) {
                    this.game.playerController.rotateCameraWithDelta(
                        deltaX * this.lookSensitivity,
                        deltaY * this.lookSensitivity
                    );
                }
                
                // Update last position
                this.lastLookPosition.x = eventData.x;
                this.lastLookPosition.y = eventData.y;
            }
        });
        
        this.game.scene.onPointerUpObservable.add((eventData) => {
            if (this.lookPointerID === eventData.pointerId) {
                this.lookPointerID = null;
            }
        });
    }

    createAdditionalControls() {
        // Create reload button
        const reloadButton = new GUI.Ellipse("reloadButton");
        reloadButton.width = "80px";
        reloadButton.height = "80px";
        reloadButton.cornerRadius = 40;
        reloadButton.color = "white";
        reloadButton.thickness = 2;
        reloadButton.background = "green";
        reloadButton.alpha = 0.6;
        reloadButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        reloadButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        reloadButton.left = "-180px";
        reloadButton.top = "-180px";
        
        // Add text to button
        const reloadText = new GUI.TextBlock("reloadText");
        reloadText.text = "RELOAD";
        reloadText.color = "white";
        reloadText.fontSize = 14;
        reloadText.fontFamily = "Arial";
        reloadButton.addControl(reloadText);
        
        // Add button to interface
        this.touchInterface.addControl(reloadButton);
        
        // Add event listeners for reload button
        reloadButton.onPointerDownObservable.add(() => {
            if (this.controlsEnabled && this.game.weaponSystem) {
                this.game.weaponSystem.reload();
            }
        });
        
        // Create settings button (for adjusting controls)
        const settingsButton = new GUI.Ellipse("settingsButton");
        settingsButton.width = "60px";
        settingsButton.height = "60px";
        settingsButton.cornerRadius = 30;
        settingsButton.color = "white";
        settingsButton.thickness = 2;
        settingsButton.background = "gray";
        settingsButton.alpha = 0.6;
        settingsButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        settingsButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        settingsButton.left = "-20px";
        settingsButton.top = "20px";
        
        // Add icon to button
        const settingsText = new GUI.TextBlock("settingsText");
        settingsText.text = "⚙️";
        settingsText.color = "white";
        settingsText.fontSize = 24;
        settingsText.fontFamily = "Arial";
        settingsButton.addControl(settingsText);
        
        // Add button to interface
        this.touchInterface.addControl(settingsButton);
        
        // Add event listeners for settings button
        settingsButton.onPointerDownObservable.add(() => {
            this.toggleControlsSettings();
        });
    }

    toggleControlsSettings() {
        // Create or show settings panel
        if (!this.settingsPanel) {
            this.createSettingsPanel();
        } else {
            this.settingsPanel.isVisible = !this.settingsPanel.isVisible;
        }
    }

    createSettingsPanel() {
        // Create settings panel
        this.settingsPanel = new GUI.Rectangle("settingsPanel");
        this.settingsPanel.width = "300px";
        this.settingsPanel.height = "400px";
        this.settingsPanel.cornerRadius = 10;
        this.settingsPanel.color = "white";
        this.settingsPanel.thickness = 2;
        this.settingsPanel.background = "black";
        this.settingsPanel.alpha = 0.8;
        this.settingsPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.settingsPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        
        // Add title
        const titleText = new GUI.TextBlock("settingsTitleText");
        titleText.text = "TOUCH CONTROLS SETTINGS";
        titleText.color = "white";
        titleText.fontSize = 20;
        titleText.fontFamily = "Arial";
        titleText.height = "40px";
        titleText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        titleText.top = "10px";
        this.settingsPanel.addControl(titleText);
        
        // Add close button
        const closeButton = new GUI.Button("closeButton");
        closeButton.width = "40px";
        closeButton.height = "40px";
        closeButton.cornerRadius = 20;
        closeButton.color = "white";
        closeButton.thickness = 2;
        closeButton.background = "red";
        closeButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        closeButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        closeButton.top = "10px";
        closeButton.left = "-10px";
        
        const closeText = new GUI.TextBlock("closeText");
        closeText.text = "X";
        closeText.color = "white";
        closeText.fontSize = 20;
        closeButton.addControl(closeText);
        
        closeButton.onPointerClickObservable.add(() => {
            this.settingsPanel.isVisible = false;
        });
        
        this.settingsPanel.addControl(closeButton);
        
        // Add look sensitivity slider
        this.addSettingSlider(
            "Look Sensitivity",
            this.lookSensitivity,
            0.01,
            0.2,
            (value) => {
                this.lookSensitivity = value;
            },
            "60px"
        );
        
        // Add move sensitivity slider
        this.addSettingSlider(
            "Move Sensitivity",
            this.moveSensitivity,
            0.005,
            0.05,
            (value) => {
                this.moveSensitivity = value;
            },
            "120px"
        );
        
        // Add opacity slider
        this.addSettingSlider(
            "Controls Opacity",
            this.controlsOpacity,
            0.2,
            1.0,
            (value) => {
                this.controlsOpacity = value;
                this.setControlsOpacity(value);
            },
            "180px"
        );
        
        // Add scale slider
        this.addSettingSlider(
            "Controls Scale",
            this.controlsScale,
            0.7,
            1.3,
            (value) => {
                this.controlsScale = value;
                this.setControlsScale(value);
            },
            "240px"
        );
        
        // Add visibility toggle
        const visibilityStack = new GUI.StackPanel("visibilityStack");
        visibilityStack.height = "40px";
        visibilityStack.isVertical = false;
        visibilityStack.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        visibilityStack.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        visibilityStack.top = "300px";
        visibilityStack.left = "20px";
        visibilityStack.width = "260px";
        
        const visibilityLabel = new GUI.TextBlock("visibilityLabel");
        visibilityLabel.text = "Show Controls";
        visibilityLabel.color = "white";
        visibilityLabel.fontSize = 18;
        visibilityLabel.width = "150px";
        visibilityLabel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        visibilityStack.addControl(visibilityLabel);
        
        const visibilityCheckbox = new GUI.Checkbox("visibilityCheckbox");
        visibilityCheckbox.width = "20px";
        visibilityCheckbox.height = "20px";
        visibilityCheckbox.isChecked = this.controlsVisible;
        visibilityCheckbox.color = "white";
        visibilityCheckbox.onIsCheckedChangedObservable.add((value) => {
            this.controlsVisible = value;
            this.setControlsVisibility(value);
        });
        visibilityStack.addControl(visibilityCheckbox);
        
        this.settingsPanel.addControl(visibilityStack);
        
        // Add reset button
        const resetButton = new GUI.Button("resetButton");
        resetButton.width = "120px";
        resetButton.height = "40px";
        resetButton.cornerRadius = 10;
        resetButton.color = "white";
        resetButton.thickness = 2;
        resetButton.background = "blue";
        resetButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        resetButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        resetButton.top = "-20px";
        
        const resetText = new GUI.TextBlock("resetText");
        resetText.text = "RESET";
        resetText.color = "white";
        resetText.fontSize = 18;
        resetButton.addControl(resetText);
        
        resetButton.onPointerClickObservable.add(() => {
            this.resetControlSettings();
        });
        
        this.settingsPanel.addControl(resetButton);
        
        // Add panel to interface
        this.touchInterface.addControl(this.settingsPanel);
    }

    addSettingSlider(labelText, initialValue, min, max, onValueChanged, topPosition) {
        const sliderStack = new GUI.StackPanel(`${labelText}Stack`);
        sliderStack.height = "50px";
        sliderStack.isVertical = true;
        sliderStack.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        sliderStack.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        sliderStack.top = topPosition;
        sliderStack.left = "20px";
        sliderStack.width = "260px";
        
        const label = new GUI.TextBlock(`${labelText}Label`);
        label.text = labelText;
        label.color = "white";
        label.fontSize = 18;
        label.height = "20px";
        label.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        sliderStack.addControl(label);
        
        const slider = new GUI.Slider(`${labelText}Slider`);
        slider.minimum = min;
        slider.maximum = max;
        slider.value = initialValue;
        slider.height = "20px";
        slider.width = "260px";
        slider.color = "white";
        slider.background = "gray";
        slider.onValueChangedObservable.add((value) => {
            onValueChanged(value);
            valueDisplay.text = value.toFixed(2);
        });
        sliderStack.addControl(slider);
        
        const valueDisplay = new GUI.TextBlock(`${labelText}Value`);
        valueDisplay.text = initialValue.toFixed(2);
        valueDisplay.color = "white";
        valueDisplay.fontSize = 14;
        valueDisplay.height = "20px";
        valueDisplay.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        sliderStack.addControl(valueDisplay);
        
        this.settingsPanel.addControl(sliderStack);
    }

    resetControlSettings() {
        // Reset all control settings to defaults
        this.lookSensitivity = 0.05;
        this.moveSensitivity = 0.01;
        this.controlsOpacity = 0.6;
        this.controlsScale = 1.0;
        this.controlsVisible = true;
        
        // Apply reset settings
        this.setControlsOpacity(this.controlsOpacity);
        this.setControlsScale(this.controlsScale);
        this.setControlsVisibility(this.controlsVisible);
        
        // Close and recreate settings panel to refresh values
        if (this.settingsPanel) {
            this.settingsPanel.dispose();
            this.settingsPanel = null;
            this.createSettingsPanel();
        }
    }

    setControlsVisibility(visible) {
        // Set visibility of all control elements
        this.controlsVisible = visible;
        
        if (this.joystickContainer) this.joystickContainer.isVisible = visible;
        if (this.fireButton) this.fireButton.isVisible = visible;
        if (this.jumpButton) this.jumpButton.isVisible = visible;
        
        this.weaponSwitchButtons.forEach(button => {
            button.isVisible = visible;
        });
        
        // Don't hide settings button
        const settingsButton = this.touchInterface.getControlByName("settingsButton");
        if (settingsButton) settingsButton.isVisible = true;
    }

    setControlsOpacity(opacity) {
        // Set opacity of all control elements
        this.controlsOpacity = opacity;
        
        if (this.joystickContainer) this.joystickContainer.alpha = opacity;
        if (this.virtualJoystick) this.virtualJoystick.alpha = opacity + 0.2; // Make joystick slightly more visible
        if (this.fireButton) this.fireButton.alpha = opacity;
        if (this.jumpButton) this.jumpButton.alpha = opacity;
        
        this.weaponSwitchButtons.forEach(button => {
            button.alpha = opacity;
        });
        
        // Don't change settings button opacity
        const settingsButton = this.touchInterface.getControlByName("settingsButton");
        if (settingsButton) settingsButton.alpha = 0.6;
        
        // Don't change reload button opacity
        const reloadButton = this.touchInterface.getControlByName("reloadButton");
        if (reloadButton) reloadButton.alpha = opacity;
    }

    setControlsScale(scale) {
        // Set scale of all control elements
        this.controlsScale = scale;
        
        // Apply scale to joystick
        if (this.joystickContainer) {
            this.joystickContainer.width = (200 * scale) + "px";
            this.joystickContainer.height = (200 * scale) + "px";
        }
        
        if (this.virtualJoystick) {
            this.virtualJoystick.width = (80 * scale) + "px";
            this.virtualJoystick.height = (80 * scale) + "px";
        }
        
        // Apply scale to buttons
        if (this.fireButton) {
            this.fireButton.width = (120 * scale) + "px";
            this.fireButton.height = (120 * scale) + "px";
        }
        
        if (this.jumpButton) {
            this.jumpButton.width = (100 * scale) + "px";
            this.jumpButton.height = (100 * scale) + "px";
        }
        
        // Apply scale to weapon buttons
        const weaponCount = this.weaponSwitchButtons.length;
        const buttonSize = 60 * scale;
        const spacing = 10;
        const totalWidth = weaponCount * (buttonSize + spacing) - spacing;
        
        const weaponContainer = this.touchInterface.getControlByName("weaponContainer");
        if (weaponContainer) {
            weaponContainer.width = totalWidth + "px";
            weaponContainer.height = buttonSize + "px";
            
            this.weaponSwitchButtons.forEach((button, i) => {
                button.width = buttonSize + "px";
                button.height = buttonSize + "px";
                button.left = (i * (buttonSize + spacing)) + "px";
            });
        }
        
        // Apply scale to reload button
        const reloadButton = this.touchInterface.getControlByName("reloadButton");
        if (reloadButton) {
            reloadButton.width = (80 * scale) + "px";
            reloadButton.height = (80 * scale) + "px";
        }
    }

    enableControls() {
        this.controlsEnabled = true;
    }

    disableControls() {
        this.controlsEnabled = false;
        this.resetJoystick();
        
        // Reset any active inputs
        if (this.game.playerController) {
            this.game.playerController.setMobileMovementInput(0, 0);
        }
        
        if (this.game.weaponSystem) {
            this.game.weaponSystem.stopFiring();
        }
    }

    update() {
        // Update controls state if needed
        if (this.isMobileDevice && this.controlsEnabled) {
            // Handle any continuous updates needed for mobile controls
        }
    }
}

export default MobileControls;
