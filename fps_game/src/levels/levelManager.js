import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

export class LevelManager {
    constructor(game) {
        this.game = game;
        this.levels = {};
        this.currentLevel = null;
        this.currentLevelName = '';
        this.levelTransitioning = false;
    }

    async initialize() {
        // Register level definitions
        this.registerLevels();
        
        console.log('Level Manager initialized');
        return Promise.resolve();
    }

    registerLevels() {
        // Register all available levels
        this.levels = {
            'level1': {
                name: 'Entrance Facility',
                description: 'The entrance to the facility. Find a way inside.',
                create: () => this.createLevel1(),
                spawnPoint: new BABYLON.Vector3(0, 2, 0),
                music: 'level1_music.mp3',
                ambientSound: 'ambient_outdoors.mp3',
                skybox: 'skybox_night.jpg',
                nextLevel: 'level2'
            },
            'level2': {
                name: 'Processing Plant',
                description: 'Navigate through the processing plant. Watch out for enemies.',
                create: () => this.createLevel2(),
                spawnPoint: new BABYLON.Vector3(0, 2, 0),
                music: 'level2_music.mp3',
                ambientSound: 'ambient_factory.mp3',
                skybox: 'skybox_factory.jpg',
                nextLevel: 'level3'
            },
            'level3': {
                name: 'Underground Labs',
                description: 'Explore the underground laboratories. Many secrets are hidden here.',
                create: () => this.createLevel3(),
                spawnPoint: new BABYLON.Vector3(0, 2, 0),
                music: 'level3_music.mp3',
                ambientSound: 'ambient_labs.mp3',
                skybox: 'skybox_labs.jpg',
                nextLevel: 'level4'
            },
            'level4': {
                name: 'Reactor Core',
                description: 'Reach the reactor core. Be prepared for heavy resistance.',
                create: () => this.createLevel4(),
                spawnPoint: new BABYLON.Vector3(0, 2, 0),
                music: 'level4_music.mp3',
                ambientSound: 'ambient_reactor.mp3',
                skybox: 'skybox_reactor.jpg',
                nextLevel: 'level5'
            },
            'level5': {
                name: 'Final Confrontation',
                description: 'Face the final boss and escape the facility.',
                create: () => this.createLevel5(),
                spawnPoint: new BABYLON.Vector3(0, 2, 0),
                music: 'level5_music.mp3',
                ambientSound: 'ambient_boss.mp3',
                skybox: 'skybox_boss.jpg',
                nextLevel: null
            }
        };
    }

    async loadLevel(levelName) {
        if (this.levelTransitioning) {
            console.log('Level transition already in progress');
            return;
        }
        
        this.levelTransitioning = true;
        
        // Show loading screen
        if (this.game.uiManager) {
            this.game.uiManager.showLoadingScreen(`Loading ${this.levels[levelName].name}...`);
        }
        
        // Dispose of current level if exists
        if (this.currentLevel) {
            this.disposeCurrentLevel();
        }
        
        // Reset player position
        if (this.game.playerController && this.game.playerController.camera) {
            this.game.playerController.camera.position = new BABYLON.Vector3(0, this.game.config.playerHeight, 0);
        }
        
        // Create the new level
        console.log(`Loading level: ${levelName}`);
        this.currentLevelName = levelName;
        this.currentLevel = await this.levels[levelName].create();
        
        // Set player spawn point
        if (this.game.playerController && this.game.playerController.camera) {
            this.game.playerController.camera.position = this.levels[levelName].spawnPoint.clone();
            this.game.playerController.camera.position.y += this.game.config.playerHeight;
        }
        
        // Play level music and ambient sounds
        if (this.game.audioManager) {
            this.game.audioManager.playMusic(this.levels[levelName].music);
            this.game.audioManager.playAmbientSound(this.levels[levelName].ambientSound);
        }
        
        // Hide loading screen
        if (this.game.uiManager) {
            this.game.uiManager.hideLoadingScreen();
            this.game.uiManager.showLevelIntro(
                this.levels[levelName].name,
                this.levels[levelName].description
            );
        }
        
        this.levelTransitioning = false;
        
        console.log(`Level ${levelName} loaded successfully`);
    }

    disposeCurrentLevel() {
        // Dispose of all level-specific meshes and resources
        if (!this.currentLevel) return;
        
        console.log(`Disposing level: ${this.currentLevelName}`);
        
        // Dispose of all meshes that belong to the level
        this.currentLevel.meshes.forEach(mesh => {
            if (mesh && mesh.dispose) {
                mesh.dispose();
            }
        });
        
        // Dispose of all lights that belong to the level
        this.currentLevel.lights.forEach(light => {
            if (light && light.dispose) {
                light.dispose();
            }
        });
        
        // Clear enemies
        if (this.game.enemyManager) {
            this.game.enemyManager.clearEnemies();
        }
        
        // Clear secrets
        if (this.game.secretManager) {
            this.game.secretManager.clearSecrets();
        }
        
        // Stop music and ambient sounds
        if (this.game.audioManager) {
            this.game.audioManager.stopMusic();
            this.game.audioManager.stopAmbientSound();
        }
        
        this.currentLevel = null;
    }

    goToNextLevel() {
        const nextLevelName = this.levels[this.currentLevelName].nextLevel;
        if (nextLevelName) {
            this.loadLevel(nextLevelName);
        } else {
            // Game completed
            if (this.game.uiManager) {
                this.game.uiManager.showGameCompleted();
            }
        }
    }

