/**
 * 3D-Scene.js - Creates and manages the interactive 3D scene
 * This script utilizes Three.js to render and animate a 3D scene
 * that visualizes different aspects of the platform.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if Three.js is available
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded. Skipping 3D scene creation.');

        // Create fallback content
        const sceneElement = document.getElementById('scene');
        if (sceneElement) {
            sceneElement.innerHTML = `
                <div class="fallback-scene">
                    <div class="fallback-message">
                        <i class="ph ph-cube"></i>
                        <p>Interactive 3D visualization not available</p>
                    </div>
                </div>
            `;
        }
        return;
    }

    // Initialize the scene
    initScene();
});

let scene, camera, renderer, mixer;
let currentView = 'funding';
let animationObjects = {};
let clock = new THREE.Clock();

function initScene() {
    const container = document.getElementById('scene');
    if (!container) return;

    // Get the dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x12151e);

    // Create camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x20b2aa, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create basic objects for each view
    createFundingView();
    createProjectsView();
    createGovernanceView();

    // Initial view
    showView('funding');

    // Add orbit controls if available
    if (typeof THREE.OrbitControls !== 'undefined') {
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.enablePan = false;
        controls.rotateSpeed = 0.5;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
    }

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();
}

function createFundingView() {
    const group = new THREE.Group();
    group.visible = false;
    scene.add(group);

    // Create a token
    const tokenGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 32);
    const tokenMaterial = new THREE.MeshStandardMaterial({
        color: 0x20b2aa,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x20b2aa,
        emissiveIntensity: 0.2
    });

    const token = new THREE.Mesh(tokenGeometry, tokenMaterial);

    // Add details to the token face
    const detailGeometry = new THREE.RingGeometry(0.5, 0.7, 16);
    const detailMaterial = new THREE.MeshStandardMaterial({
        color: 0x00bfff,
        metalness: 0.9,
        roughness: 0.1,
    });

    const tokenDetail = new THREE.Mesh(detailGeometry, detailMaterial);
    tokenDetail.position.z = 0.101;
    tokenDetail.rotation.x = Math.PI / 2;
    token.add(tokenDetail);

    const centerGeometry = new THREE.CircleGeometry(0.3, 16);
    const centerMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.1,
    });

    const tokenCenter = new THREE.Mesh(centerGeometry, centerMaterial);
    tokenCenter.position.z = 0.102;
    tokenCenter.rotation.x = Math.PI / 2;
    token.add(tokenCenter);

    // Create smaller tokens
    for (let i = 0; i < 10; i++) {
        const smallToken = token.clone();
        const scale = 0.2 + Math.random() * 0.3;
        smallToken.scale.set(scale, scale, scale);

        // Position in a circular pattern
        const angle = (i / 10) * Math.PI * 2;
        const radius = 2.5 + Math.random() * 0.5;
        smallToken.position.x = Math.sin(angle) * radius;
        smallToken.position.y = Math.cos(angle) * radius;
        smallToken.position.z = (Math.random() - 0.5) * 1.5;

        // Random rotation
        smallToken.rotation.x = Math.random() * Math.PI;
        smallToken.rotation.y = Math.random() * Math.PI;

        group.add(smallToken);
    }

    // Add main token
    token.position.set(0, 0, 0);
    group.add(token);

    // Create connecting lines
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00bfff,
        opacity: 0.6,
        transparent: true
    });

    for (let i = 1; i < group.children.length; i++) {
        const smallToken = group.children[i];

        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(
                smallToken.position.x,
                smallToken.position.y,
                smallToken.position.z
            )
        ]);

        const line = new THREE.Line(lineGeometry, lineMaterial);
        group.add(line);
    }

    animationObjects.funding = group;
}

function createProjectsView() {
    const group = new THREE.Group();
    group.visible = false;
    scene.add(group);

    // Create central node
    const nodeGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const nodeMaterial = new THREE.MeshStandardMaterial({
        color: 0x8a2be2,
        metalness: 0.5,
        roughness: 0.3,
        emissive: 0x8a2be2,
        emissiveIntensity: 0.2
    });

    const centralNode = new THREE.Mesh(nodeGeometry, nodeMaterial);
    group.add(centralNode);

    // Create project nodes
    const projectGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const projectColors = [
        0x00bfff, // Blue
        0x20b2aa, // Green
        0xffa502, // Orange
        0xff4757, // Red
        0x8a2be2 // Purple
    ];

    for (let i = 0; i < 5; i++) {
        const material = new THREE.MeshStandardMaterial({
            color: projectColors[i],
            metalness: 0.5,
            roughness: 0.3
        });

        const project = new THREE.Mesh(projectGeometry, material);

        // Position in a star pattern
        const angle = (i / 5) * Math.PI * 2;
        project.position.x = Math.sin(angle) * 3;
        project.position.y = Math.cos(angle) * 3;

        // Add to group
        group.add(project);

        // Create connection line
        const lineMaterial = new THREE.LineBasicMaterial({
            color: projectColors[i],
            opacity: 0.6,
            transparent: true
        });

        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(project.position.x, project.position.y, 0)
        ]);

        const line = new THREE.Line(lineGeometry, lineMaterial);
        group.add(line);
    }

    animationObjects.projects = group;
}

function createGovernanceView() {
    const group = new THREE.Group();
    group.visible = false;
    scene.add(group);

    // Create network nodes
    const nodeCount = 20;
    const nodes = [];
    const nodeGeometry = new THREE.SphereGeometry(0.2, 16, 16);

    for (let i = 0; i < nodeCount; i++) {
        const nodeMaterial = new THREE.MeshStandardMaterial({
            color: i === 0 ? 0x8a2be2 : 0x00bfff,
            metalness: 0.5,
            roughness: 0.3,
            emissive: i === 0 ? 0x8a2be2 : 0x00bfff,
            emissiveIntensity: 0.2
        });

        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);

        // Position randomly within sphere
        const radius = 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        node.position.x = radius * Math.sin(phi) * Math.cos(theta);
        node.position.y = radius * Math.sin(phi) * Math.sin(theta);
        node.position.z = radius * Math.cos(phi);

        // Make central node larger
        if (i === 0) {
            node.scale.set(2, 2, 2);
            node.position.set(0, 0, 0);
        }

        group.add(node);
        nodes.push(node);
    }

    // Create connections between nodes
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x20b2aa,
        opacity: 0.3,
        transparent: true
    });

    // Connect center to all nodes
    for (let i = 1; i < nodes.length; i++) {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(
                nodes[i].position.x,
                nodes[i].position.y,
                nodes[i].position.z
            )
        ]);

        const line = new THREE.Line(lineGeometry, lineMaterial);
        group.add(line);
    }

    // Connect some nodes to each other
    for (let i = 1; i < nodes.length; i++) {
        // Connect to 2-3 random other nodes
        const connectionCount = 2 + Math.floor(Math.random() * 2);

        for (let j = 0; j < connectionCount; j++) {
            // Get random node other than self
            let otherIndex;
            do {
                otherIndex = 1 + Math.floor(Math.random() * (nodes.length - 1));
            } while (otherIndex === i);

            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(
                    nodes[i].position.x,
                    nodes[i].position.y,
                    nodes[i].position.z
                ),
                new THREE.Vector3(
                    nodes[otherIndex].position.x,
                    nodes[otherIndex].position.y,
                    nodes[otherIndex].position.z
                )
            ]);

            const line = new THREE.Line(lineGeometry, lineMaterial);
            group.add(line);
        }
    }

    animationObjects.governance = group;
}

function showView(view) {
    // Hide all views
    for (const key in animationObjects) {
        if (animationObjects[key]) {
            animationObjects[key].visible = false;
        }
    }

    // Show selected view
    if (animationObjects[view]) {
        animationObjects[view].visible = true;
    }

    currentView = view;
}

function animate() {
    requestAnimationFrame(animate);

    // Update animations based on current view
    const delta = clock.getDelta();

    if (animationObjects[currentView]) {
        const group = animationObjects[currentView];

        // Rotate the entire group slowly
        group.rotation.y += 0.005;

        // Additional animations for specific views
        switch (currentView) {
            case 'funding':
                // Pulse the tokens
                group.children.forEach((child, index) => {
                    if (child.isMesh) {
                        child.rotation.x += 0.01;
                        child.rotation.y += 0.01;

                        // Pulse scale
                        const time = Date.now() * 0.001;
                        const pulse = Math.sin(time + index) * 0.05 + 1;
                        child.scale.set(pulse, pulse, pulse);
                    }
                });
                break;

            case 'projects':
                // Rotate the projects
                group.children.forEach((child, index) => {
                    if (child.isMesh && index > 0) { // Skip central node
                        child.rotation.x += 0.01;
                        child.rotation.y += 0.02;

                        // Gentle floating motion
                        const time = Date.now() * 0.001;
                        child.position.z = Math.sin(time + index) * 0.3;
                    }
                });
                break;

            case 'governance':
                // Gentle pulsating for the network
                group.children.forEach((child, index) => {
                    if (child.isMesh) {
                        const time = Date.now() * 0.001;
                        const pulse = Math.sin(time + index * 0.5) * 0.1 + 1;

                        // Apply pulse to non-central nodes
                        if (index > 0) {
                            child.scale.set(pulse, pulse, pulse);
                        }
                    }
                });
                break;
        }
    }

    // Update mixer animations if they exist
    if (mixer) {
        mixer.update(delta);
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('scene');
    if (!container || !camera || !renderer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

// Export function for external control
window.updateScene = showView;