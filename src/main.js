import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import './style.css';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 1.6, 10); // New spawn position away from central objects and benches

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('container').appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// Controls
const controls = new PointerLockControls(camera, document.body);
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

// Movement
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let playerHeight = 1.8; // Typical height for a first-person camera

// Physics parameters for jumping
const gravity = 20.0; // Strength of gravity
let onGround = true;  // Tracks if player is on the ground

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const speed = 10.0;

// Acceleration and deceleration parameters - adjusted for smoother movement
const acceleration = 5.0;   // Reduced from 15.0 for more gradual acceleration
const deceleration = 3.0;   // Reduced from 8.0 for smoother stopping
const maxSpeed = 12.0;      // Slightly reduced max speed

// Museum layout
const museumSize = {
    width: 30,
    height: 6,
    depth: 30
};

// Artwork data
const artworks = [
    {
        title: "Starry Night",
        artist: "Vincent van Gogh",
        year: 1889,
        description: "One of Van Gogh's most famous works depicting a night scene with swirling stars.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1200px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
        position: { x: -14.9, y: 2.5, z: -10 },
        rotation: { y: Math.PI / 2 },
        size: { width: 5, height: 4 }
    },
    {
        title: "The Persistence of Memory",
        artist: "Salvador Dalí",
        year: 1931,
        description: "Famous surrealist painting with melting clocks, often referred to as 'Melting Clocks' or 'Soft Watches'.",
        image: "https://uploads6.wikiart.org/images/salvador-dali/the-persistence-of-memory-1931.jpg",
        position: { x: -14.9, y: 2.5, z: 0 },
        rotation: { y: Math.PI / 2 },
        size: { width: 4, height: 3 }
    },
    {
        title: "The Scream",
        artist: "Edvard Munch",
        year: 1893,
        description: "Iconic expressionist painting depicting an agonized figure against a red sky.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg",
        position: { x: -14.9, y: 2.5, z: 10 },
        rotation: { y: Math.PI / 2 },
        size: { width: 3, height: 4 }
    },
    {
        title: "The Great Wave off Kanagawa",
        artist: "Hokusai",
        year: 1831,
        description: "Famous ukiyo-e woodblock print depicting a large wave threatening boats off the coast of Kanagawa.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1200px-Tsunami_by_hokusai_19th_century.jpg",
        position: { x: 0, y: 2.5, z: -14.9 },
        rotation: { y: 0 },
        size: { width: 5, height: 3 }
    },
    {
        title: "Mona Lisa",
        artist: "Leonardo da Vinci",
        year: 1503,
        description: "One of the most famous portrait paintings in the world, known for the subject's enigmatic smile.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
        position: { x: 14.9, y: 2.5, z: 0 },
        rotation: { y: -Math.PI / 2 },
        size: { width: 3, height: 4.5 }
    },
    {
        title: "Girl with a Pearl Earring",
        artist: "Johannes Vermeer",
        year: 1665,
        description: "Tronie painting depicting a girl wearing an exotic dress and a large pearl earring.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg",
        position: { x: 14.9, y: 2.5, z: -10 },
        rotation: { y: -Math.PI / 2 },
        size: { width: 3, height: 4 }
    },
    {
        title: "The Night Watch",
        artist: "Rembrandt",
        year: 1642,
        description: "Large group portrait of a militia company, notable for its use of light and shadow.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Night_Watch_-_HD.jpg/1200px-The_Night_Watch_-_HD.jpg",
        position: { x: 0, y: 2.5, z: 14.9 },
        rotation: { y: Math.PI },
        size: { width: 6, height: 4 }
    },
    {
        title: "Fine Wind, Clear Morning",
        artist: "Hokusai",
        year: 1830,
        description: "Also known as 'Red Fuji', this is one of Hokusai's most famous woodblock prints from the series 'Thirty-six Views of Mount Fuji', depicting the mountain on a clear morning with a gentle wind.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Red_Fuji_southern_wind_clear_morning.jpg/1200px-Red_Fuji_southern_wind_clear_morning.jpg",
        position: { x: 14.9, y: 2.5, z: 10 },
        rotation: { y: -Math.PI / 2 },
        size: { width: 4, height: 3 }
    }
];