    // Level creation methods
    async createLevel1() {
        console.log('Creating Level 1: Entrance Facility');
        
        const level = {
            meshes: [],
            lights: [],
            enemies: [],
            secrets: [],
            items: [],
            triggers: []
        };
        
        // Create skybox
        const skybox = this.createSkybox('skybox_night.jpg');
        level.meshes.push(skybox);
        
        // Create main lighting
        const hemisphericLight = new BABYLON.HemisphericLight(
            "hemisphericLight",
            new BABYLON.Vector3(0, 1, 0),
            this.game.scene
        );
        hemisphericLight.intensity = 0.7;
        level.lights.push(hemisphericLight);
        
        // Create ground
        const ground = this.createGround();
        level.meshes.push(ground);
        
        // Create entrance building
        const entranceBuilding = await this.createEntranceBuilding();
        entranceBuilding.meshes.forEach(mesh => level.meshes.push(mesh));
        
        // Create surrounding environment
        const environment = await this.createEnvironment();
        environment.meshes.forEach(mesh => level.meshes.push(mesh));
        
        // Add enemies
        if (this.game.enemyManager) {
            const enemy1 = await this.game.enemyManager.spawnEnemy('grunt', new BABYLON.Vector3(10, 0, 10));
            const enemy2 = await this.game.enemyManager.spawnEnemy('grunt', new BABYLON.Vector3(-10, 0, 15));
            const enemy3 = await this.game.enemyManager.spawnEnemy('grunt', new BABYLON.Vector3(5, 0, -12));
            
            level.enemies.push(enemy1, enemy2, enemy3);
        }
        
        // Add secrets
        if (this.game.secretManager) {
            const secret1 = await this.game.secretManager.createSecret(
                'level1_secret1',
                'Hidden Shotgun',
                new BABYLON.Vector3(15, 0.5, -15),
                () => {
                    // Reward: Shotgun weapon
                    if (this.game.weaponSystem) {
                        this.game.weaponSystem.acquireWeapon('shotgun');
                    }
                }
            );
            
            const secret2 = await this.game.secretManager.createSecret(
                'level1_secret2',
                'Armor Cache',
                new BABYLON.Vector3(-20, 0.5, -5),
                () => {
                    // Reward: Armor
                    if (this.game.playerController) {
                        this.game.playerController.pickupArmor(50);
                    }
                }
            );
            
            level.secrets.push(secret1, secret2);
        }
        
        // Add items
        const healthPack = this.createItem('health', new BABYLON.Vector3(5, 0.5, 5), 25);
        const ammoBox = this.createItem('ammo', new BABYLON.Vector3(-5, 0.5, 5), 20, 'pistol');
        
        level.items.push(healthPack, ammoBox);
        
        // Add level exit trigger
        const exitTrigger = this.createTrigger(
            'level1_exit',
            new BABYLON.Vector3(0, 1, -20),
            new BABYLON.Vector3(5, 2, 5),
            () => {
                this.goToNextLevel();
            }
        );
        
        level.triggers.push(exitTrigger);
        
        return level;
    }

    async createLevel2() {
        console.log('Creating Level 2: Processing Plant');
        
        const level = {
            meshes: [],
            lights: [],
            enemies: [],
            secrets: [],
            items: [],
            triggers: []
        };
        
        // Create skybox
        const skybox = this.createSkybox('skybox_factory.jpg');
        level.meshes.push(skybox);
        
        // Create main lighting
        const hemisphericLight = new BABYLON.HemisphericLight(
            "hemisphericLight",
            new BABYLON.Vector3(0, 1, 0),
            this.game.scene
        );
        hemisphericLight.intensity = 0.5;
        level.lights.push(hemisphericLight);
        
        // Add some point lights for atmosphere
        const pointLight1 = new BABYLON.PointLight(
            "pointLight1",
            new BABYLON.Vector3(10, 5, 10),
            this.game.scene
        );
        pointLight1.intensity = 0.3;
        pointLight1.diffuse = new BABYLON.Color3(1, 0.7, 0.3);
        level.lights.push(pointLight1);
        
        const pointLight2 = new BABYLON.PointLight(
            "pointLight2",
            new BABYLON.Vector3(-10, 5, -10),
            this.game.scene
        );
        pointLight2.intensity = 0.3;
        pointLight2.diffuse = new BABYLON.Color3(0.3, 0.7, 1);
        level.lights.push(pointLight2);
        
        // Create ground
        const ground = this.createGround();
        level.meshes.push(ground);
        
        // Create factory interior
        const factory = await this.createFactoryInterior();
        factory.meshes.forEach(mesh => level.meshes.push(mesh));
        
        // Add enemies
        if (this.game.enemyManager) {
            const enemy1 = await this.game.enemyManager.spawnEnemy('grunt', new BABYLON.Vector3(8, 0, 8));
            const enemy2 = await this.game.enemyManager.spawnEnemy('grunt', new BABYLON.Vector3(-8, 0, 12));
            const enemy3 = await this.game.enemyManager.spawnEnemy('enforcer', new BABYLON.Vector3(5, 0, -10));
            const enemy4 = await this.game.enemyManager.spawnEnemy('enforcer', new BABYLON.Vector3(-5, 0, -15));
            
            level.enemies.push(enemy1, enemy2, enemy3, enemy4);
        }
        
        // Add secrets
        if (this.game.secretManager) {
            const secret1 = await this.game.secretManager.createSecret(
                'level2_secret1',
                'Hidden Assault Rifle',
                new BABYLON.Vector3(18, 0.5, -12),
                () => {
                    // Reward: Assault Rifle weapon
                    if (this.game.weaponSystem) {
                        this.game.weaponSystem.acquireWeapon('assault rifle');
                    }
                }
            );
            
            const secret2 = await this.game.secretManager.createSecret(
                'level2_secret2',
                'Health Cache',
                new BABYLON.Vector3(-15, 0.5, -8),
                () => {
                    // Reward: Health
                    if (this.game.playerController) {
                        this.game.playerController.pickupHealth(50);
                    }
                }
            );
            
            level.secrets.push(secret1, secret2);
        }
        
        // Add items
        const healthPack1 = this.createItem('health', new BABYLON.Vector3(7, 0.5, 3), 25);
        const healthPack2 = this.createItem('health', new BABYLON.Vector3(-7, 0.5, -3), 25);
        const ammoBox1 = this.createItem('ammo', new BABYLON.Vector3(3, 0.5, 7), 20, 'pistol');
        const ammoBox2 = this.createItem('ammo', new BABYLON.Vector3(-3, 0.5, -7), 20, 'shells');
        
        level.items.push(healthPack1, healthPack2, ammoBox1, ammoBox2);
        
        // Add level exit trigger
        const exitTrigger = this.createTrigger(
            'level2_exit',
            new BABYLON.Vector3(0, 1, -25),
            new BABYLON.Vector3(5, 2, 5),
            () => {
                this.goToNextLevel();
            }
        );
        
        level.triggers.push(exitTrigger);
        
        return level;
    }

