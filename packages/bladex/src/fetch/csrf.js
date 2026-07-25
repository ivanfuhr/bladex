export function csrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');

    if (meta === null) {
        return null;
    }

    const token = meta.getAttribute('content');

    if (token === null || token === '') {
        return null;
    }

    return token;
}
