import { Bladex } from '../src/bladex.js';
import { scheduleDeclarativeBoot } from '../src/actions/boot.js';
import {
    normalizeDomUpdateMode,
    setDomUpdateMode,
} from '../src/components/dom-update-mode.js';
import { installFetchProxy } from '../src/fetch/proxy.js';

window.Bladex = Bladex;

const currentScript = document.currentScript;

if (currentScript !== null) {
    setDomUpdateMode(
        normalizeDomUpdateMode(
            currentScript.getAttribute('data-dom-update'),
        ),
    );
}

if (
    currentScript === null ||
    currentScript.getAttribute('data-fetch-proxy') !== 'false'
) {
    installFetchProxy();
}

scheduleDeclarativeBoot();
