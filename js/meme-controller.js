'use strict'

function initMemeController() {
    renderMeme()
    initTextInput()
}

function initTextInput() {
    const textInput = document.getElementById('meme-text-input')
    textInput.addEventListener('input', () => {
        setLineTxt(textInput.value)
        renderMeme()
    })
}

function renderMeme() {
    const meme = getMeme()
    const imgData = getImageById(meme.selectedImgId)
    
    const canvas = document.getElementById('meme-canvas')
    const ctx = canvas.getContext('2d')


    const img = new Image()
    img.src = imgData.url
    img.onload = () => {
       
        canvas.width = img.width
        canvas.height = img.height


        ctx.drawImage(img, 0, 0)

 
        const line = meme.lines[meme.selectedLineIdx]
        ctx.font = `${line.size}px Arial`
        ctx.fillStyle = line.color
        ctx.textAlign = 'center'
        ctx.fillText(line.txt, canvas.width / 2, 50)
    }
}