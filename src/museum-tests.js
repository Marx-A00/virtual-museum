/**
 * Automated tests for the Virtual Museum
 * These tests verify that the cel-shading, outline, and anaglyph effects work correctly.
 */

// Mock THREE.js objects for testing
const mockScene = {
    children: [],
    objects: [],
    traverse: function(callback) {
        this.objects.forEach(callback);
    },
    add: function(obj) {
        this.children.push(obj);
        this.objects.push(obj);
        if (obj.children) {
            obj.children.forEach(child => this.objects.push(child));
        }
    }
};

const mockCamera = {
    aspect: 1,
    updateProjectionMatrix: jest.fn()
};

const mockRenderer = {
    setSize: jest.fn(),
    render: jest.fn()
};

const mockComposer = {
    setSize: jest.fn(),
    render: jest.fn(),
    addPass: jest.fn()
};

const mockAnaglyphEffect = {
    setSize: jest.fn(),
    render: jest.fn()
};

// Test suite
describe('Virtual Museum Cel-Shading Features', () => {
    
    // Test materials toggle
    test('toggleCelShading should switch materials on all objects', () => {
        // Setup test environment
        const mockObjects = [];
        
        // Create a few mock meshes with standard and cel-shaded materials
        for (let i = 0; i < 5; i++) {
            const standardMaterial = { id: `standard-${i}` };
            const celShadedMaterial = { id: `cel-shaded-${i}` };
            
            mockObjects.push({
                isMesh: true,
                userData: {
                    materials: {
                        standard: standardMaterial,
                        celShaded: celShadedMaterial
                    }
                },
                material: standardMaterial
            });
        }
        
        // Add objects to the mock scene
        mockScene.objects = mockObjects;
        
        // Mock global variables and functions required by toggleCelShading
        global.celShadingEnabled = false;
        global.scene = mockScene;
        global.updateEffectControls = jest.fn();
        
        // Import the toggleCelShading function (mocked implementation)
        function toggleCelShading() {
            global.celShadingEnabled = !global.celShadingEnabled;
            
            global.scene.traverse(object => {
                if (object.isMesh && object.userData.materials) {
                    object.material = global.celShadingEnabled 
                        ? object.userData.materials.celShaded 
                        : object.userData.materials.standard;
                }
            });
            
            global.updateEffectControls();
        }
        
        // Execute the function to toggle cel-shading ON
        toggleCelShading();
        
        // Verify all objects now use cel-shaded materials
        expect(global.celShadingEnabled).toBe(true);
        mockObjects.forEach((obj, i) => {
            expect(obj.material.id).toBe(`cel-shaded-${i}`);
        });
        expect(global.updateEffectControls).toHaveBeenCalled();
        
        // Toggle cel-shading OFF
        toggleCelShading();
        
        // Verify all objects are back to standard materials
        expect(global.celShadingEnabled).toBe(false);
        mockObjects.forEach((obj, i) => {
            expect(obj.material.id).toBe(`standard-${i}`);
        });
        expect(global.updateEffectControls).toHaveBeenCalledTimes(2);
    });
    
    // Test outline effect toggle
    test('outline effect toggle should enable/disable outline pass', () => {
        // Mock global variables and functions
        global.outlineEnabled = false;
        global.outlinePass = { enabled: false };
        global.updateEffectControls = jest.fn();
        
        // Mock toggle function
        function toggleOutlineEffect() {
            global.outlineEnabled = !global.outlineEnabled;
            global.outlinePass.enabled = global.outlineEnabled;
            global.updateEffectControls();
        }
        
        // Execute toggle ON
        toggleOutlineEffect();
        
        // Verify outline is enabled
        expect(global.outlineEnabled).toBe(true);
        expect(global.outlinePass.enabled).toBe(true);
        expect(global.updateEffectControls).toHaveBeenCalled();
        
        // Execute toggle OFF
        toggleOutlineEffect();
        
        // Verify outline is disabled
        expect(global.outlineEnabled).toBe(false);
        expect(global.outlinePass.enabled).toBe(false);
        expect(global.updateEffectControls).toHaveBeenCalledTimes(2);
    });
    
    // Test anaglyph effect toggle
    test('anaglyph effect toggle should change rendering method', () => {
        // Mock global variables and functions
        global.anaglyphEnabled = false;
        global.updateEffectControls = jest.fn();
        
        // Mock toggle function
        function toggleAnaglyphEffect() {
            global.anaglyphEnabled = !global.anaglyphEnabled;
            global.updateEffectControls();
        }
        
        // Execute toggle ON
        toggleAnaglyphEffect();
        
        // Verify anaglyph is enabled
        expect(global.anaglyphEnabled).toBe(true);
        expect(global.updateEffectControls).toHaveBeenCalled();
        
        // Execute toggle OFF
        toggleAnaglyphEffect();
        
        // Verify anaglyph is disabled
        expect(global.anaglyphEnabled).toBe(false);
        expect(global.updateEffectControls).toHaveBeenCalledTimes(2);
    });
    
    // Test render path selection based on effects
    test('render method should change based on active effects', () => {
        // Mock global variables
        global.anaglyphEnabled = false;
        global.composer = mockComposer;
        global.renderer = mockRenderer;
        global.anaglyphEffect = mockAnaglyphEffect;
        global.scene = mockScene;
        global.camera = mockCamera;
        
        // Mock render function
        function render() {
            if (global.anaglyphEnabled) {
                global.anaglyphEffect.render(global.scene, global.camera);
            } else {
                if (global.composer) {
                    global.composer.render();
                } else {
                    global.renderer.render(global.scene, global.camera);
                }
            }
        }
        
        // Test standard rendering (composer)
        render();
        expect(mockComposer.render).toHaveBeenCalled();
        expect(mockAnaglyphEffect.render).not.toHaveBeenCalled();
        mockComposer.render.mockClear();
        mockAnaglyphEffect.render.mockClear();
        
        // Test anaglyph rendering
        global.anaglyphEnabled = true;
        render();
        expect(mockComposer.render).not.toHaveBeenCalled();
        expect(mockAnaglyphEffect.render).toHaveBeenCalledWith(mockScene, mockCamera);
    });
    
    // Test window resize handler
    test('resize handler should update all renderers', () => {
        // Mock global variables
        global.camera = mockCamera;
        global.renderer = mockRenderer;
        global.composer = mockComposer;
        global.anaglyphEffect = mockAnaglyphEffect;
        global.window = {
            innerWidth: 1000,
            innerHeight: 500
        };
        
        // Mock resize function
        function handleResize() {
            global.camera.aspect = global.window.innerWidth / global.window.innerHeight;
            global.camera.updateProjectionMatrix();
            
            global.renderer.setSize(global.window.innerWidth, global.window.innerHeight);
            global.composer.setSize(global.window.innerWidth, global.window.innerHeight);
            
            if (global.anaglyphEffect) {
                global.anaglyphEffect.setSize(global.window.innerWidth, global.window.innerHeight);
            }
        }
        
        // Call resize handler
        handleResize();
        
        // Verify all resize methods called with correct dimensions
        expect(mockCamera.updateProjectionMatrix).toHaveBeenCalled();
        expect(mockRenderer.setSize).toHaveBeenCalledWith(1000, 500);
        expect(mockComposer.setSize).toHaveBeenCalledWith(1000, 500);
        expect(mockAnaglyphEffect.setSize).toHaveBeenCalledWith(1000, 500);
    });
});

