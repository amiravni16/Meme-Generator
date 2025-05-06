'use strict'

var isDragging = false
var draggedLineIdx = -1
var dragOffsetX = 0
var dragOffsetY = 0
var selectedLineIdx = 0
var currentImageObj = null
var gElCanvas = document.getElementById('meme-canvas')
var gCtx = gElCanvas.getContext('2d')
var gInlineInput = null
var isResizing = false
var isRotating = false
var resizeHandleSize = 12
var rotateHandleSize = 12

// Double tap detection variables
var lastTapTime = 0
var lastTapLineIdx = -1
var lastTapX = 0
var lastTapY = 0
const DOUBLE_TAP_TIME_THRESHOLD = 300
const DOUBLE_TAP_POS_THRESHOLD = 20

// Emoji Panel State
const ALL_EMOJIS = ['😄', '😂', '😢', '😡', '👍', '👎', '❤️', '⭐', '🔥', '🎉', '🤔', '💡', '💩', '👻', '💀', '👽']
const EMOJIS_PER_PAGE = 4
var gCurrentEmojiPage = 0

function initMemeController() {
    initEditorControls()
    initCanvasDragAndDrop()
    preloadImage()
    window.addEventListener('imageSelected', () => {
        preloadImage()
        renderMeme()
    })
}

function preloadImage() {
    const meme = getMeme()
    const img = getImageById(meme.selectedImgId)
    if (img && img.url) {
        currentImageObj = new Image()
        currentImageObj.src = img.url
        currentImageObj.onload = () => {
            renderMeme()
        }
    }
}

