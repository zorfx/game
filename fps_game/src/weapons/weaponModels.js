import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

export class WeaponModels {
    constructor(game) {
        this.game = game;
        this.models = {};
        this.animations = {};
    }

    async initialize() {
        // Load weapon models
        await this.loadWeaponModels();
        
        // Create animations
        this.createWeaponAnimations();
        
        console.log('Weapon Models initialized');
        return Promise.resolve();
    }

    async loadWeaponModels() {
        // In a real implementation, we would load actual 3D models
        // For now, we'll create primitive shapes as placeholders
        
        // Pistol
        this.models.pistol = this.createPistolModel();
        
        // Shotgun
        this.models.shotgun = this.createShotgunModel();
        
        // Assault Rifle
        this.models.rifle = this.createRifleModel();
        
        // Sniper Rifle
        this.models.sniper = this.createSniperModel();
        
        // Rocket Launcher
        this.models.rocket = this.createRocketLauncherModel();
        
        // Plasma Gun
        this.models.plasma = this.createPlasmaGunModel();
        
        // BFG
        this.models.bfg = this.createBFGModel();
        
        // Hide all models initially
        Object.values(this.models).forEach(model => {
            model.setEnabled(false);
        });
    }

    createPistolModel() {
        const pistol = new BABYLON.TransformNode("pistolNode", this.game.scene);
        
        // Main body
        const body = BABYLON.MeshBuilder.CreateBox("pistolBody", {width: 0.1, height: 0.15, depth: 0.25}, this.game.scene);
        body.parent = pistol;
        body.position.y = -0.05;
        
        // Barrel
        const barrel = BABYLON.MeshBuilder.CreateCylinder("pistolBarrel", {diameter: 0.05, height: 0.2}, this.game.scene);
        barrel.parent = pistol;
        barrel.position.z = 0.2;
        barrel.rotation.x = Math.PI / 2;
        
        // Handle
        const handle = BABYLON.MeshBuilder.CreateBox("pistolHandle", {width: 0.08, height: 0.2, depth: 0.1}, this.game.scene);
        handle.parent = pistol;
        handle.position.y = -0.15;
        handle.position.z = -0.05;
        
        // Trigger
        const trigger = BABYLON.MeshBuilder.CreateBox("pistolTrigger", {width: 0.03, height: 0.05, depth: 0.05}, this.game.scene);
        trigger.parent = pistol;
        trigger.position.y = -0.05;
        trigger.position.z = -0.05;
        
        // Create materials
        const bodyMaterial = new BABYLON.StandardMaterial("pistolBodyMaterial", this.game.scene);
        bodyMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        bodyMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        body.material = bodyMaterial;
        barrel.material = bodyMaterial;
        
        const handleMaterial = new BABYLON.StandardMaterial("pistolHandleMaterial", this.game.scene);
        handleMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        handle.material = handleMaterial;
        trigger.material = handleMaterial;
        
        // Create muzzle flash point
        const muzzlePoint = new BABYLON.TransformNode("pistolMuzzlePoint", this.game.scene);
        muzzlePoint.parent = pistol;
        muzzlePoint.position = new BABYLON.Vector3(0, 0, 0.3);
        
        return pistol;
    }

    createShotgunModel() {
        const shotgun = new BABYLON.TransformNode("shotgunNode", this.game.scene);
        
        // Main body
        const body = BABYLON.MeshBuilder.CreateBox("shotgunBody", {width: 0.12, height: 0.12, depth: 0.6}, this.game.scene);
        body.parent = shotgun;
        
        // Barrel
        const barrel = BABYLON.MeshBuilder.CreateCylinder("shotgunBarrel", {diameter: 0.08, height: 0.7}, this.game.scene);
        barrel.parent = shotgun;
        barrel.position.z = 0.35;
        barrel.rotation.x = Math.PI / 2;
        
        // Handle
        const handle = BABYLON.MeshBuilder.CreateBox("shotgunHandle", {width: 0.08, height: 0.25, depth: 0.1}, this.game.scene);
        handle.parent = shotgun;
        handle.position.y = -0.15;
        handle.position.z = -0.15;
        
        // Pump
        const pump = BABYLON.MeshBuilder.CreateBox("shotgunPump", {width: 0.15, height: 0.1, depth: 0.15}, this.game.scene);
        pump.parent = shotgun;
        pump.position.z = 0.1;
        pump.position.y = -0.1;
        
        // Create materials
        const bodyMaterial = new BABYLON.StandardMaterial("shotgunBodyMaterial", this.game.scene);
        bodyMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.3, 0.1); // Wood color
        body.material = bodyMaterial;
        handle.material = bodyMaterial;
        
