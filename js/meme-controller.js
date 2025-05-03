'use strict'

var isDragging = false
var draggedLineIdx = -1
var dragOffsetX = 0
var dragOffsetY = 0
var selectedLineIdx = 0
var currentImageObj = null 
var gElCanvas = document.getElementById('meme-canvas')
var gCtx = gElCanvas.getContext('2d')

function initMemeController() {
    console.log('initMemeController called')
    initEditorControls()
    initCanvasDragAndDrop()
    preloadImage() 
}

function preloadImage() {
    const meme = getMeme()
    const img = getImageById(meme.selectedImgId)
    currentImageObj = new Image()
    currentImageObj.src = img.url
    currentImageObj.onload = () => {
        renderMeme() 
    }
}

function initEditorControls() {
    const textInput = document.getElementById('meme-text-input')
    textInput.addEventListener('input', () => {
        const meme = getMeme()
        setLineTxt(textInput.value, meme.selectedLineIdx)
        renderMeme()
    })

    const moveUpBtn = document.getElementById('move-up-btn')
    moveUpBtn.addEventListener('click', () => {
        adjustLinePosition(getMeme().selectedLineIdx, -10, 500)
        renderMeme()
    })

    const moveDownBtn = document.getElementById('move-down-btn')
    moveDownBtn.addEventListener('click', () => {
        adjustLinePosition(getMeme().selectedLineIdx, 10, 500)
        renderMeme()
    })

    const switchLineBtn = document.getElementById('switch-line-btn')
    switchLineBtn.addEventListener('click', () => {
        switchLine()
        const meme = getMeme()
        selectedLineIdx = meme.selectedLineIdx
        document.getElementById('meme-text-input').value = meme.lines[meme.selectedLineIdx].txt
        renderMeme()
    })

    const addLineBtn = document.getElementById('add-line-btn')
    addLineBtn.addEventListener('click', () => {
        const newLineIdx = addLine()
        setSelectedLine(newLineIdx)
        selectedLineIdx = newLineIdx
        document.getElementById('meme-text-input').value = ''
        renderMeme()
    })

    const deleteLineBtn = document.getElementById('delete-line-btn')
    deleteLineBtn.addEventListener('click', () => {
        const meme = getMeme()
        if (meme.lines.length > 1) {
            meme.lines.splice(meme.selectedLineIdx, 1)
            selectedLineIdx = Math.max(0, meme.selectedLineIdx - 1)
            setSelectedLine(selectedLineIdx)
            document.getElementById('meme-text-input').value = meme.lines[selectedLineIdx].txt
            renderMeme()
        }
    })

    const fontFamily = document.getElementById('font-family')
    fontFamily.addEventListener('change', (e) => {
        const meme = getMeme()
        setFontFamily(e.target.value, meme.selectedLineIdx)
        renderMeme()
    })

    const fontColor = document.getElementById('font-color')
    fontColor.addEventListener('input', (e) => {
        const meme = getMeme()
        setColor(e.target.value, meme.selectedLineIdx)
        renderMeme()
    })

    const increaseFont = document.getElementById('increase-font')
    increaseFont.addEventListener('click', () => {
        const meme = getMeme()
        const newSize = meme.lines[meme.selectedLineIdx].size + 5
        setFontSize(newSize, meme.selectedLineIdx)
        renderMeme()
    })

    const decreaseFont = document.getElementById('decrease-font')
    decreaseFont.addEventListener('click', () => {
        const meme = getMeme()
        const newSize = Math.max(10, meme.lines[meme.selectedLineIdx].size - 5)
        setFontSize(newSize, meme.selectedLineIdx)
        renderMeme()
    })

    const alignLeft = document.getElementById('align-left')
    alignLeft.addEventListener('click', () => {
        const meme = getMeme()
        setAlignment('left', meme.selectedLineIdx)
        renderMeme()
    })

    const alignCenter = document.getElementById('align-center')
    alignCenter.addEventListener('click', () => {
        const meme = getMeme()
        setAlignment('center', meme.selectedLineIdx)
        renderMeme()
    })

    const alignRight = document.getElementById('align-right')
    alignRight.addEventListener('click', () => {
        const meme = getMeme()
        setAlignment('right', meme.selectedLineIdx)
        renderMeme()
    })

    const emoji1 = document.getElementById('emoji1')
    emoji1.addEventListener('click', () => {
        const meme = getMeme()
        const currentText = meme.lines[meme.selectedLineIdx].txt
        setLineTxt(currentText + '😄', meme.selectedLineIdx)
        document.getElementById('meme-text-input').value = meme.lines[meme.selectedLineIdx].txt
        renderMeme()
    })

    const emoji2 = document.getElementById('emoji2')
    emoji2.addEventListener('click', () => {
        const meme = getMeme()
        const currentText = meme.lines[meme.selectedLineIdx].txt
        setLineTxt(currentText + '😂', meme.selectedLineIdx)
        document.getElementById('meme-text-input').value = meme.lines[meme.selectedLineIdx].txt
        renderMeme()
    })

    const emoji3 = document.getElementById('emoji3')
    emoji3.addEventListener('click', () => {
        const meme = getMeme()
        const currentText = meme.lines[meme.selectedLineIdx].txt
        setLineTxt(currentText + '😢', meme.selectedLineIdx)
        document.getElementById('meme-text-input').value = meme.lines[meme.selectedLineIdx].txt
        renderMeme()
    })

    const emoji4 = document.getElementById('emoji4')
    emoji4.addEventListener('click', () => {
        const meme = getMeme()
        const currentText = meme.lines[meme.selectedLineIdx].txt
        setLineTxt(currentText + '😡', meme.selectedLineIdx)
        document.getElementById('meme-text-input').value = meme.lines[meme.selectedLineIdx].txt
        renderMeme()
    })

    const shareBtn = document.getElementById('share-btn')
    shareBtn.addEventListener('click', onShareImg)

    const downloadLink = document.getElementById('download-link')
    downloadLink.addEventListener('click', (e) => {
        e.preventDefault()
        const canvas = document.getElementById('meme-canvas')
        const link = document.createElement('a')
        link.download = 'meme.png'
        link.href = canvas.toDataURL('image/png')
        link.click()
    })
}

