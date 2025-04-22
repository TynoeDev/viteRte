/**
 * 3D-fallback.js - Provides fallback content when Three.js cannot be loaded
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if the scene element exists
    const sceneElement = document.getElementById('scene');
    if (!sceneElement) return;

    // Create fallback content
    const fallbackContent = document.createElement('div');
    fallbackContent.className = 'fallback-scene';
    fallbackContent.innerHTML = `
        <div class="fallback-message">
            <i class="ph ph-cube"></i>
            <p>Interactive 3D visualization will appear here</p>
        </div>
    `;

    // Add fallback to the scene element
    sceneElement.appendChild(fallbackContent);

    // Style the fallback
    fallbackContent.style.width = '100%';
    fallbackContent.style.height = '100%';
    fallbackContent.style.display = 'flex';
    fallbackContent.style.alignItems = 'center';
    fallbackContent.style.justifyContent = 'center';
    fallbackContent.style.backgroundColor = 'rgba(26, 30, 44, 0.5)';
    fallbackContent.style.borderRadius = '8px';

    const messageDiv = fallbackContent.querySelector('.fallback-message');
    messageDiv.style.textAlign = 'center';
    messageDiv.style.padding = '20px';

    const icon = fallbackContent.querySelector('i');
    icon.style.fontSize = '3rem';
    icon.style.marginBottom = '1rem';
    icon.style.color = '#20b2aa';

    const text = fallbackContent.querySelector('p');
    text.style.margin = '0';
    text.style.fontSize = '1rem';
    text.style.color = '#ffffff';
});