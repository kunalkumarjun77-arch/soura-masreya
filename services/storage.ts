
const DB_NAME = 'SouraMasreyaDB';
const STORE_NAME = 'images';
const DB_VERSION = 1;

interface StoredImage {
    id?: number;
    data: string;
    timestamp: number;
}

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const saveImageToHistory = async (base64Data: string): Promise<void> => {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const image: StoredImage = {
            data: base64Data,
            timestamp: Date.now()
        };

        store.add(image);

        // Keep only last 15 images
        const countRequest = store.count();
        countRequest.onsuccess = () => {
            if (countRequest.result > 15) {
                // Delete oldest (lowest keys)
                const cursorRequest = store.openCursor(); // Default direction is 'next' (ascending keys)
                let deletedCount = 0;
                const toDelete = countRequest.result - 15;
                
                cursorRequest.onsuccess = (e) => {
                    const cursor = (e.target as IDBRequest).result;
                    if (cursor && deletedCount < toDelete) {
                        cursor.delete();
                        deletedCount++;
                        cursor.continue();
                    }
                };
            }
        };
    } catch (error) {
        console.error("Error saving image to DB:", error);
    }
};

export const getHistoryImages = async (): Promise<string[]> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const results = request.result as StoredImage[];
                // Sort by timestamp desc (newest first)
                results.sort((a, b) => b.timestamp - a.timestamp);
                resolve(results.map(img => img.data));
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("Error fetching images from DB:", error);
        return [];
    }
};

export const clearHistoryDB = async (): Promise<void> => {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).clear();
    } catch (error) {
        console.error("Error clearing DB:", error);
    }
};