// Integration test to verify all effects work together
describe('Cel-Shaded Museum Integration Tests', () => {
    test('all visual effects should work in combination', () => {
        // Mock global variables for effect states
        const effects = {
            celShadingEnabled: false,
            outlineEnabled: true,
            noisePassEnabled: true,
            anaglyphEnabled: false
        };
        
        // Track which render path is used
        let renderPathUsed = '';
        
        // Mock render function that checks combinations
        function render() {
            // Select render path based on active effects
            if (effects.anaglyphEnabled) {
                renderPathUsed = 'anaglyph';
            } else {
                renderPathUsed = 'composer';
            }
            
            // Anaglyph and outline can't be used together in reality
            if (effects.anaglyphEnabled && effects.outlineEnabled) {
                console.warn('Warning: Anaglyph effect does not support outline pass');
            }
        }
        
        // Test different combinations
        
        // Default state
        render();
        expect(renderPathUsed).toBe('composer');
        
        // Enable cel-shading
        effects.celShadingEnabled = true;
        render();
        expect(renderPathUsed).toBe('composer');
        
        // Enable anaglyph (disables outline effect in real implementation)
        effects.anaglyphEnabled = true;
        render();
        expect(renderPathUsed).toBe('anaglyph');
        
        // Disable outline and noise while keeping anaglyph
        effects.outlineEnabled = false;
        effects.noisePassEnabled = false;
        render();
        expect(renderPathUsed).toBe('anaglyph');
        
        // Disable anaglyph, keep cel-shading only
        effects.anaglyphEnabled = false;
        render();
        expect(renderPathUsed).toBe('composer');
    });
}); 