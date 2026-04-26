export function getThemeColors() {
    const root = getComputedStyle(document.documentElement);

    return {
        background: (root.getPropertyValue('--bg-color') || '#fff').trim(),
        text: (root.getPropertyValue('--text-dark') || '#333').trim(),
        accent: (root.getPropertyValue('--accent') || '#BF3939').trim()
    };
}