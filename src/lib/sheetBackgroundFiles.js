function transaction(mode, operation) {
  return new Promise((resolve, reject) => {
    const opening = indexedDB.open("grimorio_media", 1)
    opening.onupgradeneeded = () => opening.result.createObjectStore("backgrounds")
    opening.onerror = () => reject(opening.error)
    opening.onsuccess = () => {
      const db = opening.result
      db.onversionchange = () => db.close()
      try {
        const tx = db.transaction("backgrounds", mode)
        const request = operation(tx.objectStore("backgrounds"))
        tx.oncomplete = () => {
          db.close()
          resolve(request.result)
        }
        tx.onabort = tx.onerror = () => {
          db.close()
          reject(tx.error || request.error)
        }
      } catch (error) {
        db.close()
        reject(error)
      }
    }
  })
}

export const sheetBackgroundFiles = {
  read: () => transaction("readonly", store => store.get("sheet")),
  save: file => transaction("readwrite", store => store.put(file, "sheet")),
  clear: () => transaction("readwrite", store => store.delete("sheet")),
}
