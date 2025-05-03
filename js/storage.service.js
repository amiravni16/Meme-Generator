'use strict'

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function loadFromStorage(key) {
  const data = localStorage.getItem(key)
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch (e) {
    console.error(`Error parsing JSON from localStorage for key "${key}":`, e)
    return null
  }
}

const storageService = {
  saveToStorage,
  loadFromStorage
}