    async createLevel3() {
        console.log('Creating Level 3: Underground Labs');
        
        const level = {
            meshes: [],
            lights: [],
            enemies: [],
            secrets: [],
            items: [],
            triggers: []
        };
        
        // Create skybox
        const skybox = this.createSkybox('skybox_labs.jpg');
        level.meshes.push(skybox);
        
        // Create main lighting
        const hemisphericLight = new BABYLON.HemisphericLight(
            "hemisphericLight",
            new BABYLON.Vector3(0, 1, 0),
            this.game.scene
        );
        hemisphericLight.intensity = 0.3;
        level.lights.push(hemisphericLight);
        
        // Add some point lights for atmosphere
        const pointLight1 = new BABYLON.PointLight(
            "pointLight1",
            new BABYLON.Vector3(10, 5, 10),
            this.game.scene
        );
        pointLight1.intensity = 0.5;
        pointLight1.diffuse = new BABYLON.Color3(0.3, 1, 0.3);
        level.lights.push(pointLight1);
        
        const pointLight2 = new BABYLON.PointLight(
            "pointLight2",
            new BABYLON.Vector3(-10, 5, -10),
            this.game.scene
        );
        pointLight2.intensity = 0.5;
        pointLight2.diffuse = new BABYLON.Color3(1, 0.3, 0.3);
        level.lights.push(pointLight2);
        
        // Create ground
        const ground = this.createGround();
        level.meshes.push(ground);
        
        // Create lab interior
        const lab = await this.createLabInterior();
        lab.meshes.forEach(mesh => level.meshes.push(mesh));
        
        // Add enemies
        if (this.game.enemyManager) {
            const enemy1 = await this.game.enemyManager.spawnEnemy('grunt', new BABYLON.Vector3(12, 0, 12));
            const enemy2 = await this.game.enemyManager.spawnEnemy('grunt', new BABYLON.Vector3(-12, 0, 15));
            const enemy3 = await this.game.enemyManager.spawnEnemy('enforcer', new BABYLON.Vector3(8, 0, -12));
            const enemy4 = await this.game.enemyManager.spawnEnemy('enforcer', new BABYLON.Vector3(-8, 0, -15));
            const enemy5 = await this.game.enemyManager.spawnEnemy('heavy', new BABYLON.Vector3(0, 0, -20));
            
            level.enemies.push(enemy1, enemy2, enemy3, enemy4, enemy5);
        }
        
        // Add secrets
        if (this.game.secretManager) {
            const secret1 = await this.game.secretManager.createSecret(
                'level3_secret1',
                'Hidden Rocket Launcher',
                new BABYLON.Vector3(20, 0.5, -10),
                () => {
                    // Reward: Rocket Launcher weapon
                    if (this.game.weaponSystem) {
                        this.game.weaponSystem.acquireWeapon('rocket launcher');
                    }
                }
            );
            
            const secret2 = await this.game.secretManager.createSecret(
                'level3_secret2',
                'Armor and Health Cache',
                new BABYLON.Vector3(-18, 0.5, -12),
                () => {
                    // Reward: Armor and Health
                    if (this.game.playerController) {
                        this.game.playerController.pickupArmor(75);
                        this.game.playerController.pickupHealth(75);
                    }
                }
            );
            
            const secret3 = await this.game.secretManager.createSecret(
                'level3_secret3',
                'Sniper Rifle Cache',
                new BABYLON.Vector3(0, 0.5, 25),
                () => {
                    // Reward: Sniper Rifle weapon
                    if (this.game.weaponSystem) {
                        this.game.weaponSystem.acquireWeapon('sniper rifle');
                    }
                }
            );
            
            level.secrets.push(secret1, secret2, secret3);
        }
        
        // Add items
        const healthPack1 = this.createItem('health', new BABYLON.Vector3(5, 0.5, 5), 25);
        const healthPack2 = this.createItem('health', new BABYLON.Vector3(-5, 0.5, 5), 25);
        const armorPack = this.createItem('armor', new BABYLON.Vector3(0, 0.5, 10), 25);
        const ammoBox1 = this.createItem('ammo', new BABYLON.Vector3(5, 0.5, -5), 20, 'rifle');
        const ammoBox2 = this.createItem('ammo', new BABYLON.Vector3(-5, 0.5, -5), 20, 'shells');
        const ammoBox3 = this.createItem('ammo', new BABYLON.Vector3(0, 0.5, -10), 10, 'rockets');
        
        level.items.push(healthPack1, healthPack2, armorPack, ammoBox1, ammoBox2, ammoBox3);
        
        // Add level exit trigger
        const exitTrigger = this.createTrigger(
            'level3_exit',
            new BABYLON.Vector3(0, 1, -30),
            new BABYLON.Vector3(5, 2, 5),
            () => {
                this.goToNextLevel();
            }
        );
        
        level.triggers.push(exitTrigger);
        
        return level;
    }

    async createLevel4() {
        console.log('Creating Level 4: Reactor Core');
        
        const level = {
            meshes: [],
            lights: [],
            enemies: [],
            secrets: [],
            items: [],
            triggers: []
        };
        
        // Create skybox
        const skybox = this.createSkybox('skybox_reactor.jpg');
        level.meshes.push(skybox);
        
        // Create main lighting
        const hemisphericLight = new BABYLON.HemisphericLight(
            "hemisphericLight",
            new BABYLON.Vector3(0, 1, 0),
            this.game.scene
        );
        hemisphericLight.intensity = 0.3;
        level.lights.push(hemisphericLight);
        
        // Add some point lights for atmosphere
        const pointLight1 = new BABYLON.PointLight(
            "pointLight1",
            new BABYLON.Vector3(0, 10, 0),
            this.game.scene
        );
        pointLight1.intensity = 0.8;
        pointLight1.diffuse = new BABYLON.Color3(1, 0.3, 0);
        level.lights.push(pointLight1);
        
        // Create ground
        const ground = this.createGround();
        level.meshes.push(ground);
        
        // Create reactor interior
        const reactor = await this.createReactorInterior();
        reactor.meshes.forEach(mesh => level.meshes.push(mesh));
        
        // Add enemies
        if (this.game.enemyManager) {
            const enemy1 = await this.game.enemyManager.spawnEnemy('grunt', new BABYLON.Vector3(15, 0, 15));
            const enemy2 = await this.game.enemyManager.spawnEnemy('grunt', new BABYLON.Vector3(-15, 0, 15));
            const enemy3 = await this.game.enemyManager.spawnEnemy('enforcer', new BABYLON.Vector3(15, 0, -15));
            const enemy4 = await this.game.enemyManager.spawnEnemy('enforcer', new BABYLON.Vector3(-15, 0, -15));
            const enemy5 = await this.game.enemyManager.spawnEnemy('heavy', new BABYLON.Vector3(10, 0, 0));
            const enemy6 = await this.game.enemyManager.spawnEnemy('heavy', new BABYLON.Vector3(-10, 0, 0));
            const enemy7 = await this.game.enemyManager.spawnEnemy('heavy', new BABYLON.Vector3(0, 0, -20));
            
            level.enemies.push(enemy1, enemy2, enemy3, enemy4, enemy5, enemy6, enemy7);
        }
        
        // Add secrets
        if (this.game.secretManager) {
            const secret1 = await this.game.secretManager.createSecret(
                'level4_secret1',
                'Hidden Plasma Gun',
                new BABYLON.Vector3(25, 0.5, 0),
                () => {
                    // Reward: Plasma Gun weapon
                    if (this.game.weaponSystem) {
                        this.game.weaponSystem.acquireWeapon('plasma gun');
                    }
                }
            );
            
            const secret2 = await this.game.secretManager.createSecret(
                'level4_secret2',
                'Mega Health Cache',
                new BABYLON.Vector3(-25, 0.5, 0),
                () => {
                    // Reward: Lots of Health
                    if (this.game.playerController) {
                        this.game.playerController.pickupHealth(100);
                    }
                }
            );
            
            level.secrets.push(secret1, secret2);
        }
        
        // Add items
        const healthPack1 = this.createItem('health', new BABYLON.Vector3(10, 0.5, 10), 25);
        const healthPack2 = this.createItem('health', new BABYLON.Vector3(-10, 0.5, 10), 25);
        const healthPack3 = this.createItem('health', new BABYLON.Vector3(10, 0.5, -10), 25);
        const healthPack4 = this.createItem('health', new BABYLON.Vector3(-10, 0.5, -10), 25);
        
        const armorPack1 = this.createItem('armor', new BABYLON.Vector3(5, 0.5, 0), 25);
        const armorPack2 = this.createItem('armor', new BABYLON.Vector3(-5, 0.5, 0), 25);
        
        const ammoBox1 = this.createItem('ammo', new BABYLON.Vector3(0, 0.5, 10), 20, 'rifle');
        const ammoBox2 = this.createItem('ammo', new BABYLON.Vector3(0, 0.5, -10), 20, 'shells');
        const ammoBox3 = this.createItem('ammo', new BABYLON.Vector3(10, 0.5, 0), 10, 'rockets');
        const ammoBox4 = this.createItem('ammo', new BABYLON.Vector3(-10, 0.5, 0), 20, 'cells');
        
        level.items.push(
            healthPack1, healthPack2, healthPack3, healthPack4,
            armorPack1, armorPack2,
            ammoBox1, ammoBox2, ammoBox3, ammoBox4
        );
        
        // Add level exit trigger
        const exitTrigger = this.createTrigger(
            'level4_exit',
            new BABYLON.Vector3(0, 1, -30),
            new BABYLON.Vector3(5, 2, 5),
            () => {
                this.goToNextLevel();
            }
        );
        
        level.triggers.push(exitTrigger);
        
        return level;
    }

