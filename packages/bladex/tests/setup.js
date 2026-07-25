if (typeof globalThis.CSS?.escape !== 'function') {
    globalThis.CSS = globalThis.CSS ?? {};

    globalThis.CSS.escape = (value) => {
        return String(value).replace(/[^a-zA-Z0-9_-]/g, (char) => {
            const hex = char.charCodeAt(0).toString(16);

            return `\\${hex} `;
        });
    };
}
