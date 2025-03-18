import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

export class WeaponEffects {
    constructor(game) {
        this.game = game;
        this.muzzleFlashes = {};
        this.impactEffects = {};
        this.projectileEffects = {};
        this.particleSystems = {};
    }

    async initialize() {
        // Create muzzle flash effects
        this.createMuzzleFlashEffects();
        
        // Create impact effects
        this.createImpactEffects();
        
        // Create projectile effects
        this.createProjectileEffects();
        
        console.log('Weapon Effects initialized');
        return Promise.resolve();
    }

    createMuzzleFlashEffects() {
        // Create muzzle flash for each weapon type
        const weaponTypes = ['pistol', 'shotgun', 'rifle', 'sniper', 'rocket', 'plasma', 'bfg'];
        
        weaponTypes.forEach(weaponType => {
            // Create muzzle flash particle system
            const muzzleFlash = new BABYLON.ParticleSystem(`${weaponType}MuzzleFlash`, 20, this.game.scene);
            
            // Texture and general properties
            muzzleFlash.particleTexture = new BABYLON.Texture("assets/textures/flare.png", this.game.scene);
            muzzleFlash.emitter = new BABYLON.Vector3(0, 0, 0); // Will be positioned at weapon muzzle
            muzzleFlash.minEmitBox = new BABYLON.Vector3(-0.05, -0.05, -0.05);
            muzzleFlash.maxEmitBox = new BABYLON.Vector3(0.05, 0.05, 0.05);
            
            // Colors
            if (weaponType === 'plasma') {
                muzzleFlash.color1 = new BABYLON.Color4(0, 1, 1, 1);
                muzzleFlash.color2 = new BABYLON.Color4(0, 0.5, 1, 1);
            } else if (weaponType === 'bfg') {
                muzzleFlash.color1 = new BABYLON.Color4(0, 1, 0, 1);
                muzzleFlash.color2 = new BABYLON.Color4(0.5, 1, 0, 1);
            } else {
                muzzleFlash.color1 = new BABYLON.Color4(1, 0.5, 0, 1);
                muzzleFlash.color2 = new BABYLON.Color4(1, 0.2, 0, 1);
            }
            
            // Size and lifetime
            muzzleFlash.minSize = 0.1;
            muzzleFlash.maxSize = 0.3;
            muzzleFlash.minLifeTime = 0.01;
            muzzleFlash.maxLifeTime = 0.1;
            
            // Emission
            muzzleFlash.emitRate = 100;
            muzzleFlash.manualEmitCount = 20;
            muzzleFlash.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
            
            // Speed and direction
            muzzleFlash.direction1 = new BABYLON.Vector3(-0.5, -0.5, 1);
            muzzleFlash.direction2 = new BABYLON.Vector3(0.5, 0.5, 1);
            muzzleFlash.minEmitPower = 1;
            muzzleFlash.maxEmitPower = 3;
            
            // Stop the system after a short time
            muzzleFlash.targetStopDuration = 0.1;
            
            // Store the muzzle flash
            this.muzzleFlashes[weaponType] = muzzleFlash;
        });
    }