function initEditorControls() {
    const textInput = document.getElementById('meme-text-input')
    if (textInput) {
        textInput.addEventListener('input', () => {
            const meme = getMeme()
            setLineTxt(textInput.value, meme.selectedLineIdx || 0)
            renderMeme()
        })
        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') textInput.blur()
        })
    }

    const moveUpBtn = document.getElementById('move-up-btn')
    if (moveUpBtn) moveUpBtn.addEventListener('click', () => {
        adjustLinePosition(getMeme().selectedLineIdx, -10, 500)
        renderMeme()
    })

    const moveDownBtn = document.getElementById('move-down-btn')
    if (moveDownBtn) moveDownBtn.addEventListener('click', () => {
        adjustLinePosition(getMeme().selectedLineIdx, 10, 500)
        renderMeme()
    })

    const switchLineBtn = document.getElementById('switch-line-btn')
    if (switchLineBtn) switchLineBtn.addEventListener('click', () => {
        switchLine()
        const meme = getMeme()
        selectedLineIdx = meme.selectedLineIdx
        document.getElementById('meme-text-input').value = meme.lines[meme.selectedLineIdx].txt
        renderMeme()
    })

    const deleteLineBtn = document.getElementById('delete-line-btn')
    if (deleteLineBtn) deleteLineBtn.addEventListener('click', () => {
        const meme = getMeme()
        if (meme.lines.length > 1) {
            meme.lines.splice(meme.selectedLineIdx, 1)
            selectedLineIdx = Math.max(0, meme.selectedLineIdx - 1)
            setSelectedLine(selectedLineIdx)
            document.getElementById('meme-text-input').value = meme.lines[0].txt
            renderMeme()
        }
    })
    
    const addLineBtn = document.getElementById('add-line-btn')
    if (addLineBtn) addLineBtn.addEventListener('click', () => {
        const newLineIdx = addLine()
        selectedLineIdx = newLineIdx
        setSelectedLine(newLineIdx)
        document.getElementById('meme-text-input').value = getMeme().lines[newLineIdx].txt
        renderMeme()
    })

    const fontFamily = document.getElementById('font-family')
    if (fontFamily) {
        fontFamily.value = 'Impact'
        
        fontFamily.addEventListener('change', (e) => {
            const meme = getMeme()
            if (meme && meme.lines && meme.lines[meme.selectedLineIdx]) {
                setFontFamily(e.target.value, meme.selectedLineIdx)
                renderMeme()
            }
        })
    }

    const fontColor = document.getElementById('font-color')
    if (fontColor) fontColor.addEventListener('input', (e) => {
        const meme = getMeme()
        setColor(e.target.value, meme.selectedLineIdx)
        renderMeme()
    })

    const increaseFont = document.getElementById('increase-font')
    if (increaseFont) increaseFont.addEventListener('click', () => {
        const meme = getMeme()
        const newSize = meme.lines[meme.selectedLineIdx].size + 5
        setFontSize(newSize, meme.selectedLineIdx)
        renderMeme()
    })

    const decreaseFont = document.getElementById('decrease-font')
    if (decreaseFont) decreaseFont.addEventListener('click', () => {
        const meme = getMeme()
        const newSize = Math.max(10, meme.lines[meme.selectedLineIdx].size - 5)
        setFontSize(newSize, meme.selectedLineIdx)
        renderMeme()
    })

    const alignLeft = document.getElementById('align-left')
    if (alignLeft) alignLeft.addEventListener('click', () => {
        const meme = getMeme()
        setAlignment('left', meme.selectedLineIdx)
        renderMeme()
    })

    const alignRight = document.getElementById('align-right')
    if (alignRight) alignRight.addEventListener('click', () => {
        const meme = getMeme()
        setAlignment('right', meme.selectedLineIdx)
        renderMeme()
    })

    const alignCenter = document.getElementById('align-center')
    if (alignCenter) alignCenter.addEventListener('click', () => {
        const meme = getMeme()
        setAlignment('center', meme.selectedLineIdx)
        renderMeme()
    })

    const oldEmojiIds = ['emoji1', 'emoji2', 'emoji3', 'emoji4']
    oldEmojiIds.forEach(id => {
        const el = document.getElementById(id)
        if (el && el.tagName === 'BUTTON') {
        }
    })

    const emojiPrevBtn = document.getElementById('emoji-prev-btn')
    const emojiNextBtn = document.getElementById('emoji-next-btn')

    if (emojiPrevBtn) {
        emojiPrevBtn.addEventListener('click', () => {
            if (gCurrentEmojiPage > 0) {
                gCurrentEmojiPage--
                renderEmojiPanel()
            }
        })
    }

    if (emojiNextBtn) {
        emojiNextBtn.addEventListener('click', () => {
            const maxPage = Math.ceil(ALL_EMOJIS.length / EMOJIS_PER_PAGE) - 1
            if (gCurrentEmojiPage < maxPage) {
                gCurrentEmojiPage++
                renderEmojiPanel()
            }
        })
    }

    renderEmojiPanel()

    // Share dropdown logic
    const shareDropdownBtn = document.getElementById('share-dropdown-btn')
    const shareDropdown = document.getElementById('share-dropdown')
    if (shareDropdownBtn && shareDropdown) {
        shareDropdownBtn.addEventListener('click', () => {
            shareDropdown.style.display = shareDropdown.style.display === 'none' ? 'block' : 'none'
        })
        document.addEventListener('click', (e) => {
            if (!shareDropdown.contains(e.target) && e.target !== shareDropdownBtn) {
                shareDropdown.style.display = 'none'
            }
        })
    }

    const downloadImageBtn = document.getElementById('download-image-btn')
    if (downloadImageBtn) downloadImageBtn.addEventListener('click', () => {
        const canvas = document.getElementById('meme-canvas')
        const link = document.createElement('a')
        link.download = 'meme.png'
        link.href = canvas.toDataURL('image/png')
        link.click()
        shareDropdown.style.display = 'none'
    })

    const saveMemeBtn = document.getElementById('save-meme-btn')
    if (saveMemeBtn) saveMemeBtn.addEventListener('click', () => {
        saveMeme()
        showSaveAnnotation()
        shareDropdown.style.display = 'none'
    })

    // Memes nav button handler
    const memesNavBtn = document.getElementById('memes-nav-btn')
    if (memesNavBtn) memesNavBtn.addEventListener('click', (e) => {
        e.preventDefault()
        document.getElementById('gallery').style.display = 'none'
        document.getElementById('editor').style.display = 'none'
        document.getElementById('saved-memes').style.display = 'block'
        renderSavedMemes()
    })

    const shareFacebookBtn = document.getElementById('share-facebook-btn')
    if (shareFacebookBtn) shareFacebookBtn.addEventListener('click', () => {
        onShareImg(new Event('click'))
        shareDropdown.style.display = 'none'
    })

    const shareApiBtn = document.getElementById('share-api-btn')
    if (shareApiBtn) shareApiBtn.addEventListener('click', (ev) => {
        ev.preventDefault()
        if (navigator.share) {
            gElCanvas.toBlob((blob) => {
                const file = new File([blob], 'meme.jpg', { type: 'image/jpeg' })
                navigator.share({
                    title: 'My Meme',
                    text: 'Check out this meme I created!',
                    files: [file]
                })
                .catch((error) => {
                    console.log('Error sharing:', error)
                })
            }, 'image/jpeg')
        } else {
            alert('Web Share API is not supported on this device.')
        }
        shareDropdown.style.display = 'none'
    })
}

