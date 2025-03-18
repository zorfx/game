import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

export class EnemyManager {
    constructor(game) {
        this.game = game;
        this.enemies = [];
        this.enemyTypes = {};
        this.enemyCount = 0;
    }

    async initialize() {
        // Register enemy types
        this.registerEnemyTypes();
        
        console.log('Enemy Manager initialized');
        return Promise.resolve();
    }

    registerEnemyTypes() {
        // Define different enemy types with their properties
        this.enemyTypes = {
            'grunt': {
                name: 'Grunt',
                health: 50,
                speed: 5,
                damage: 10,
                fireRate: 1,
                range: 15,
                model: this.createGruntModel.bind(this),
                ai: this.basicEnemyAI.bind(this),
                dropChance: 0.5,
                possibleDrops: ['health', 'ammo_pistol', 'ammo_shells']
            },
            'enforcer': {
                name: 'Enforcer',
                health: 100,
                speed: 4,
                damage: 15,
                fireRate: 0.8,
                range: 20,
                model: this.createEnforcerModel.bind(this),
                ai: this.basicEnemyAI.bind(this),
                dropChance: 0.7,
                possibleDrops: ['health', 'armor', 'ammo_rifle', 'ammo_rockets']
            },
            'heavy': {
                name: 'Heavy',
                health: 200,
                speed: 3,
                damage: 25,
                fireRate: 0.5,
                range: 15,
                model: this.createHeavyModel.bind(this),
                ai: this.heavyEnemyAI.bind(this),
                dropChance: 0.9,
                possibleDrops: ['health', 'armor', 'ammo_rockets', 'ammo_cells']
            },
            'boss': {
                name: 'Boss',
                health: 1000,
                speed: 4,
                damage: 40,
                fireRate: 1.2,
                range: 30,
                model: this.createBossModel.bind(this),
                ai: this.bossAI.bind(this),
                dropChance: 1.0,
                possibleDrops: ['health', 'armor', 'ammo_rockets', 'ammo_cells', 'weapon_bfg']
            }
        };
    }

    async spawnEnemy(type, position) {
        if (!this.enemyTypes[type]) {
            console.error(`Enemy type '${type}' not found`);
            return null;
        }
        
        const enemyType = this.enemyTypes[type];
        const enemyId = `enemy_${type}_${Date.now()}_${this.enemyCount++}`;
        
        // Create enemy object
        const enemy = {
            id: enemyId,
            type: type,
            name: enemyType.name,
            health: enemyType.health,
            maxHealth: enemyType.health,
            speed: enemyType.speed,
            damage: enemyType.damage,
            fireRate: enemyType.fireRate,
            range: enemyType.range,
            position: position.clone(),
            rotation: new BABYLON.Vector3(0, 0, 0),
            velocity: new BABYLON.Vector3(0, 0, 0),
            lastFireTime: 0,
            state: 'idle',
            targetPosition: null,
            path: [],
            currentPathIndex: 0,
            meshes: [],
            isAlive: true,
            dropChance: enemyType.dropChance,
            possibleDrops: enemyType.possibleDrops
        };
        
        // Create enemy model
        const model = await enemyType.model(enemy);
        enemy.meshes = model.meshes;
        enemy.rootMesh = model.rootMesh;
        
        // Set up physics and collisions
        enemy.rootMesh.checkCollisions = true;
        enemy.rootMesh.ellipsoid = new BABYLON.Vector3(1, 1, 1);
        enemy.rootMesh.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);
        
        // Set up health bar
        this.createHealthBar(enemy);
        
        // Add AI behavior
        enemy.update = (deltaTime) => {
            if (!enemy.isAlive) return;
            
            // Update position
            enemy.position = enemy.rootMesh.position;
            
            // Update AI
            enemyType.ai(enemy, deltaTime);
            
            // Update health bar position
            this.updateHealthBarPosition(enemy);
        };
        
        // Add to enemies list
        this.enemies.push(enemy);
        
