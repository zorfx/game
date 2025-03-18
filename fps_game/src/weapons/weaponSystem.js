import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

export class WeaponSystem {
    constructor(game) {
        this.game = game;
        this.weapons = [];
        this.currentWeaponIndex = 0;
        this.lastWeaponSwitchTime = 0;
        this.weaponMesh = null;
        this.muzzleFlash = null;
        this.weaponSounds = {};
    }

    async initialize() {
        // Define weapon types
        const weaponTypes = [
            { 
                name: "Pistol", 
                damage: 15, 
                fireRate: 400, 
                range: 50, 
                ammoType: "pistol",
                ammo: 50,
                maxAmmo: 100,
                model: "pistol",
                automatic: false,
                spread: 0.01,
                recoil: 0.01,
                soundFile: "pistol_fire.mp3"
            },
            { 
                name: "Shotgun", 
                damage: 8, 
                fireRate: 800, 
                range: 20,
                pellets: 8,
                ammoType: "shells",
                ammo: 20,
                maxAmmo: 40,
                model: "shotgun",
                automatic: false,
                spread: 0.05,
                recoil: 0.05,
                soundFile: "shotgun_fire.mp3"
            },
            { 
                name: "Assault Rifle", 
                damage: 10, 
                fireRate: 100, 
                range: 100,
                ammoType: "rifle",
                ammo: 60,
                maxAmmo: 200,
                model: "rifle",
                automatic: true,
                spread: 0.02,
                recoil: 0.02,
                soundFile: "rifle_fire.mp3"
            },
            { 
                name: "Sniper Rifle", 
                damage: 50, 
                fireRate: 1000, 
                range: 200,
                ammoType: "rifle",
                ammo: 20,
                maxAmmo: 40,
                model: "sniper",
                automatic: false,
                spread: 0.001,
                recoil: 0.03,
                soundFile: "sniper_fire.mp3"
            },
            { 
                name: "Rocket Launcher", 
                damage: 100, 
                fireRate: 1500, 
                range: 150,
                ammoType: "rockets",
                ammo: 5,
                maxAmmo: 15,
                model: "rocket",
                automatic: false,
                spread: 0.01,
                recoil: 0.1,
                projectile: true,
                projectileSpeed: 30,
                explosionRadius: 5,
                soundFile: "rocket_fire.mp3"
            },
            { 
                name: "Plasma Gun", 
                damage: 20, 
                fireRate: 300, 
                range: 80,
                ammoType: "cells",
                ammo: 40,
                maxAmmo: 100,
                model: "plasma",
                automatic: true,
                spread: 0.02,
                recoil: 0.01,
                projectile: true,
                projectileSpeed: 50,
                soundFile: "plasma_fire.mp3"
            },
            { 
                name: "BFG", 
                damage: 200, 
                fireRate: 2000, 
                range: 100,
                ammoType: "cells",
                ammo: 10,
                maxAmmo: 20,
                model: "bfg",
                automatic: false,
                spread: 0.01,
                recoil: 0.2,
                projectile: true,
                projectileSpeed: 20,
                explosionRadius: 10,
                soundFile: "bfg_fire.mp3"
            }
        ];
        
        // Create weapons from types
        for (const weaponType of weaponTypes) {
            const weapon = {
                ...weaponType,
                lastFired: 0,
                mesh: null,
                acquired: weaponType.name === "Pistol", // Start with pistol only
                fire: () => this.fireWeapon(weapon)
            };
            
            this.weapons.push(weapon);
        }
        
        // Load weapon sounds
        if (this.game.audioManager) {
            for (const weapon of this.weapons) {
                this.weaponSounds[weapon.name] = await this.game.audioManager.loadSound(
                    `${weapon.name.toLowerCase()}_fire`, 
                    `assets/sounds/${weapon.soundFile}`
                );
            }
            
            // Load other weapon sounds
            this.weaponSounds.empty = await this.game.audioManager.loadSound("empty", "assets/sounds/empty.mp3");
            this.weaponSounds.switch = await this.game.audioManager.loadSound("switch", "assets/sounds/weapon_switch.mp3");
        }
        
        // Create temporary weapon model (will be replaced with actual models later)
        this.createTemporaryWeaponModel();
        
        console.log('Weapon System initialized');
        return Promise.resolve();
    }