// Create museum structure
function createMuseum() {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(museumSize.width, museumSize.depth);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf0f0f0, 
        roughness: 0.1,
        metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(museumSize.width, museumSize.depth);
    const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = museumSize.height;
    scene.add(ceiling);

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf5f5f5,
        roughness: 0.2
    });

    // North wall
    const northWallGeometry = new THREE.PlaneGeometry(museumSize.width, museumSize.height);
    const northWall = new THREE.Mesh(northWallGeometry, wallMaterial);
    northWall.position.z = -museumSize.depth / 2;
    northWall.position.y = museumSize.height / 2;
    northWall.receiveShadow = true;
    scene.add(northWall);

    // South wall
    const southWallGeometry = new THREE.PlaneGeometry(museumSize.width, museumSize.height);
    const southWall = new THREE.Mesh(southWallGeometry, wallMaterial);
    southWall.position.z = museumSize.depth / 2;
    southWall.position.y = museumSize.height / 2;
    southWall.rotation.y = Math.PI;
    southWall.receiveShadow = true;
    scene.add(southWall);

    // East wall
    const eastWallGeometry = new THREE.PlaneGeometry(museumSize.depth, museumSize.height);
    const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
    eastWall.position.x = museumSize.width / 2;
    eastWall.position.y = museumSize.height / 2;
    eastWall.rotation.y = -Math.PI / 2;
    eastWall.receiveShadow = true;
    scene.add(eastWall);

    // West wall
    const westWallGeometry = new THREE.PlaneGeometry(museumSize.depth, museumSize.height);
    const westWall = new THREE.Mesh(westWallGeometry, wallMaterial);
    westWall.position.x = -museumSize.width / 2;
    westWall.position.y = museumSize.height / 2;
    westWall.rotation.y = Math.PI / 2;
    westWall.receiveShadow = true;
    scene.add(westWall);

    // Add central columns or features
    addMuseumFeatures();
}

function addMuseumFeatures() {
    // Central feature - could be a sculpture base or information desk
    const pedestalGeometry = new THREE.BoxGeometry(4, 1, 4);
    const pedestalMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x808080,
        roughness: 0.2,
        metalness: 0.3
    });
    const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    pedestal.position.set(0, 0.5, 0);
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Add a simple sculpture on top of the pedestal
    const sculptureGeometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const sculptureMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffd700, // Gold color
        roughness: 0.1,
        metalness: 0.8
    });
    const sculpture = new THREE.Mesh(sculptureGeometry, sculptureMaterial);
    sculpture.position.set(0, 2, 0);
    sculpture.castShadow = true;
    sculpture.scale.set(0.7, 0.7, 0.7);
    scene.add(sculpture);

    // Add some benches
    addBench(-5, 0, -5);
    addBench(5, 0, -5);
    addBench(-5, 0, 5);
    addBench(5, 0, 5);

    // Add a function to create a fancy chandelier
    addChandelier();
}

function addBench(x, y, z) {
    const benchGroup = new THREE.Group();
    
    // Bench top
    const benchTopGeometry = new THREE.BoxGeometry(3, 0.2, 0.8);
    const benchMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513, // Brown
        roughness: 0.8
    });
    const benchTop = new THREE.Mesh(benchTopGeometry, benchMaterial);
    benchTop.position.y = 0.5;
    benchTop.castShadow = true;
    benchTop.receiveShadow = true;
    benchGroup.add(benchTop);
    
    // Bench legs
    const legGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.6);
    const legMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3d3d3d, 
        roughness: 0.5
    });
    
    const leg1 = new THREE.Mesh(legGeometry, legMaterial);
    leg1.position.set(-1.2, 0.25, 0);
    leg1.castShadow = true;
    leg1.receiveShadow = true;
    
    const leg2 = new THREE.Mesh(legGeometry, legMaterial);
    leg2.position.set(1.2, 0.25, 0);
    leg2.castShadow = true;
    leg2.receiveShadow = true;
    
    benchGroup.add(leg1);
    benchGroup.add(leg2);
    benchGroup.position.set(x, y, z);
    
    scene.add(benchGroup);
}