    createImpactEffects() {
        // Create different impact effects for different surfaces
        
        // Standard impact (wall/floor)
        const standardImpact = new BABYLON.ParticleSystem("standardImpact", 50, this.game.scene);
        standardImpact.particleTexture = new BABYLON.Texture("assets/textures/particle.png", this.game.scene);
        standardImpact.emitter = new BABYLON.Vector3(0, 0, 0); // Will be positioned at impact point
        standardImpact.minEmitBox = new BABYLON.Vector3(-0.1, -0.1, -0.1);
        standardImpact.maxEmitBox = new BABYLON.Vector3(0.1, 0.1, 0.1);
        
        // Colors
        standardImpact.color1 = new BABYLON.Color4(0.7, 0.7, 0.7, 1.0);
        standardImpact.color2 = new BABYLON.Color4(0.5, 0.5, 0.5, 1.0);
        
        // Size and lifetime
        standardImpact.minSize = 0.05;
        standardImpact.maxSize = 0.1;
        standardImpact.minLifeTime = 0.2;
        standardImpact.maxLifeTime = 0.5;
        
        // Emission
        standardImpact.emitRate = 100;
        standardImpact.manualEmitCount = 50;
        standardImpact.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        
        // Speed and direction (will be adjusted based on impact normal)
        standardImpact.direction1 = new BABYLON.Vector3(-1, 1, -1);
        standardImpact.direction2 = new BABYLON.Vector3(1, 1, 1);
        standardImpact.minEmitPower = 1;
        standardImpact.maxEmitPower = 3;
        
        // Gravity
        standardImpact.gravity = new BABYLON.Vector3(0, -9.81, 0);
        
        // Stop the system after a short time
        standardImpact.targetStopDuration = 0.3;
        
        // Store the impact effect
        this.impactEffects.standard = standardImpact;
        
        // Blood impact (enemy)
        const bloodImpact = new BABYLON.ParticleSystem("bloodImpact", 50, this.game.scene);
        bloodImpact.particleTexture = new BABYLON.Texture("assets/textures/particle.png", this.game.scene);
        bloodImpact.emitter = new BABYLON.Vector3(0, 0, 0);
        bloodImpact.minEmitBox = new BABYLON.Vector3(-0.1, -0.1, -0.1);
        bloodImpact.maxEmitBox = new BABYLON.Vector3(0.1, 0.1, 0.1);
        
        // Colors
        bloodImpact.color1 = new BABYLON.Color4(0.7, 0, 0, 1.0);
        bloodImpact.color2 = new BABYLON.Color4(0.5, 0, 0, 1.0);
        
        // Size and lifetime
        bloodImpact.minSize = 0.05;
        bloodImpact.maxSize = 0.15;
        bloodImpact.minLifeTime = 0.3;
        bloodImpact.maxLifeTime = 0.6;
        
        // Emission
        bloodImpact.emitRate = 100;
        bloodImpact.manualEmitCount = 50;
        bloodImpact.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        
        // Speed and direction
        bloodImpact.direction1 = new BABYLON.Vector3(-1, 1, -1);
        bloodImpact.direction2 = new BABYLON.Vector3(1, 1, 1);
        bloodImpact.minEmitPower = 1;
        bloodImpact.maxEmitPower = 3;
        
        // Gravity
        bloodImpact.gravity = new BABYLON.Vector3(0, -9.81, 0);
        
        // Stop the system after a short time
        bloodImpact.targetStopDuration = 0.4;
        
        // Store the impact effect
        this.impactEffects.blood = bloodImpact;
    }