        return enemy;
    }

    createGruntModel(enemy) {
        // Create a simple model for the grunt enemy
        const meshes = [];
        
        // Body
        const body = BABYLON.MeshBuilder.CreateBox(
            `${enemy.id}_body`,
            { width: 1, height: 1.8, depth: 1 },
            this.game.scene
        );
        body.position = enemy.position.clone();
        body.position.y += 0.9;
        
        // Head
        const head = BABYLON.MeshBuilder.CreateSphere(
            `${enemy.id}_head`,
            { diameter: 0.7 },
            this.game.scene
        );
        head.position = enemy.position.clone();
        head.position.y += 1.9;
        
        // Arms
        const leftArm = BABYLON.MeshBuilder.CreateCylinder(
            `${enemy.id}_leftArm`,
            { height: 1, diameter: 0.3 },
            this.game.scene
        );
        leftArm.position = enemy.position.clone();
        leftArm.position.x -= 0.65;
        leftArm.position.y += 1.2;
        leftArm.rotation.z = Math.PI / 2;
        
        const rightArm = BABYLON.MeshBuilder.CreateCylinder(
            `${enemy.id}_rightArm`,
            { height: 1, diameter: 0.3 },
            this.game.scene
        );
        rightArm.position = enemy.position.clone();
        rightArm.position.x += 0.65;
        rightArm.position.y += 1.2;
        rightArm.rotation.z = Math.PI / 2;
        
        // Legs
        const leftLeg = BABYLON.MeshBuilder.CreateCylinder(
            `${enemy.id}_leftLeg`,
            { height: 1, diameter: 0.3 },
            this.game.scene
        );
        leftLeg.position = enemy.position.clone();
        leftLeg.position.x -= 0.3;
        leftLeg.position.y += 0.5;
        
        const rightLeg = BABYLON.MeshBuilder.CreateCylinder(
            `${enemy.id}_rightLeg`,
            { height: 1, diameter: 0.3 },
            this.game.scene
        );
        rightLeg.position = enemy.position.clone();
        rightLeg.position.x += 0.3;
        rightLeg.position.y += 0.5;
        
        // Create materials
        const bodyMaterial = new BABYLON.StandardMaterial(`${enemy.id}_bodyMaterial`, this.game.scene);
        bodyMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.2, 0.2);
        
        const headMaterial = new BABYLON.StandardMaterial(`${enemy.id}_headMaterial`, this.game.scene);
        headMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.5, 0.5);
        
        const limbMaterial = new BABYLON.StandardMaterial(`${enemy.id}_limbMaterial`, this.game.scene);
        limbMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.2, 0.2);
        
        // Apply materials
        body.material = bodyMaterial;
        head.material = headMaterial;
        leftArm.material = limbMaterial;
        rightArm.material = limbMaterial;
        leftLeg.material = limbMaterial;
        rightLeg.material = limbMaterial;
        
        // Create a parent mesh to group all parts
        const rootMesh = new BABYLON.Mesh(`${enemy.id}_root`, this.game.scene);
        rootMesh.position = enemy.position.clone();
        
        // Parent all parts to the root
        body.parent = rootMesh;
        head.parent = rootMesh;
        leftArm.parent = rootMesh;
        rightArm.parent = rootMesh;
        leftLeg.parent = rootMesh;
        rightLeg.parent = rootMesh;
        
        // Add all meshes to the array
        meshes.push(body, head, leftArm, rightArm, leftLeg, rightLeg);
        
        return { meshes, rootMesh };
    }

    createEnforcerModel(enemy) {
        // Create a model for the enforcer enemy (slightly larger and different color)
        const meshes = [];
        
        // Body
        const body = BABYLON.MeshBuilder.CreateBox(
            `${enemy.id}_body`,
            { width: 1.2, height: 2, depth: 1.2 },
            this.game.scene
        );
        body.position = enemy.position.clone();
        body.position.y += 1;
        
        // Head
        const head = BABYLON.MeshBuilder.CreateSphere(
            `${enemy.id}_head`,
            { diameter: 0.8 },
            this.game.scene
        );
        head.position = enemy.position.clone();
        head.position.y += 2.1;
        
        // Arms
        const leftArm = BABYLON.MeshBuilder.CreateCylinder(
            `${enemy.id}_leftArm`,
            { height: 1.2, diameter: 0.4 },
            this.game.scene
        );
        leftArm.position = enemy.position.clone();
        leftArm.position.x -= 0.8;
        leftArm.position.y += 1.3;
        leftArm.rotation.z = Math.PI / 2;
        
        const rightArm = BABYLON.MeshBuilder.CreateCylinder(
            `${enemy.id}_rightArm`,
            { height: 1.2, diameter: 0.4 },
            this.game.scene
        );
        rightArm.position = enemy.position.clone();
        rightArm.position.x += 0.8;
        rightArm.position.y += 1.3;
        rightArm.rotation.z = Math.PI / 2;
        
        // Weapon
        const weapon = BABYLON.MeshBuilder.CreateBox(
            `${enemy.id}_weapon`,
            { width: 0.3, height: 0.3, depth: 1.5 },
            this.game.scene
        );
        weapon.position = enemy.position.clone();
        weapon.position.x += 1.2;
        weapon.position.y += 1.3;
        weapon.position.z += 0.5;
        
        // Legs
        const leftLeg = BABYLON.MeshBuilder.CreateCylinder(
            `${enemy.id}_leftLeg`,
            { height: 1.2, diameter: 0.4 },
            this.game.scene
        );
        leftLeg.position = enemy.position.clone();
        leftLeg.position.x -= 0.4;
        leftLeg.position.y += 0.6;
        
        const rightLeg = BABYLON.MeshBuilder.CreateCylinder(
            `${enemy.id}_rightLeg`,
            { height: 1.2, diameter: 0.4 },
            this.game.scene
        );
        rightLeg.position = enemy.position.clone();
        rightLeg.position.x += 0.4;
        rightLeg.position.y += 0.6;
        
        // Create materials
        const bodyMaterial = new BABYLON.StandardMaterial(`${enemy.id}_bodyMaterial`, this.game.scene);
        bodyMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.6);
        
        const headMaterial = new BABYLON.StandardMaterial(`${enemy.id}_headMaterial`, this.game.scene);
        headMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.8);
        
        const limbMaterial = new BABYLON.StandardMaterial(`${enemy.id}_limbMaterial`, this.game.scene);
        limbMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.5);
        
        const weaponMaterial = new BABYLON.StandardMaterial(`${enemy.id}_weaponMaterial`, this.game.scene);
        weaponMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        
        // Apply materials
        body.material = bodyMaterial;
        head.material = headMaterial;
        leftArm.material = limbMaterial;
        rightArm.material = limbMaterial;
        leftLeg.material = limbMaterial;
        rightLeg.material = limbMaterial;
        weapon.material = weaponMaterial;
        
        // Create a parent mesh to group all parts
        const rootMesh = new BABYLON.Mesh(`${enemy.id}_root`, this.game.scene);
        rootMesh.position = enemy.position.clone();
        
        // Parent all parts to the root
        body.parent = rootMesh;
        head.parent = rootMesh;
        leftArm.parent = rootMesh;
        rightArm.parent = rootMesh;
        leftLeg.parent = rootMesh;
        rightLeg.parent = rootMesh;
        weapon.parent = rootMesh;
        
        // Add all meshes to the array
        meshes.push(body, head, leftArm, rightArm, leftLeg, rightLeg, weapon);
        
        return { meshes, rootMesh };
    }

    createHeavyModel(enemy) {
        // Create a model for the heavy enemy (larger and more intimidating)
        const meshes = [];
        
        // Body
        const body = BABYLON.MeshBuilder.CreateBox(
            `${enemy.id}_body`,
            { width: 2, height: 2.5, depth: 1.5 },
            this.game.scene
        );
        body.position = enemy.position.clone();
        body.position.y += 1.25;
        
        // Head
        const head = BABYLON.MeshBuilder.CreateSphere(
            `${enemy.id}_head`,
            { diameter: 1 },
            this.game.scene
        );
        head.position = enemy.position.clone();
        head.position.y += 2.7;
        
        // Shoulders
        const leftShoulder = BABYLON.MeshBuilder.CreateSphere(
            `${enemy.id}_leftShoulder`,
            { diameter: 0.8 },
            this.game.scene
        );
        leftShoulder.position = enemy.position.clone();
        leftShoulder.position.x -= 1.2;
        leftShoulder.position.y += 2;
        
        const rightShoulder = BABYLON.MeshBuilder.CreateSphere(
            `${enemy.id}_rightShoulder`,
            { diameter: 0.8 },
            this.game.scene
        );
        rightShoulder.position = enemy.position.clone();
        rightShoulder.position.x += 1.2;
        rightShoulder.position.y += 2;
        
        // Arms
        const leftArm = BABYLON.MeshBuilder.CreateCylinder(
            `${enemy.id}_leftArm`,
            { height: 1.5, diameter: 0.6 },
            this.game.scene
        );
        leftArm.position = enemy.position.clone();
        leftArm.position.x -= 1.2;
        leftArm.position.y += 1.3;
        leftArm.rotation.z = Math.PI / 2;
        
        const rightArm = BABYLON.MeshBuilder.CreateCylinder(
            `${enemy.id}_rightArm`,
            { height: 1.5, diameter: 0.6 },
            this.game.scene
        );
        rightArm.position = enemy.position.clone();
        rightArm.position.x += 1.2;
        rightArm.position.y += 1.3;
        rightArm.rotation.z = Math.PI / 2;
        
        // Weapon (heavy cannon)
        const weapon = BABYLON.MeshBuilder.CreateCylinder(
            `${enemy.id}_weapon`,
            { height: 2, diameter: 0.8, diameterTop: 0.6 },
            this.game.scene
        );
        weapon.position = enemy.position.clone();
        weapon.position.x += 1.8;
        weapon.position.y += 1.3;
        weapon.rotation.z = Math.PI / 2;
        
        // Legs
        const leftLeg = BABYLON.MeshBuilder.CreateCylinder(
            `${enemy.id}_leftLeg`,
            { height: 1.5, diameter: 0.6 },
            this.game.scene
        );
        leftLeg.position = enemy.position.clone();
        leftLeg.position.x -= 0.6;
        leftLeg.position.y += 0.75;
        
        const rightLeg = BABYLON.MeshBuilder.CreateCylinder(
            `${enemy.id}_rightLeg`,
            { height: 1.5, diameter: 0.6 },
            this.game.scene
        );
        rightLeg.position = enemy.position.clone();
        rightLeg.position.x += 0.6;
        rightLeg.position.y += 0.75;
        
        // Create materials
        const bodyMaterial = new BABYLON.StandardMaterial(`${enemy.id}_bodyMaterial`, this.game.scene);
        bodyMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.1);
        
        const headMaterial = new BABYLON.StandardMaterial(`${enemy.id}_headMaterial`, this.game.scene);
        headMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.2);
        
        const limbMaterial = new BABYLON.StandardMaterial(`${enemy.id}_limbMaterial`, this.game.scene);
        limbMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.1);
        
        const weaponMaterial = new BABYLON.StandardMaterial(`${enemy.id}_weaponMaterial`, this.game.scene);
        weaponMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        
        // Apply materials
        body.material = bodyMaterial;
        head.material = headMaterial;
        leftShoulder.material = limbMaterial;
        rightShoulder.material = limbMaterial;
        leftArm.material = limbMaterial;
        rightArm.material = limbMaterial;
        leftLeg.material = limbMaterial;
        rightLeg.material = limbMaterial;
        weapon.material = weaponMaterial;
        
        // Create a parent mesh to group all parts
        const rootMesh = new BABYLON.Mesh(`${enemy.id}_root`, this.game.scene);
        rootMesh.position = enemy.position.clone();
        
        // Parent all parts to the root
        body.parent = rootMesh;
        head.parent = rootMesh;
        leftShoulder.parent = rootMesh;
        rightShoulder.parent = rootMesh;
        leftArm.parent = rootMesh;
        rightArm.parent = rootMesh;
        leftLeg.parent = rootMesh;
        rightLeg.parent = rootMesh;
        weapon.parent = rootMesh;
        
        // Add all meshes to the array
        meshes.push(body, head, leftShoulder, rightShoulder, leftArm, rightArm, leftLeg, rightLeg, weapon);
        
        return { meshes, rootMesh };
    }

    createBossModel(enemy) {
        // Create a model for the boss enemy (large and intimidating)
        const meshes = [];
        
        // Body
        const body = BABYLON.MeshBuilder.CreateBox(
            `${enemy.id}_body`,
            { width: 3, height: 4, depth: 2 },
            this.game.scene
        );
        body.position = enemy.position.clone();
        body.position.y += 2;
        
        // Head
        const head = BABYLON.MeshBuilder.CreateBox(
            `${enemy.id}_head`,
            { width: 2, height: 1.5, depth: 1.5 },
            this.game.scene
        );
        head.position = enemy.position.clone();
        head.position.y += 4.5;
        
        // Eyes (glowing)
        const leftEye = BABYLON.MeshBuilder.CreateSphere(
            `${enemy.id}_leftEye`,
            { diameter: 0.4 },
            this.game.scene
        );
        leftEye.position = enemy.position.clone();
        leftEye.position.x -= 0.5;
        leftEye.position.y += 4.7;
        leftEye.position.z += 0.7;
        
        const rightEye = BABYLON.MeshBuilder.CreateSphere(
            `${enemy.id}_rightEye`,
            { diameter: 0.4 },
            this.game.scene
        );
        rightEye.position = enemy.position.clone();
        rightEye.position.x += 0.5;
        rightEye.position.y += 4.7;
        rightEye.position.z += 0.7;
        
        // Shoulders
        const leftShoulder = BABYLON.MeshBuilder.CreateSphere(
            `${enemy.id}_leftShoulder`,
            { diameter: 1.2 },
            this.game.scene
        );
        leftShoulder.position = enemy.position.clone();
        leftShoulder.position.x -= 1.8;
        leftShoulder.position.y += 3.2;
        
        const rightShoulder = BABYLON.MeshBuilder.CreateSphere(
            `${enemy.id}_rightShoulder`,
            { diameter: 1.2 },
            this.game.scene
        );
        rightShoulder.position = enemy.position.clone();
        rightShoulder.position.x += 1.8;
        rightShoulder.position.y += 3.2;
        
        // Arms
        const leftArm = BABYLON.MeshBuilder.CreateCylinder(
            `${enemy.id}_leftArm`,
            { height: 2.5, diameter: 0.8 },
            this.game.scene
        );
        leftArm.position = enemy.position.clone();
        leftArm.position.x -= 1.8;
        leftArm.position.y += 2;
        leftArm.rotation.z = Math.PI / 2;
        
        const rightArm = BABYLON.MeshBuilder.CreateCylinder(
            `${enemy.id}_rightArm`,
            { height: 2.5, diameter: 0.8 },
            this.game.scene
        );
        rightArm.position = enemy.position.clone();
        rightArm.position.x += 1.8;
        rightArm.position.y += 2;
        rightArm.rotation.z = Math.PI / 2;
        
        // Weapons (dual cannons)
        const leftWeapon = BABYLON.MeshBuilder.CreateCylinder(
            `${enemy.id}_leftWeapon`,
            { height: 3, diameter: 1, diameterTop: 0.7 },
            this.game.scene
        );
        leftWeapon.position = enemy.position.clone();
        leftWeapon.position.x -= 3;
        leftWeapon.position.y += 2;
        leftWeapon.rotation.z = Math.PI / 2;
        
        const rightWeapon = BABYLON.MeshBuilder.CreateCylinder(
            `${enemy.id}_rightWeapon`,
            { height: 3, diameter: 1, diameterTop: 0.7 },
            this.game.scene
        );
        rightWeapon.position = enemy.position.clone();
        rightWeapon.position.x += 3;
        rightWeapon.position.y += 2;
        rightWeapon.rotation.z = Math.PI / 2;
        
        // Legs
        const leftLeg = BABYLON.MeshBuilder.CreateCylinder(
            `${enemy.id}_leftLeg`,
            { height: 2.5, diameter: 1 },
            this.game.scene
        );
        leftLeg.position = enemy.position.clone();
        leftLeg.position.x -= 1;
        leftLeg.position.y += 1.25;
        
        const rightLeg = BABYLON.MeshBuilder.CreateCylinder(
            `${enemy.id}_rightLeg`,
            { height: 2.5, diameter: 1 },
            this.game.scene
        );
        rightLeg.position = enemy.position.clone();
        rightLeg.position.x += 1;
        rightLeg.position.y += 1.25;
        
        // Create materials
        const bodyMaterial = new BABYLON.StandardMaterial(`${enemy.id}_bodyMaterial`, this.game.scene);
        bodyMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.1, 0.3);
        
        const headMaterial = new BABYLON.StandardMaterial(`${enemy.id}_headMaterial`, this.game.scene);
        headMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.1, 0.4);
        
        const eyeMaterial = new BABYLON.StandardMaterial(`${enemy.id}_eyeMaterial`, this.game.scene);
        eyeMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        eyeMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0);
        
        const limbMaterial = new BABYLON.StandardMaterial(`${enemy.id}_limbMaterial`, this.game.scene);
        limbMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.1, 0.2);
        
        const weaponMaterial = new BABYLON.StandardMaterial(`${enemy.id}_weaponMaterial`, this.game.scene);
        weaponMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        
        // Apply materials
        body.material = bodyMaterial;
        head.material = headMaterial;
        leftEye.material = eyeMaterial;
        rightEye.material = eyeMaterial;
        leftShoulder.material = limbMaterial;
        rightShoulder.material = limbMaterial;
        leftArm.material = limbMaterial;
        rightArm.material = limbMaterial;
        leftLeg.material = limbMaterial;
        rightLeg.material = limbMaterial;
        leftWeapon.material = weaponMaterial;
        rightWeapon.material = weaponMaterial;
        
        // Create a parent mesh to group all parts
        const rootMesh = new BABYLON.Mesh(`${enemy.id}_root`, this.game.scene);
        rootMesh.position = enemy.position.clone();
        
        // Parent all parts to the root
        body.parent = rootMesh;
        head.parent = rootMesh;
        leftEye.parent = rootMesh;
        rightEye.parent = rootMesh;
        leftShoulder.parent = rootMesh;
        rightShoulder.parent = rootMesh;
        leftArm.parent = rootMesh;
        rightArm.parent = rootMesh;
        leftLeg.parent = rootMesh;
        rightLeg.parent = rootMesh;
        leftWeapon.parent = rootMesh;
        rightWeapon.parent = rootMesh;
        
        // Add all meshes to the array
        meshes.push(body, head, leftEye, rightEye, leftShoulder, rightShoulder, 
                   leftArm, rightArm, leftLeg, rightLeg, leftWeapon, rightWeapon);
        
        return { meshes, rootMesh };
    }

    createHealthBar(enemy) {
        // Create a health bar that follows the enemy
        const healthBarContainer = new GUI.Rectangle(`${enemy.id}_healthBarContainer`);
        healthBarContainer.width = "150px";
        healthBarContainer.height = "15px";
        healthBarContainer.cornerRadius = 5;
        healthBarContainer.color = "black";
        healthBarContainer.thickness = 1;
        healthBarContainer.background = "gray";
        
        const healthBar = new GUI.Rectangle(`${enemy.id}_healthBar`);
        healthBar.width = 1;
        healthBar.height = 1;
        healthBar.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        healthBar.background = "red";
        healthBar.color = "transparent";
        
        healthBarContainer.addControl(healthBar);
        
        // Create advanced dynamic texture for the health bar
        const healthBarTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI(`${enemy.id}_healthBarUI`, true, this.game.scene);
        healthBarTexture.addControl(healthBarContainer);
        
        // Store references
        enemy.healthBarContainer = healthBarContainer;
        enemy.healthBar = healthBar;
        enemy.healthBarTexture = healthBarTexture;
        
        // Initial position update
        this.updateHealthBarPosition(enemy);
    }

    updateHealthBarPosition(enemy) {
        if (!enemy.healthBarContainer || !enemy.rootMesh) return;
        
        // Get the position above the enemy in screen coordinates
        const enemyPosition = enemy.rootMesh.position.clone();
        enemyPosition.y += 3; // Position above the enemy
        
        const projectedPosition = BABYLON.Vector3.Project(
            enemyPosition,
            BABYLON.Matrix.Identity(),
            this.game.scene.getTransformMatrix(),
            this.game.camera.viewport.toGlobal(
                this.game.engine.getRenderWidth(),
                this.game.engine.getRenderHeight()
            )
        );
        
        // Update health bar position
        enemy.healthBarContainer.left = projectedPosition.x - 75 + "px";
        enemy.healthBarContainer.top = projectedPosition.y + "px";
        
        // Update health bar width based on current health
        const healthPercent = enemy.health / enemy.maxHealth;
        enemy.healthBar.width = healthPercent;
        
        // Hide health bar if enemy is too far or behind the camera
        const distance = BABYLON.Vector3.Distance(
            this.game.playerController.camera.position,
            enemy.rootMesh.position
        );
        
        const isBehindCamera = BABYLON.Vector3.Dot(
            this.game.playerController.camera.getForwardRay().direction,
            enemyPosition.subtract(this.game.playerController.camera.position).normalize()
        ) < 0;
        
        enemy.healthBarContainer.isVisible = !isBehindCamera && distance < 30 && enemy.health < enemy.maxHealth;
    }

    basicEnemyAI(enemy, deltaTime) {
        // Get player position
        const playerPosition = this.game.playerController.camera.position;
        
        // Calculate distance to player
        const distanceToPlayer = BABYLON.Vector3.Distance(
            enemy.position,
            playerPosition
        );
        
        // Check if player is in range
        if (distanceToPlayer <= enemy.range) {
            // Face the player
            const direction = playerPosition.subtract(enemy.position);
            direction.y = 0; // Keep the enemy upright
            
            if (direction.length() > 0.1) {
                const targetRotation = Math.atan2(direction.x, direction.z);
                enemy.rootMesh.rotation.y = targetRotation;
            }
            
            // If in attack range, attack
            if (distanceToPlayer <= enemy.range * 0.7) {
                enemy.state = 'attacking';
                
                // Attack if enough time has passed since last attack
                const currentTime = Date.now();
                if (currentTime - enemy.lastFireTime > 1000 / enemy.fireRate) {
                    this.enemyAttack(enemy, playerPosition);
                    enemy.lastFireTime = currentTime;
                }
                
                // If too close, back up
                if (distanceToPlayer < 5) {
                    const backupDirection = enemy.position.subtract(playerPosition).normalize();
                    enemy.velocity = backupDirection.scale(enemy.speed * 0.5);
                } else {
                    enemy.velocity = BABYLON.Vector3.Zero();
                }
            } else {
                // Move towards player
                enemy.state = 'chasing';
                const moveDirection = direction.normalize();
                enemy.velocity = moveDirection.scale(enemy.speed);
            }
        } else {
            // Patrol or idle behavior when player is out of range
            enemy.state = 'patrolling';
            
            // Simple patrol logic
            if (!enemy.targetPosition || BABYLON.Vector3.Distance(enemy.position, enemy.targetPosition) < 1) {
                // Choose a new random patrol point
                const patrolRadius = 10;
                const randomAngle = Math.random() * Math.PI * 2;
                const randomDistance = Math.random() * patrolRadius;
                
                enemy.targetPosition = new BABYLON.Vector3(
                    enemy.position.x + Math.sin(randomAngle) * randomDistance,
                    enemy.position.y,
                    enemy.position.z + Math.cos(randomAngle) * randomDistance
                );
            }
            
            // Move towards patrol point
            const patrolDirection = enemy.targetPosition.subtract(enemy.position);
            patrolDirection.y = 0;
            
            if (patrolDirection.length() > 0.1) {
                const normalizedDirection = patrolDirection.normalize();
                enemy.velocity = normalizedDirection.scale(enemy.speed * 0.5);
                
                // Face the patrol direction
                const targetRotation = Math.atan2(patrolDirection.x, patrolDirection.z);
                enemy.rootMesh.rotation.y = targetRotation;
            } else {
                enemy.velocity = BABYLON.Vector3.Zero();
            }
        }
        
        // Apply velocity to position
        if (enemy.velocity.length() > 0) {
            const moveVector = enemy.velocity.scale(deltaTime);
            
            // Simple collision detection
            const ray = new BABYLON.Ray(
                enemy.position,
                moveVector.normalize(),
                moveVector.length()
            );
            
            const hit = this.game.scene.pickWithRay(ray, (mesh) => {
                return mesh !== enemy.rootMesh && mesh.checkCollisions;
            });
            
            if (!hit.hit) {
                enemy.rootMesh.position.addInPlace(moveVector);
            } else {
                // Handle collision by sliding along the surface
                const slideDirection = moveVector.subtract(hit.getNormal().scale(BABYLON.Vector3.Dot(moveVector, hit.getNormal())));
                enemy.rootMesh.position.addInPlace(slideDirection);
            }
        }
    }

    heavyEnemyAI(enemy, deltaTime) {
        // Similar to basic AI but with more aggressive behavior and special attacks
        this.basicEnemyAI(enemy, deltaTime);
        
        // Add special attack behavior for heavy enemies
        if (enemy.state === 'attacking') {
            const currentTime = Date.now();
            
            // Special attack every 5 seconds
            if (currentTime - enemy.lastFireTime > 5000) {
                this.enemySpecialAttack(enemy);
                enemy.lastFireTime = currentTime;
            }
        }
    }

    bossAI(enemy, deltaTime) {
        // Get player position
        const playerPosition = this.game.playerController.camera.position;
        
        // Calculate distance to player
        const distanceToPlayer = BABYLON.Vector3.Distance(
            enemy.position,
            playerPosition
        );
        
        // Boss has different phases based on health
        const healthPercent = enemy.health / enemy.maxHealth;
        
        // Phase determination
        let phase = 1;
        if (healthPercent < 0.3) {
            phase = 3; // Rage phase
        } else if (healthPercent < 0.7) {
            phase = 2; // Aggressive phase
        }
        
        // Always face the player
        const direction = playerPosition.subtract(enemy.position);
        direction.y = 0; // Keep the boss upright
        
        if (direction.length() > 0.1) {
            const targetRotation = Math.atan2(direction.x, direction.z);
            enemy.rootMesh.rotation.y = targetRotation;
        }
        
        // Attack behavior based on phase
        const currentTime = Date.now();
        
        switch (phase) {
            case 1: // Normal phase
                if (distanceToPlayer <= enemy.range) {
                    enemy.state = 'attacking';
                    
                    // Regular attacks
                    if (currentTime - enemy.lastFireTime > 1000 / enemy.fireRate) {
                        this.enemyAttack(enemy, playerPosition);
                        enemy.lastFireTime = currentTime;
                    }
                    
                    // Maintain distance
                    if (distanceToPlayer < 10) {
                        const backupDirection = enemy.position.subtract(playerPosition).normalize();
                        enemy.velocity = backupDirection.scale(enemy.speed * 0.7);
                    } else if (distanceToPlayer > 20) {
                        const approachDirection = direction.normalize();
                        enemy.velocity = approachDirection.scale(enemy.speed * 0.7);
                    } else {
                        // Strafe
                        const strafeDirection = new BABYLON.Vector3(
                            direction.z,
                            0,
                            -direction.x
                        ).normalize();
                        
                        // Randomly change strafe direction
                        if (Math.random() < 0.01) {
                            enemy.strafeMultiplier = -enemy.strafeMultiplier || 1;
                        }
                        
                        enemy.velocity = strafeDirection.scale(enemy.speed * 0.5 * (enemy.strafeMultiplier || 1));
                    }
                }
                break;
                
            case 2: // Aggressive phase
                if (distanceToPlayer <= enemy.range * 1.2) {
                    enemy.state = 'aggressive';
                    
                    // More frequent attacks
                    if (currentTime - enemy.lastFireTime > 800 / enemy.fireRate) {
                        this.enemyAttack(enemy, playerPosition);
                        enemy.lastFireTime = currentTime;
                    }
                    
                    // Special attack every 4 seconds
                    if (currentTime % 4000 < 100) {
                        this.enemySpecialAttack(enemy);
                    }
                    
                    // More aggressive movement
                    if (distanceToPlayer > 15) {
                        const approachDirection = direction.normalize();
                        enemy.velocity = approachDirection.scale(enemy.speed);
                    } else {
                        // Strafe more quickly
                        const strafeDirection = new BABYLON.Vector3(
                            direction.z,
                            0,
                            -direction.x
                        ).normalize();
                        
                        // Randomly change strafe direction
                        if (Math.random() < 0.02) {
                            enemy.strafeMultiplier = -enemy.strafeMultiplier || 1;
                        }
                        
                        enemy.velocity = strafeDirection.scale(enemy.speed * 0.8 * (enemy.strafeMultiplier || 1));
                    }
                }
                break;
                
            case 3: // Rage phase
                enemy.state = 'rage';
                
                // Very frequent attacks
                if (currentTime - enemy.lastFireTime > 500 / enemy.fireRate) {
                    this.enemyAttack(enemy, playerPosition);
                    enemy.lastFireTime = currentTime;
                }
                
                // Special attack every 3 seconds
                if (currentTime % 3000 < 100) {
                    this.enemySpecialAttack(enemy);
                }
                
                // Charge at player
                if (distanceToPlayer > 8) {
                    const chargeDirection = direction.normalize();
                    enemy.velocity = chargeDirection.scale(enemy.speed * 1.5);
                } else {
                    // Quick strafe when close
                    const strafeDirection = new BABYLON.Vector3(
                        direction.z,
                        0,
                        -direction.x
                    ).normalize();
                    
                    // Randomly change strafe direction
                    if (Math.random() < 0.05) {
                        enemy.strafeMultiplier = -enemy.strafeMultiplier || 1;
                    }
                    
                    enemy.velocity = strafeDirection.scale(enemy.speed * (enemy.strafeMultiplier || 1));
                }
                break;
        }
        
        // Apply velocity to position
        if (enemy.velocity && enemy.velocity.length() > 0) {
            const moveVector = enemy.velocity.scale(deltaTime);
            
            // Simple collision detection
            const ray = new BABYLON.Ray(
                enemy.position,
                moveVector.normalize(),
                moveVector.length()
            );
            
            const hit = this.game.scene.pickWithRay(ray, (mesh) => {
                return mesh !== enemy.rootMesh && mesh.checkCollisions;
            });
            
            if (!hit.hit) {
                enemy.rootMesh.position.addInPlace(moveVector);
            } else {
                // Handle collision by sliding along the surface
                const slideDirection = moveVector.subtract(hit.getNormal().scale(BABYLON.Vector3.Dot(moveVector, hit.getNormal())));
                enemy.rootMesh.position.addInPlace(slideDirection);
            }
        }
    }

    enemyAttack(enemy, targetPosition) {
        // Create a projectile or perform a hitscan attack
        const attackOrigin = enemy.position.clone();
        attackOrigin.y += 1.5; // Adjust to fire from appropriate height
        
        // Direction to target
        const direction = targetPosition.subtract(attackOrigin).normalize();
        
        // Add some inaccuracy based on enemy type
        let inaccuracy = 0.1;
        if (enemy.type === 'grunt') inaccuracy = 0.2;
        if (enemy.type === 'enforcer') inaccuracy = 0.1;
        if (enemy.type === 'heavy') inaccuracy = 0.15;
        if (enemy.type === 'boss') inaccuracy = 0.05;
        
        const randomOffset = new BABYLON.Vector3(
            (Math.random() - 0.5) * inaccuracy,
            (Math.random() - 0.5) * inaccuracy,
            (Math.random() - 0.5) * inaccuracy
        );
        
        const finalDirection = direction.add(randomOffset).normalize();
        
        // Determine attack type based on enemy
        if (enemy.type === 'grunt' || enemy.type === 'enforcer') {
            // Hitscan attack (instant bullet)
            this.performHitscanAttack(enemy, attackOrigin, finalDirection);
        } else {
            // Projectile attack
            this.createEnemyProjectile(enemy, attackOrigin, finalDirection);
        }
        
        // Play attack sound
        if (this.game.audioManager) {
            const soundName = enemy.type === 'boss' ? 'boss_attack' : 'enemy_attack';
            this.game.audioManager.playSound(soundName);
        }
        
        // Create muzzle flash effect
        if (this.game.weaponEffects) {
            let weaponType = 'pistol';
            if (enemy.type === 'enforcer') weaponType = 'rifle';
            if (enemy.type === 'heavy') weaponType = 'plasma';
            if (enemy.type === 'boss') weaponType = 'bfg';
            
            this.game.weaponEffects.createMuzzleFlash(weaponType, attackOrigin);
        }
    }

    enemySpecialAttack(enemy) {
        // Special attack based on enemy type
        const attackOrigin = enemy.position.clone();
        attackOrigin.y += 1.5;
        
        if (enemy.type === 'heavy') {
            // Heavy enemy fires multiple projectiles in a spread
            for (let i = 0; i < 5; i++) {
                const angle = (i - 2) * Math.PI / 10;
                const direction = new BABYLON.Vector3(
                    Math.sin(angle + enemy.rootMesh.rotation.y),
                    0,
                    Math.cos(angle + enemy.rootMesh.rotation.y)
                );
                
                this.createEnemyProjectile(enemy, attackOrigin, direction);
            }
            
            // Play special attack sound
            if (this.game.audioManager) {
                this.game.audioManager.playSound('heavy_special');
            }
        } else if (enemy.type === 'boss') {
            // Boss has different special attacks based on health
            const healthPercent = enemy.health / enemy.maxHealth;
            
            if (healthPercent < 0.3) {
                // Rage phase: create a large explosion around the boss
                this.createBossExplosion(enemy, 15);
            } else if (healthPercent < 0.7) {
                // Aggressive phase: fire projectiles in all directions
                for (let i = 0; i < 8; i++) {
                    const angle = i * Math.PI / 4;
                    const direction = new BABYLON.Vector3(
                        Math.sin(angle),
                        0,
                        Math.cos(angle)
                    );
                    
                    this.createEnemyProjectile(enemy, attackOrigin, direction, 'bfg');
                }
            } else {
                // Normal phase: fire a powerful projectile
                const playerPosition = this.game.playerController.camera.position;
                const direction = playerPosition.subtract(attackOrigin).normalize();
                
                this.createEnemyProjectile(enemy, attackOrigin, direction, 'plasma');
            }
            
            // Play boss special attack sound
            if (this.game.audioManager) {
                this.game.audioManager.playSound('boss_special');
            }
        }
    }

    performHitscanAttack(enemy, origin, direction) {
        // Create a ray for the attack
        const ray = new BABYLON.Ray(origin, direction, 100);
        
        // Visualize the ray (for debugging)
        // BABYLON.RayHelper.CreateAndShow(ray, this.game.scene, new BABYLON.Color3(1, 0, 0));
        
        // Check for hit
        const hit = this.game.scene.pickWithRay(ray, (mesh) => {
            // Don't hit the enemy itself or other enemies
            return mesh !== enemy.rootMesh && !mesh.name.includes('enemy');
        });
        
        if (hit.hit) {
            // Check if we hit the player
            if (hit.pickedMesh && hit.pickedMesh.name === 'player') {
                // Damage player
                if (this.game.playerController) {
                    this.game.playerController.takeDamage(enemy.damage);
                }
                
                // Create impact effect
                if (this.game.weaponEffects) {
                    this.game.weaponEffects.createImpactEffect(
                        hit.pickedPoint,
                        hit.getNormal(),
                        'blood'
                    );
                }
            } else {
                // Hit something else
                if (this.game.weaponEffects) {
                    this.game.weaponEffects.createImpactEffect(
                        hit.pickedPoint,
                        hit.getNormal()
                    );
                }
            }
        }
    }

    createEnemyProjectile(enemy, origin, direction, type = 'standard') {
        // Create a projectile mesh
        let projectile;
        let speed = 15;
        let damage = enemy.damage;
        let radius = 0.2;
        
        if (type === 'plasma') {
            projectile = BABYLON.MeshBuilder.CreateSphere(
                `projectile_${Date.now()}`,
                { diameter: 0.5 },
                this.game.scene
            );
            
            const material = new BABYLON.StandardMaterial(`projectileMaterial_${Date.now()}`, this.game.scene);
            material.emissiveColor = new BABYLON.Color3(0, 1, 1);
            material.diffuseColor = new BABYLON.Color3(0, 0.8, 1);
            projectile.material = material;
            
            speed = 20;
            damage = enemy.damage * 1.5;
            radius = 0.25;
        } else if (type === 'bfg') {
            projectile = BABYLON.MeshBuilder.CreateSphere(
                `projectile_${Date.now()}`,
                { diameter: 1 },
                this.game.scene
            );
            
            const material = new BABYLON.StandardMaterial(`projectileMaterial_${Date.now()}`, this.game.scene);
            material.emissiveColor = new BABYLON.Color3(0, 1, 0);
            material.diffuseColor = new BABYLON.Color3(0.5, 1, 0);
            projectile.material = material;
            
            speed = 15;
            damage = enemy.damage * 3;
            radius = 0.5;
        } else {
            projectile = BABYLON.MeshBuilder.CreateSphere(
                `projectile_${Date.now()}`,
                { diameter: 0.4 },
                this.game.scene
            );
            
            const material = new BABYLON.StandardMaterial(`projectileMaterial_${Date.now()}`, this.game.scene);
            material.emissiveColor = new BABYLON.Color3(1, 0.5, 0);
            material.diffuseColor = new BABYLON.Color3(1, 0.2, 0);
            projectile.material = material;
        }
        
        projectile.position = origin.clone();
        
        // Add a light to the projectile
        const light = new BABYLON.PointLight(
            `projectileLight_${Date.now()}`,
            origin.clone(),
            this.game.scene
        );
        
        if (type === 'plasma') {
            light.diffuse = new BABYLON.Color3(0, 1, 1);
        } else if (type === 'bfg') {
            light.diffuse = new BABYLON.Color3(0, 1, 0);
        } else {
            light.diffuse = new BABYLON.Color3(1, 0.5, 0);
        }
        
        light.intensity = 0.5;
        light.range = 3;
        
        // Parent the light to the projectile
        light.parent = projectile;
        
        // Create a trail effect
        let trail;
        if (this.game.weaponEffects) {
            if (type === 'plasma') {
                trail = this.game.weaponEffects.createProjectileTrail(projectile, 'plasma');
            } else if (type === 'bfg') {
                trail = this.game.weaponEffects.createProjectileTrail(projectile, 'bfg');
            } else {
                trail = this.game.weaponEffects.createProjectileTrail(projectile, 'rocket');
            }
        }
        
        // Store projectile properties
        projectile.metadata = {
            type: 'enemyProjectile',
            damage: damage,
            speed: speed,
            direction: direction.clone(),
            origin: origin.clone(),
            owner: enemy,
            light: light,
            trail: trail,
            explosionRadius: type === 'bfg' ? 5 : (type === 'plasma' ? 3 : 2),
            explosionType: type
        };
        
        // Register an observer to update the projectile
        const observer = this.game.scene.onBeforeRenderObservable.add(() => {
            if (!projectile.isDisposed()) {
                // Move the projectile
                const delta = this.game.engine.getDeltaTime() / 1000;
                const movement = direction.scale(speed * delta);
                projectile.position.addInPlace(movement);
                
                // Check for collisions
                const ray = new BABYLON.Ray(
                    projectile.position.subtract(movement),
                    direction,
                    movement.length()
                );
                
                const hit = this.game.scene.pickWithRay(ray, (mesh) => {
                    // Don't hit the owner or other enemies
                    return mesh !== enemy.rootMesh && !mesh.name.includes('enemy');
                });
                
                if (hit.hit) {
                    // Handle hit
                    this.handleProjectileHit(projectile, hit);
                }
                
                // Check if projectile has traveled too far
                const distanceTraveled = BABYLON.Vector3.Distance(
                    projectile.position,
                    projectile.metadata.origin
                );
                
                if (distanceTraveled > 100) {
                    this.disposeProjectile(projectile);
                    this.game.scene.onBeforeRenderObservable.remove(observer);
                }
            } else {
                // Projectile has been disposed, remove the observer
                this.game.scene.onBeforeRenderObservable.remove(observer);
            }
        });
        
        return projectile;
    }

    handleProjectileHit(projectile, hit) {
        if (!projectile || projectile.isDisposed()) return;
        
        // Check if we hit the player
        if (hit.pickedMesh && hit.pickedMesh.name === 'player') {
            // Damage player
            if (this.game.playerController) {
                this.game.playerController.takeDamage(projectile.metadata.damage);
            }
        }
        
        // Create explosion effect
        if (this.game.weaponEffects) {
            if (projectile.metadata.explosionRadius > 0) {
                this.game.weaponEffects.createExplosionEffect(
                    hit.pickedPoint,
                    projectile.metadata.explosionRadius,
                    projectile.metadata.explosionType
                );
                
                // Apply explosion damage to nearby objects
                this.applyExplosionDamage(
                    hit.pickedPoint,
                    projectile.metadata.explosionRadius,
                    projectile.metadata.damage,
                    projectile.metadata.owner
                );
            } else {
                // Just create an impact effect
                this.game.weaponEffects.createImpactEffect(
                    hit.pickedPoint,
                    hit.getNormal(),
                    hit.pickedMesh && hit.pickedMesh.name === 'player' ? 'blood' : 'standard'
                );
            }
        }
        
        // Play explosion sound
        if (this.game.audioManager) {
            const soundName = projectile.metadata.explosionRadius > 0 ? 'explosion' : 'impact';
            this.game.audioManager.playSound(soundName);
        }
        
        // Dispose of the projectile
        this.disposeProjectile(projectile);
    }

    applyExplosionDamage(position, radius, damage, owner) {
        // Check for player in explosion radius
        const playerPosition = this.game.playerController.camera.position;
        const distanceToPlayer = BABYLON.Vector3.Distance(position, playerPosition);
        
        if (distanceToPlayer <= radius) {
            // Calculate damage based on distance (more damage closer to explosion center)
            const damageMultiplier = 1 - (distanceToPlayer / radius);
            const finalDamage = damage * damageMultiplier;
            
            // Apply damage to player
            this.game.playerController.takeDamage(finalDamage);
        }
        
        // Check for enemies in explosion radius (for friendly fire)
        this.enemies.forEach(enemy => {
            if (enemy !== owner && enemy.isAlive) {
                const distanceToEnemy = BABYLON.Vector3.Distance(position, enemy.position);
                
                if (distanceToEnemy <= radius) {
                    // Calculate damage based on distance
                    const damageMultiplier = 1 - (distanceToEnemy / radius);
                    const finalDamage = damage * damageMultiplier * 0.5; // Reduced friendly fire damage
                    
                    // Apply damage to enemy
                    this.damageEnemy(enemy, finalDamage);
                }
            }
        });
    }

    disposeProjectile(projectile) {
        if (!projectile || projectile.isDisposed()) return;
        
        // Dispose of the light
        if (projectile.metadata && projectile.metadata.light) {
            projectile.metadata.light.dispose();
        }
        
        // Dispose of the trail
        if (projectile.metadata && projectile.metadata.trail) {
            // Trail is handled by the weapon effects system
        }
        
        // Dispose of the projectile
        projectile.dispose();
    }

    createBossExplosion(enemy, radius) {
        // Create a large explosion around the boss
        if (this.game.weaponEffects) {
            this.game.weaponEffects.createExplosionEffect(
                enemy.position,
                radius,
                'bfg'
            );
        }
        
        // Apply damage to player if in range
        const playerPosition = this.game.playerController.camera.position;
        const distanceToPlayer = BABYLON.Vector3.Distance(enemy.position, playerPosition);
        
        if (distanceToPlayer <= radius) {
            // Calculate damage based on distance
            const damageMultiplier = 1 - (distanceToPlayer / radius);
            const finalDamage = enemy.damage * 2 * damageMultiplier;
            
            // Apply damage to player
            this.game.playerController.takeDamage(finalDamage);
        }
        
        // Play explosion sound
        if (this.game.audioManager) {
            this.game.audioManager.playSound('boss_explosion');
        }
    }

    damageEnemy(enemy, damage) {
        if (!enemy || !enemy.isAlive) return;
        
        // Apply damage
        enemy.health -= damage;
        
        // Update health bar
        if (enemy.healthBar) {
            const healthPercent = enemy.health / enemy.maxHealth;
            enemy.healthBar.width = Math.max(0, healthPercent);
        }
        
        // Check if enemy is defeated
        if (enemy.health <= 0) {
            this.killEnemy(enemy);
        } else {
            // Play hit sound
            if (this.game.audioManager) {
                this.game.audioManager.playSound('enemy_hit');
            }
        }
    }

    killEnemy(enemy) {
        if (!enemy || !enemy.isAlive) return;
        
        console.log(`Enemy ${enemy.id} killed`);
        
        // Mark as not alive
        enemy.isAlive = false;
        
        // Create death effect
        if (this.game.weaponEffects) {
            this.game.weaponEffects.createImpactEffect(
                enemy.position.clone(),
                new BABYLON.Vector3(0, 1, 0),
                'blood'
            );
        }
        
        // Play death sound
        if (this.game.audioManager) {
            const soundName = enemy.type === 'boss' ? 'boss_death' : 'enemy_death';
            this.game.audioManager.playSound(soundName);
        }
        
        // Drop items based on chance
        if (Math.random() < enemy.dropChance) {
            this.dropItem(enemy);
        }
        
        // Remove health bar
        if (enemy.healthBarContainer) {
            enemy.healthBarContainer.dispose();
        }
        
        // Dispose of meshes with a fade effect
        if (enemy.meshes) {
            enemy.meshes.forEach(mesh => {
                if (mesh && mesh.material) {
                    // Create animation to fade out
                    const fadeAnimation = new BABYLON.Animation(
                        `fadeAnimation_${enemy.id}`,
                        "material.alpha",
                        30,
                        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
                    );
                    
                    const keys = [];
                    keys.push({ frame: 0, value: 1 });
                    keys.push({ frame: 30, value: 0 });
                    
                    fadeAnimation.setKeys(keys);
                    
                    mesh.material.alpha = 1;
                    mesh.material.animations = [fadeAnimation];
                    
                    this.game.scene.beginAnimation(mesh.material, 0, 30, false, 1, () => {
                        if (mesh && !mesh.isDisposed()) {
                            mesh.dispose();
                        }
                    });
                }
            });
        }
        
        // Remove from enemies array after a delay
        setTimeout(() => {
            const index = this.enemies.indexOf(enemy);
            if (index !== -1) {
                this.enemies.splice(index, 1);
            }
        }, 1000);
        
        // If this was a boss, trigger level completion
        if (enemy.type === 'boss') {
            // Find the level completion trigger and activate it
            const completionTrigger = this.game.scene.getMeshByName('level5_completion');
            if (completionTrigger && completionTrigger.metadata && completionTrigger.metadata.callback) {
                completionTrigger.metadata.callback();
            }
        }
    }

    dropItem(enemy) {
        if (!enemy.possibleDrops || enemy.possibleDrops.length === 0) return;
        
        // Choose a random item to drop
        const itemType = enemy.possibleDrops[Math.floor(Math.random() * enemy.possibleDrops.length)];
        
        // Determine item properties
        let type, amount, weaponType;
        
        if (itemType.startsWith('ammo_')) {
            type = 'ammo';
            weaponType = itemType.replace('ammo_', '');
            amount = 10 + Math.floor(Math.random() * 20);
        } else if (itemType.startsWith('weapon_')) {
            type = 'weapon';
            weaponType = itemType.replace('weapon_', '');
        } else if (itemType === 'health') {
            type = 'health';
            amount = 15 + Math.floor(Math.random() * 15);
        } else if (itemType === 'armor') {
            type = 'armor';
            amount = 15 + Math.floor(Math.random() * 15);
        }
        
        // Create the item
        if (this.game.levelManager) {
            const dropPosition = enemy.position.clone();
            dropPosition.y = 0.5; // Place on ground
            
            this.game.levelManager.createItem(type, dropPosition, amount, weaponType);
        }
    }

    update(deltaTime) {
        // Update all enemies
        this.enemies.forEach(enemy => {
            if (enemy.update) {
                enemy.update(deltaTime);
            }
        });
    }

    clearEnemies() {
        // Dispose of all enemies
        this.enemies.forEach(enemy => {
            if (enemy.healthBarContainer) {
                enemy.healthBarContainer.dispose();
            }
            
            if (enemy.meshes) {
                enemy.meshes.forEach(mesh => {
                    if (mesh && !mesh.isDisposed()) {
                        mesh.dispose();
                    }
                });
            }
        });
        
        // Clear the array
        this.enemies = [];
    }
}

export default EnemyManager;