// Create and add artwork to the museum
function createArtworks() {
    artworks.forEach((artwork, index) => {
        // Create a frame for the artwork
        const frameWidth = artwork.size.width + 0.2;
        const frameHeight = artwork.size.height + 0.2;
        const frameDepth = 0.1;
        
        const frameGeometry = new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth);
        const frameMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b4513, // Brown frame
            roughness: 0.8
        });
        
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(
            artwork.position.x, 
            artwork.position.y, 
            artwork.position.z
        );
        
        if (artwork.rotation) {
            frame.rotation.y = artwork.rotation.y;
        }
        
        frame.castShadow = true;
        frame.receiveShadow = true;
        frame.userData = { artworkIndex: index };
        scene.add(frame);
        
        // Create the artwork texture
        const loader = new THREE.TextureLoader();
        
        loader.load(
            artwork.image,
            function(texture) {
                const paintingGeometry = new THREE.PlaneGeometry(artwork.size.width, artwork.size.height);
                const paintingMaterial = new THREE.MeshBasicMaterial({ 
                    map: texture,
                    side: THREE.FrontSide
                });
                
                const painting = new THREE.Mesh(paintingGeometry, paintingMaterial);
                
                // Position the painting slightly in front of the frame
                const offset = 0.06;
                const position = new THREE.Vector3().copy(frame.position);
                
                // Adjust position based on rotation
                if (artwork.rotation) {
                    if (artwork.rotation.y === Math.PI / 2) {
                        position.x += offset;
                    } else if (artwork.rotation.y === -Math.PI / 2) {
                        position.x -= offset;
                    } else if (artwork.rotation.y === Math.PI) {
                        position.z -= offset;
                    } else {
                        position.z += offset;
                    }
                } else {
                    position.z += offset;
                }
                
                painting.position.copy(position);
                
                if (artwork.rotation) {
                    painting.rotation.y = artwork.rotation.y;
                }
                
                painting.userData = { artworkIndex: index };
                scene.add(painting);
            },
            undefined,
            function(error) {
                console.error('Error loading texture', error);
            }
        );
    });
}

// Create info panel for artwork details
const artworkInfoPanel = document.createElement('div');
artworkInfoPanel.className = 'artwork-info';
artworkInfoPanel.innerHTML = '<h2>Artwork Title</h2><p>Artist (Year)</p><p>Description...</p>';
document.body.appendChild(artworkInfoPanel);

// Interaction with artworks
function setupInteraction() {
    // Check for artwork interaction when the mouse moves
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onMouseClick);
    
    // Make sure keyboard controls are registered here
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
    console.log('All interaction event listeners have been registered');
}

function onMouseMove(event) {
    // Update the mouse position for raycasting
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseClick(event) {
    // Only handle clicks when pointer is locked (in navigation mode)
    if (!controls.isLocked) return;
    
    // Cast a ray from the camera
    raycaster.setFromCamera(new THREE.Vector2(), camera);
    
    // Check for intersections with artwork frames or paintings
    const intersects = raycaster.intersectObjects(scene.children);
    
    for (let i = 0; i < intersects.length; i++) {
        const intersect = intersects[i];
        
        // Check if the intersected object is an artwork
        if (intersect.object.userData.hasOwnProperty('artworkIndex')) {
            const artworkIndex = intersect.object.userData.artworkIndex;
            const artwork = artworks[artworkIndex];
            
            // Display artwork information
            showArtworkInfo(artwork);
            break;
        }
    }
}

function showArtworkInfo(artwork) {
    artworkInfoPanel.innerHTML = `
        <h2>${artwork.title}</h2>
        <p>${artwork.artist} (${artwork.year})</p>
        <p>${artwork.description}</p>
    `;
    artworkInfoPanel.classList.add('visible');
    
    // Hide after a few seconds
    setTimeout(() => {
        artworkInfoPanel.classList.remove('visible');
    }, 6000);
}

// Collision detection
function checkCollisions() {
    // Basic collision with walls
    if (camera.position.x < -museumSize.width / 2 + 0.5) camera.position.x = -museumSize.width / 2 + 0.5;
    if (camera.position.x > museumSize.width / 2 - 0.5) camera.position.x = museumSize.width / 2 - 0.5;
    if (camera.position.z < -museumSize.depth / 2 + 0.5) camera.position.z = -museumSize.depth / 2 + 0.5;
    if (camera.position.z > museumSize.depth / 2 - 0.5) camera.position.z = museumSize.depth / 2 - 0.5;
    
    // Floor collision (for jumping)
    if (camera.position.y < playerHeight) {
        camera.position.y = playerHeight;
        velocity.y = 0;
        canJump = true;
        onGround = true;
    } else {
        onGround = false;
    }
    
    // Ceiling collision
    if (camera.position.y > museumSize.height - 0.5) {
        camera.position.y = museumSize.height - 0.5;
        velocity.y = 0;
    }
}

// Keyboard controls
function onKeyDown(event) {
    // Add logging only for D key
    if (event.code === 'KeyD' || event.code === 'ArrowRight') {
        console.log('D/Right key pressed, code:', event.code);
    }
    
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            toggleKeyClass('key-W', true);
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            toggleKeyClass('key-A', true);
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            toggleKeyClass('key-S', true);
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            toggleKeyClass('key-D', true);
            console.log('D key: moveRight set to', moveRight);  // Debug the moveRight value
            break;
        case 'Space':
            if (canJump === true) {
                velocity.y = 10; // Initial jump velocity
                console.log('Jump initiated');
            }
            canJump = false;
            toggleKeyClass('key-Space', true);
            break;
    }
}

