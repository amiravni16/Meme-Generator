'use strict'

function initGalleryController() {
    console.log('initGalleryController called')
    renderGallery()
}

function renderGallery() {
    console.log('renderGallery called')
    const gallery = document.getElementById('gallery-content')
    const imgs = getImages()
    console.log('Images to render:', imgs)
    
    let htmlStr = ''
    imgs.forEach(img => {
        const imgHtml = `
            <div class="gallery-item">
                <img src="${img.url}" alt="Meme Image ${img.id}" onclick="onImgSelect(${img.id})">
            </div>
        `
        console.log('Generated HTML for image:', img.id, imgHtml)
        htmlStr += imgHtml
    })
    
    console.log('Combined HTML:', htmlStr)
    gallery.innerHTML = htmlStr
    console.log('Gallery HTML set:', gallery.innerHTML)
    
    setTimeout(() => {
        const imgElements = gallery.querySelectorAll('img')
        console.log('Number of images in DOM:', imgElements.length)
        imgElements.forEach(img => {
            console.log('Image in DOM:', img.src, 'Natural width:', img.naturalWidth)
        })
    }, 1000)
}

function onImgSelect(imgId) {
    console.log('onImgSelect called with imgId:', imgId)
    setImg(imgId)
    document.getElementById('gallery').style.display = 'none'
    document.getElementById('editor').style.display = 'block'
    renderMeme()
}