    createTemporaryWeaponModel() {
        // Create a simple box as a placeholder for the weapon model
        this.weaponMesh = BABYLON.MeshBuilder.CreateBox("weaponMesh", {width: 0.2, height: 0.2, depth: 0.5}, this.game.scene);
        
        // Position the weapon in front of the camera
        this.weaponMesh.parent = this.game.playerController.camera;
        this.weaponMesh.position = new BABYLON.Vector3(0.3, -0.3, 1);
        
        // Create a material for the weapon
        const weaponMaterial = new BABYLON.StandardMaterial("weaponMaterial", this.game.scene);
        weaponMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        weaponMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        this.weaponMesh.material = weaponMaterial;
        
        // Create muzzle flash (initially invisible)
        this.muzzleFlash = BABYLON.MeshBuilder.CreatePlane("muzzleFlash", {width: 0.3, height: 0.3}, this.game.scene);
        this.muzzleFlash.parent = this.weaponMesh;
        this.muzzleFlash.position = new BABYLON.Vector3(0, 0, -0.3);
        this.muzzleFlash.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        
        const muzzleFlashMaterial = new BABYLON.StandardMaterial("muzzleFlashMaterial", this.game.scene);
        muzzleFlashMaterial.diffuseColor = new BABYLON.Color3(1, 0.7, 0);
        muzzleFlashMaterial.emissiveColor = new BABYLON.Color3(1, 0.7, 0);
        muzzleFlashMaterial.alpha = 0;
        this.muzzleFlash.material = muzzleFlashMaterial;
    }

    switchWeapon(index) {
        const now = Date.now();
        if (now - this.lastWeaponSwitchTime < this.game.config.weaponSwitchTime) {
            return; // Prevent switching too quickly
        }
        
        // Only switch to acquired weapons
        if (index >= 0 && index < this.weapons.length && this.weapons[index].acquired) {
            this.lastWeaponSwitchTime = now;
            this.currentWeaponIndex = index;
            
            // Play weapon switch sound
            if (this.game.audioManager && this.weaponSounds.switch) {
                this.game.audioManager.playSound(this.weaponSounds.switch);
            }
            
            // Update UI
            if (this.game.uiManager) {
                this.game.uiManager.updateWeaponDisplay(this.weapons[this.currentWeaponIndex]);
            }
            
            console.log(`Switched to ${this.weapons[this.currentWeaponIndex].name}`);
        }
    }

    fireCurrentWeapon() {
        const currentWeapon = this.weapons[this.currentWeaponIndex];
        if (currentWeapon) {
            currentWeapon.fire();
        }
    }

    fireWeapon(weapon) {
        const now = Date.now();
        
        // Check fire rate
        if (now - weapon.lastFired < weapon.fireRate) {
            return false;
        }
        
        // Check ammo
        if (weapon.ammo <= 0) {
            // Play empty sound
            if (this.game.audioManager && this.weaponSounds.empty) {
                this.game.audioManager.playSound(this.weaponSounds.empty);
            }
            return false;
        }
        
        // Update last fired time
        weapon.lastFired = now;
        
        // Decrease ammo
        weapon.ammo--;
        
        // Update UI
        if (this.game.uiManager) {
            this.game.uiManager.updateAmmoDisplay(weapon.ammo, weapon.maxAmmo);
        }
        
        // Play weapon sound
        if (this.game.audioManager && this.weaponSounds[weapon.name]) {
            this.game.audioManager.playSound(this.weaponSounds[weapon.name]);
        }
        
        // Show muzzle flash
        this.showMuzzleFlash();
        
        // Handle projectile weapons
        if (weapon.projectile) {
            this.fireProjectile(weapon);
        } else {
            // Handle hitscan weapons
            this.fireHitscan(weapon);
        }
        
        // Apply recoil
        this.applyRecoil(weapon.recoil);
        
        return true;
    }

    fireHitscan(weapon) {
        // Get camera direction with spread
        const spread = weapon.spread;
        const direction = this.getDirectionWithSpread(spread);
        
        // Create a ray for hit detection
        const ray = new BABYLON.Ray(
            this.game.playerController.camera.position, 
            direction, 
            weapon.range
        );
        
        // For shotguns, fire multiple pellets
        if (weapon.pellets) {
            for (let i = 0; i < weapon.pellets; i++) {
                const pelletDirection = this.getDirectionWithSpread(spread * 2);
                const pelletRay = new BABYLON.Ray(
                    this.game.playerController.camera.position, 
                    pelletDirection, 
                    weapon.range
                );
                this.processHitscanHit(pelletRay, weapon.damage);
            }
        } else {
            // Single shot
            this.processHitscanHit(ray, weapon.damage);
        }
        
        // Visual feedback for shooting (tracer)
        if (this.game.config.debugMode) {
            const rayHelper = new BABYLON.RayHelper(ray);
            rayHelper.show(this.game.scene, new BABYLON.Color3(1, 0.7, 0));
            setTimeout(() => rayHelper.hide(), 100);
        }
    }