function onKeyUp(event) {
    // Add logging only for D key
    if (event.code === 'KeyD' || event.code === 'ArrowRight') {
        console.log('D/Right key released, code:', event.code);
    }
    
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            toggleKeyClass('key-W', false);
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            toggleKeyClass('key-A', false);
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            toggleKeyClass('key-S', false);
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            toggleKeyClass('key-D', false);
            break;
        case 'Space':
            toggleKeyClass('key-Space', false);
            break;
    }
}

// Helper function to safely toggle key classes
function toggleKeyClass(id, isActive) {
    const element = document.getElementById(id);
    if (element) {
        if (isActive) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    }
}

// Function to update the speed meter
function updateSpeedMeter() {
    // Calculate the current speed from X and Z velocity components
    const horizontalSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
    
    // Update the numeric value (rounded to 1 decimal place)
    const speedValueElement = document.getElementById('speed-value');
    if (speedValueElement) {
        speedValueElement.textContent = horizontalSpeed.toFixed(1);
    }
    
    // Update the speed bar width as a percentage of max speed
    const speedBarElement = document.getElementById('speed-bar');
    if (speedBarElement) {
        const percentage = Math.min((horizontalSpeed / maxSpeed) * 100, 100);
        speedBarElement.style.width = `${percentage}%`;
        
        // Change color based on speed (green to yellow to red)
        if (percentage > 80) {
            speedBarElement.style.background = 'linear-gradient(to right, #fc2, #f44)';
        } else if (percentage > 50) {
            speedBarElement.style.background = 'linear-gradient(to right, #4c8, #fc2)';
        } else {
            speedBarElement.style.background = 'linear-gradient(to right, #4c8, #8cf)';
        }
    }
}

// Lock/unlock controls with click
const container = document.getElementById('container');
const loadingElement = document.getElementById('loading');
const infoElement = document.getElementById('info');

container.addEventListener('click', function() {
    controls.lock();
});

controls.addEventListener('lock', function() {
    infoElement.classList.add('hidden');
});

controls.addEventListener('unlock', function() {
    infoElement.classList.remove('hidden');
    artworkInfoPanel.classList.remove('visible');
});

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (controls.isLocked) {
        // Time delta
        const time = performance.now();
        const delta = (time - prevTime) / 1000;
        
        // Direction based on key presses
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        
        // Only normalize if we're actually moving
        if (direction.x !== 0 || direction.z !== 0) {
            direction.normalize();
        }
        
        // Apply gravity to vertical velocity
        velocity.y -= gravity * delta;
        
        // Apply acceleration or deceleration for X axis (left/right)
        if (moveLeft || moveRight) {
            // Smooth acceleration when keys are pressed
            // This creates a more gradual ramp-up effect
            const currentSpeed = Math.abs(velocity.x);
            const accelerationFactor = 1 - (currentSpeed / maxSpeed); // Slows acceleration as we approach max speed
            
            velocity.x -= direction.x * acceleration * accelerationFactor * delta;
            
            // Limit to max speed - with a softer cap
            if (Math.abs(velocity.x) > maxSpeed) {
                // Gradually bring speed down to max rather than hard capping
                velocity.x = Math.sign(velocity.x) * (maxSpeed + (Math.abs(velocity.x) - maxSpeed) * 0.9);
            }
        } else {
            // Smooth deceleration when keys are released
            // Use a quadratic falloff for more natural deceleration
            if (Math.abs(velocity.x) > 0.005) { // Lower threshold for smoother stop
                const decelerationStrength = Math.min(deceleration, Math.abs(velocity.x) * 5);
                velocity.x -= velocity.x * decelerationStrength * delta;
            } else {
                velocity.x = 0; // Complete stop below threshold
            }
        }
        
        // Apply acceleration or deceleration for Z axis (forward/backward)
        if (moveForward || moveBackward) {
            // Smooth acceleration when keys are pressed
            const currentSpeed = Math.abs(velocity.z);
            const accelerationFactor = 1 - (currentSpeed / maxSpeed); // Slows acceleration as we approach max speed
            
            velocity.z -= direction.z * acceleration * accelerationFactor * delta;
            
            // Limit to max speed - with a softer cap
            if (Math.abs(velocity.z) > maxSpeed) {
                // Gradually bring speed down to max rather than hard capping
                velocity.z = Math.sign(velocity.z) * (maxSpeed + (Math.abs(velocity.z) - maxSpeed) * 0.9);
            }
        } else {
            // Smooth deceleration when keys are released
            if (Math.abs(velocity.z) > 0.005) { // Lower threshold for smoother stop
                const decelerationStrength = Math.min(deceleration, Math.abs(velocity.z) * 5);
                velocity.z -= velocity.z * decelerationStrength * delta;
            } else {
                velocity.z = 0; // Complete stop below threshold
            }
        }
        
        // Move the camera based on velocity
        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        
        // Apply vertical movement (jumping/falling)
        camera.position.y += velocity.y * delta;
        
        // Check for collisions after movement
        checkCollisions();
        
        // Update the speed meter to show current velocity
        updateSpeedMeter();
        
        prevTime = time;
    }
    
    renderer.render(scene, camera);
}