    createProjectileEffects() {
        // Create projectile trail effects for different weapon types
        
        // Rocket trail
        const rocketTrail = new BABYLON.ParticleSystem("rocketTrail", 100, this.game.scene);
        rocketTrail.particleTexture = new BABYLON.Texture("assets/textures/smoke.png", this.game.scene);
        rocketTrail.emitter = new BABYLON.Vector3(0, 0, 0); // Will follow the rocket
        
        // Colors
        rocketTrail.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
        rocketTrail.color2 = new BABYLON.Color4(0.1, 0.1, 0.1, 1.0);
        
        // Size and lifetime
        rocketTrail.minSize = 0.2;
        rocketTrail.maxSize = 0.5;
        rocketTrail.minLifeTime = 0.5;
        rocketTrail.maxLifeTime = 1.0;
        
        // Emission
        rocketTrail.emitRate = 50;
        rocketTrail.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        
        // Speed and direction
        rocketTrail.direction1 = new BABYLON.Vector3(0, 0, -1);
        rocketTrail.direction2 = new BABYLON.Vector3(0, 0, -1);
        rocketTrail.minEmitPower = 0.1;
        rocketTrail.maxEmitPower = 0.3;
        
        // Store the projectile effect
        this.projectileEffects.rocket = rocketTrail;
        
        // Plasma trail
        const plasmaTrail = new BABYLON.ParticleSystem("plasmaTrail", 100, this.game.scene);
        plasmaTrail.particleTexture = new BABYLON.Texture("assets/textures/flare.png", this.game.scene);
        plasmaTrail.emitter = new BABYLON.Vector3(0, 0, 0);
        
        // Colors
        plasmaTrail.color1 = new BABYLON.Color4(0, 1, 1, 1.0);
        plasmaTrail.color2 = new BABYLON.Color4(0, 0.5, 1, 1.0);
        
        // Size and lifetime
        plasmaTrail.minSize = 0.1;
        plasmaTrail.maxSize = 0.3;
        plasmaTrail.minLifeTime = 0.2;
        plasmaTrail.maxLifeTime = 0.4;
        
        // Emission
        plasmaTrail.emitRate = 60;
        plasmaTrail.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        
        // Speed and direction
        plasmaTrail.direction1 = new BABYLON.Vector3(0, 0, -1);
        plasmaTrail.direction2 = new BABYLON.Vector3(0, 0, -1);
        plasmaTrail.minEmitPower = 0.05;
        plasmaTrail.maxEmitPower = 0.1;
        
        // Store the projectile effect
        this.projectileEffects.plasma = plasmaTrail;
        
        // BFG trail
        const bfgTrail = new BABYLON.ParticleSystem("bfgTrail", 200, this.game.scene);
        bfgTrail.particleTexture = new BABYLON.Texture("assets/textures/flare.png", this.game.scene);
        bfgTrail.emitter = new BABYLON.Vector3(0, 0, 0);
        
        // Colors
        bfgTrail.color1 = new BABYLON.Color4(0, 1, 0, 1.0);
        bfgTrail.color2 = new BABYLON.Color4(0.5, 1, 0, 1.0);
        
        // Size and lifetime
        bfgTrail.minSize = 0.2;
        bfgTrail.maxSize = 0.5;
        bfgTrail.minLifeTime = 0.3;
        bfgTrail.maxLifeTime = 0.6;
        
        // Emission
        bfgTrail.emitRate = 100;
        bfgTrail.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        
        // Speed and direction
        bfgTrail.direction1 = new BABYLON.Vector3(-0.5, -0.5, -1);
        bfgTrail.direction2 = new BABYLON.Vector3(0.5, 0.5, -1);
        bfgTrail.minEmitPower = 0.1;
        bfgTrail.maxEmitPower = 0.3;
        
        // Store the projectile effect
        this.projectileEffects.bfg = bfgTrail;
    }

