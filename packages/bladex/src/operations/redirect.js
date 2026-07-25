export function applyRedirect(operation) {
    const url = operation.url;

    if (typeof url !== 'string' || url === '') {
        return false;
    }

    window.location.assign(url);

    return true;
}