// Initialize the museum
function init() {
    // Check if key elements exist
    const keyElements = ['key-W', 'key-A', 'key-S', 'key-D'];
    keyElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Key element not found: ${id}`);
        } else {
            console.log(`Key element found: ${id}`);
        }
    });
    
    createMuseum();
    createArtworks();
    setupInteraction();
    
    // Hide loading indicator
    setTimeout(() => {
        loadingElement.classList.add('hidden');
    }, 2000);
    
    animate();
}

// Add a function to create a fancy chandelier
function addChandelier() {
    // Create main chandelier structure
    const chandGroup = new THREE.Group();
    
    // Center rod
    const rodGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
    const rodMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,  // Bronze/copper color
        metalness: 0.8,
        roughness: 0.2
    });
    const rod = new THREE.Mesh(rodGeometry, rodMaterial);
    rod.position.y = -0.75;
    chandGroup.add(rod);
    
    // Main body - decorative orb
    const bodyGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xB87333,  // Copper 
        metalness: 0.9,
        roughness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    chandGroup.add(body);
    
    // Ring for lights
    const ringGeometry = new THREE.TorusGeometry(1.2, 0.08, 16, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xB87333,  // Copper
        metalness: 0.9,
        roughness: 0.1 
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = -0.5;
    ring.rotation.x = Math.PI / 2;
    chandGroup.add(ring);
    
    // Add decorative chains
    for (let i = 0; i < 4; i++) {
        const chainGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8);
        const chain = new THREE.Mesh(chainGeometry, rodMaterial);
        chain.position.y = -0.75;
        chain.position.x = Math.sin(i * Math.PI/2) * 0.7;
        chain.position.z = Math.cos(i * Math.PI/2) * 0.7;
        // Tilt chains outward slightly
        chain.rotation.x = Math.sin(i * Math.PI/2) * 0.2;
        chain.rotation.z = Math.cos(i * Math.PI/2) * 0.2;
        chandGroup.add(chain);
    }
    
    // Add lights around the ring
    const numLights = 8;
    for (let i = 0; i < numLights; i++) {
        // Create a small bulb geometry
        const bulbGeometry = new THREE.SphereGeometry(0.12, 8, 8);
        const bulbMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFFF99,  // Light yellow
            emissive: 0xFFFF99,
            emissiveIntensity: 1,
            metalness: 0.1,
            roughness: 0.1
        });
        const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
        
        // Position around the ring
        const angle = (i / numLights) * Math.PI * 2;
        bulb.position.x = Math.sin(angle) * 1.2;
        bulb.position.z = Math.cos(angle) * 1.2;
        bulb.position.y = -0.5;
        chandGroup.add(bulb);
        
        // Add a point light at each bulb
        const pointLight = new THREE.PointLight(0xFFFF99, 0.5, 5);
        pointLight.position.copy(bulb.position);
        chandGroup.add(pointLight);
    }
    
    // Add a central point light for overall illumination
    const centralLight = new THREE.PointLight(0xFFFFAA, 1, 15);
    centralLight.position.y = -0.3;
    chandGroup.add(centralLight);
    
    // Position the chandelier in the center of the museum, hanging from the ceiling
    chandGroup.position.set(0, museumSize.height - 0.5, 0);
    
    // Add subtle animation to make the chandelier sway slightly
    const animateChandelier = () => {
        const time = Date.now() * 0.001;
        chandGroup.rotation.x = Math.sin(time * 0.5) * 0.02;
        chandGroup.rotation.z = Math.sin(time * 0.3) * 0.02;
        requestAnimationFrame(animateChandelier);
    };
    animateChandelier();
    
    scene.add(chandGroup);
}

init();