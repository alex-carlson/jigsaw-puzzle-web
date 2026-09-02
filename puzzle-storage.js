export function loadPuzzleState(storageKey) {
    try {
        return JSON.parse(localStorage.getItem(storageKey));
    } catch (error) {
        return null;
    }
}

export function removePuzzleState(storageKey) {
    localStorage.removeItem(storageKey);
}