function initCanvasDragAndDrop() {
    const canvas = document.getElementById('meme-canvas')
    
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const meme = getMeme()
        draggedLineIdx = meme.lines.findIndex(line => {
            const left = line.boxX
            const right = line.boxX + line.boxWidth
            const top = line.boxY
            const bottom = line.boxY + line.boxHeight
            return mouseX >= left && mouseX <= right && mouseY >= top && mouseY <= bottom
        })

        if (draggedLineIdx !== -1) {
            isDragging = true
            const line = meme.lines[draggedLineIdx]
            dragOffsetX = mouseX - line.x
            dragOffsetY = mouseY - line.y
            selectedLineIdx = draggedLineIdx
            setSelectedLine(draggedLineIdx)
            document.getElementById('meme-text-input').value = line.txt
            renderMeme()
        }
    })

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return

        const rect = canvas.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const meme = getMeme()
        const line = meme.lines[draggedLineIdx]
        
        line.x = Math.max(0, Math.min(mouseX - dragOffsetX, gElCanvas.width))
        line.y = Math.max(0, Math.min(mouseY - dragOffsetY, gElCanvas.height))

        renderMeme()
    })

    canvas.addEventListener('mouseup', () => {
        isDragging = false
        draggedLineIdx = -1
        renderMeme()
    })

    canvas.addEventListener('mouseleave', () => {
        isDragging = false
        draggedLineIdx = -1
        renderMeme()
    })
}

function renderMeme() {
    gElCanvas.width = 500
    gElCanvas.height = 500

   
    if (currentImageObj && currentImageObj.complete) {
        gCtx.drawImage(currentImageObj, 0, 0, gElCanvas.width, gElCanvas.height)
    }

    const meme = getMeme()
    meme.lines.forEach((line, idx) => {
        gCtx.font = `${line.size}px ${line.fontFamily}`
        gCtx.fillStyle = line.color
        gCtx.textAlign = line.align
        gCtx.textBaseline = 'middle'

        gCtx.fillText(line.txt, line.x, line.y)

        const metrics = gCtx.measureText(line.txt)
        const ascent = metrics.actualBoundingBoxAscent || line.size
        const descent = metrics.actualBoundingBoxDescent || 0
        const boxWidth = metrics.width
        const boxHeight = ascent + descent
        var boxX = line.x
        if (line.align === 'center') {
            boxX -= boxWidth / 2
        } else if (line.align === 'right') {
            boxX -= boxWidth
        }
        const boxY = line.y - ascent
        setLineBox(idx, boxX, boxY, boxWidth, boxHeight)

        if (idx === selectedLineIdx) {
            gCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
            gCtx.lineWidth = 2
            gCtx.strokeRect(boxX, boxY, boxWidth, boxHeight)
        }
    })
}

function onShareImg(ev) {
    ev.preventDefault()
    const canvasData = gElCanvas.toDataURL('image/jpeg')

    function onSuccess(uploadedImgUrl) {
        const encodedUploadedImgUrl = encodeURIComponent(uploadedImgUrl)
        console.log('encodedUploadedImgUrl:', encodedUploadedImgUrl)
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUploadedImgUrl}&t=${encodedUploadedImgUrl}`)
    }
    uploadImg(canvasData, onSuccess)
}

async function uploadImg(imgData, onSuccess) {
    const CLOUD_NAME = 'webify'
    const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
    const formData = new FormData()
    formData.append('file', imgData)
    formData.append('upload_preset', 'webify')
    try {
        const res = await fetch(UPLOAD_URL, {
            method: 'POST',
            body: formData
        })
        const data = await res.json()
        console.log('Cloudinary response:', data)
        onSuccess(data.secure_url)
    } catch (err) {
        console.log(err)
    }
}