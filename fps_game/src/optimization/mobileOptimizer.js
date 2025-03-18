import * as BABYLON from 'babylonjs';

export class MobileOptimizer {
    constructor(game) {
        this.game = game;
        this.isLowEndDevice = false;
        this.isMobileDevice = false;
        this.originalSettings = {};
        this.currentQualityLevel = 'auto'; // 'low', 'medium', 'high', 'ultra', 'auto'
        this.fpsHistory = [];
        this.fpsUpdateInterval = 1000; // ms
        this.lastFpsUpdate = 0;
        this.targetFps = 60;
        this.adaptiveQualityEnabled = true;
    }

    async initialize() {
        // Detect device capabilities
        this.detectDeviceCapabilities();
        
        // Store original engine settings
        this.storeOriginalSettings();
        
        // Apply initial optimizations based on device
        this.applyOptimizations();
        
        // Set up FPS monitoring for adaptive quality
        this.setupFpsMonitoring();
        
        console.log('Mobile Optimizer initialized');
        return Promise.resolve();
    }

    detectDeviceCapabilities() {
        // Check if mobile device
        this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Check for low-end device indicators
        const canvas = this.game.engine.getRenderingCanvas();
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                console.log(`GPU: ${renderer}`);
                
                // Check for known low-end GPUs
                this.isLowEndDevice = /Intel|HD Graphics|Iris|Mali-|Adreno 3|Adreno 4|PowerVR/i.test(renderer);
            }
        }
        
        // Additional checks for low-end devices
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
            this.isLowEndDevice = true;
        }
        
        // Check available memory if possible
        if (navigator.deviceMemory && navigator.deviceMemory <= 4) {
            this.isLowEndDevice = true;
        }
        
        console.log(`Device detection: Mobile: ${this.isMobileDevice}, Low-end: ${this.isLowEndDevice}`);
        
        // Set initial quality level based on device
        if (this.isLowEndDevice) {
            this.currentQualityLevel = 'low';
        } else if (this.isMobileDevice) {
            this.currentQualityLevel = 'medium';
        } else {
            this.currentQualityLevel = 'high';
        }
    }

    storeOriginalSettings() {
        // Store original engine settings for reference
        this.originalSettings = {
            hardwareScalingLevel: this.game.engine.getHardwareScalingLevel(),
            renderingQuality: this.game.scene.getEngine().getHardwareScalingLevel(),
            particlesEnabled: true,
            shadowsEnabled: true,
            postProcessesEnabled: true,
            physicsEnabled: true,
            textureQuality: 'high',
            drawDistance: 1000,
            maxLights: 4
        };
    }

    applyOptimizations() {
        // Apply optimizations based on current quality level
        switch (this.currentQualityLevel) {
            case 'low':
                this.applyLowQualitySettings();
                break;
            case 'medium':
                this.applyMediumQualitySettings();
                break;
            case 'high':
                this.applyHighQualitySettings();
                break;
            case 'ultra':
                this.applyUltraQualitySettings();
                break;
            case 'auto':
            default:
                // Start with medium and let adaptive quality adjust
                this.applyMediumQualitySettings();
                break;
        }
    }

    applyLowQualitySettings() {
        console.log('Applying low quality settings');
        
        // Engine scaling (render at lower resolution)
        this.game.engine.setHardwareScalingLevel(1.5);
        
        // Disable shadows
        this.game.scene.shadowsEnabled = false;
        
        // Reduce draw distance
        this.setDrawDistance(300);
        
        // Disable post-processing
        this.disablePostProcessing();
        
        // Reduce particle count
        this.reduceParticleEffects(0.3);
        
        // Disable physics for non-essential objects
        this.optimizePhysics();
        
        // Reduce texture quality
        this.setTextureQuality('low');
        
        // Limit lights
        this.limitLights(2);
        
        // Disable ambient occlusion
        this.game.scene.ambientColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        
        // Disable reflections
        this.disableReflections();
        
        // Use simpler materials
        this.simplifyMaterials();
    }

    applyMediumQualitySettings() {
        console.log('Applying medium quality settings');
        
        // Engine scaling (render at slightly lower resolution)
        this.game.engine.setHardwareScalingLevel(1.2);
        
        // Enable basic shadows
        this.game.scene.shadowsEnabled = true;
        this.optimizeShadows(512, true);
        
        // Moderate draw distance
        this.setDrawDistance(500);
        
        // Enable basic post-processing
        this.enableBasicPostProcessing();
        
        // Reduce particle count moderately
        this.reduceParticleEffects(0.6);
        
        // Optimize physics
        this.optimizePhysics();
        
        // Medium texture quality
        this.setTextureQuality('medium');
        
        // Limit lights
        this.limitLights(3);
        
        // Basic ambient occlusion
        this.game.scene.ambientColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        
        // Basic reflections
        this.enableBasicReflections();
        
        // Optimize materials
        this.optimizeMaterials();
    }

    applyHighQualitySettings() {
        console.log('Applying high quality settings');
        
        // Engine scaling (native resolution)
        this.game.engine.setHardwareScalingLevel(1.0);
        
        // Enable full shadows
        this.game.scene.shadowsEnabled = true;
        this.optimizeShadows(1024, false);
        
        // Full draw distance
        this.setDrawDistance(800);
        
        // Enable post-processing
        this.enableFullPostProcessing();
        
        // Full particle effects
        this.reduceParticleEffects(1.0);
        
        // Full physics
        this.enableFullPhysics();
        
        // High texture quality
        this.setTextureQuality('high');
        
        // Standard lights
        this.limitLights(4);
        
        // Full ambient occlusion
        this.game.scene.ambientColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        
        // Full reflections
        this.enableFullReflections();
        
        // Full materials
        this.enableFullMaterials();
    }

    applyUltraQualitySettings() {
        console.log('Applying ultra quality settings');
        
        // Engine scaling (native resolution)
        this.game.engine.setHardwareScalingLevel(1.0);
        
        // Enable enhanced shadows
        this.game.scene.shadowsEnabled = true;
        this.optimizeShadows(2048, false);
        
        // Extended draw distance
        this.setDrawDistance(1000);
        
        // Enable enhanced post-processing
        this.enableEnhancedPostProcessing();
        
        // Enhanced particle effects
        this.enhanceParticleEffects();
        
        // Full physics with enhancements
        this.enableFullPhysics();
        
        // Ultra texture quality
        this.setTextureQuality('ultra');
        
        // Maximum lights
        this.limitLights(8);
        
        // Enhanced ambient occlusion
        this.game.scene.ambientColor = new BABYLON.Color3(0.05, 0.05, 0.05);
        
        // Enhanced reflections
        this.enableEnhancedReflections();
        
        // Enhanced materials
        this.enableEnhancedMaterials();
    }

    setDrawDistance(distance) {
        // Set camera far plane distance
        if (this.game.playerController && this.game.playerController.camera) {
            this.game.playerController.camera.maxZ = distance;
        }
        
        // Update fog if used
        if (this.game.scene.fogMode !== BABYLON.Scene.FOGMODE_NONE) {
            this.game.scene.fogEnd = distance * 0.9;
            this.game.scene.fogStart = distance * 0.5;
        }
    }

    disablePostProcessing() {
        // Remove all post-processes
        if (this.game.postProcessManager) {
            this.game.postProcessManager.disableAllEffects();
        }
        
        // Or manually remove from camera
        if (this.game.playerController && this.game.playerController.camera) {
            this.game.playerController.camera.detachPostProcess();
        }
    }

    enableBasicPostProcessing() {
        // Enable only basic post-processing
        if (this.game.postProcessManager) {
            this.game.postProcessManager.enableBasicEffects();
        }
    }

    enableFullPostProcessing() {
        // Enable standard post-processing
        if (this.game.postProcessManager) {
            this.game.postProcessManager.enableStandardEffects();
        }
    }

    enableEnhancedPostProcessing() {
        // Enable all post-processing
        if (this.game.postProcessManager) {
            this.game.postProcessManager.enableAllEffects();
        }
    }

    reduceParticleEffects(scale) {
        // Reduce particle count in all systems
        if (this.game.weaponEffects) {
            this.game.weaponEffects.setParticleScale(scale);
        }
        
        // Iterate through all particle systems in the scene
        this.game.scene.particleSystems.forEach(system => {
            const originalCapacity = system.getCapacity();
            system.capacity = Math.floor(originalCapacity * scale);
            
            // Also adjust emitRate
            if (system.emitRate) {
                system.emitRate = Math.floor(system.emitRate * scale);
            }
        });
    }

    enhanceParticleEffects() {
        // Increase particle count and quality
        if (this.game.weaponEffects) {
            this.game.weaponEffects.setParticleScale(1.5);
        }
        
        // Enhance existing particle systems
        this.game.scene.particleSystems.forEach(system => {
            // Increase capacity for more particles
            system.capacity = Math.floor(system.getCapacity() * 1.5);
            
            // Increase emit rate
            if (system.emitRate) {
                system.emitRate = Math.floor(system.emitRate * 1.5);
            }
            
            // Enhance particle size variation
            if (system.minSize && system.maxSize) {
                const avgSize = (system.minSize + system.maxSize) / 2;
                system.minSize = avgSize * 0.8;
                system.maxSize = avgSize * 1.2;
            }
            
            // Enhance particle lifetime
            if (system.minLifeTime && system.maxLifeTime) {
                system.minLifeTime *= 1.2;
                system.maxLifeTime *= 1.2;
            }
        });
    }

    optimizePhysics() {
        // Simplify physics for non-essential objects
        if (this.game.physicsEngine) {
            this.game.physicsEngine.setTimeStep(1/30); // Reduce physics update rate
            
            // Disable physics for distant objects
            this.game.scene.meshes.forEach(mesh => {
                if (mesh.physicsImpostor && !mesh.isEssentialPhysics) {
                    const distance = BABYLON.Vector3.Distance(
                        mesh.position,
                        this.game.playerController.camera.position
                    );
                    
                    if (distance > 50) {
                        mesh.physicsImpostor.dispose();
                        mesh.physicsImpostor = null;
                    }
                }
            });
        }
    }

    enableFullPhysics() {
        // Restore full physics
        if (this.game.physicsEngine) {
            this.game.physicsEngine.setTimeStep(1/60); // Standard physics update rate
            
            // Re-enable physics for all objects that should have it
            this.game.scene.meshes.forEach(mesh => {
                if (mesh.shouldHavePhysics && !mesh.physicsImpostor) {
                    // Recreate physics impostor
                    mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
                        mesh,
                        mesh.physicsImposterType || BABYLON.PhysicsImpostor.BoxImpostor,
                        { mass: mesh.physicsMass || 0, restitution: mesh.physicsRestitution || 0.2 },
                        this.game.scene
                    );
                }
            });
        }
    }

    setTextureQuality(quality) {
        // Set global texture quality
        switch (quality) {
            case 'low':
                BABYLON.TextureTools.UseSRGBBuffers = false;
                this.game.engine.setHardwareScalingLevel(1.5); // Reduce texture resolution
                break;
            case 'medium':
                BABYLON.TextureTools.UseSRGBBuffers = false;
                this.game.engine.setHardwareScalingLevel(1.2);
                break;
            case 'high':
                BABYLON.TextureTools.UseSRGBBuffers = true;
                this.game.engine.setHardwareScalingLevel(1.0);
                break;
            case 'ultra':
                BABYLON.TextureTools.UseSRGBBuffers = true;
                this.game.engine.setHardwareScalingLevel(1.0);
                // Could enable anisotropic filtering or other enhancements
                break;
        }
        
        // Apply to all textures
        this.game.scene.textures.forEach(texture => {
            if (quality === 'low') {
                texture.anisotropicFilteringLevel = 1;
                texture.updateSamplingMode(BABYLON.Texture.BILINEAR_SAMPLINGMODE);
            } else if (quality === 'medium') {
                texture.anisotropicFilteringLevel = 4;
                texture.updateSamplingMode(BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
            } else if (quality === 'high') {
                texture.anisotropicFilteringLevel = 8;
                texture.updateSamplingMode(BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
            } else if (quality === 'ultra') {
                texture.anisotropicFilteringLevel = 16;
                texture.updateSamplingMode(BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
            }
        });
    }

    limitLights(maxLights) {
        // Limit the number of active lights
        const lights = this.game.scene.lights;
        let activeCount = 0;
        
        for (let i = 0; i < lights.length; i++) {
            if (activeCount < maxLights) {
                lights[i].setEnabled(true);
                activeCount++;
            } else {
                // Disable excess lights, but keep essential ones
                if (!lights[i].isEssential) {
                    lights[i].setEnabled(false);
                } else {
                    // Keep essential lights on and count them
                    activeCount++;
                }
            }
        }
    }

    optimizeShadows(mapSize, useBlurVarianceShadowMap) {
        // Optimize shadow generators
        this.game.scene.lights.forEach(light => {
            if (light.shadowGenerator) {
                // Set shadow map size
                light.shadowGenerator.getShadowMap().refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
                light.shadowGenerator.getShadowMap().resize(mapSize);
                
                // Use blur variance for better performance on low-end
                if (useBlurVarianceShadowMap) {
                    light.shadowGenerator.useBlurVarianceShadowMap = true;
                    light.shadowGenerator.blurScale = 2;
                } else {
                    light.shadowGenerator.useBlurVarianceShadowMap = false;
                    light.shadowGenerator.usePoissonSampling = true;
                }
                
                // Limit shadow casters
                light.shadowGenerator.getShadowMap().renderList = light.shadowGenerator.getShadowMap().renderList.filter(mesh => {
                    return mesh.receiveShadows !== false; // Only include meshes that should receive shadows
                });
            }
        });
    }

    disableReflections() {
        // Disable reflections on all materials
        this.game.scene.materials.forEach(material => {
            if (material instanceof BABYLON.StandardMaterial) {
                material.reflectionTexture = null;
                material.specularColor = new BABYLON.Color3(0, 0, 0);
            } else if (material instanceof BABYLON.PBRMaterial) {
                material.reflectivityColor = new BABYLON.Color3(0, 0, 0);
                material.environmentIntensity = 0;
            }
        });
        
        // Disable environment texture
        this.game.scene.environmentTexture = null;
    }

    enableBasicReflections() {
        // Enable basic reflections
        this.game.scene.materials.forEach(material => {
            if (material instanceof BABYLON.StandardMaterial) {
                if (material.originalReflectionTexture) {
                    material.reflectionTexture = material.originalReflectionTexture;
                    material.specularColor = material.originalSpecularColor || new BABYLON.Color3(0.2, 0.2, 0.2);
                }
            } else if (material instanceof BABYLON.PBRMaterial) {
                if (material.originalReflectivityColor) {
                    material.reflectivityColor = material.originalReflectivityColor;
                    material.environmentIntensity = 0.5;
                }
            }
        });
        
        // Set basic environment texture if available
        if (this.game.environmentTexture) {
            this.game.scene.environmentTexture = this.game.environmentTexture;
        }
    }

    enableFullReflections() {
        // Enable full reflections
        this.game.scene.materials.forEach(material => {
            if (material instanceof BABYLON.StandardMaterial) {
                if (material.originalReflectionTexture) {
                    material.reflectionTexture = material.originalReflectionTexture;
                    material.specularColor = material.originalSpecularColor || new BABYLON.Color3(1, 1, 1);
                }
            } else if (material instanceof BABYLON.PBRMaterial) {
                if (material.originalReflectivityColor) {
                    material.reflectivityColor = material.originalReflectivityColor;
                    material.environmentIntensity = 1.0;
                }
            }
        });
        
        // Set full environment texture
        if (this.game.environmentTexture) {
            this.game.scene.environmentTexture = this.game.environmentTexture;
        }
    }

    enableEnhancedReflections() {
        // Enable enhanced reflections
        this.enableFullReflections();
        
        // Add screen space reflections if supported
        if (BABYLON.ScreenSpaceReflectionPostProcess && !this.isLowEndDevice) {
            const ssrPostProcess = new BABYLON.ScreenSpaceReflectionPostProcess(
                "ssr",
                this.game.scene,
                1.0,
                this.game.playerController.camera
            );
            ssrPostProcess.strength = 1.0;
            ssrPostProcess.reflectionSamples = 64;
            ssrPostProcess.reflectionSpecularFalloffExponent = 1;
            ssrPostProcess.reflectionEnabled = true;
            ssrPostProcess.reflectionThreshold = 0.01;
        }
    }

    simplifyMaterials() {
        // Simplify all materials for better performance
        this.game.scene.materials.forEach(material => {
            if (material instanceof BABYLON.StandardMaterial) {
                // Store original values if not already stored
                if (!material.originalSpecularColor) {
                    material.originalSpecularColor = material.specularColor.clone();
                    material.originalReflectionTexture = material.reflectionTexture;
                }
                
                // Simplify material
                material.specularColor = new BABYLON.Color3(0, 0, 0);
                material.reflectionTexture = null;
                material.bumpTexture = null;
                material.useSpecularOverAlpha = false;
                material.useParallax = false;
                material.useParallaxOcclusion = false;
                material.disableLighting = false;
                material.emissiveColor = new BABYLON.Color3(0, 0, 0);
            } else if (material instanceof BABYLON.PBRMaterial) {
                // Store original values
                if (!material.originalReflectivityColor) {
                    material.originalReflectivityColor = material.reflectivityColor.clone();
                }
                
                // Simplify PBR material
                material.reflectivityColor = new BABYLON.Color3(0, 0, 0);
                material.environmentIntensity = 0;
                material.bumpTexture = null;
                material.lightmapTexture = null;
                material.useLightmapAsShadowmap = false;
                material.useParallax = false;
                material.useParallaxOcclusion = false;
                material.useRadianceOverAlpha = false;
                material.useSpecularOverAlpha = false;
                material.enableSpecularAntiAliasing = false;
            }
        });
    }

    optimizeMaterials() {
        // Optimize materials for medium quality
        this.game.scene.materials.forEach(material => {
            if (material instanceof BABYLON.StandardMaterial) {
                // Restore some properties from originals
                if (material.originalSpecularColor) {
                    material.specularColor = material.originalSpecularColor.scale(0.5);
                }
                
                // Keep some optimizations
                material.useParallax = false;
                material.useParallaxOcclusion = false;
                
                // Restore bump maps for important materials
                if (material.isImportant && material.originalBumpTexture) {
                    material.bumpTexture = material.originalBumpTexture;
                }
            } else if (material instanceof BABYLON.PBRMaterial) {
                // Restore some properties
                if (material.originalReflectivityColor) {
                    material.reflectivityColor = material.originalReflectivityColor.scale(0.5);
                    material.environmentIntensity = 0.5;
                }
                
                // Keep some optimizations
                material.useParallax = false;
                material.useParallaxOcclusion = false;
                material.enableSpecularAntiAliasing = false;
                
                // Restore bump maps for important materials
                if (material.isImportant && material.originalBumpTexture) {
                    material.bumpTexture = material.originalBumpTexture;
                }
            }
        });
    }

    enableFullMaterials() {
        // Restore full material properties
        this.game.scene.materials.forEach(material => {
            if (material instanceof BABYLON.StandardMaterial) {
                // Restore original properties
                if (material.originalSpecularColor) {
                    material.specularColor = material.originalSpecularColor.clone();
                }
                if (material.originalReflectionTexture) {
                    material.reflectionTexture = material.originalReflectionTexture;
                }
                if (material.originalBumpTexture) {
                    material.bumpTexture = material.originalBumpTexture;
                }
                
                // Restore other properties based on material type
                if (material.isHighQuality) {
                    material.useParallax = true;
                    material.useSpecularOverAlpha = true;
                }
            } else if (material instanceof BABYLON.PBRMaterial) {
                // Restore original properties
                if (material.originalReflectivityColor) {
                    material.reflectivityColor = material.originalReflectivityColor.clone();
                    material.environmentIntensity = 1.0;
                }
                if (material.originalBumpTexture) {
                    material.bumpTexture = material.originalBumpTexture;
                }
                
                // Restore other properties based on material type
                if (material.isHighQuality) {
                    material.useRadianceOverAlpha = true;
                    material.useSpecularOverAlpha = true;
                    material.enableSpecularAntiAliasing = true;
                }
            }
        });
    }

    enableEnhancedMaterials() {
        // Enable full materials first
        this.enableFullMaterials();
        
        // Then enhance them further
        this.game.scene.materials.forEach(material => {
            if (material instanceof BABYLON.StandardMaterial) {
                // Enhance standard materials
                if (material.isHighQuality) {
                    material.useParallaxOcclusion = true;
                    material.parallaxScaleBias = 0.1;
                    
                    // Increase specular power
                    material.specularPower = 64;
                }
            } else if (material instanceof BABYLON.PBRMaterial) {
                // Enhance PBR materials
                if (material.isHighQuality) {
                    material.useParallaxOcclusion = true;
                    material.parallaxScaleBias = 0.1;
                    
                    // Increase environment intensity
                    material.environmentIntensity = 1.2;
                    
                    // Enable subsurface if available
                    if (material.originalSubSurface) {
                        material.subSurface = material.originalSubSurface;
                    }
                }
            }
        });
    }

    setupFpsMonitoring() {
        // Set up FPS monitoring for adaptive quality
        this.game.scene.onBeforeRenderObservable.add(() => {
            const currentTime = performance.now();
            
            // Update FPS history every second
            if (currentTime - this.lastFpsUpdate > this.fpsUpdateInterval) {
                const currentFps = this.game.engine.getFps();
                this.fpsHistory.push(currentFps);
                
                // Keep history limited to last 5 seconds
                if (this.fpsHistory.length > 5) {
                    this.fpsHistory.shift();
                }
                
                // Check if we need to adjust quality
                if (this.adaptiveQualityEnabled) {
                    this.adjustQualityBasedOnFps();
                }
                
                this.lastFpsUpdate = currentTime;
            }
        });
    }

    adjustQualityBasedOnFps() {
        // Calculate average FPS
        const avgFps = this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
        
        // Adjust quality based on FPS
        if (avgFps < this.targetFps * 0.7) {
            // FPS is too low, decrease quality
            this.decreaseQuality();
        } else if (avgFps > this.targetFps * 0.9 && this.currentQualityLevel !== 'ultra') {
            // FPS is good, we can try increasing quality
            this.increaseQuality();
        }
    }

    decreaseQuality() {
        // Decrease quality level
        switch (this.currentQualityLevel) {
            case 'ultra':
                this.currentQualityLevel = 'high';
                this.applyHighQualitySettings();
                break;
            case 'high':
                this.currentQualityLevel = 'medium';
                this.applyMediumQualitySettings();
                break;
            case 'medium':
                this.currentQualityLevel = 'low';
                this.applyLowQualitySettings();
                break;
            case 'low':
                // Already at lowest, try more aggressive optimizations
                this.game.engine.setHardwareScalingLevel(2.0);
                break;
        }
        
        console.log(`Decreased quality to ${this.currentQualityLevel} due to low FPS (${this.fpsHistory[this.fpsHistory.length - 1].toFixed(1)})`);
    }

    increaseQuality() {
        // Only increase quality if we've had good FPS for a while
        if (this.fpsHistory.length < 3) return;
        
        // Check if all recent FPS readings are good
        const allGood = this.fpsHistory.every(fps => fps > this.targetFps * 0.9);
        
        if (allGood) {
            // Increase quality level
            switch (this.currentQualityLevel) {
                case 'low':
                    this.currentQualityLevel = 'medium';
                    this.applyMediumQualitySettings();
                    break;
                case 'medium':
                    this.currentQualityLevel = 'high';
                    this.applyHighQualitySettings();
                    break;
                case 'high':
                    this.currentQualityLevel = 'ultra';
                    this.applyUltraQualitySettings();
                    break;
            }
            
            console.log(`Increased quality to ${this.currentQualityLevel} due to good FPS (${this.fpsHistory[this.fpsHistory.length - 1].toFixed(1)})`);
        }
    }

    setQualityLevel(level) {
        // Manually set quality level
        if (['low', 'medium', 'high', 'ultra', 'auto'].includes(level)) {
            this.currentQualityLevel = level;
            this.applyOptimizations();
            
            // If set to auto, enable adaptive quality
            this.adaptiveQualityEnabled = (level === 'auto');
        }
    }

    setTargetFps(fps) {
        // Set target FPS for adaptive quality
        this.targetFps = fps;
    }

    toggleAdaptiveQuality(enabled) {
        // Enable or disable adaptive quality
        this.adaptiveQualityEnabled = enabled;
    }

    getCurrentPerformanceStats() {
        // Return current performance stats
        return {
            fps: this.game.engine.getFps(),
            drawCalls: this.game.engine.drawCalls,
            triangles: this.game.engine.totalVertices / 3,
            qualityLevel: this.currentQualityLevel,
            adaptiveQualityEnabled: this.adaptiveQualityEnabled,
            targetFps: this.targetFps,
            isMobileDevice: this.isMobileDevice,
            isLowEndDevice: this.isLowEndDevice
        };
    }
}

export default MobileOptimizer;
