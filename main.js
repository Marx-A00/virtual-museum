import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 0); // Average human height

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

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const speed = 5.0;

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
}

// Keyboard controls
function onKeyDown(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
}

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

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
        
        // Deceleration
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        
        // Direction based on key presses
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();
        
        // Movement
        if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;
        
        // Apply movement
        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        
        // Check for collisions after movement
        checkCollisions();
        
        prevTime = time;
    }
    
    renderer.render(scene, camera);
}

// Initialize the museum
function init() {
    createMuseum();
    createArtworks();
    setupInteraction();
    
    // Hide loading indicator
    setTimeout(() => {
        loadingElement.classList.add('hidden');
    }, 2000);
    
    animate();
}

init();