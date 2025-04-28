'use strict'

function initGalleryController() {
    console.log('initGalleryController called')
    renderGallery()
}

function renderGallery() {
    console.log('renderGallery called')
    const gallery = document.getElementById('gallery-content')
    const imgs = getImages().slice(0, 2) // For testing, limit to 2 images
    console.log('Images to render:', imgs)
    
    const htmlArray = imgs.map(img => {
        const imgHtml = `<img src="${img.url}" alt="Meme Image ${img.id}" class="w-full h-32 object-cover rounded cursor-pointer" onclick="onImgSelect(${img.id})">`
        console.log('Generated HTML for image:', img.id, imgHtml)
        return imgHtml
    })
    
    const html = htmlArray.join('')
    console.log('Combined HTML:', html)
    
    gallery.innerHTML = html
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