    async createLevel5() {
        console.log('Creating Level 5: Final Confrontation');
        
        const level = {
            meshes: [],
            lights: [],
            enemies: [],
            secrets: [],
            items: [],
            triggers: []
        };
        
        // Create skybox
        const skybox = this.createSkybox('skybox_boss.jpg');
        level.meshes.push(skybox);
        
        // Create main lighting
        const hemisphericLight = new BABYLON.HemisphericLight(
            "hemisphericLight",
            new BABYLON.Vector3(0, 1, 0),
            this.game.scene
        );
        hemisphericLight.intensity = 0.3;
        level.lights.push(hemisphericLight);
        
        // Add dramatic lighting
        const pointLight1 = new BABYLON.PointLight(
            "pointLight1",
            new BABYLON.Vector3(0, 10, -20),
            this.game.scene
        );
        pointLight1.intensity = 1;
        pointLight1.diffuse = new BABYLON.Color3(1, 0, 0);
        level.lights.push(pointLight1);
        
        // Create ground
        const ground = this.createGround();
        level.meshes.push(ground);
        
        // Create boss arena
        const arena = await this.createBossArena();
        arena.meshes.forEach(mesh => level.meshes.push(mesh));
        
        // Add boss enemy
        if (this.game.enemyManager) {
            const boss = await this.game.enemyManager.spawnEnemy('boss', new BABYLON.Vector3(0, 0, -30));
            level.enemies.push(boss);
        }
        
        // Add secrets
        if (this.game.secretManager) {
            const secret1 = await this.game.secretManager.createSecret(
                'level5_secret1',
                'Hidden BFG',
                new BABYLON.Vector3(30, 0.5, 0),
                () => {
                    // Reward: BFG weapon
                    if (this.game.weaponSystem) {
                        this.game.weaponSystem.acquireWeapon('bfg');
                    }
                }
            );
            
            level.secrets.push(secret1);
        }
        
        // Add items
        const healthPack1 = this.createItem('health', new BABYLON.Vector3(15, 0.5, 15), 25);
        const healthPack2 = this.createItem('health', new BABYLON.Vector3(-15, 0.5, 15), 25);
        const healthPack3 = this.createItem('health', new BABYLON.Vector3(15, 0.5, -15), 25);
        const healthPack4 = this.createItem('health', new BABYLON.Vector3(-15, 0.5, -15), 25);
        
        const armorPack1 = this.createItem('armor', new BABYLON.Vector3(15, 0.5, 0), 50);
        const armorPack2 = this.createItem('armor', new BABYLON.Vector3(-15, 0.5, 0), 50);
        
        const ammoBox1 = this.createItem('ammo', new BABYLON.Vector3(0, 0.5, 15), 50, 'rifle');
        const ammoBox2 = this.createItem('ammo', new BABYLON.Vector3(10, 0.5, 15), 50, 'shells');
        const ammoBox3 = this.createItem('ammo', new BABYLON.Vector3(-10, 0.5, 15), 20, 'rockets');
        const ammoBox4 = this.createItem('ammo', new BABYLON.Vector3(0, 0.5, -15), 50, 'cells');
        
        level.items.push(
            healthPack1, healthPack2, healthPack3, healthPack4,
            armorPack1, armorPack2,
            ammoBox1, ammoBox2, ammoBox3, ammoBox4
        );
        
        // Add game completion trigger (activated when boss is defeated)
        const completionTrigger = this.createTrigger(
            'level5_completion',
            new BABYLON.Vector3(0, 1, -30),
            new BABYLON.Vector3(5, 2, 5),
            () => {
                // Show game completion screen
                if (this.game.uiManager) {
                    this.game.uiManager.showGameCompleted();
                }
            }
        );
        
        level.triggers.push(completionTrigger);
        
        return level;
    }

    // Helper methods for level creation
    createSkybox(texturePath) {
        const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size: 1000.0}, this.game.scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", this.game.scene);
        skyboxMaterial.backFaceCulling = false;
        
        // In a real implementation, we would use actual textures
        // For now, we'll use a placeholder from Babylon.js
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://playground.babylonjs.com/textures/skybox", this.game.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        
        skybox.material = skyboxMaterial;
        