function createInlineInput(lineIdx) {
    if (gInlineInput) {
        gInlineInput.remove()
        gInlineInput = null
    }

    const meme = getMeme()
    const line = meme.lines[lineIdx]
    const canvasRect = gElCanvas.getBoundingClientRect()

    const input = document.createElement('input')
    input.type = 'text'
    input.className = 'inline-input'
    input.value = line.txt
    input.style.position = 'absolute'
    input.style.fontSize = `${line.size}px`
    input.style.fontFamily = line.fontFamily
    input.style.color = line.color
    input.style.background = 'rgba(255, 255, 255, 0.7)'
    input.style.border = '1px solid #ccc'
    input.style.borderRadius = '3px'
    input.style.padding = '2px'
    input.style.textAlign = line.align
    input.style.boxSizing = 'border-box'
    input.style.zIndex = '1000'

    gCtx.font = `${line.size}px ${line.fontFamily}`
    const metrics = gCtx.measureText(line.txt || ' ')
    const width = Math.max(metrics.width + 10, 50)
    input.style.width = `${width}px`

    let left = canvasRect.left + line.x + window.scrollX
    if (line.align === 'center') {
        left -= width / 2
    } else if (line.align === 'right') {
        left -= width
    }

    const lineHeight = line.size
    let top = canvasRect.top + line.y - (lineHeight / 2) + window.scrollY

    if (lineIdx === 1 || line.y > gElCanvas.height / 2) {
        top = canvasRect.top + line.y - lineHeight - 10 + window.scrollY
    }
    
    const canvasBottom = canvasRect.top + canvasRect.height
    if (top + lineHeight > canvasBottom) {
        top = canvasBottom - lineHeight - 5
    }

    input.style.left = `${left}px`
    input.style.top = `${top}px`

    input.addEventListener('input', () => {
        setLineTxt(input.value, lineIdx)
        renderMeme()
    })

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            input.blur()
        }
    })

    input.addEventListener('blur', () => {
        input.remove()
        gInlineInput = null
        renderMeme()
    })

    document.body.appendChild(input)
    gInlineInput = input
    input.focus()
}

