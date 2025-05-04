'use strict'

document.addEventListener('DOMContentLoaded', () => {
    initGalleryController()
    initMemeController()

    const galleryBtn = document.querySelector('[data-trans="gallery"]');
    if (galleryBtn) {
        galleryBtn.addEventListener('click', (ev) => {
            ev.preventDefault();
            document.getElementById('gallery').style.display = 'block';
            document.getElementById('editor').style.display = 'none';
            const savedMemes = document.getElementById('saved-memes');
            if (savedMemes) savedMemes.style.display = 'none';
        });
    }

    const moreBtn = document.getElementById('more-search-btn');
    const searchBar = document.querySelector('.search-bar');
    if (moreBtn && searchBar) {
        moreBtn.addEventListener('click', () => {
            searchBar.classList.toggle('show-actions');
        });
    }
})