        const metalMaterial = new BABYLON.StandardMaterial("shotgunMetalMaterial", this.game.scene);
        metalMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        metalMaterial.specularColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        barrel.material = metalMaterial;
        pump.material = metalMaterial;
        
        // Create muzzle flash point
        const muzzlePoint = new BABYLON.TransformNode("shotgunMuzzlePoint", this.game.scene);
        muzzlePoint.parent = shotgun;
        muzzlePoint.position = new BABYLON.Vector3(0, 0, 0.7);
        
        return shotgun;
    }

    createRifleModel() {
        const rifle = new BABYLON.TransformNode("rifleNode", this.game.scene);
        
        // Main body
        const body = BABYLON.MeshBuilder.CreateBox("rifleBody", {width: 0.1, height: 0.15, depth: 0.8}, this.game.scene);
        body.parent = rifle;
        
        // Barrel
        const barrel = BABYLON.MeshBuilder.CreateCylinder("rifleBarrel", {diameter: 0.05, height: 0.4}, this.game.scene);
        barrel.parent = rifle;
        barrel.position.z = 0.5;
        barrel.rotation.x = Math.PI / 2;
        
        // Handle
        const handle = BABYLON.MeshBuilder.CreateBox("rifleHandle", {width: 0.08, height: 0.2, depth: 0.1}, this.game.scene);
        handle.parent = rifle;
        handle.position.y = -0.15;
        handle.position.z = -0.2;
        
        // Magazine
        const magazine = BABYLON.MeshBuilder.CreateBox("rifleMagazine", {width: 0.08, height: 0.2, depth: 0.05}, this.game.scene);
        magazine.parent = rifle;
        magazine.position.y = -0.15;
        magazine.position.z = 0;
        
        // Stock
        const stock = BABYLON.MeshBuilder.CreateBox("rifleStock", {width: 0.08, height: 0.15, depth: 0.3}, this.game.scene);
        stock.parent = rifle;
        stock.position.z = -0.4;
        
        // Create materials
        const bodyMaterial = new BABYLON.StandardMaterial("rifleBodyMaterial", this.game.scene);
        bodyMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        bodyMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        body.material = bodyMaterial;
        barrel.material = bodyMaterial;
        
        const handleMaterial = new BABYLON.StandardMaterial("rifleHandleMaterial", this.game.scene);
        handleMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        handle.material = handleMaterial;
        magazine.material = handleMaterial;
        stock.material = handleMaterial;
        
        // Create muzzle flash point
        const muzzlePoint = new BABYLON.TransformNode("rifleMuzzlePoint", this.game.scene);
        muzzlePoint.parent = rifle;
        muzzlePoint.position = new BABYLON.Vector3(0, 0, 0.7);
        
        return rifle;
    }

    createSniperModel() {
        const sniper = new BABYLON.TransformNode("sniperNode", this.game.scene);
        
        // Main body
        const body = BABYLON.MeshBuilder.CreateBox("sniperBody", {width: 0.1, height: 0.15, depth: 1.0}, this.game.scene);
        body.parent = sniper;
        
        // Barrel
        const barrel = BABYLON.MeshBuilder.CreateCylinder("sniperBarrel", {diameter: 0.05, height: 0.6}, this.game.scene);
        barrel.parent = sniper;
        barrel.position.z = 0.6;
        barrel.rotation.x = Math.PI / 2;
        
        // Handle
        const handle = BABYLON.MeshBuilder.CreateBox("sniperHandle", {width: 0.08, height: 0.2, depth: 0.1}, this.game.scene);
        handle.parent = sniper;
        handle.position.y = -0.15;
        handle.position.z = -0.2;
        
        // Stock
        const stock = BABYLON.MeshBuilder.CreateBox("sniperStock", {width: 0.08, height: 0.15, depth: 0.4}, this.game.scene);
        stock.parent = sniper;
        stock.position.z = -0.5;
        
        // Scope
        const scope = BABYLON.MeshBuilder.CreateCylinder("sniperScope", {diameter: 0.08, height: 0.25}, this.game.scene);
        scope.parent = sniper;
        scope.position.y = 0.1;
        scope.position.z = 0.1;
        
        // Create materials
        const bodyMaterial = new BABYLON.StandardMaterial("sniperBodyMaterial", this.game.scene);
        bodyMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        bodyMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        body.material = bodyMaterial;
        barrel.material = bodyMaterial;
        
        const handleMaterial = new BABYLON.StandardMaterial("sniperHandleMaterial", this.game.scene);
        handleMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        handle.material = handleMaterial;
        stock.material = handleMaterial;
        
        const scopeMaterial = new BABYLON.StandardMaterial("sniperScopeMaterial", this.game.scene);
        scopeMaterial.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.05);
        scopeMaterial.specularColor = new BABYLON.Color3(0.9, 0.9, 0.9);
        scope.material = scopeMaterial;
        
        // Create muzzle flash point
        const muzzlePoint = new BABYLON.TransformNode("sniperMuzzlePoint", this.game.scene);
        muzzlePoint.parent = sniper;
        muzzlePoint.position = new BABYLON.Vector3(0, 0, 0.9);
        
        return sniper;
    }

    createRocketLauncherModel() {
        const rocketLauncher = new BABYLON.TransformNode("rocketLauncherNode", this.game.scene);
        
        // Main tube
        const tube = BABYLON.MeshBuilder.CreateCylinder("rocketTube", {diameter: 0.15, height: 0.9}, this.game.scene);
        tube.parent = rocketLauncher;
        tube.rotation.x = Math.PI / 2;
        
        // Handle
        const handle = BABYLON.MeshBuilder.CreateBox("rocketHandle", {width: 0.08, height: 0.2, depth: 0.1}, this.game.scene);
        handle.parent = rocketLauncher;
        handle.position.y = -0.15;
        handle.position.z = -0.2;
        
        // Trigger mechanism
        const trigger = BABYLON.MeshBuilder.CreateBox("rocketTrigger", {width: 0.1, height: 0.1, depth: 0.2}, this.game.scene);
        trigger.parent = rocketLauncher;
        trigger.position.y = -0.05;
        trigger.position.z = -0.1;
        
        // Sight
        const sight = BABYLON.MeshBuilder.CreateBox("rocketSight", {width: 0.05, height: 0.05, depth: 0.05}, this.game.scene);
        sight.parent = rocketLauncher;
        sight.position.y = 0.15;
        sight.position.z = -0.2;
        
        // Create materials
        const tubeMaterial = new BABYLON.StandardMaterial("rocketTubeMaterial", this.game.scene);
        tubeMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        tubeMaterial.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);
        tube.material = tubeMaterial;
        
        const handleMaterial = new BABYLON.StandardMaterial("rocketHandleMaterial", this.game.scene);
        handleMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        handle.material = handleMaterial;
        trigger.material = handleMaterial;
        sight.material = handleMaterial;
        
        // Create muzzle flash point
        const muzzlePoint = new BABYLON.TransformNode("rocketMuzzlePoint", this.game.scene);
        muzzlePoint.parent = rocketLauncher;
        muzzlePoint.position = new BABYLON.Vector3(0, 0, 0.45);
        
        return rocketLauncher;
    }

    createPlasmaGunModel() {
        const plasmaGun = new BABYLON.TransformNode("plasmaGunNode", this.game.scene);
        
        // Main body
        const body = BABYLON.MeshBuilder.CreateBox("plasmaBody", {width: 0.15, height: 0.15, depth: 0.6}, this.game.scene);
        body.parent = plasmaGun;
        
        // Energy core (glowing center)
        const core = BABYLON.MeshBuilder.CreateSphere("plasmaCore", {diameter: 0.1}, this.game.scene);
        core.parent = plasmaGun;
        core.position.y = 0.05;
        core.position.z = 0.1;
        
        // Barrel
        const barrel = BABYLON.MeshBuilder.CreateCylinder("plasmaBarrel", {diameter: 0.1, height: 0.3}, this.game.scene);
        barrel.parent = plasmaGun;
        barrel.position.z = 0.4;
        barrel.rotation.x = Math.PI / 2;
        
        // Handle
        const handle = BABYLON.MeshBuilder.CreateBox("plasmaHandle", {width: 0.08, height: 0.2, depth: 0.1}, this.game.scene);
        handle.parent = plasmaGun;
        handle.position.y = -0.15;
        handle.position.z = -0.15;
        
        // Energy tubes (connecting core to barrel)
        const tube1 = BABYLON.MeshBuilder.CreateCylinder("plasmaTube1", {diameter: 0.03, height: 0.3}, this.game.scene);
        tube1.parent = plasmaGun;
        tube1.position.x = 0.05;
        tube1.position.y = 0.05;
        tube1.position.z = 0.25;
        tube1.rotation.x = Math.PI / 2;
        
        const tube2 = BABYLON.MeshBuilder.CreateCylinder("plasmaTube2", {diameter: 0.03, height: 0.3}, this.game.scene);
        tube2.parent = plasmaGun;
        tube2.position.x = -0.05;
        tube2.position.y = 0.05;
        tube2.position.z = 0.25;
        tube2.rotation.x = Math.PI / 2;
        
        // Create materials
        const bodyMaterial = new BABYLON.StandardMaterial("plasmaBodyMaterial", this.game.scene);
        bodyMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.3);
        bodyMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.7);
        body.material = bodyMaterial;
        barrel.material = bodyMaterial;
        handle.material = bodyMaterial;
        
        const coreMaterial = new BABYLON.StandardMaterial("plasmaCoreaterial", this.game.scene);
        coreMaterial.diffuseColor = new BABYLON.Color3(0, 0.8, 0.8);
        coreMaterial.emissiveColor = new BABYLON.Color3(0, 0.8, 0.8);
        coreMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
        core.material = coreMaterial;
        
        const tubeMaterial = new BABYLON.StandardMaterial("plasmaTubeMaterial", this.game.scene);
        tubeMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.5, 0.5);
        tubeMaterial.alpha = 0.7;
        tube1.material = tubeMaterial;
        tube2.material = tubeMaterial;
        
        // Create muzzle flash point
        const muzzlePoint = new BABYLON.TransformNode("plasmaMuzzlePoint", this.game.scene);
        muzzlePoint.parent = plasmaGun;
        muzzlePoint.position = new BABYLON.Vector3(0, 0, 0.55);
        
        return plasmaGun;
    }

    createBFGModel() {
        const bfg = new BABYLON.TransformNode("bfgNode", this.game.scene);
        
        // Main body
        const body = BABYLON.MeshBuilder.CreateBox("bfgBody", {width: 0.25, height: 0.25, depth: 0.7}, this.game.scene);
        body.parent = bfg;
        
        // Energy core (large glowing center)
        const core = BABYLON.MeshBuilder.CreateSphere("bfgCore", {diameter: 0.2}, this.game.scene);
        core.parent = bfg;
        core.position.z = 0.2;
        
        // Barrel (wide opening)
        const barrel = BABYLON.MeshBuilder.CreateCylinder("bfgBarrel", {diameterTop: 0.3, diameterBottom: 0.2, height: 0.3}, this.game.scene);
        barrel.parent = bfg;
        barrel.position.z = 0.5;
        barrel.rotation.x = Math.PI / 2;
        
        // Handle
        const handle = BABYLON.MeshBuilder.CreateBox("bfgHandle", {width: 0.1, height: 0.25, depth: 0.15}, this.game.scene);
        handle.parent = bfg;
        handle.position.y = -0.2;
        handle.position.z = -0.15;
        
        // Side energy cells
        const cell1 = BABYLON.MeshBuilder.CreateCylinder("bfgCell1", {diameter: 0.1, height: 0.3}, this.game.scene);
        cell1.parent = bfg;
        cell1.position.x = 0.15;
        cell1.position.z = -0.1;
        cell1.rotation.z = Math.PI / 2;
        
        const cell2 = BABYLON.MeshBuilder.CreateCylinder("bfgCell2", {diameter: 0.1, height: 0.3}, this.game.scene);
        cell2.parent = bfg;
        cell2.position.x = -0.15;
        cell2.position.z = -0.1;
        cell2.rotation.z = Math.PI / 2;
        
        // Create materials
        const bodyMaterial = new BABYLON.StandardMaterial("bfgBodyMaterial", this.game.scene);
        bodyMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.2, 0.1);
        bodyMaterial.specularColor = new BABYLON.Color3(0.3, 0.5, 0.3);
        body.material = bodyMaterial;
        barrel.material = bodyMaterial;
        handle.material = bodyMaterial;
        
        const coreMaterial = new BABYLON.StandardMaterial("bfgCoreMaterial", this.game.scene);
        coreMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
        coreMaterial.emissiveColor = new BABYLON.Color3(0, 1, 0);
        coreMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
        core.material = coreMaterial;
        
        const cellMaterial = new BABYLON.StandardMaterial("bfgCellMaterial", this.game.scene);
        cellMaterial.diffuseColor = new BABYLON.Color3(0, 0.7, 0);
        cellMaterial.emissiveColor = new BABYLON.Color3(0, 0.3, 0);
        cell1.material = cellMaterial;
        cell2.material = cellMaterial;
        
        // Create muzzle flash point
        const muzzlePoint = new BABYLON.TransformNode("bfgMuzzlePoint", this.game.scene);
        muzzlePoint.parent = bfg;
        muzzlePoint.position = new BABYLON.Vector3(0, 0, 0.65);
        
        return bfg;
    }

    createWeaponAnimations() {
        // Create animation groups for each weapon
        
        // Firing animations
        this.animations.pistolFire = this.createFiringAnimation("pistol");
        this.animations.shotgunFire = this.createFiringAnimation("shotgun");
        this.animations.rifleFire = this.createFiringAnimation("rifle");
        this.animations.sniperFire = this.createFiringAnimation("sniper");
        this.animations.rocketFire = this.createFiringAnimation("rocket");
        this.animations.plasmaFire = this.createFiringAnimation("plasma");
        this.animations.bfgFire = this.createFiringAnimation("bfg");
        
        // Reload animations
        this.animations.pistolReload = this.createReloadAnimation("pistol");
        this.animations.shotgunReload = this.createReloadAnimation("shotgun");
        this.animations.rifleReload = this.createReloadAnimation("rifle");
        this.animations.sniperReload = this.createReloadAnimation("sniper");
        this.animations.rocketReload = this.createReloadAnimation("rocket");
        this.animations.plasmaReload = this.createReloadAnimation("plasma");
        this.animations.bfgReload = this.createReloadAnimation("bfg");
        
        // Switch animations
        this.animations.weaponSwitch = this.createSwitchAnimation();
    }

    createFiringAnimation(weaponType) {
        const weapon = this.models[weaponType];
        if (!weapon) return null;
        
        // Create animation group
        const animationGroup = new BABYLON.AnimationGroup(`${weaponType}FireAnimation`);
        
        // Create position animation (recoil)
        const positionAnimation = new BABYLON.Animation(
            `${weaponType}FirePositionAnimation`,
            "position",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        // Keyframes for position
        const positionKeys = [];
        positionKeys.push({ frame: 0, value: new BABYLON.Vector3(0, 0, 0) });
        positionKeys.push({ frame: 3, value: new BABYLON.Vector3(0, 0, -0.1) });
        positionKeys.push({ frame: 10, value: new BABYLON.Vector3(0, 0, 0) });
        
        positionAnimation.setKeys(positionKeys);
        
        // Create rotation animation (slight upward recoil)
        const rotationAnimation = new BABYLON.Animation(
            `${weaponType}FireRotationAnimation`,
            "rotation",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        // Keyframes for rotation
        const rotationKeys = [];
        rotationKeys.push({ frame: 0, value: new BABYLON.Vector3(0, 0, 0) });
        rotationKeys.push({ frame: 3, value: new BABYLON.Vector3(-0.1, 0, 0) });
        rotationKeys.push({ frame: 10, value: new BABYLON.Vector3(0, 0, 0) });
        
        rotationAnimation.setKeys(rotationKeys);
        
        // Add animations to group
        animationGroup.addTargetedAnimation(positionAnimation, weapon);
        animationGroup.addTargetedAnimation(rotationAnimation, weapon);
        
        return animationGroup;
    }

    createReloadAnimation(weaponType) {
        const weapon = this.models[weaponType];
        if (!weapon) return null;
        
        // Create animation group
        const animationGroup = new BABYLON.AnimationGroup(`${weaponType}ReloadAnimation`);
        
        // Create position animation
        const positionAnimation = new BABYLON.Animation(
            `${weaponType}ReloadPositionAnimation`,
            "position",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        // Keyframes for position
        const positionKeys = [];
        positionKeys.push({ frame: 0, value: new BABYLON.Vector3(0, 0, 0) });
        positionKeys.push({ frame: 15, value: new BABYLON.Vector3(0, -0.2, 0) });
        positionKeys.push({ frame: 30, value: new BABYLON.Vector3(0, 0, 0) });
        
        positionAnimation.setKeys(positionKeys);
        
        // Create rotation animation
        const rotationAnimation = new BABYLON.Animation(
            `${weaponType}ReloadRotationAnimation`,
            "rotation",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        // Keyframes for rotation
        const rotationKeys = [];
        rotationKeys.push({ frame: 0, value: new BABYLON.Vector3(0, 0, 0) });
        rotationKeys.push({ frame: 15, value: new BABYLON.Vector3(0, 0, 0.3) });
        rotationKeys.push({ frame: 30, value: new BABYLON.Vector3(0, 0, 0) });
        
        rotationAnimation.setKeys(rotationKeys);
        
        // Add animations to group
        animationGroup.addTargetedAnimation(positionAnimation, weapon);
        animationGroup.addTargetedAnimation(rotationAnimation, weapon);
        
        return animationGroup;
    }

    createSwitchAnimation() {
        // This animation will be applied to any weapon being switched to
        const animationGroup = new BABYLON.AnimationGroup("weaponSwitchAnimation");
        
        // Create position animation
        const positionAnimation = new BABYLON.Animation(
            "weaponSwitchPositionAnimation",
            "position",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        // Keyframes for position
        const positionKeys = [];
        positionKeys.push({ frame: 0, value: new BABYLON.Vector3(0, -0.5, 0) });
        positionKeys.push({ frame: 10, value: new BABYLON.Vector3(0, 0, 0) });
        
        positionAnimation.setKeys(positionKeys);
        
        // Create scaling animation
        const scalingAnimation = new BABYLON.Animation(
            "weaponSwitchScalingAnimation",
            "scaling",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        // Keyframes for scaling
        const scalingKeys = [];
        scalingKeys.push({ frame: 0, value: new BABYLON.Vector3(0.8, 0.8, 0.8) });
        scalingKeys.push({ frame: 10, value: new BABYLON.Vector3(1, 1, 1) });
        
        scalingAnimation.setKeys(scalingKeys);
        
        // Note: We don't add targeted animations here because they will be added dynamically
        // when switching weapons
        
        return animationGroup;
    }

    getWeaponModel(weaponType) {
        return this.models[weaponType];
    }

    getWeaponAnimation(weaponType, animationType) {
        if (animationType === 'fire') {
            return this.animations[`${weaponType}Fire`];
        } else if (animationType === 'reload') {
            return this.animations[`${weaponType}Reload`];
        } else if (animationType === 'switch') {
            return this.animations.weaponSwitch;
        }
        return null;
    }

    getMuzzleFlashPosition(weaponType) {
        const weapon = this.models[weaponType];
        if (!weapon) return new BABYLON.Vector3(0, 0, 0);
        
        const muzzlePoint = weapon.getChildTransformNodes(false, (node) => {
            return node.name === `${weaponType}MuzzlePoint`;
        })[0];
        
        if (muzzlePoint) {
            return muzzlePoint.getAbsolutePosition();
        }
        
        return weapon.position.add(new BABYLON.Vector3(0, 0, 0.5));
    }
}

export default WeaponModels;