    processHitscanHit(ray, damage) {
        const hit = this.game.scene.pickWithRay(ray);
        
        // Handle hit
        if (hit.pickedMesh && hit.pickedMesh.name !== "skyBox") {
            // Check if hit an enemy
            if (hit.pickedMesh.metadata && hit.pickedMesh.metadata.type === 'enemy') {
                // Damage enemy
                if (this.game.enemyManager) {
                    this.game.enemyManager.damageEnemy(hit.pickedMesh.metadata.id, damage);
                }
            }
            
            // Create impact effect
            this.createImpactEffect(hit.pickedPoint, hit.getNormal(true, true));
        }
    }

    fireProjectile(weapon) {
        // Get camera direction with spread
        const spread = weapon.spread;
        const direction = this.getDirectionWithSpread(spread);
        
        // Create projectile
        const projectile = BABYLON.MeshBuilder.CreateSphere(
            `projectile_${Date.now()}`, 
            {diameter: 0.2}, 
            this.game.scene
        );
        
        // Position projectile at weapon muzzle
        projectile.position = this.muzzleFlash.getAbsolutePosition();
        
        // Set projectile properties
        projectile.metadata = {
            type: 'projectile',
            damage: weapon.damage,
            speed: weapon.projectileSpeed,
            direction: direction,
            explosionRadius: weapon.explosionRadius,
            owner: 'player',
            creationTime: Date.now()
        };
        
        // Create material for projectile
        const projectileMaterial = new BABYLON.StandardMaterial(`projectileMaterial_${Date.now()}`, this.game.scene);
        
        if (weapon.name === "Plasma Gun") {
            projectileMaterial.emissiveColor = new BABYLON.Color3(0, 1, 0.7);
            projectileMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0.7);
        } else if (weapon.name === "Rocket Launcher") {
            projectileMaterial.emissiveColor = new BABYLON.Color3(1, 0.5, 0);
            projectileMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.2, 0);
        } else if (weapon.name === "BFG") {
            projectileMaterial.emissiveColor = new BABYLON.Color3(0, 1, 0);
            projectileMaterial.diffuseColor = new BABYLON.Color3(0, 0.7, 0);
        }
        
        projectile.material = projectileMaterial;
        
        // Register projectile movement
        this.game.scene.registerBeforeRender(() => {
            // Move projectile
            projectile.position.addInPlace(direction.scale(projectile.metadata.speed * this.game.engine.getDeltaTime() / 1000));
            
            // Check for collision
            const ray = new BABYLON.Ray(projectile.position, direction, 0.5);
            const hit = this.game.scene.pickWithRay(ray);
            
            // Handle collision
            if (hit.pickedMesh && hit.pickedMesh !== projectile && hit.pickedMesh.name !== "skyBox") {
                // Handle explosion if applicable
                if (projectile.metadata.explosionRadius) {
                    this.createExplosion(projectile.position, projectile.metadata.explosionRadius, projectile.metadata.damage);
                } else {
                    // Handle direct hit
                    if (hit.pickedMesh.metadata && hit.pickedMesh.metadata.type === 'enemy') {
                        // Damage enemy
                        if (this.game.enemyManager) {
                            this.game.enemyManager.damageEnemy(hit.pickedMesh.metadata.id, projectile.metadata.damage);
                        }
                    }
                    
                    // Create impact effect
                    this.createImpactEffect(hit.pickedPoint, hit.getNormal(true, true));
                }
                
                // Remove projectile
                projectile.dispose();
            }
            
            // Remove projectile after a certain time
            if (Date.now() - projectile.metadata.creationTime > 5000) {
                projectile.dispose();
            }
        });
    }

    createExplosion(position, radius, damage) {
        // Create explosion effect
        const explosion = BABYLON.MeshBuilder.CreateSphere(
            `explosion_${Date.now()}`, 
            {diameter: radius * 2}, 
            this.game.scene
        );
        explosion.position = position;
        
        // Create material for explosion
        const explosionMaterial = new BABYLON.StandardMaterial(`explosionMaterial_${Date.now()}`, this.game.scene);
        explosionMaterial.emissiveColor = new BABYLON.Color3(1, 0.5, 0);
        explosionMaterial.alpha = 0.7;
        explosion.material = explosionMaterial;
        
        // Play explosion sound
        if (this.game.audioManager) {
            this.game.audioManager.playSound("explosion");
        }
        
        // Damage entities within radius
        const entities = this.game.scene.meshes.filter(mesh => 
            mesh.metadata && 
            (mesh.metadata.type === 'enemy' || mesh === this.game.playerController.camera) &&
            BABYLON.Vector3.Distance(mesh.position, position) <= radius
        );
        
        entities.forEach(entity => {
            const distance = BABYLON.Vector3.Distance(entity.position, position);
            const damageMultiplier = 1 - (distance / radius); // More damage closer to explosion
            const explosionDamage = damage * damageMultiplier;
            
            if (entity.metadata && entity.metadata.type === 'enemy') {
                // Damage enemy
                if (this.game.enemyManager) {
                    this.game.enemyManager.damageEnemy(entity.metadata.id, explosionDamage);
                }
            } else if (entity === this.game.playerController.camera) {
                // Damage player
                this.game.playerController.takeDamage(explosionDamage * 0.5); // Reduce self-damage
            }
        });
        
        // Animate explosion
        let alpha = 1;
        let scale = 1;
        const startTime = Date.now();
        
        this.game.scene.registerBeforeRender(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed > 500) {
                explosion.dispose();
                return;
            }
            
            alpha = 1 - (elapsed / 500);
            scale = 1 + (elapsed / 500);
            
            explosionMaterial.alpha = alpha;
            explosion.scaling = new BABYLON.Vector3(scale, scale, scale);
        });
    }

    createImpactEffect(position, normal) {
        // Create impact decal
        const decal = BABYLON.MeshBuilder.CreateDecal(
            "impact", 
            null, 
            {
                position: position,
                normal: normal,
                size: new BABYLON.Vector3(0.2, 0.2, 0.2)
            }, 
            this.game.scene
        );
        
        // Create material for impact
        const impactMaterial = new BABYLON.StandardMaterial("impactMat", this.game.scene);
        impactMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        impactMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        decal.material = impactMaterial;
        
        // Remove impact after a short time
        setTimeout(() => {
            decal.dispose();
        }, 5000);
    }

    showMuzzleFlash() {
        // Make muzzle flash visible
        this.muzzleFlash.material.alpha = 1;
        
        // Hide muzzle flash after a short time
        setTimeout(() => {
            this.muzzleFlash.material.alpha = 0;
        }, 50);
    }

    applyRecoil(amount) {
        // Apply recoil to camera
        this.game.playerController.camera.rotation.x -= amount;
    }

    getDirectionWithSpread(spread) {
        // Get base direction from camera
        const direction = this.game.playerController.camera.getDirection(BABYLON.Vector3.Forward());
        
        // Add random spread
        direction.x += (Math.random() - 0.5) * spread;
        direction.y += (Math.random() - 0.5) * spread;
        direction.z += (Math.random() - 0.5) * spread;
        
        // Normalize direction
        return direction.normalize();
    }

    acquireWeapon(weaponType) {
        const weaponIndex = this.weapons.findIndex(w => w.name.toLowerCase() === weaponType.toLowerCase());
        
        if (weaponIndex !== -1) {
            const weapon = this.weapons[weaponIndex];
            
            if (!weapon.acquired) {
                weapon.acquired = true;
                
                // Switch to newly acquired weapon
                this.switchWeapon(weaponIndex);
                
                // Play pickup sound
                if (this.game.audioManager) {
                    this.game.audioManager.playSound("pickup");
                }
                
                // Show weapon acquired message
                if (this.game.uiManager) {
                    this.game.uiManager.showMessage(`Acquired ${weapon.name}!`);
                }
                
                return true;
            }
        }
        
        return false;
    }

    addAmmo(ammoType, amount) {
        let ammoAdded = false;
        
        this.weapons.forEach(weapon => {
            if (weapon.ammoType === ammoType || ammoType === 'all') {
                const oldAmmo = weapon.ammo;
                weapon.ammo = Math.min(weapon.maxAmmo, weapon.ammo + amount);
                
                if (weapon.ammo > oldAmmo) {
                    ammoAdded = true;
                }
            }
        });
        
        // Update UI if current weapon ammo changed
        if (this.game.uiManager) {
            const currentWeapon = this.weapons[this.currentWeaponIndex];
            this.game.uiManager.updateAmmoDisplay(currentWeapon.ammo, currentWeapon.maxAmmo);
        }
        
        // Play pickup sound if ammo was added
        if (ammoAdded && this.game.audioManager) {
            this.game.audioManager.playSound("pickup");
        }
        
        return ammoAdded;
    }
}

export default WeaponSystem;
