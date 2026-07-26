/**
 * @param {Response} response
 */
export function isBladexResponse(response) {
    return response.headers.get('X-BladeX') === 'true';
}