function initCanvasDragAndDrop() {
    const canvas = document.getElementById('meme-canvas')
    const tooltip = document.createElement('div')
    tooltip.style.position = 'absolute'
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
    tooltip.style.color = 'white'
    tooltip.style.padding = '5px 10px'
    tooltip.style.borderRadius = '4px'
    tooltip.style.fontSize = '12px'
    tooltip.style.pointerEvents = 'none'
    tooltip.style.display = 'none'
    tooltip.style.zIndex = '1000'
    document.body.appendChild(tooltip)
    
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const meme = getMeme()
        const clickedLineIdx = meme.lines.findIndex(line => {
            const left = line.boxX
            const right = line.boxX + line.boxWidth
            const top = line.boxY
            const bottom = line.boxY + line.boxHeight
            return mouseX >= left && mouseX <= right && mouseY >= top && mouseY <= bottom
        })

        if (clickedLineIdx !== -1) {
            selectedLineIdx = clickedLineIdx
            meme.selectedLineIdx = clickedLineIdx
            setSelectedLine(clickedLineIdx)
            document.getElementById('meme-text-input').value = meme.lines[clickedLineIdx].txt
            const line = meme.lines[clickedLineIdx]
            const centerX = line.x
            const centerY = line.y
            const angle = (line.rotation * Math.PI) / 180
            const cos = Math.cos(angle)
            const sin = Math.sin(angle)

            const resizeHandleX = centerX + (line.boxWidth / 2) * cos - (line.boxHeight / 2) * sin
            const resizeHandleY = centerY + (line.boxWidth / 2) * sin + (line.boxHeight / 2) * cos
            const resizeHandleDist = Math.sqrt(
                Math.pow(mouseX - resizeHandleX, 2) + Math.pow(mouseY - resizeHandleY, 2)
            )

            const rotateHandleX = centerX - (line.boxHeight / 2) * sin
            const rotateHandleY = centerY + (line.boxHeight / 2) * cos
            const rotateHandleDist = Math.sqrt(
                Math.pow(mouseX - rotateHandleX, 2) + Math.pow(mouseY - rotateHandleY, 2)
            )

            if (resizeHandleDist <= resizeHandleSize) {
                isResizing = true
                draggedLineIdx = clickedLineIdx
                dragOffsetX = mouseX - resizeHandleX
                dragOffsetY = mouseY - resizeHandleY
            } else if (rotateHandleDist <= rotateHandleSize) {
                isRotating = true
                draggedLineIdx = clickedLineIdx
                dragOffsetX = mouseX - centerX
                dragOffsetY = mouseY - centerY
            } else {
                isDragging = true
                draggedLineIdx = clickedLineIdx
                dragOffsetX = mouseX - line.x
                dragOffsetY = mouseY - line.y
                selectedLineIdx = clickedLineIdx
                setSelectedLine(selectedLineIdx)
                document.getElementById('meme-text-input').value = line.txt
            }
            renderMeme()
        } else {
            selectedLineIdx = -1
            setSelectedLine(-1)
            document.getElementById('meme-text-input').value = ''
            renderMeme()
        }
    })

    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault()
        const rect = canvas.getBoundingClientRect()
        const touch = e.touches[0]
        
        const touchX = touch.clientX - rect.left
        const touchY = touch.clientY - rect.top

        const meme = getMeme()
        
        const sortedLineIndices = Array.from({length: meme.lines.length}, (_, i) => i)
            .sort((a, b) => meme.lines[a].y - meme.lines[b].y);
        
        let clickedLineIdx = -1;
        let minDistance = Infinity;
        
        for (let i = 0; i < sortedLineIndices.length; i++) {
            const lineIndex = sortedLineIndices[i];
            const line = meme.lines[lineIndex];
            
            const distance = Math.sqrt(
                Math.pow(touchX - line.x, 2) + 
                Math.pow(touchY - line.y, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                clickedLineIdx = lineIndex;
            }
        }
        
        if (minDistance > 150) {
            clickedLineIdx = -1;
        }

        if (clickedLineIdx !== -1) {
            selectedLineIdx = clickedLineIdx
            meme.selectedLineIdx = clickedLineIdx
            setSelectedLine(clickedLineIdx)
            document.getElementById('meme-text-input').value = meme.lines[clickedLineIdx].txt
            const line = meme.lines[clickedLineIdx]
            const centerX = line.x
            const centerY = line.y
            const angle = (line.rotation * Math.PI) / 180
            const cos = Math.cos(angle)
            const sin = Math.sin(angle)

            const resizeHandleX = centerX + (line.boxWidth / 2) * cos - (line.boxHeight / 2) * sin
            const resizeHandleY = centerY + (line.boxWidth / 2) * sin + (line.boxHeight / 2) * cos
            const resizeHandleDist = Math.sqrt(
                Math.pow(touchX - resizeHandleX, 2) + Math.pow(touchY - resizeHandleY, 2)
            )

            const rotateHandleX = centerX - (line.boxHeight / 2) * sin
            const rotateHandleY = centerY + (line.boxHeight / 2) * cos
            const rotateHandleDist = Math.sqrt(
                Math.pow(touchX - rotateHandleX, 2) + Math.pow(touchY - rotateHandleY, 2)
            )

            if (resizeHandleDist <= resizeHandleSize) {
                isResizing = true
                draggedLineIdx = clickedLineIdx
                dragOffsetX = touchX - resizeHandleX
                dragOffsetY = touchY - resizeHandleY
            } else if (rotateHandleDist <= rotateHandleSize) {
                isRotating = true
                draggedLineIdx = clickedLineIdx
                dragOffsetX = touchX - centerX
                dragOffsetY = touchY - centerY
            } else {
                isDragging = true
                draggedLineIdx = clickedLineIdx
                dragOffsetX = touchX - line.x
                dragOffsetY = touchY - line.y
                selectedLineIdx = clickedLineIdx
                setSelectedLine(selectedLineIdx)
                document.getElementById('meme-text-input').value = line.txt
            }
            renderMeme()
        } else {
            selectedLineIdx = -1
            setSelectedLine(-1)
            document.getElementById('meme-text-input').value = ''
            renderMeme()
        }
    })

    canvas.addEventListener('mousemove', (e) => {
        if (draggedLineIdx === -1) {
            const rect = canvas.getBoundingClientRect()
            const mouseX = e.clientX - rect.left
            const mouseY = e.clientY - rect.top

            const meme = getMeme()
            const line = meme.lines[meme.selectedLineIdx]
            if (line) {
                const centerX = line.x
                const centerY = line.y
                const angle = (line.rotation * Math.PI) / 180
                const cos = Math.cos(angle)
                const sin = Math.sin(angle)

                const resizeHandleX = centerX + (line.boxWidth / 2) * cos - (line.boxHeight / 2) * sin
                const resizeHandleY = centerY + (line.boxWidth / 2) * sin + (line.boxHeight / 2) * cos
                const resizeHandleDist = Math.sqrt(
                    Math.pow(mouseX - resizeHandleX, 2) + Math.pow(mouseY - resizeHandleY, 2)
                )

                const rotateHandleX = centerX - (line.boxHeight / 2) * sin
                const rotateHandleY = centerY + (line.boxHeight / 2) * cos
                const rotateHandleDist = Math.sqrt(
                    Math.pow(mouseX - rotateHandleX, 2) + Math.pow(mouseY - rotateHandleY, 2)
                )

                if (resizeHandleDist <= resizeHandleSize) {
                    tooltip.textContent = 'Drag to resize'
                    tooltip.style.display = 'block'
                    tooltip.style.left = e.clientX + 10 + 'px'
                    tooltip.style.top = e.clientY + 10 + 'px'
                    canvas.style.cursor = 'nwse-resize'
                } else if (rotateHandleDist <= rotateHandleSize) {
                    tooltip.textContent = 'Drag to rotate'
                    tooltip.style.display = 'block'
                    tooltip.style.left = e.clientX + 10 + 'px'
                    tooltip.style.top = e.clientY + 10 + 'px'
                    canvas.style.cursor = 'grab'
                } else {
                    tooltip.style.display = 'none'
                    canvas.style.cursor = 'default'
                }
            }
        } else {
            const rect = canvas.getBoundingClientRect()
            const mouseX = e.clientX - rect.left
            const mouseY = e.clientY - rect.top

            const meme = getMeme()
            const line = meme.lines[draggedLineIdx]

            if (isResizing) {
                const centerX = line.x
                const centerY = line.y
                const angle = (line.rotation * Math.PI) / 180
                const cos = Math.cos(angle)
                const sin = Math.sin(angle)

                const dx = mouseX - centerX
                const dy = mouseY - centerY
                const newWidth = Math.max(50, Math.abs(dx * cos + dy * sin) * 2)
                const newHeight = Math.max(20, Math.abs(-dx * sin + dy * cos) * 2)

                const scaleX = newWidth / line.boxWidth
                const scaleY = newHeight / line.boxHeight
                const newScale = Math.min(scaleX, scaleY)
                setScale(newScale, draggedLineIdx)
            } else if (isRotating) {
                const centerX = line.x
                const centerY = line.y
                const dx = mouseX - centerX
                const dy = mouseY - centerY
                const newRotation = (Math.atan2(dy, dx) * 180) / Math.PI
                setRotation(newRotation, draggedLineIdx)
            } else if (isDragging) {
                line.x = Math.max(0, Math.min(mouseX - dragOffsetX, gElCanvas.width))
                line.y = Math.max(0, Math.min(mouseY - dragOffsetY, gElCanvas.height))
            }

            renderMeme()
        }
    })

    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault()
        if (draggedLineIdx === -1) {
            return;
        }

        const rect = canvas.getBoundingClientRect()
        const touch = e.touches[0]
        const touchX = touch.clientX - rect.left
        const touchY = touch.clientY - rect.top

        const meme = getMeme()
        
        if (draggedLineIdx >= 0 && draggedLineIdx < meme.lines.length) {
            const line = meme.lines[draggedLineIdx]

            if (isResizing) {
                const centerX = line.x
                const centerY = line.y
                const angle = (line.rotation * Math.PI) / 180
                const cos = Math.cos(angle)
                const sin = Math.sin(angle)

                const dx = touchX - centerX
                const dy = touchY - centerY
                const newWidth = Math.max(50, Math.abs(dx * cos + dy * sin) * 2)
                const newHeight = Math.max(20, Math.abs(-dx * sin + dy * cos) * 2)

                const scaleX = newWidth / line.boxWidth
                const scaleY = newHeight / line.boxHeight
                const newScale = Math.min(scaleX, scaleY)
                setScale(newScale, draggedLineIdx)
            } else if (isRotating) {
                const centerX = line.x
                const centerY = line.y
                const dx = touchX - centerX
                const dy = touchY - centerY
                const newRotation = (Math.atan2(dy, dx) * 180) / Math.PI
                setRotation(newRotation, draggedLineIdx)
            } else if (isDragging) {
                line.x = Math.max(0, Math.min(touchX - dragOffsetX, gElCanvas.width))
                line.y = Math.max(0, Math.min(touchY - dragOffsetY, gElCanvas.height))
            }
            
            renderMeme()
        }
    })

    canvas.addEventListener('touchend', function(e) {
        e.preventDefault()

        const rect = canvas.getBoundingClientRect()
        const touch = e.changedTouches[0]
        
        const touchX = touch.clientX - rect.left
        const touchY = touch.clientY - rect.top

        const meme = getMeme()
        
        const sortedLineIndices = Array.from({length: meme.lines.length}, (_, i) => i)
            .sort((a, b) => meme.lines[a].y - meme.lines[b].y);
        
        let clickedLineIdx = -1;
        let minDistance = Infinity;
        
        for (let i = 0; i < sortedLineIndices.length; i++) {
            const lineIndex = sortedLineIndices[i];
            const line = meme.lines[lineIndex];
            
            const distance = Math.sqrt(
                Math.pow(touchX - line.x, 2) + 
                Math.pow(touchY - line.y, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                clickedLineIdx = lineIndex;
            }
        }
        
        if (minDistance > 150) {
            clickedLineIdx = -1;
        }

        const currentTime = new Date().getTime()
        const timeSinceLastTap = currentTime - lastTapTime

        if (clickedLineIdx !== -1 && 
            timeSinceLastTap < DOUBLE_TAP_TIME_THRESHOLD && 
            lastTapLineIdx === clickedLineIdx &&
            Math.abs(touchX - lastTapX) < DOUBLE_TAP_POS_THRESHOLD &&
            Math.abs(touchY - lastTapY) < DOUBLE_TAP_POS_THRESHOLD) {
            
            createInlineInput(clickedLineIdx)
            lastTapTime = 0
            lastTapLineIdx = -1
        } else {
            if (clickedLineIdx !== -1) {
                lastTapLineIdx = clickedLineIdx
                lastTapX = touchX
                lastTapY = touchY
            } else {
                lastTapLineIdx = -1
            }
            lastTapTime = currentTime
        }

        isDragging = false
        isResizing = false
        isRotating = false
        draggedLineIdx = -1
        tooltip.style.display = 'none'
        renderMeme()
    })

    canvas.addEventListener('mouseup', () => {
        isDragging = false
        isResizing = false
        isRotating = false
        draggedLineIdx = -1
        tooltip.style.display = 'none'
        canvas.style.cursor = 'default'
        renderMeme()
    })

    canvas.addEventListener('mouseleave', () => {
        isDragging = false
        isResizing = false
        isRotating = false
        draggedLineIdx = -1
        tooltip.style.display = 'none'
        canvas.style.cursor = 'default'
        renderMeme()
    })

    canvas.addEventListener('dblclick', (e) => {
        const rect = canvas.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const meme = getMeme()
        const clickedLineIdx = meme.lines.findIndex(line => {
            const left = line.boxX
            const right = line.boxX + line.boxWidth
            const top = line.boxY
            const bottom = line.boxY + line.boxHeight
            return mouseX >= left && mouseX <= right && mouseY >= top && mouseY <= bottom
        })
        if (clickedLineIdx !== -1) {
            createInlineInput(clickedLineIdx)
        }
    })
}

