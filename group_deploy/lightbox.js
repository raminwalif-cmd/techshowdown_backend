// lightbox.js
document.addEventListener('DOMContentLoaded', () => {
    // Create the lightbox overlay element
    const overlay = document.createElement('div');
    overlay.id = 'global-lightbox-overlay';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'lightbox-wrapper';

    const img = document.createElement('img');
    img.id = 'global-lightbox-img';

    const closeBtn = document.createElement('div');
    closeBtn.className = 'lightbox-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.title = "Close (Esc)";

    wrapper.appendChild(img);
    wrapper.appendChild(closeBtn);
    overlay.appendChild(wrapper);
    document.body.appendChild(overlay);

    // Function to close lightbox
    const closeLightbox = () => {
        overlay.classList.remove('active');
        setTimeout(() => {
            img.src = ''; // Clear source to prevent ghosting on next load
        }, 300);
    };

    // Add click event to close when clicking outside the image or on the close button
    overlay.addEventListener('click', (e) => {
        if (e.target !== img) {
            closeLightbox();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeLightbox();
        }
    });

    // Attach click events to all content images
    // Exclude logos and explicitly ignored images
    const images = document.querySelectorAll('img:not(#primary-logo-img):not(.lightbox-ignore):not(.ext-style-2)');
    images.forEach(image => {
        // Only apply to images that are likely content (not tiny icons)
        // We can add a simple check, or just apply it. 
        image.style.cursor = 'zoom-in';
        image.title = "Click to enlarge";
        
        image.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default if wrapped in an anchor
            img.src = image.src;
            overlay.classList.add('active');
        });
    });
});
