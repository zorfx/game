import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

export class SecretManager {
    constructor(game) {
        this.game = game;
        this.secrets = {};
        this.discoveredSecrets = {};
        this.totalSecrets = 0;
        this.discoveredCount = 0;
    }

    async initialize() {
        // Create UI for secret discovery notifications
        this.createSecretUI();
        
        console.log('Secret Manager initialized');
        return Promise.resolve();
    }

    createSecretUI() {
        // Create fullscreen UI for secret notifications
        this.secretUI = GUI.AdvancedDynamicTexture.CreateFullscreenUI("secretUI", true, this.game.scene);
        
        // Create secret discovery notification
        this.secretNotification = new GUI.Rectangle("secretNotification");
        this.secretNotification.width = "400px";
        this.secretNotification.height = "80px";
        this.secretNotification.cornerRadius = 10;
        this.secretNotification.color = "#27ae60";
        this.secretNotification.thickness = 3;
        this.secretNotification.background = "black";
        this.secretNotification.alpha = 0.9;
        this.secretNotification.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.secretNotification.top = "100px";
        this.secretNotification.isVisible = false;
        
        // Add text to notification
        this.secretText = new GUI.TextBlock("secretText");
        this.secretText.text = "SECRET FOUND!";
        this.secretText.color = "white";
        this.secretText.fontSize = 24;
        this.secretText.fontFamily = "Orbitron";
        this.secretText.textWrapping = true;
        
        this.secretNotification.addControl(this.secretText);
        this.secretUI.addControl(this.secretNotification);
        
        // Create secret counter
        this.secretCounter = new GUI.TextBlock("secretCounter");
        this.secretCounter.text = "Secrets: 0/0";
        this.secretCounter.color = "white";
        this.secretCounter.fontSize = 18;
        this.secretCounter.fontFamily = "Orbitron";
        this.secretCounter.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.secretCounter.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.secretCounter.top = "10px";
        this.secretCounter.left = "-10px";
        this.secretCounter.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        
        this.secretUI.addControl(this.secretCounter);
    }

