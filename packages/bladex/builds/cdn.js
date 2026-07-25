import { Bladex } from '../src/bladex.js';
import { scheduleDeclarativeBoot } from '../src/actions/boot.js';
import { installFetchProxy } from '../src/fetch/proxy.js';

window.Bladex = Bladex;

if (
    document.currentScript === null ||
    document.currentScript.getAttribute('data-fetch-proxy') !== 'false'
) {
    installFetchProxy();
}

scheduleDeclarativeBoot();