        return skybox;
    }

    createGround() {
        const ground = BABYLON.MeshBuilder.CreateGround(
            "ground",
            {width: 100, height: 100},
            this.game.scene
        );
        
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.game.scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        
        ground.material = groundMaterial;
        ground.checkCollisions = true;
        
        return ground;
    }

    async createEntranceBuilding() {
        const meshes = [];
        
        // Create main building
        const building = BABYLON.MeshBuilder.CreateBox(
            "entranceBuilding",
            {width: 20, height: 10, depth: 20},
            this.game.scene
        );
        building.position = new BABYLON.Vector3(0, 5, -30);
        building.checkCollisions = true;
        
        const buildingMaterial = new BABYLON.StandardMaterial("buildingMaterial", this.game.scene);
        buildingMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        building.material = buildingMaterial;
        
        meshes.push(building);
        
        // Create entrance
        const entrance = BABYLON.MeshBuilder.CreateBox(
            "entrance",
            {width: 5, height: 5, depth: 1},
            this.game.scene
        );
        entrance.position = new BABYLON.Vector3(0, 2.5, -20);
        
        const entranceMaterial = new BABYLON.StandardMaterial("entranceMaterial", this.game.scene);
        entranceMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        entrance.material = entranceMaterial;
        
        meshes.push(entrance);
        
        // Create some decorative elements
        const pillar1 = BABYLON.MeshBuilder.CreateCylinder(
            "pillar1",
            {diameter: 1, height: 8},
            this.game.scene
        );
        pillar1.position = new BABYLON.Vector3(5, 4, -20);
        pillar1.checkCollisions = true;
        
        const pillar2 = BABYLON.MeshBuilder.CreateCylinder(
            "pillar2",
            {diameter: 1, height: 8},
            this.game.scene
        );
        pillar2.position = new BABYLON.Vector3(-5, 4, -20);
        pillar2.checkCollisions = true;
        
        const pillarMaterial = new BABYLON.StandardMaterial("pillarMaterial", this.game.scene);
        pillarMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        
        pillar1.material = pillarMaterial;
        pillar2.material = pillarMaterial;
        
        meshes.push(pillar1, pillar2);
        
        return { meshes };
    }

    async createEnvironment() {
        const meshes = [];
        
        // Create some trees
        for (let i = 0; i < 20; i++) {
            const treeX = (Math.random() - 0.5) * 80;
            const treeZ = (Math.random() - 0.5) * 80;
            
            // Don't place trees too close to the spawn point or entrance
            if (Math.abs(treeX) < 10 && Math.abs(treeZ) < 10) continue;
            if (Math.abs(treeX) < 10 && treeZ < -15) continue;
            
            const treeTrunk = BABYLON.MeshBuilder.CreateCylinder(
                `treeTrunk${i}`,
                {diameter: 1, height: 5},
                this.game.scene
            );
            treeTrunk.position = new BABYLON.Vector3(treeX, 2.5, treeZ);
            treeTrunk.checkCollisions = true;
            
            const treeTop = BABYLON.MeshBuilder.CreateCylinder(
                `treeTop${i}`,
                {diameterTop: 0, diameterBottom: 4, height: 8},
                this.game.scene
            );
            treeTop.position = new BABYLON.Vector3(treeX, 7, treeZ);
            treeTop.checkCollisions = true;
            
            const trunkMaterial = new BABYLON.StandardMaterial(`trunkMaterial${i}`, this.game.scene);
            trunkMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2);
            
            const topMaterial = new BABYLON.StandardMaterial(`topMaterial${i}`, this.game.scene);
            topMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.4, 0.1);
            
            treeTrunk.material = trunkMaterial;
            treeTop.material = topMaterial;
            
            meshes.push(treeTrunk, treeTop);
        }
        
        // Create some rocks
        for (let i = 0; i < 15; i++) {
            const rockX = (Math.random() - 0.5) * 80;
            const rockZ = (Math.random() - 0.5) * 80;
            const rockSize = 1 + Math.random() * 2;
            
            // Don't place rocks too close to the spawn point or entrance
            if (Math.abs(rockX) < 10 && Math.abs(rockZ) < 10) continue;
            if (Math.abs(rockX) < 10 && rockZ < -15) continue;
            
            const rock = BABYLON.MeshBuilder.CreatePolyhedron(
                `rock${i}`,
                {type: Math.floor(Math.random() * 4), size: rockSize},
                this.game.scene
            );
            rock.position = new BABYLON.Vector3(rockX, rockSize / 2, rockZ);
            rock.rotation.y = Math.random() * Math.PI * 2;
            rock.checkCollisions = true;
            
            const rockMaterial = new BABYLON.StandardMaterial(`rockMaterial${i}`, this.game.scene);
            rockMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
            
            rock.material = rockMaterial;
            
            meshes.push(rock);
        }
        
        return { meshes };
    }

    async createFactoryInterior() {
        const meshes = [];
        
        // Create walls
        const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", this.game.scene);
        wallMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        
        // North wall
        const northWall = BABYLON.MeshBuilder.CreateBox(
            "northWall",
            {width: 50, height: 10, depth: 1},
            this.game.scene
        );
        northWall.position = new BABYLON.Vector3(0, 5, 25);
        northWall.checkCollisions = true;
        northWall.material = wallMaterial;
        
        // South wall
        const southWall = BABYLON.MeshBuilder.CreateBox(
            "southWall",
            {width: 50, height: 10, depth: 1},
            this.game.scene
        );
        southWall.position = new BABYLON.Vector3(0, 5, -25);
        southWall.checkCollisions = true;
        southWall.material = wallMaterial;
        
        // East wall
        const eastWall = BABYLON.MeshBuilder.CreateBox(
            "eastWall",
            {width: 1, height: 10, depth: 50},
            this.game.scene
        );
        eastWall.position = new BABYLON.Vector3(25, 5, 0);
        eastWall.checkCollisions = true;
        eastWall.material = wallMaterial;
        
        // West wall
        const westWall = BABYLON.MeshBuilder.CreateBox(
            "westWall",
            {width: 1, height: 10, depth: 50},
            this.game.scene
        );
        westWall.position = new BABYLON.Vector3(-25, 5, 0);
        westWall.checkCollisions = true;
        westWall.material = wallMaterial;
        
        meshes.push(northWall, southWall, eastWall, westWall);
        
        // Create some machinery
        const machineMaterial = new BABYLON.StandardMaterial("machineMaterial", this.game.scene);
        machineMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.3);
        machineMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        
        for (let i = 0; i < 5; i++) {
            const machineX = (Math.random() - 0.5) * 40;
            const machineZ = (Math.random() - 0.5) * 40;
            
            // Don't place machinery too close to the spawn point
            if (Math.abs(machineX) < 10 && Math.abs(machineZ) < 10) continue;
            
            const machine = BABYLON.MeshBuilder.CreateBox(
                `machine${i}`,
                {width: 3 + Math.random() * 2, height: 3 + Math.random() * 2, depth: 3 + Math.random() * 2},
                this.game.scene
            );
            machine.position = new BABYLON.Vector3(machineX, 1.5, machineZ);
            machine.checkCollisions = true;
            machine.material = machineMaterial;
            
            meshes.push(machine);
        }
        
        // Create some pipes
        const pipeMaterial = new BABYLON.StandardMaterial("pipeMaterial", this.game.scene);
        pipeMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.5, 0.3);
        
        for (let i = 0; i < 10; i++) {
            const pipeX = (Math.random() - 0.5) * 40;
            const pipeZ = (Math.random() - 0.5) * 40;
            const pipeLength = 5 + Math.random() * 10;
            
            const pipe = BABYLON.MeshBuilder.CreateCylinder(
                `pipe${i}`,
                {diameter: 0.5, height: pipeLength},
                this.game.scene
            );
            
            // Randomly orient the pipe
            if (Math.random() > 0.5) {
                pipe.rotation.z = Math.PI / 2;
                pipe.position = new BABYLON.Vector3(pipeX, 5, pipeZ);
            } else {
                pipe.rotation.x = Math.PI / 2;
                pipe.position = new BABYLON.Vector3(pipeX, 5, pipeZ);
            }
            
            pipe.checkCollisions = true;
            pipe.material = pipeMaterial;
            
            meshes.push(pipe);
        }
        
        return { meshes };
    }

    async createLabInterior() {
        const meshes = [];
        
        // Create walls
        const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", this.game.scene);
        wallMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        
        // North wall
        const northWall = BABYLON.MeshBuilder.CreateBox(
            "northWall",
            {width: 50, height: 10, depth: 1},
            this.game.scene
        );
        northWall.position = new BABYLON.Vector3(0, 5, 25);
        northWall.checkCollisions = true;
        northWall.material = wallMaterial;
        
        // South wall
        const southWall = BABYLON.MeshBuilder.CreateBox(
            "southWall",
            {width: 50, height: 10, depth: 1},
            this.game.scene
        );
        southWall.position = new BABYLON.Vector3(0, 5, -25);
        southWall.checkCollisions = true;
        southWall.material = wallMaterial;
        
        // East wall
        const eastWall = BABYLON.MeshBuilder.CreateBox(
            "eastWall",
            {width: 1, height: 10, depth: 50},
            this.game.scene
        );
        eastWall.position = new BABYLON.Vector3(25, 5, 0);
        eastWall.checkCollisions = true;
        eastWall.material = wallMaterial;
        
        // West wall
        const westWall = BABYLON.MeshBuilder.CreateBox(
            "westWall",
            {width: 1, height: 10, depth: 50},
            this.game.scene
        );
        westWall.position = new BABYLON.Vector3(-25, 5, 0);
        westWall.checkCollisions = true;
        westWall.material = wallMaterial;
        
        meshes.push(northWall, southWall, eastWall, westWall);
        
        // Create lab equipment
        const labMaterial = new BABYLON.StandardMaterial("labMaterial", this.game.scene);
        labMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
        
        // Create lab tables
        for (let i = 0; i < 6; i++) {
            const tableX = (i % 3 - 1) * 15;
            const tableZ = Math.floor(i / 3) * 30 - 15;
            
            const table = BABYLON.MeshBuilder.CreateBox(
                `labTable${i}`,
                {width: 8, height: 1, depth: 3},
                this.game.scene
            );
            table.position = new BABYLON.Vector3(tableX, 0.5, tableZ);
            table.checkCollisions = true;
            table.material = labMaterial;
            
            meshes.push(table);
            
            // Add some lab equipment on the table
            const equipment1 = BABYLON.MeshBuilder.CreateCylinder(
                `equipment${i}_1`,
                {diameter: 0.5, height: 1.5},
                this.game.scene
            );
            equipment1.position = new BABYLON.Vector3(tableX - 2, 1.75, tableZ);
            equipment1.material = labMaterial;
            
            const equipment2 = BABYLON.MeshBuilder.CreateBox(
                `equipment${i}_2`,
                {width: 1, height: 1, depth: 1},
                this.game.scene
            );
            equipment2.position = new BABYLON.Vector3(tableX, 1.5, tableZ);
            equipment2.material = labMaterial;
            
            const equipment3 = BABYLON.MeshBuilder.CreateSphere(
                `equipment${i}_3`,
                {diameter: 1},
                this.game.scene
            );
            equipment3.position = new BABYLON.Vector3(tableX + 2, 1.5, tableZ);
            
            const glassMaterial = new BABYLON.StandardMaterial("glassMaterial", this.game.scene);
            glassMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.7, 0.9);
            glassMaterial.alpha = 0.5;
            equipment3.material = glassMaterial;
            
            meshes.push(equipment1, equipment2, equipment3);
        }
        
        // Create some computers
        const computerMaterial = new BABYLON.StandardMaterial("computerMaterial", this.game.scene);
        computerMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        
        for (let i = 0; i < 4; i++) {
            const computerX = (i % 2 * 2 - 1) * 20;
            const computerZ = Math.floor(i / 2) * 30 - 15;
            
            const computer = BABYLON.MeshBuilder.CreateBox(
                `computer${i}`,
                {width: 2, height: 1.5, depth: 1},
                this.game.scene
            );
            computer.position = new BABYLON.Vector3(computerX, 0.75, computerZ);
            computer.checkCollisions = true;
            computer.material = computerMaterial;
            
            const screen = BABYLON.MeshBuilder.CreateBox(
                `screen${i}`,
                {width: 1.8, height: 1, depth: 0.1},
                this.game.scene
            );
            screen.position = new BABYLON.Vector3(computerX, 1.5, computerZ);
            
            const screenMaterial = new BABYLON.StandardMaterial("screenMaterial", this.game.scene);
            screenMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.6, 0.8);
            screenMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.6, 0.8);
            screen.material = screenMaterial;
            
            meshes.push(computer, screen);
        }
        
        return { meshes };
    }

    async createReactorInterior() {
        const meshes = [];
        
        // Create walls
        const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", this.game.scene);
        wallMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        
        // North wall
        const northWall = BABYLON.MeshBuilder.CreateBox(
            "northWall",
            {width: 50, height: 10, depth: 1},
            this.game.scene
        );
        northWall.position = new BABYLON.Vector3(0, 5, 25);
        northWall.checkCollisions = true;
        northWall.material = wallMaterial;
        
        // South wall
        const southWall = BABYLON.MeshBuilder.CreateBox(
            "southWall",
            {width: 50, height: 10, depth: 1},
            this.game.scene
        );
        southWall.position = new BABYLON.Vector3(0, 5, -25);
        southWall.checkCollisions = true;
        southWall.material = wallMaterial;
        
        // East wall
        const eastWall = BABYLON.MeshBuilder.CreateBox(
            "eastWall",
            {width: 1, height: 10, depth: 50},
            this.game.scene
        );
        eastWall.position = new BABYLON.Vector3(25, 5, 0);
        eastWall.checkCollisions = true;
        eastWall.material = wallMaterial;
        
        // West wall
        const westWall = BABYLON.MeshBuilder.CreateBox(
            "westWall",
            {width: 1, height: 10, depth: 50},
            this.game.scene
        );
        westWall.position = new BABYLON.Vector3(-25, 5, 0);
        westWall.checkCollisions = true;
        westWall.material = wallMaterial;
        
        meshes.push(northWall, southWall, eastWall, westWall);
        
        // Create reactor core
        const coreMaterial = new BABYLON.StandardMaterial("coreMaterial", this.game.scene);
        coreMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        
        const coreBase = BABYLON.MeshBuilder.CreateCylinder(
            "coreBase",
            {diameter: 10, height: 1},
            this.game.scene
        );
        coreBase.position = new BABYLON.Vector3(0, 0.5, 0);
        coreBase.checkCollisions = true;
        coreBase.material = coreMaterial;
        
        const coreColumn = BABYLON.MeshBuilder.CreateCylinder(
            "coreColumn",
            {diameter: 5, height: 8},
            this.game.scene
        );
        coreColumn.position = new BABYLON.Vector3(0, 4.5, 0);
        coreColumn.checkCollisions = true;
        coreColumn.material = coreMaterial;
        
        const coreTop = BABYLON.MeshBuilder.CreateCylinder(
            "coreTop",
            {diameter: 8, height: 1},
            this.game.scene
        );
        coreTop.position = new BABYLON.Vector3(0, 9, 0);
        coreTop.checkCollisions = true;
        coreTop.material = coreMaterial;
        
        meshes.push(coreBase, coreColumn, coreTop);
        
        // Create energy beam
        const beamMaterial = new BABYLON.StandardMaterial("beamMaterial", this.game.scene);
        beamMaterial.diffuseColor = new BABYLON.Color3(1, 0.3, 0);
        beamMaterial.emissiveColor = new BABYLON.Color3(1, 0.3, 0);
        beamMaterial.alpha = 0.7;
        
        const energyBeam = BABYLON.MeshBuilder.CreateCylinder(
            "energyBeam",
            {diameter: 2, height: 8},
            this.game.scene
        );
        energyBeam.position = new BABYLON.Vector3(0, 4.5, 0);
        energyBeam.material = beamMaterial;
        
        meshes.push(energyBeam);
        
        // Create some control panels
        const panelMaterial = new BABYLON.StandardMaterial("panelMaterial", this.game.scene);
        panelMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        
        for (let i = 0; i < 8; i++) {
            const angle = i * Math.PI / 4;
            const panelX = Math.cos(angle) * 15;
            const panelZ = Math.sin(angle) * 15;
            
            const panel = BABYLON.MeshBuilder.CreateBox(
                `panel${i}`,
                {width: 3, height: 1.5, depth: 1},
                this.game.scene
            );
            panel.position = new BABYLON.Vector3(panelX, 1, panelZ);
            panel.rotation.y = angle + Math.PI;
            panel.checkCollisions = true;
            panel.material = panelMaterial;
            
            const screen = BABYLON.MeshBuilder.CreateBox(
                `screen${i}`,
                {width: 2.5, height: 1, depth: 0.1},
                this.game.scene
            );
            screen.position = new BABYLON.Vector3(
                panelX + Math.cos(angle + Math.PI) * 0.5,
                1.5,
                panelZ + Math.sin(angle + Math.PI) * 0.5
            );
            screen.rotation.y = angle + Math.PI;
            
            const screenMaterial = new BABYLON.StandardMaterial(`screenMaterial${i}`, this.game.scene);
            screenMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.6, 0.1);
            screenMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.6, 0.1);
            screen.material = screenMaterial;
            
            meshes.push(panel, screen);
        }
        
        return { meshes };
    }

    async createBossArena() {
        const meshes = [];
        
        // Create walls
        const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", this.game.scene);
        wallMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        
        // North wall
        const northWall = BABYLON.MeshBuilder.CreateBox(
            "northWall",
            {width: 60, height: 15, depth: 1},
            this.game.scene
        );
        northWall.position = new BABYLON.Vector3(0, 7.5, 30);
        northWall.checkCollisions = true;
        northWall.material = wallMaterial;
        
        // South wall
        const southWall = BABYLON.MeshBuilder.CreateBox(
            "southWall",
            {width: 60, height: 15, depth: 1},
            this.game.scene
        );
        southWall.position = new BABYLON.Vector3(0, 7.5, -30);
        southWall.checkCollisions = true;
        southWall.material = wallMaterial;
        
        // East wall
        const eastWall = BABYLON.MeshBuilder.CreateBox(
            "eastWall",
            {width: 1, height: 15, depth: 60},
            this.game.scene
        );
        eastWall.position = new BABYLON.Vector3(30, 7.5, 0);
        eastWall.checkCollisions = true;
        eastWall.material = wallMaterial;
        
        // West wall
        const westWall = BABYLON.MeshBuilder.CreateBox(
            "westWall",
            {width: 1, height: 15, depth: 60},
            this.game.scene
        );
        westWall.position = new BABYLON.Vector3(-30, 7.5, 0);
        westWall.checkCollisions = true;
        westWall.material = wallMaterial;
        
        meshes.push(northWall, southWall, eastWall, westWall);
        
        // Create boss platform
        const platformMaterial = new BABYLON.StandardMaterial("platformMaterial", this.game.scene);
        platformMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        
        const bossPlatform = BABYLON.MeshBuilder.CreateCylinder(
            "bossPlatform",
            {diameter: 20, height: 1},
            this.game.scene
        );
        bossPlatform.position = new BABYLON.Vector3(0, 0.5, -15);
        bossPlatform.checkCollisions = true;
        bossPlatform.material = platformMaterial;
        
        meshes.push(bossPlatform);
        
        // Create lava pit around the platform
        const lavaMaterial = new BABYLON.StandardMaterial("lavaMaterial", this.game.scene);
        lavaMaterial.diffuseColor = new BABYLON.Color3(1, 0.3, 0);
        lavaMaterial.emissiveColor = new BABYLON.Color3(1, 0.3, 0);
        
        const lavaGround = BABYLON.MeshBuilder.CreateGround(
            "lavaGround",
            {width: 60, height: 60},
            this.game.scene
        );
        lavaGround.position = new BABYLON.Vector3(0, -0.5, 0);
        lavaGround.material = lavaMaterial;
        
        meshes.push(lavaGround);
        
        // Create safe platforms for the player
        const safePlatform1 = BABYLON.MeshBuilder.CreateBox(
            "safePlatform1",
            {width: 10, height: 1, depth: 10},
            this.game.scene
        );
        safePlatform1.position = new BABYLON.Vector3(0, 0.5, 15);
        safePlatform1.checkCollisions = true;
        safePlatform1.material = platformMaterial;
        
        const safePlatform2 = BABYLON.MeshBuilder.CreateBox(
            "safePlatform2",
            {width: 5, height: 1, depth: 5},
            this.game.scene
        );
        safePlatform2.position = new BABYLON.Vector3(15, 0.5, 0);
        safePlatform2.checkCollisions = true;
        safePlatform2.material = platformMaterial;
        
        const safePlatform3 = BABYLON.MeshBuilder.CreateBox(
            "safePlatform3",
            {width: 5, height: 1, depth: 5},
            this.game.scene
        );
        safePlatform3.position = new BABYLON.Vector3(-15, 0.5, 0);
        safePlatform3.checkCollisions = true;
        safePlatform3.material = platformMaterial;
        
        meshes.push(safePlatform1, safePlatform2, safePlatform3);
        
        // Create bridges connecting platforms
        const bridge1 = BABYLON.MeshBuilder.CreateBox(
            "bridge1",
            {width: 2, height: 1, depth: 15},
            this.game.scene
        );
        bridge1.position = new BABYLON.Vector3(0, 0.5, 0);
        bridge1.checkCollisions = true;
        bridge1.material = platformMaterial;
        
        const bridge2 = BABYLON.MeshBuilder.CreateBox(
            "bridge2",
            {width: 15, height: 1, depth: 2},
            this.game.scene
        );
        bridge2.position = new BABYLON.Vector3(7.5, 0.5, -7.5);
        bridge2.checkCollisions = true;
        bridge2.material = platformMaterial;
        
        const bridge3 = BABYLON.MeshBuilder.CreateBox(
            "bridge3",
            {width: 15, height: 1, depth: 2},
            this.game.scene
        );
        bridge3.position = new BABYLON.Vector3(-7.5, 0.5, -7.5);
        bridge3.checkCollisions = true;
        bridge3.material = platformMaterial;
        
        meshes.push(bridge1, bridge2, bridge3);
        
        // Create some decorative elements
        const decorMaterial = new BABYLON.StandardMaterial("decorMaterial", this.game.scene);
        decorMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        
        for (let i = 0; i < 4; i++) {
            const angle = i * Math.PI / 2;
            const pillarX = Math.cos(angle) * 25;
            const pillarZ = Math.sin(angle) * 25;
            
            const pillar = BABYLON.MeshBuilder.CreateCylinder(
                `pillar${i}`,
                {diameter: 2, height: 15},
                this.game.scene
            );
            pillar.position = new BABYLON.Vector3(pillarX, 7.5, pillarZ);
            pillar.checkCollisions = true;
            pillar.material = decorMaterial;
            
            meshes.push(pillar);
        }
        
        return { meshes };
    }

    createItem(type, position, amount, weaponType = null) {
        let mesh;
        let material;
        
        switch (type) {
            case 'health':
                mesh = BABYLON.MeshBuilder.CreateBox(
                    `healthPack_${Date.now()}`,
                    {width: 0.8, height: 0.8, depth: 0.8},
                    this.game.scene
                );
                material = new BABYLON.StandardMaterial(`healthMaterial_${Date.now()}`, this.game.scene);
                material.diffuseColor = new BABYLON.Color3(1, 0, 0);
                material.emissiveColor = new BABYLON.Color3(0.5, 0, 0);
                mesh.metadata = {
                    type: 'health',
                    amount: amount
                };
                break;
                
            case 'armor':
                mesh = BABYLON.MeshBuilder.CreateBox(
                    `armorPack_${Date.now()}`,
                    {width: 0.8, height: 0.8, depth: 0.8},
                    this.game.scene
                );
                material = new BABYLON.StandardMaterial(`armorMaterial_${Date.now()}`, this.game.scene);
                material.diffuseColor = new BABYLON.Color3(0, 0.7, 1);
                material.emissiveColor = new BABYLON.Color3(0, 0.3, 0.5);
                mesh.metadata = {
                    type: 'armor',
                    amount: amount
                };
                break;
                
            case 'ammo':
                mesh = BABYLON.MeshBuilder.CreateBox(
                    `ammoBox_${Date.now()}`,
                    {width: 0.6, height: 0.4, depth: 0.6},
                    this.game.scene
                );
                material = new BABYLON.StandardMaterial(`ammoMaterial_${Date.now()}`, this.game.scene);
                material.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0);
                material.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0);
                mesh.metadata = {
                    type: 'ammo',
                    weaponType: weaponType,
                    amount: amount
                };
                break;
                
            case 'weapon':
                mesh = BABYLON.MeshBuilder.CreateBox(
                    `weaponPickup_${Date.now()}`,
                    {width: 1, height: 0.5, depth: 0.5},
                    this.game.scene
                );
                material = new BABYLON.StandardMaterial(`weaponMaterial_${Date.now()}`, this.game.scene);
                material.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
                material.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
                mesh.metadata = {
                    type: 'weapon',
                    weaponType: weaponType
                };
                break;
        }
        
        if (mesh) {
            mesh.position = position;
            mesh.material = material;
            mesh.isPickable = true;
            
            // Add a simple animation to make the item float and rotate
            const animation = new BABYLON.Animation(
                `itemAnimation_${Date.now()}`,
                "position.y",
                30,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
            );
            
            const rotationAnimation = new BABYLON.Animation(
                `itemRotationAnimation_${Date.now()}`,
                "rotation.y",
                30,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
            );
            
            const keys = [];
            keys.push({ frame: 0, value: position.y });
            keys.push({ frame: 30, value: position.y + 0.3 });
            keys.push({ frame: 60, value: position.y });
            
            const rotationKeys = [];
            rotationKeys.push({ frame: 0, value: 0 });
            rotationKeys.push({ frame: 60, value: Math.PI * 2 });
            
            animation.setKeys(keys);
            rotationAnimation.setKeys(rotationKeys);
            
            mesh.animations.push(animation);
            mesh.animations.push(rotationAnimation);
            
            this.game.scene.beginAnimation(mesh, 0, 60, true);
        }
        
        return mesh;
    }

    createTrigger(name, position, size, callback) {
        // Create an invisible trigger box
        const trigger = BABYLON.MeshBuilder.CreateBox(
            name,
            {width: size.x, height: size.y, depth: size.z},
            this.game.scene
        );
        trigger.position = position;
        
        // Make it invisible and non-collidable
        trigger.isVisible = false;
        trigger.checkCollisions = false;
        
        // Store the callback in metadata
        trigger.metadata = {
            type: 'trigger',
            callback: callback,
            triggered: false
        };
        
        // Register an observer to check for player entering the trigger
        this.game.scene.registerBeforeRender(() => {
            if (trigger.metadata.triggered) return;
            
            if (this.game.playerController && this.game.playerController.camera) {
                const playerPosition = this.game.playerController.camera.position;
                
                // Check if player is inside the trigger box
                if (
                    playerPosition.x >= trigger.position.x - size.x / 2 &&
                    playerPosition.x <= trigger.position.x + size.x / 2 &&
                    playerPosition.y >= trigger.position.y - size.y / 2 &&
                    playerPosition.y <= trigger.position.y + size.y / 2 &&
                    playerPosition.z >= trigger.position.z - size.z / 2 &&
                    playerPosition.z <= trigger.position.z + size.z / 2
                ) {
                    // Mark as triggered and call the callback
                    trigger.metadata.triggered = true;
                    callback();
                }
            }
        });
        
        return trigger;
    }
}

export default LevelManager;