    createExplosionEffect(position, radius, type = 'standard') {
        // Create explosion particle system
        const explosionName = `explosion_${Date.now()}`;
        const explosion = new BABYLON.ParticleSystem(explosionName, 200, this.game.scene);
        
        // Set texture and properties based on explosion type
        if (type === 'rocket') {
            explosion.particleTexture = new BABYLON.Texture("assets/textures/explosion.png", this.game.scene);
            explosion.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
            explosion.color2 = new BABYLON.Color4(1, 0.2, 0, 1.0);
        } else if (type === 'bfg') {
            explosion.particleTexture = new BABYLON.Texture("assets/textures/explosion.png", this.game.scene);
            explosion.color1 = new BABYLON.Color4(0, 1, 0, 1.0);
            explosion.color2 = new BABYLON.Color4(0.5, 1, 0, 1.0);
        } else {
            explosion.particleTexture = new BABYLON.Texture("assets/textures/explosion.png", this.game.scene);
            explosion.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
            explosion.color2 = new BABYLON.Color4(0.3, 0.1, 0.1, 1.0);
        }
        
        // Position
        explosion.emitter = position;
        explosion.minEmitBox = new BABYLON.Vector3(-0.5, -0.5, -0.5);
        explosion.maxEmitBox = new BABYLON.Vector3(0.5, 0.5, 0.5);
        
        // Size and lifetime
        explosion.minSize = radius * 0.2;
        explosion.maxSize = radius * 0.8;
        explosion.minLifeTime = 0.3;
        explosion.maxLifeTime = 0.6;
        
        // Emission
        explosion.emitRate = 300;
        explosion.manualEmitCount = 200;
        explosion.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        
        // Speed and direction
        explosion.direction1 = new BABYLON.Vector3(-1, -1, -1);
        explosion.direction2 = new BABYLON.Vector3(1, 1, 1);
        explosion.minEmitPower = 1;
        explosion.maxEmitPower = 3;
        
        // Start and stop
        explosion.start();
        explosion.targetStopDuration = 0.5;
        
        // Create light for explosion
        const light = new BABYLON.PointLight(`explosionLight_${Date.now()}`, position, this.game.scene);
        
        if (type === 'rocket') {
            light.diffuse = new BABYLON.Color3(1, 0.5, 0);
        } else if (type === 'bfg') {
            light.diffuse = new BABYLON.Color3(0, 1, 0);
        } else {
            light.diffuse = new BABYLON.Color3(1, 0.5, 0);
        }
        
        light.intensity = radius * 0.5;
        light.range = radius * 2;
        
        // Animate light intensity
        const lightAnimation = new BABYLON.Animation(
            "explosionLightAnimation",
            "intensity",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const lightKeys = [];
        lightKeys.push({ frame: 0, value: radius * 0.5 });
        lightKeys.push({ frame: 10, value: radius * 0.2 });
        lightKeys.push({ frame: 20, value: 0 });
        
        lightAnimation.setKeys(lightKeys);
        light.animations.push(lightAnimation);
        
        this.game.scene.beginAnimation(light, 0, 20, false, 1, () => {
            light.dispose();
        });
        
        // Create shockwave
        const shockwave = BABYLON.MeshBuilder.CreateDisc(
            `shockwave_${Date.now()}`,
            { radius: 0.1, tessellation: 32 },
            this.game.scene
        );
        
        shockwave.position = position;
        shockwave.rotation.x = Math.PI / 2;
        
        // Create material for shockwave
        const shockwaveMaterial = new BABYLON.StandardMaterial(`shockwaveMaterial_${Date.now()}`, this.game.scene);
        
        if (type === 'rocket') {
            shockwaveMaterial.emissiveColor = new BABYLON.Color3(1, 0.5, 0);
        } else if (type === 'bfg') {
            shockwaveMaterial.emissiveColor = new BABYLON.Color3(0, 1, 0);
        } else {
            shockwaveMaterial.emissiveColor = new BABYLON.Color3(1, 0.5, 0);
        }
        
        shockwaveMaterial.alpha = 0.7;
        shockwaveMaterial.disableLighting = true;
        shockwave.material = shockwaveMaterial;
        
        // Animate shockwave
        const scaleAnimation = new BABYLON.Animation(
            "shockwaveScaleAnimation",
            "scaling",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const alphaAnimation = new BABYLON.Animation(
            "shockwaveAlphaAnimation",
            "material.alpha",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const scaleKeys = [];
        scaleKeys.push({ frame: 0, value: new BABYLON.Vector3(1, 1, 1) });
        scaleKeys.push({ frame: 30, value: new BABYLON.Vector3(radius * 2, radius * 2, 1) });
        
        const alphaKeys = [];
        alphaKeys.push({ frame: 0, value: 0.7 });
        alphaKeys.push({ frame: 30, value: 0 });
        
        scaleAnimation.setKeys(scaleKeys);
        alphaAnimation.setKeys(alphaKeys);
        
        shockwave.animations.push(scaleAnimation);
        shockwave.animations.push(alphaAnimation);
        
        this.game.scene.beginAnimation(shockwave, 0, 30, false, 1, () => {
            shockwave.dispose();
        });
        
        // Store the particle system for cleanup
        this.particleSystems[explosionName] = explosion;
        
        // Return the explosion for further manipulation
        return explosion;
    }

    createImpactEffect(position, normal, type = 'standard') {
        // Clone the appropriate impact effect
        let impact;
        
        if (type === 'blood') {
            impact = this.impactEffects.blood.clone(`impact_${Date.now()}`);
        } else {
            impact = this.impactEffects.standard.clone(`impact_${Date.now()}`);
        }
        
        // Position the impact
        impact.emitter = position;
        
        // Adjust direction based on normal
        impact.direction1 = normal.add(new BABYLON.Vector3(-0.5, -0.5, -0.5));
        impact.direction2 = normal.add(new BABYLON.Vector3(0.5, 0.5, 0.5));
        
        // Start the impact effect
        impact.start();
        
        // Store the particle system for cleanup
        this.particleSystems[impact.name] = impact;
        
        // Create impact decal
        this.createImpactDecal(position, normal, type);
        
        return impact;
    }

    createImpactDecal(position, normal, type = 'standard') {
        // Create a decal at the impact point
        let decalSize;
        let decalMaterial;
        
        if (type === 'blood') {
            decalSize = new BABYLON.Vector3(0.3, 0.3, 0.3);
            decalMaterial = new BABYLON.StandardMaterial(`decalMaterial_${Date.now()}`, this.game.scene);
            decalMaterial.diffuseColor = new BABYLON.Color3(0.5, 0, 0);
            decalMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        } else {
            decalSize = new BABYLON.Vector3(0.2, 0.2, 0.2);
            decalMaterial = new BABYLON.StandardMaterial(`decalMaterial_${Date.now()}`, this.game.scene);
            decalMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
            decalMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        }
        
        // Find mesh to apply decal to
        const ray = new BABYLON.Ray(position.subtract(normal.scale(0.1)), normal, 0.2);
        const hit = this.game.scene.pickWithRay(ray);
        
        if (hit.pickedMesh && hit.pickedMesh.name !== "skyBox") {
            const decal = BABYLON.MeshBuilder.CreateDecal(
                `decal_${Date.now()}`,
                hit.pickedMesh,
                {
                    position: position,
                    normal: normal,
                    size: decalSize
                },
                this.game.scene
            );
            
            decal.material = decalMaterial;
            
            // Remove decal after a while
            setTimeout(() => {
                decal.dispose();
            }, 10000);
        }
    }

    createMuzzleFlash(weaponType, position) {
        // Clone the appropriate muzzle flash
        const muzzleFlash = this.muzzleFlashes[weaponType].clone(`muzzleFlash_${Date.now()}`);
        
        // Position the muzzle flash
        muzzleFlash.emitter = position;
        
        // Start the muzzle flash
        muzzleFlash.start();
        
        // Store the particle system for cleanup
        this.particleSystems[muzzleFlash.name] = muzzleFlash;
        
        return muzzleFlash;
    }

    createProjectileTrail(projectile, type) {
        if (!this.projectileEffects[type]) return null;
        
        // Clone the appropriate projectile trail
        const trail = this.projectileEffects[type].clone(`projectileTrail_${Date.now()}`);
        
        // Position the trail at the projectile
        trail.emitter = projectile;
        
        // Start the trail
        trail.start();
        
        // Store the particle system for cleanup
        this.particleSystems[trail.name] = trail;
        
        return trail;
    }

    cleanup() {
        // Dispose of all particle systems
        Object.values(this.particleSystems).forEach(system => {
            if (system && system.dispose) {
                system.dispose();
            }
        });
        
        this.particleSystems = {};
    }
}

export default WeaponEffects;