function renderMeme() {
    const meme = getMeme()
    if (!currentImageObj) return

    gElCanvas.width = 500
    gElCanvas.height = 500

    gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height)
    gCtx.drawImage(currentImageObj, 0, 0, gElCanvas.width, gElCanvas.height)

    meme.lines.forEach((line, idx) => {
        gCtx.font = `${line.size * line.scale}px ${line.fontFamily}`
        gCtx.fillStyle = line.color
        gCtx.textAlign = line.align
        gCtx.textBaseline = 'middle'

        gCtx.save()
        gCtx.translate(line.x, line.y)
        gCtx.rotate((line.rotation * Math.PI) / 180)
        gCtx.fillText(line.txt, 0, 0)
        gCtx.restore()

        const textMetrics = gCtx.measureText(line.txt)
        const padding = 10
        const boxWidth = textMetrics.width + (padding * 2)
        const boxHeight = (line.size * line.scale) + (padding * 2)
        
        let actualBoxX = 0
        const actualBoxY = line.y - boxHeight / 2

        if (line.align === 'center') {
            actualBoxX = line.x - boxWidth / 2
        } else if (line.align === 'right') {
            actualBoxX = line.x - boxWidth
        } else {
            actualBoxX = line.x
        }
        
        line.boxX = actualBoxX
        line.boxY = actualBoxY
        line.boxWidth = boxWidth
        line.boxHeight = boxHeight
        
        setLineBox(idx, actualBoxX, actualBoxY, boxWidth, boxHeight)

        if (idx === meme.selectedLineIdx) {
            gCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
            gCtx.lineWidth = 2

            gCtx.save()
            gCtx.translate(line.x, line.y)
            gCtx.rotate((line.rotation * Math.PI) / 180)

            let relX = 0
            const relY = -boxHeight / 2
            if (line.align === 'center') {
                relX = -boxWidth / 2
            } else if (line.align === 'right') {
                relX = -boxWidth
            }

            gCtx.strokeRect(relX, relY, boxWidth, boxHeight)

            const handleRelX_Resize = relX + boxWidth
            const handleRelY_Resize = relY + boxHeight
            gCtx.fillStyle = 'white'
            gCtx.beginPath()
            gCtx.moveTo(handleRelX_Resize - resizeHandleSize, handleRelY_Resize)
            gCtx.lineTo(handleRelX_Resize, handleRelY_Resize - resizeHandleSize)
            gCtx.lineTo(handleRelX_Resize, handleRelY_Resize)
            gCtx.closePath()
            gCtx.fill()

            const handleRelX_Rotate = relX + boxWidth / 2
            const handleRelY_Rotate = relY + boxHeight
            gCtx.fillStyle = 'white'
            gCtx.beginPath()
            gCtx.arc(handleRelX_Rotate, handleRelY_Rotate, rotateHandleSize / 2, 0, Math.PI * 2)
            gCtx.fill()

            gCtx.restore()
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

function showSaveAnnotation() {
    const annotation = document.getElementById('save-annotation')
    if (!annotation) return
    
    annotation.style.position = 'fixed'
    annotation.style.top = '20px'
    annotation.style.right = '20px'
    annotation.style.backgroundColor = '#4CAF50'
    annotation.style.color = 'white'
    annotation.style.padding = '12px 24px'
    annotation.style.borderRadius = '4px'
    annotation.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'
    annotation.style.zIndex = '1000'
    annotation.style.fontWeight = 'bold'
    annotation.style.fontSize = '1.1rem'
    annotation.style.transition = 'opacity 0.3s ease-in-out'
    
    annotation.textContent = 'Meme saved!'
    annotation.style.display = 'block'
    annotation.style.opacity = '1'
    
    setTimeout(() => {
        annotation.style.opacity = '0'
        setTimeout(() => {
            annotation.style.display = 'none'
        }, 300)
    }, 2000)
}

function renderEmojiPanel() {
    const emojiDisplayArea = document.getElementById('emoji-display-area')
    if (!emojiDisplayArea) return

    const startIdx = gCurrentEmojiPage * EMOJIS_PER_PAGE
    const endIdx = startIdx + EMOJIS_PER_PAGE
    const emojisToShow = ALL_EMOJIS.slice(startIdx, endIdx)

    emojiDisplayArea.innerHTML = ''

    emojisToShow.forEach(emoji => {
        const button = document.createElement('button')
        button.textContent = emoji
        button.title = `Add ${emoji}`
        button.addEventListener('click', () => {
            const textInput = document.getElementById('meme-text-input')
            const meme = getMeme()
            const lineIdx = meme.selectedLineIdx >= 0 ? meme.selectedLineIdx : 0
            const currentText = meme.lines[lineIdx]?.txt || ''
            const newText = currentText + emoji
            setLineTxt(newText, lineIdx)
            textInput.value = newText
            renderMeme()
        })
        emojiDisplayArea.appendChild(button)
    })

    const emojiPrevBtn = document.getElementById('emoji-prev-btn')
    const emojiNextBtn = document.getElementById('emoji-next-btn')
    const maxPage = Math.ceil(ALL_EMOJIS.length / EMOJIS_PER_PAGE) - 1

    if (emojiPrevBtn) emojiPrevBtn.disabled = gCurrentEmojiPage === 0
    if (emojiNextBtn) emojiNextBtn.disabled = gCurrentEmojiPage === maxPage
}