    async createSecret(id, name, position, rewardCallback) {
        // Create a secret object
        const secret = {
            id,
            name,
            position,
            discovered: false,
            rewardCallback
        };
        
        // Create a visual indicator for the secret
        const secretMesh = BABYLON.MeshBuilder.CreateSphere(
            `secret_${id}`,
            { diameter: 1 },
            this.game.scene
        );
        secretMesh.position = position;
        
        // Create glowing material for the secret
        const secretMaterial = new BABYLON.StandardMaterial(`secretMaterial_${id}`, this.game.scene);
        secretMaterial.emissiveColor = new BABYLON.Color3(1, 0.8, 0);
        secretMaterial.alpha = 0.7;
        secretMesh.material = secretMaterial;
        
        // Add a simple animation to make the secret glow and rotate
        const animation = new BABYLON.Animation(
            `secretAnimation_${id}`,
            "scaling",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const rotationAnimation = new BABYLON.Animation(
            `secretRotationAnimation_${id}`,
            "rotation.y",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const keys = [];
        keys.push({ frame: 0, value: new BABYLON.Vector3(1, 1, 1) });
        keys.push({ frame: 15, value: new BABYLON.Vector3(1.2, 1.2, 1.2) });
        keys.push({ frame: 30, value: new BABYLON.Vector3(1, 1, 1) });
        
        const rotationKeys = [];
        rotationKeys.push({ frame: 0, value: 0 });
        rotationKeys.push({ frame: 30, value: Math.PI * 2 });
        
        animation.setKeys(keys);
        rotationAnimation.setKeys(rotationKeys);
        
        secretMesh.animations.push(animation);
        secretMesh.animations.push(rotationAnimation);
        
        this.game.scene.beginAnimation(secretMesh, 0, 30, true);
        
        // Create a trigger area around the secret
        const triggerRadius = 2;
        const triggerArea = BABYLON.MeshBuilder.CreateSphere(
            `secretTrigger_${id}`,
            { diameter: triggerRadius * 2 },
            this.game.scene
        );
        triggerArea.position = position;
        triggerArea.isVisible = false;
        triggerArea.isPickable = false;
        
        // Store the secret mesh and trigger
        secret.mesh = secretMesh;
        secret.trigger = triggerArea;
        
        // Register an observer to check for player entering the trigger
        this.game.scene.registerBeforeRender(() => {
            if (secret.discovered) return;
            
            if (this.game.playerController && this.game.playerController.camera) {
                const playerPosition = this.game.playerController.camera.position;
                const distance = BABYLON.Vector3.Distance(playerPosition, position);
                
                if (distance <= triggerRadius) {
                    this.discoverSecret(id);
                }
            }
        });
        
        // Add to secrets collection
        this.secrets[id] = secret;
        this.totalSecrets++;
        this.updateSecretCounter();
        
        return secret;
    }

    discoverSecret(id) {
        const secret = this.secrets[id];
        if (!secret || secret.discovered) return;
        
        console.log(`Secret discovered: ${secret.name}`);
        
        // Mark as discovered
        secret.discovered = true;
        this.discoveredSecrets[id] = secret;
        this.discoveredCount++;
        
        // Update counter
        this.updateSecretCounter();
        
        // Show notification
        this.showSecretNotification(secret.name);
        
        // Play discovery sound
        if (this.game.audioManager) {
            this.game.audioManager.playSound('secret_found');
        }
        
        // Give reward
        if (secret.rewardCallback) {
            secret.rewardCallback();
        }
        
        // Remove the secret mesh and trigger
        if (secret.mesh) {
            // Create a particle effect at the secret location
            this.createDiscoveryEffect(secret.mesh.position);
            
            // Dispose of the meshes
            secret.mesh.dispose();
            secret.trigger.dispose();
        }
    }

    createDiscoveryEffect(position) {
        // Create a particle system for the discovery effect
        const particleSystem = new BABYLON.ParticleSystem("secretDiscoveryEffect", 100, this.game.scene);
        particleSystem.particleTexture = new BABYLON.Texture("assets/textures/flare.png", this.game.scene);
        particleSystem.emitter = position;
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.2, -0.2, -0.2);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.2, 0.2, 0.2);
        
        // Particle colors
        particleSystem.color1 = new BABYLON.Color4(1, 0.8, 0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1.0);
        
        // Size and lifetime
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.5;
        particleSystem.minLifeTime = 0.5;
        particleSystem.maxLifeTime = 1.5;
        
        // Emission
        particleSystem.emitRate = 100;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        
        // Speed and direction
        particleSystem.direction1 = new BABYLON.Vector3(-1, -1, -1);
        particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;
        
        // Start the particle system
        particleSystem.start();
        
        // Stop and dispose after a short time
        setTimeout(() => {
            particleSystem.stop();
            setTimeout(() => {
                particleSystem.dispose();
            }, 2000);
        }, 1000);
        
        // Create a point light at the discovery location
        const light = new BABYLON.PointLight("secretLight", position, this.game.scene);
        light.diffuse = new BABYLON.Color3(1, 0.8, 0);
        light.intensity = 1;
        
        // Animate the light intensity
        const lightAnimation = new BABYLON.Animation(
            "secretLightAnimation",
            "intensity",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const lightKeys = [];
        lightKeys.push({ frame: 0, value: 1 });
        lightKeys.push({ frame: 15, value: 0.5 });
        lightKeys.push({ frame: 30, value: 0 });
        
        lightAnimation.setKeys(lightKeys);
        light.animations.push(lightAnimation);
        
        this.game.scene.beginAnimation(light, 0, 30, false, 1, () => {
            light.dispose();
        });
    }

    showSecretNotification(secretName) {
        // Update notification text
        this.secretText.text = `SECRET FOUND!\n${secretName}`;
        
        // Show the notification
        this.secretNotification.isVisible = true;
        
        // Animate the notification
        const animation = new BABYLON.Animation(
            "secretNotificationAnimation",
            "alpha",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const keys = [];
        keys.push({ frame: 0, value: 0 });
        keys.push({ frame: 10, value: 0.9 });
        keys.push({ frame: 70, value: 0.9 });
        keys.push({ frame: 90, value: 0 });
        
        animation.setKeys(keys);
        this.secretNotification.animations = [animation];
        
        this.game.scene.beginAnimation(this.secretNotification, 0, 90, false, 1, () => {
            this.secretNotification.isVisible = false;
        });
    }

    updateSecretCounter() {
        if (this.secretCounter) {
            this.secretCounter.text = `Secrets: ${this.discoveredCount}/${this.totalSecrets}`;
        }
    }

    clearSecrets() {
        // Dispose of all secret meshes and triggers
        Object.values(this.secrets).forEach(secret => {
            if (secret.mesh) {
                secret.mesh.dispose();
            }
            if (secret.trigger) {
                secret.trigger.dispose();
            }
        });
        
        // Reset collections
        this.secrets = {};
        this.discoveredSecrets = {};
        this.discoveredCount = 0;
        this.totalSecrets = 0;
        
        // Update counter
        this.updateSecretCounter();
    }

    getSecretStats() {
        return {
            total: this.totalSecrets,
            discovered: this.discoveredCount,
            remaining: this.totalSecrets - this.discoveredCount
        };
    }
}

export default SecretManager;
