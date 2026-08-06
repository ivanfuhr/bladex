(() => {
  // packages/bladex/src/actions/methods.js
  var ALLOWED_HTTP_METHODS = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE"
  ];
  var ACTION_SELECTOR = "[data-fetch]";
  function resolveHttpMethod(element) {
    const raw = element.getAttribute("data-method");
    if (raw === null || raw.trim() === "") {
      return "GET";
    }
    const normalized = raw.trim().toUpperCase();
    if (ALLOWED_HTTP_METHODS.indexOf(normalized) === -1) {
      console.warn(
        '[Bladex] Unknown data-method "' + raw + '"; falling back to GET.'
      );
      return "GET";
    }
    return normalized;
  }
  function resolveRequest(element) {
    if (!(element instanceof Element)) {
      return null;
    }
    const url = element.getAttribute("data-fetch");
    if (url === null || url === "") {
      return null;
    }
    return { url, method: resolveHttpMethod(element) };
  }
  function defaultTriggerSpec(element) {
    if (element.tagName === "FORM") {
      return "submit";
    }
    return "click";
  }
  function requestBodyForElement(element, method) {
    if (element.tagName !== "FORM") {
      return void 0;
    }
    const normalized = method.toUpperCase();
    if (normalized === "GET" || normalized === "HEAD") {
      return void 0;
    }
    return new FormData(element);
  }
  function setLoadingState(element, loading) {
    if (loading) {
      element.setAttribute("data-loading", "");
    } else {
      element.removeAttribute("data-loading");
    }
  }
  var formControlsDisabledByBladex = /* @__PURE__ */ new WeakMap();
  function disableFormControls(form) {
    if (!(form instanceof HTMLFormElement)) {
      return;
    }
    const toggled = [];
    for (let index = 0; index < form.elements.length; index++) {
      const control = form.elements[index];
      if (control.disabled) {
        continue;
      }
      control.disabled = true;
      toggled.push(control);
    }
    formControlsDisabledByBladex.set(form, toggled);
  }
  function restoreFormControls(form) {
    if (!(form instanceof HTMLFormElement)) {
      return;
    }
    const toggled = formControlsDisabledByBladex.get(form);
    if (toggled === void 0) {
      return;
    }
    for (let index = 0; index < toggled.length; index++) {
      toggled[index].disabled = false;
    }
    formControlsDisabledByBladex.delete(form);
  }
  function setDeclarativeLoadingState(element, loading) {
    setLoadingState(element, loading);
    if (element.tagName !== "FORM") {
      return;
    }
    if (loading) {
      disableFormControls(element);
    } else {
      restoreFormControls(element);
    }
  }
  function shouldPreventDefault(element, event) {
    if (event.type === "submit" && element.tagName === "FORM") {
      return true;
    }
    if (event.type === "click" && element.tagName === "A") {
      return true;
    }
    if (event.type === "click" && element.tagName === "BUTTON" && element.getAttribute("type") !== "submit") {
      return true;
    }
    return false;
  }

  // packages/bladex/src/forms/errors.js
  var VALIDATION_FAILED_EVENT = "validation-failed";
  var VALIDATION_CLEARED_EVENT = "validation-cleared";
  function normalizeMessageList(messages) {
    if (!Array.isArray(messages)) {
      return [];
    }
    const normalized = [];
    for (let index = 0; index < messages.length; index++) {
      const message = messages[index];
      if (typeof message === "string" && message !== "") {
        normalized.push(message);
      }
    }
    return normalized;
  }
  function addNormalizedFieldError(target, name, messages) {
    const list = normalizeMessageList(messages);
    if (list.length === 0) {
      return;
    }
    target[name] = list;
  }
  function normalizeErrorsObject(errors) {
    if (errors === null || typeof errors !== "object" || Array.isArray(errors)) {
      return null;
    }
    const normalized = {};
    for (const key in errors) {
      if (!Object.prototype.hasOwnProperty.call(errors, key)) {
        continue;
      }
      addNormalizedFieldError(
        normalized,
        key,
        /** @type {Record<string, unknown>} */
        errors[key]
      );
    }
    return Object.keys(normalized).length === 0 ? null : normalized;
  }
  function normalizeErrorsList(fieldErrors) {
    if (!Array.isArray(fieldErrors)) {
      return null;
    }
    const normalized = {};
    for (let index = 0; index < fieldErrors.length; index++) {
      const entry = fieldErrors[index];
      if (entry === null || typeof entry !== "object") {
        continue;
      }
      const name = (
        /** @type {Record<string, unknown>} */
        entry.name
      );
      const messages = (
        /** @type {Record<string, unknown>} */
        entry.messages
      );
      if (typeof name !== "string" || name === "") {
        continue;
      }
      addNormalizedFieldError(normalized, name, messages);
    }
    return Object.keys(normalized).length === 0 ? null : normalized;
  }
  function normalizeErrors(payload) {
    if (payload === null || typeof payload !== "object") {
      return null;
    }
    const record = (
      /** @type {Record<string, unknown>} */
      payload
    );
    const errors = record.errors;
    if (Array.isArray(errors)) {
      return normalizeErrorsList(errors);
    }
    return normalizeErrorsObject(errors);
  }
  function fieldNameToErrorKey(name) {
    if (typeof name !== "string" || name === "") {
      return "";
    }
    let key = name;
    key = key.replace(/\]/g, "");
    key = key.replace(/\[/g, ".");
    while (key.includes("..")) {
      key = key.replace(/\.\./g, ".");
    }
    return key.replace(/^\.|\.$/g, "");
  }
  function fieldNameMatchesErrorKey(name, errorKey) {
    return fieldNameToErrorKey(name) === errorKey;
  }
  function resolveFieldsForErrors(form, errors) {
    const fields = {};
    if (!(form instanceof HTMLFormElement)) {
      return fields;
    }
    const errorKeys = Object.keys(errors);
    for (let keyIndex = 0; keyIndex < errorKeys.length; keyIndex++) {
      const errorKey = errorKeys[keyIndex];
      const controls = [];
      for (let index = 0; index < form.elements.length; index++) {
        const control = form.elements[index];
        if (!(control instanceof HTMLElement)) {
          continue;
        }
        const name = control.getAttribute("name");
        if (name === null || name === "") {
          continue;
        }
        if (!fieldNameMatchesErrorKey(name, errorKey)) {
          continue;
        }
        controls.push(control);
      }
      if (controls.length > 0) {
        fields[errorKey] = controls;
      }
    }
    return fields;
  }
  function dispatchValidationCleared(form, reason) {
    if (!(form instanceof HTMLFormElement)) {
      return;
    }
    for (let index = 0; index < form.elements.length; index++) {
      const control = form.elements[index];
      if (!(control instanceof HTMLElement)) {
        continue;
      }
      control.dispatchEvent(
        new CustomEvent(VALIDATION_CLEARED_EVENT, {
          bubbles: true,
          composed: true,
          detail: {
            form,
            control,
            reason
          }
        })
      );
    }
  }
  function dispatchValidationFailed(form, errors) {
    if (!(form instanceof HTMLFormElement)) {
      return;
    }
    const fields = resolveFieldsForErrors(form, errors);
    const errorKeys = Object.keys(fields);
    for (let keyIndex = 0; keyIndex < errorKeys.length; keyIndex++) {
      const errorKey = errorKeys[keyIndex];
      const messages = errors[errorKey];
      const controls = fields[errorKey];
      if (messages === void 0 || controls === void 0) {
        continue;
      }
      for (let controlIndex = 0; controlIndex < controls.length; controlIndex++) {
        const control = controls[controlIndex];
        control.dispatchEvent(
          new CustomEvent(VALIDATION_FAILED_EVENT, {
            bubbles: true,
            composed: true,
            detail: {
              form,
              control,
              field: errorKey,
              messages
            }
          })
        );
      }
    }
  }
  function formFromTriggerElement(triggerElement) {
    if (!(triggerElement instanceof Element)) {
      return null;
    }
    if (triggerElement instanceof HTMLFormElement) {
      return triggerElement;
    }
    const form = triggerElement.closest("form");
    return form instanceof HTMLFormElement ? form : null;
  }

  // packages/bladex/src/forms/context.js
  var pendingFormContext = null;
  function setPendingFormContext(context) {
    pendingFormContext = context;
  }
  function takePendingFormContext() {
    const context = pendingFormContext != null ? pendingFormContext : {};
    pendingFormContext = null;
    return context;
  }
  function clearPendingFormContext() {
    pendingFormContext = null;
  }

  // packages/bladex/src/fetch/csrf.js
  function csrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    if (meta === null) {
      return null;
    }
    const token = meta.getAttribute("content");
    if (token === null || token === "") {
      return null;
    }
    return token;
  }

  // packages/bladex/src/fetch/request.js
  function isMutationMethod(method) {
    const normalized = (method || "GET").toUpperCase();
    return normalized === "POST" || normalized === "PUT" || normalized === "PATCH" || normalized === "DELETE";
  }
  function mergeRequestInit(init) {
    const options = init ? Object.assign({}, init) : {};
    const headers = new Headers(options.headers || {});
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }
    headers.set("X-BladeX-Request", "true");
    if (isMutationMethod(options.method) && !headers.has("X-CSRF-TOKEN")) {
      const token = csrfToken();
      if (token !== null) {
        headers.set("X-CSRF-TOKEN", token);
      }
    }
    if (isMutationMethod(options.method) && !headers.has("X-Requested-With")) {
      headers.set("X-Requested-With", "XMLHttpRequest");
    }
    options.headers = headers;
    return options;
  }

  // packages/bladex/src/fetch/bladex-response.js
  function isBladexResponse(response) {
    return response.headers.get("X-BladeX") === "true";
  }

  // packages/bladex/src/components/dom-update-mode.js
  var domUpdateMode = "morph";
  function setDomUpdateMode(mode) {
    if (mode === "replace" || mode === "morph") {
      domUpdateMode = mode;
    }
  }
  function getDomUpdateMode() {
    return domUpdateMode;
  }
  function normalizeDomUpdateMode(value) {
    if (value === "replace" || value === "morph") {
      return value;
    }
    return "morph";
  }

  // node_modules/idiomorph/dist/idiomorph.esm.js
  var Idiomorph = (function() {
    "use strict";
    const noOp = () => {
    };
    const defaults = {
      morphStyle: "outerHTML",
      callbacks: {
        beforeNodeAdded: noOp,
        afterNodeAdded: noOp,
        beforeNodeMorphed: noOp,
        afterNodeMorphed: noOp,
        beforeNodeRemoved: noOp,
        afterNodeRemoved: noOp,
        beforeAttributeUpdated: noOp
      },
      head: {
        style: "merge",
        shouldPreserve: (elt) => elt.getAttribute("im-preserve") === "true",
        shouldReAppend: (elt) => elt.getAttribute("im-re-append") === "true",
        shouldRemove: noOp,
        afterHeadMorphed: noOp
      },
      restoreFocus: true
    };
    function morph(oldNode, newContent, config = {}) {
      oldNode = normalizeElement(oldNode);
      const newNode = normalizeParent(newContent);
      const ctx = createMorphContext(oldNode, newNode, config);
      const morphedNodes = saveAndRestoreFocus(ctx, () => {
        return withHeadBlocking(
          ctx,
          oldNode,
          newNode,
          /** @param {MorphContext} ctx */
          (ctx2) => {
            if (ctx2.morphStyle === "innerHTML") {
              morphChildren(ctx2, oldNode, newNode);
              return Array.from(oldNode.childNodes);
            } else {
              return morphOuterHTML(ctx2, oldNode, newNode);
            }
          }
        );
      });
      ctx.pantry.remove();
      return morphedNodes;
    }
    function morphOuterHTML(ctx, oldNode, newNode) {
      const oldParent = normalizeParent(oldNode);
      morphChildren(
        ctx,
        oldParent,
        newNode,
        // these two optional params are the secret sauce
        oldNode,
        // start point for iteration
        oldNode.nextSibling
        // end point for iteration
      );
      return Array.from(oldParent.childNodes);
    }
    function saveAndRestoreFocus(ctx, fn) {
      var _a;
      if (!ctx.config.restoreFocus) return fn();
      let activeElement = (
        /** @type {HTMLInputElement|HTMLTextAreaElement|null} */
        document.activeElement
      );
      if (!(activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement)) {
        return fn();
      }
      const { id: activeElementId, selectionStart, selectionEnd } = activeElement;
      const results = fn();
      if (activeElementId && activeElementId !== ((_a = document.activeElement) == null ? void 0 : _a.getAttribute("id"))) {
        activeElement = ctx.target.querySelector(`[id="${activeElementId}"]`);
        activeElement == null ? void 0 : activeElement.focus();
      }
      if (activeElement && !activeElement.selectionEnd && selectionEnd) {
        activeElement.setSelectionRange(selectionStart, selectionEnd);
      }
      return results;
    }
    const morphChildren = /* @__PURE__ */ (function() {
      function morphChildren2(ctx, oldParent, newParent, insertionPoint = null, endPoint = null) {
        if (oldParent instanceof HTMLTemplateElement && newParent instanceof HTMLTemplateElement) {
          oldParent = oldParent.content;
          newParent = newParent.content;
        }
        insertionPoint || (insertionPoint = oldParent.firstChild);
        for (const newChild of newParent.childNodes) {
          if (insertionPoint && insertionPoint != endPoint) {
            const bestMatch = findBestMatch(
              ctx,
              newChild,
              insertionPoint,
              endPoint
            );
            if (bestMatch) {
              if (bestMatch !== insertionPoint) {
                removeNodesBetween(ctx, insertionPoint, bestMatch);
              }
              morphNode(bestMatch, newChild, ctx);
              insertionPoint = bestMatch.nextSibling;
              continue;
            }
          }
          if (newChild instanceof Element) {
            const newChildId = (
              /** @type {String} */
              newChild.getAttribute("id")
            );
            if (ctx.persistentIds.has(newChildId)) {
              const movedChild = moveBeforeById(
                oldParent,
                newChildId,
                insertionPoint,
                ctx
              );
              morphNode(movedChild, newChild, ctx);
              insertionPoint = movedChild.nextSibling;
              continue;
            }
          }
          const insertedNode = createNode(
            oldParent,
            newChild,
            insertionPoint,
            ctx
          );
          if (insertedNode) {
            insertionPoint = insertedNode.nextSibling;
          }
        }
        while (insertionPoint && insertionPoint != endPoint) {
          const tempNode = insertionPoint;
          insertionPoint = insertionPoint.nextSibling;
          removeNode(ctx, tempNode);
        }
      }
      function createNode(oldParent, newChild, insertionPoint, ctx) {
        if (ctx.callbacks.beforeNodeAdded(newChild) === false) return null;
        if (ctx.idMap.has(newChild)) {
          const newEmptyChild = document.createElement(
            /** @type {Element} */
            newChild.tagName
          );
          oldParent.insertBefore(newEmptyChild, insertionPoint);
          morphNode(newEmptyChild, newChild, ctx);
          ctx.callbacks.afterNodeAdded(newEmptyChild);
          return newEmptyChild;
        } else {
          const newClonedChild = document.importNode(newChild, true);
          oldParent.insertBefore(newClonedChild, insertionPoint);
          ctx.callbacks.afterNodeAdded(newClonedChild);
          return newClonedChild;
        }
      }
      const findBestMatch = /* @__PURE__ */ (function() {
        function findBestMatch2(ctx, node, startPoint, endPoint) {
          let softMatch = null;
          let nextSibling = node.nextSibling;
          let siblingSoftMatchCount = 0;
          let cursor = startPoint;
          while (cursor && cursor != endPoint) {
            if (isSoftMatch(cursor, node)) {
              if (isIdSetMatch(ctx, cursor, node)) {
                return cursor;
              }
              if (softMatch === null) {
                if (!ctx.idMap.has(cursor)) {
                  softMatch = cursor;
                }
              }
            }
            if (softMatch === null && nextSibling && isSoftMatch(cursor, nextSibling)) {
              siblingSoftMatchCount++;
              nextSibling = nextSibling.nextSibling;
              if (siblingSoftMatchCount >= 2) {
                softMatch = void 0;
              }
            }
            if (ctx.activeElementAndParents.includes(cursor)) break;
            cursor = cursor.nextSibling;
          }
          return softMatch || null;
        }
        function isIdSetMatch(ctx, oldNode, newNode) {
          let oldSet = ctx.idMap.get(oldNode);
          let newSet = ctx.idMap.get(newNode);
          if (!newSet || !oldSet) return false;
          for (const id of oldSet) {
            if (newSet.has(id)) {
              return true;
            }
          }
          return false;
        }
        function isSoftMatch(oldNode, newNode) {
          var _a, _b, _c;
          const oldElt = (
            /** @type {Element} */
            oldNode
          );
          const newElt = (
            /** @type {Element} */
            newNode
          );
          return oldElt.nodeType === newElt.nodeType && oldElt.tagName === newElt.tagName && // If oldElt has an `id` with possible state and it doesn't match newElt.id then avoid morphing.
          // We'll still match an anonymous node with an IDed newElt, though, because if it got this far,
          // its not persistent, and new nodes can't have any hidden state.
          // We can't use .id because of form input shadowing, and we can't count on .getAttribute's presence because it could be a document-fragment
          (!((_a = oldElt.getAttribute) == null ? void 0 : _a.call(oldElt, "id")) || ((_b = oldElt.getAttribute) == null ? void 0 : _b.call(oldElt, "id")) === ((_c = newElt.getAttribute) == null ? void 0 : _c.call(newElt, "id")));
        }
        return findBestMatch2;
      })();
      function removeNode(ctx, node) {
        var _a;
        if (ctx.idMap.has(node)) {
          moveBefore(ctx.pantry, node, null);
        } else {
          if (ctx.callbacks.beforeNodeRemoved(node) === false) return;
          (_a = node.parentNode) == null ? void 0 : _a.removeChild(node);
          ctx.callbacks.afterNodeRemoved(node);
        }
      }
      function removeNodesBetween(ctx, startInclusive, endExclusive) {
        let cursor = startInclusive;
        while (cursor && cursor !== endExclusive) {
          let tempNode = (
            /** @type {Node} */
            cursor
          );
          cursor = cursor.nextSibling;
          removeNode(ctx, tempNode);
        }
        return cursor;
      }
      function moveBeforeById(parentNode, id, after, ctx) {
        var _a, _b;
        const target = (
          /** @type {Element} - will always be found */
          // ctx.target.id unsafe because of form input shadowing
          // ctx.target could be a document fragment which doesn't have `getAttribute`
          ((_b = (_a = ctx.target).getAttribute) == null ? void 0 : _b.call(_a, "id")) === id && ctx.target || ctx.target.querySelector(`[id="${id}"]`) || ctx.pantry.querySelector(`[id="${id}"]`)
        );
        removeElementFromAncestorsIdMaps(target, ctx);
        moveBefore(parentNode, target, after);
        return target;
      }
      function removeElementFromAncestorsIdMaps(element, ctx) {
        const id = (
          /** @type {String} */
          element.getAttribute("id")
        );
        while (element = element.parentNode) {
          let idSet = ctx.idMap.get(element);
          if (idSet) {
            idSet.delete(id);
            if (!idSet.size) {
              ctx.idMap.delete(element);
            }
          }
        }
      }
      function moveBefore(parentNode, element, after) {
        if (parentNode.moveBefore) {
          try {
            parentNode.moveBefore(element, after);
          } catch (e) {
            parentNode.insertBefore(element, after);
          }
        } else {
          parentNode.insertBefore(element, after);
        }
      }
      return morphChildren2;
    })();
    const morphNode = /* @__PURE__ */ (function() {
      function morphNode2(oldNode, newContent, ctx) {
        if (ctx.ignoreActive && oldNode === document.activeElement) {
          return null;
        }
        if (ctx.callbacks.beforeNodeMorphed(oldNode, newContent) === false) {
          return oldNode;
        }
        if (oldNode instanceof HTMLHeadElement && ctx.head.ignore) {
        } else if (oldNode instanceof HTMLHeadElement && ctx.head.style !== "morph") {
          handleHeadElement(
            oldNode,
            /** @type {HTMLHeadElement} */
            newContent,
            ctx
          );
        } else {
          morphAttributes(oldNode, newContent, ctx);
          if (!ignoreValueOfActiveElement(oldNode, ctx)) {
            morphChildren(ctx, oldNode, newContent);
          }
        }
        ctx.callbacks.afterNodeMorphed(oldNode, newContent);
        return oldNode;
      }
      function morphAttributes(oldNode, newNode, ctx) {
        let type = newNode.nodeType;
        if (type === 1) {
          const oldElt = (
            /** @type {Element} */
            oldNode
          );
          const newElt = (
            /** @type {Element} */
            newNode
          );
          const oldAttributes = oldElt.attributes;
          const newAttributes = newElt.attributes;
          for (const newAttribute of newAttributes) {
            if (ignoreAttribute(newAttribute.name, oldElt, "update", ctx)) {
              continue;
            }
            if (oldElt.getAttribute(newAttribute.name) !== newAttribute.value) {
              oldElt.setAttribute(newAttribute.name, newAttribute.value);
            }
          }
          for (let i = oldAttributes.length - 1; 0 <= i; i--) {
            const oldAttribute = oldAttributes[i];
            if (!oldAttribute) continue;
            if (!newElt.hasAttribute(oldAttribute.name)) {
              if (ignoreAttribute(oldAttribute.name, oldElt, "remove", ctx)) {
                continue;
              }
              oldElt.removeAttribute(oldAttribute.name);
            }
          }
          if (!ignoreValueOfActiveElement(oldElt, ctx)) {
            syncInputValue(oldElt, newElt, ctx);
          }
        }
        if (type === 8 || type === 3) {
          if (oldNode.nodeValue !== newNode.nodeValue) {
            oldNode.nodeValue = newNode.nodeValue;
          }
        }
      }
      function syncInputValue(oldElement, newElement, ctx) {
        if (oldElement instanceof HTMLInputElement && newElement instanceof HTMLInputElement && newElement.type !== "file") {
          let newValue = newElement.value;
          let oldValue = oldElement.value;
          syncBooleanAttribute(oldElement, newElement, "checked", ctx);
          syncBooleanAttribute(oldElement, newElement, "disabled", ctx);
          if (!newElement.hasAttribute("value")) {
            if (!ignoreAttribute("value", oldElement, "remove", ctx)) {
              oldElement.value = "";
              oldElement.removeAttribute("value");
            }
          } else if (oldValue !== newValue) {
            if (!ignoreAttribute("value", oldElement, "update", ctx)) {
              oldElement.setAttribute("value", newValue);
              oldElement.value = newValue;
            }
          }
        } else if (oldElement instanceof HTMLOptionElement && newElement instanceof HTMLOptionElement) {
          syncBooleanAttribute(oldElement, newElement, "selected", ctx);
        } else if (oldElement instanceof HTMLTextAreaElement && newElement instanceof HTMLTextAreaElement) {
          let newValue = newElement.value;
          let oldValue = oldElement.value;
          if (ignoreAttribute("value", oldElement, "update", ctx)) {
            return;
          }
          if (newValue !== oldValue) {
            oldElement.value = newValue;
          }
          if (oldElement.firstChild && oldElement.firstChild.nodeValue !== newValue) {
            oldElement.firstChild.nodeValue = newValue;
          }
        }
      }
      function syncBooleanAttribute(oldElement, newElement, attributeName, ctx) {
        const newLiveValue = newElement[attributeName], oldLiveValue = oldElement[attributeName];
        if (newLiveValue !== oldLiveValue) {
          const ignoreUpdate = ignoreAttribute(
            attributeName,
            oldElement,
            "update",
            ctx
          );
          if (!ignoreUpdate) {
            oldElement[attributeName] = newElement[attributeName];
          }
          if (newLiveValue) {
            if (!ignoreUpdate) {
              oldElement.setAttribute(attributeName, "");
            }
          } else {
            if (!ignoreAttribute(attributeName, oldElement, "remove", ctx)) {
              oldElement.removeAttribute(attributeName);
            }
          }
        }
      }
      function ignoreAttribute(attr, element, updateType, ctx) {
        if (attr === "value" && ctx.ignoreActiveValue && element === document.activeElement) {
          return true;
        }
        return ctx.callbacks.beforeAttributeUpdated(attr, element, updateType) === false;
      }
      function ignoreValueOfActiveElement(possibleActiveElement, ctx) {
        return !!ctx.ignoreActiveValue && possibleActiveElement === document.activeElement && possibleActiveElement !== document.body;
      }
      return morphNode2;
    })();
    function withHeadBlocking(ctx, oldNode, newNode, callback) {
      if (ctx.head.block) {
        const oldHead = oldNode.querySelector("head");
        const newHead = newNode.querySelector("head");
        if (oldHead && newHead) {
          const promises = handleHeadElement(oldHead, newHead, ctx);
          return Promise.all(promises).then(() => {
            const newCtx = Object.assign(ctx, {
              head: {
                block: false,
                ignore: true
              }
            });
            return callback(newCtx);
          });
        }
      }
      return callback(ctx);
    }
    function handleHeadElement(oldHead, newHead, ctx) {
      let added = [];
      let removed = [];
      let preserved = [];
      let nodesToAppend = [];
      let srcToNewHeadNodes = /* @__PURE__ */ new Map();
      for (const newHeadChild of newHead.children) {
        srcToNewHeadNodes.set(newHeadChild.outerHTML, newHeadChild);
      }
      for (const currentHeadElt of oldHead.children) {
        let inNewContent = srcToNewHeadNodes.has(currentHeadElt.outerHTML);
        let isReAppended = ctx.head.shouldReAppend(currentHeadElt);
        let isPreserved = ctx.head.shouldPreserve(currentHeadElt);
        if (inNewContent || isPreserved) {
          if (isReAppended) {
            removed.push(currentHeadElt);
          } else {
            srcToNewHeadNodes.delete(currentHeadElt.outerHTML);
            preserved.push(currentHeadElt);
          }
        } else {
          if (ctx.head.style === "append") {
            if (isReAppended) {
              removed.push(currentHeadElt);
              nodesToAppend.push(currentHeadElt);
            }
          } else {
            if (ctx.head.shouldRemove(currentHeadElt) !== false) {
              removed.push(currentHeadElt);
            }
          }
        }
      }
      nodesToAppend.push(...srcToNewHeadNodes.values());
      let promises = [];
      for (const newNode of nodesToAppend) {
        let newElt = (
          /** @type {ChildNode} */
          document.createRange().createContextualFragment(newNode.outerHTML).firstChild
        );
        if (ctx.callbacks.beforeNodeAdded(newElt) !== false) {
          if ("href" in newElt && newElt.href || "src" in newElt && newElt.src) {
            let resolve;
            let promise = new Promise(function(_resolve) {
              resolve = _resolve;
            });
            newElt.addEventListener("load", function() {
              resolve();
            });
            promises.push(promise);
          }
          oldHead.appendChild(newElt);
          ctx.callbacks.afterNodeAdded(newElt);
          added.push(newElt);
        }
      }
      for (const removedElement of removed) {
        if (ctx.callbacks.beforeNodeRemoved(removedElement) !== false) {
          oldHead.removeChild(removedElement);
          ctx.callbacks.afterNodeRemoved(removedElement);
        }
      }
      ctx.head.afterHeadMorphed(oldHead, {
        added,
        kept: preserved,
        removed
      });
      return promises;
    }
    const createMorphContext = /* @__PURE__ */ (function() {
      function createMorphContext2(oldNode, newContent, config) {
        const { persistentIds, idMap } = createIdMaps(oldNode, newContent);
        const mergedConfig = mergeDefaults(config);
        const morphStyle = mergedConfig.morphStyle || "outerHTML";
        if (!["innerHTML", "outerHTML"].includes(morphStyle)) {
          throw `Do not understand how to morph style ${morphStyle}`;
        }
        return {
          target: oldNode,
          newContent,
          config: mergedConfig,
          morphStyle,
          ignoreActive: mergedConfig.ignoreActive,
          ignoreActiveValue: mergedConfig.ignoreActiveValue,
          restoreFocus: mergedConfig.restoreFocus,
          idMap,
          persistentIds,
          pantry: createPantry(),
          activeElementAndParents: createActiveElementAndParents(oldNode),
          callbacks: mergedConfig.callbacks,
          head: mergedConfig.head
        };
      }
      function mergeDefaults(config) {
        let finalConfig = Object.assign({}, defaults);
        Object.assign(finalConfig, config);
        finalConfig.callbacks = Object.assign(
          {},
          defaults.callbacks,
          config.callbacks
        );
        finalConfig.head = Object.assign({}, defaults.head, config.head);
        return finalConfig;
      }
      function createPantry() {
        const pantry = document.createElement("div");
        pantry.hidden = true;
        document.body.insertAdjacentElement("afterend", pantry);
        return pantry;
      }
      function createActiveElementAndParents(oldNode) {
        let activeElementAndParents = [];
        let elt = document.activeElement;
        if ((elt == null ? void 0 : elt.tagName) !== "BODY" && oldNode.contains(elt)) {
          while (elt) {
            activeElementAndParents.push(elt);
            if (elt === oldNode) break;
            elt = elt.parentElement;
          }
        }
        return activeElementAndParents;
      }
      function findIdElements(root) {
        var _a;
        let elements = Array.from(root.querySelectorAll("[id]"));
        if ((_a = root.getAttribute) == null ? void 0 : _a.call(root, "id")) {
          elements.push(root);
        }
        return elements;
      }
      function populateIdMapWithTree(idMap, persistentIds, root, elements) {
        for (const elt of elements) {
          const id = (
            /** @type {String} */
            elt.getAttribute("id")
          );
          if (persistentIds.has(id)) {
            let current = elt;
            while (current) {
              let idSet = idMap.get(current);
              if (idSet == null) {
                idSet = /* @__PURE__ */ new Set();
                idMap.set(current, idSet);
              }
              idSet.add(id);
              if (current === root) break;
              current = current.parentElement;
            }
          }
        }
      }
      function createIdMaps(oldContent, newContent) {
        const oldIdElements = findIdElements(oldContent);
        const newIdElements = findIdElements(newContent);
        const persistentIds = createPersistentIds(oldIdElements, newIdElements);
        let idMap = /* @__PURE__ */ new Map();
        populateIdMapWithTree(idMap, persistentIds, oldContent, oldIdElements);
        const newRoot = newContent.__idiomorphRoot || newContent;
        populateIdMapWithTree(idMap, persistentIds, newRoot, newIdElements);
        return { persistentIds, idMap };
      }
      function createPersistentIds(oldIdElements, newIdElements) {
        let duplicateIds = /* @__PURE__ */ new Set();
        let oldIdTagNameMap = /* @__PURE__ */ new Map();
        for (const { id, tagName } of oldIdElements) {
          if (oldIdTagNameMap.has(id)) {
            duplicateIds.add(id);
          } else {
            oldIdTagNameMap.set(id, tagName);
          }
        }
        let persistentIds = /* @__PURE__ */ new Set();
        for (const { id, tagName } of newIdElements) {
          if (persistentIds.has(id)) {
            duplicateIds.add(id);
          } else if (oldIdTagNameMap.get(id) === tagName) {
            persistentIds.add(id);
          }
        }
        for (const id of duplicateIds) {
          persistentIds.delete(id);
        }
        return persistentIds;
      }
      return createMorphContext2;
    })();
    const { normalizeElement, normalizeParent } = /* @__PURE__ */ (function() {
      const generatedByIdiomorph = /* @__PURE__ */ new WeakSet();
      function normalizeElement2(content) {
        if (content instanceof Document) {
          return content.documentElement;
        } else {
          return content;
        }
      }
      function normalizeParent2(newContent) {
        if (newContent == null) {
          return document.createElement("div");
        } else if (typeof newContent === "string") {
          return normalizeParent2(parseContent(newContent));
        } else if (generatedByIdiomorph.has(
          /** @type {Element} */
          newContent
        )) {
          return (
            /** @type {Element} */
            newContent
          );
        } else if (newContent instanceof Node) {
          if (newContent.parentNode) {
            return (
              /** @type {any} */
              new SlicedParentNode(newContent)
            );
          } else {
            const dummyParent = document.createElement("div");
            dummyParent.append(newContent);
            return dummyParent;
          }
        } else {
          const dummyParent = document.createElement("div");
          for (const elt of [...newContent]) {
            dummyParent.append(elt);
          }
          return dummyParent;
        }
      }
      class SlicedParentNode {
        /** @param {Node} node */
        constructor(node) {
          this.originalNode = node;
          this.realParentNode = /** @type {Element} */
          node.parentNode;
          this.previousSibling = node.previousSibling;
          this.nextSibling = node.nextSibling;
        }
        /** @returns {Node[]} */
        get childNodes() {
          const nodes = [];
          let cursor = this.previousSibling ? this.previousSibling.nextSibling : this.realParentNode.firstChild;
          while (cursor && cursor != this.nextSibling) {
            nodes.push(cursor);
            cursor = cursor.nextSibling;
          }
          return nodes;
        }
        /**
         * @param {string} selector
         * @returns {Element[]}
         */
        querySelectorAll(selector) {
          return this.childNodes.reduce(
            (results, node) => {
              if (node instanceof Element) {
                if (node.matches(selector)) results.push(node);
                const nodeList = node.querySelectorAll(selector);
                for (let i = 0; i < nodeList.length; i++) {
                  results.push(nodeList[i]);
                }
              }
              return results;
            },
            /** @type {Element[]} */
            []
          );
        }
        /**
         * @param {Node} node
         * @param {Node} referenceNode
         * @returns {Node}
         */
        insertBefore(node, referenceNode) {
          return this.realParentNode.insertBefore(node, referenceNode);
        }
        /**
         * @param {Node} node
         * @param {Node} referenceNode
         * @returns {Node}
         */
        moveBefore(node, referenceNode) {
          return this.realParentNode.moveBefore(node, referenceNode);
        }
        /**
         * for later use with populateIdMapWithTree to halt upwards iteration
         * @returns {Node}
         */
        get __idiomorphRoot() {
          return this.originalNode;
        }
      }
      function parseContent(newContent) {
        let parser = new DOMParser();
        let contentWithSvgsRemoved = newContent.replace(
          /<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim,
          ""
        );
        if (contentWithSvgsRemoved.match(/<\/html>/) || contentWithSvgsRemoved.match(/<\/head>/) || contentWithSvgsRemoved.match(/<\/body>/)) {
          let content = parser.parseFromString(newContent, "text/html");
          if (contentWithSvgsRemoved.match(/<\/html>/)) {
            generatedByIdiomorph.add(content);
            return content;
          } else {
            let htmlElement = content.firstChild;
            if (htmlElement) {
              generatedByIdiomorph.add(htmlElement);
            }
            return htmlElement;
          }
        } else {
          let responseDoc = parser.parseFromString(
            "<body><template>" + newContent + "</template></body>",
            "text/html"
          );
          let content = (
            /** @type {HTMLTemplateElement} */
            responseDoc.body.querySelector("template").content
          );
          generatedByIdiomorph.add(content);
          return content;
        }
      }
      return { normalizeElement: normalizeElement2, normalizeParent: normalizeParent2 };
    })();
    return {
      morph,
      defaults
    };
  })();

  // packages/bladex/src/components/morph.js
  function morphComponent(existing, incoming) {
    Idiomorph.morph(existing, incoming, {
      morphStyle: "outerHTML"
    });
  }

  // packages/bladex/src/components/parse-html.js
  var COMPONENT_IDENTIFIER_ATTRIBUTE = "data-component-identifier";
  function parseComponentHtml(html, identifier) {
    if (typeof html !== "string" || html.trim() === "") {
      console.error("[Bladex] Component HTML must be a non-empty string.");
      return null;
    }
    if (typeof identifier !== "string" || identifier === "") {
      console.error("[Bladex] Component identifier is required to parse HTML.");
      return null;
    }
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    const roots = [];
    for (let index = 0; index < template.content.childNodes.length; index++) {
      const node = template.content.childNodes[index];
      if (node.nodeType === Node.ELEMENT_NODE) {
        roots.push(node);
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
        console.error(
          "[Bladex] Component HTML must have a single root element."
        );
        return null;
      }
    }
    if (roots.length !== 1) {
      console.error(
        "[Bladex] Component HTML must have a single root element."
      );
      return null;
    }
    const incoming = roots[0];
    const incomingIdentifier = incoming.getAttribute(
      COMPONENT_IDENTIFIER_ATTRIBUTE
    );
    if (incomingIdentifier !== identifier) {
      console.error(
        "[Bladex] Component HTML identifier mismatch. Expected:",
        identifier,
        "Received:",
        incomingIdentifier
      );
      return null;
    }
    return incoming;
  }

  // packages/bladex/src/components/find.js
  function componentFromElement(element) {
    if (!(element instanceof Element)) {
      return null;
    }
    const root = element.closest("[data-component-identifier]");
    if (root === null) {
      return null;
    }
    const identifier = root.getAttribute("data-component-identifier");
    if (identifier === null || identifier === "") {
      return null;
    }
    return { element: root, identifier };
  }
  function elementsFromIdentifier(identifier) {
    if (typeof identifier !== "string" || identifier === "") {
      return [];
    }
    return document.querySelectorAll(
      '[data-component-identifier="' + CSS.escape(identifier) + '"]'
    );
  }
  function uniqueElementFromIdentifier(identifier) {
    const elements = elementsFromIdentifier(identifier);
    if (elements.length === 0) {
      console.error(
        "[Bladex] No component found for identifier:",
        identifier
      );
      return null;
    }
    if (elements.length > 1) {
      console.error(
        "[Bladex] Multiple components found for identifier:",
        identifier
      );
      return null;
    }
    return elements[0];
  }
  function componentFromIdentifier(identifier) {
    const element = uniqueElementFromIdentifier(identifier);
    if (element === null) {
      return null;
    }
    return { element, identifier };
  }

  // packages/bladex/src/components/dom.js
  function replaceComponentHtml(element, html) {
    element.outerHTML = html;
  }
  function swapComponent(identifier, html) {
    const element = uniqueElementFromIdentifier(identifier);
    if (element === null) {
      return false;
    }
    if (typeof html !== "string") {
      return false;
    }
    if (getDomUpdateMode() === "replace") {
      replaceComponentHtml(element, html);
      return true;
    }
    const incoming = parseComponentHtml(html, identifier);
    if (incoming === null) {
      console.error(
        "[Bladex] Falling back to replace for identifier:",
        identifier
      );
      replaceComponentHtml(element, html);
      return true;
    }
    morphComponent(element, incoming);
    return true;
  }
  function removeComponent(identifier) {
    const element = uniqueElementFromIdentifier(identifier);
    if (element === null) {
      return false;
    }
    element.remove();
    return true;
  }
  function insertComponent(intoIdentifier, html, position) {
    const element = uniqueElementFromIdentifier(intoIdentifier);
    if (element === null) {
      return false;
    }
    if (typeof html !== "string") {
      return false;
    }
    element.insertAdjacentHTML(position, html);
    return true;
  }

  // packages/bladex/src/operations/append.js
  function applyAppend(operation) {
    const html = operation.html;
    if (typeof html !== "string") {
      return false;
    }
    return insertComponent(operation.identifier, html, "beforeend");
  }

  // packages/bladex/src/operations/prepend.js
  function applyPrepend(operation) {
    const html = operation.html;
    if (typeof html !== "string") {
      return false;
    }
    return insertComponent(operation.identifier, html, "afterbegin");
  }

  // packages/bladex/src/operations/redirect.js
  function applyRedirect(operation) {
    const url = operation.url;
    if (typeof url !== "string" || url === "") {
      return false;
    }
    window.location.assign(url);
    return true;
  }

  // packages/bladex/src/operations/refresh.js
  function applyRefreshOrReplace(operation) {
    const html = operation.html;
    if (typeof html !== "string") {
      return false;
    }
    return swapComponent(operation.identifier, html);
  }

  // packages/bladex/src/operations/remove.js
  function applyRemove(operation) {
    return removeComponent(operation.identifier);
  }

  // packages/bladex/src/operations/index.js
  function applyOperation(operation) {
    if (operation === null || typeof operation !== "object") {
      return false;
    }
    const type = operation.type;
    if (type === "redirect") {
      return applyRedirect(operation);
    }
    const identifier = operation.identifier;
    if (typeof identifier !== "string" || identifier === "") {
      return false;
    }
    if (type === "refresh" || type === "replace") {
      return applyRefreshOrReplace(operation);
    }
    if (type === "remove") {
      return applyRemove(operation);
    }
    if (type === "append") {
      return applyAppend(operation);
    }
    if (type === "prepend") {
      return applyPrepend(operation);
    }
    return false;
  }
  function apply(payload) {
    const operations = payload !== null && typeof payload === "object" && Array.isArray(payload.operations) ? payload.operations : null;
    if (operations === null) {
      return false;
    }
    let applied = true;
    for (let index = 0; index < operations.length; index++) {
      if (!applyOperation(operations[index])) {
        applied = false;
      }
    }
    return applied;
  }

  // packages/bladex/src/response.js
  function shouldProcessPayload(response, payload, form) {
    if (isBladexResponse(response)) {
      return true;
    }
    if (!(form instanceof HTMLFormElement) || response.ok) {
      return false;
    }
    return normalizeErrors(payload) !== null;
  }
  function applyOperationsFromPayload(payload) {
    if (payload === null || typeof payload !== "object" || !Array.isArray(payload.operations)) {
      return false;
    }
    return apply(payload);
  }
  function processBladexResponse(response) {
    var _a;
    const context = takePendingFormContext();
    const form = (_a = context.form) != null ? _a : null;
    const clearOnSuccess = context.clearOnSuccess !== false;
    if (!isBladexResponse(response) && (!(form instanceof HTMLFormElement) || response.ok)) {
      return Promise.resolve(false);
    }
    return response.clone().json().then(function(payload) {
      if (!shouldProcessPayload(response, payload, form)) {
        return false;
      }
      const operationsApplied = applyOperationsFromPayload(payload);
      const errors = normalizeErrors(payload);
      if (form instanceof HTMLFormElement) {
        if (response.ok && clearOnSuccess) {
          dispatchValidationCleared(form, "success");
        } else if (errors !== null) {
          dispatchValidationFailed(form, errors);
        }
      }
      return operationsApplied || errors !== null;
    }).catch(function(error) {
      console.error("[Bladex] Failed to process BladeX response.", error);
      return false;
    });
  }

  // packages/bladex/src/fetch/proxy.js
  var nativeFetch = window.fetch.bind(window);
  function fetch(input, init) {
    return nativeFetch(input, mergeRequestInit(init)).then(function(response) {
      return processBladexResponse(response).then(function() {
        return response;
      });
    });
  }
  var fetchProxyInstalled = false;
  function installFetchProxy() {
    if (fetchProxyInstalled) {
      return;
    }
    window.fetch = fetch;
    window.fetch.native = nativeFetch;
    fetchProxyInstalled = true;
  }
  function uninstallFetchProxy() {
    if (!fetchProxyInstalled) {
      return;
    }
    window.fetch = nativeFetch;
    fetchProxyInstalled = false;
  }

  // packages/bladex/src/actions/boot.js
  var DECLARATIVE_EVENT_TYPES = [
    "click",
    "submit",
    "change",
    "keydown",
    "keyup"
  ];
  var declarativeBooted = false;
  var declarativeListeners = [];
  var inFlightElements = /* @__PURE__ */ new WeakSet();
  var onceTriggeredElements = /* @__PURE__ */ new WeakSet();
  function parseDelayMs(modifier) {
    const match = /^delay:(\d+)ms$/i.exec(modifier);
    if (match === null) {
      return null;
    }
    return parseInt(match[1], 10);
  }
  function parseTriggerSpec(spec, element) {
    const normalized = typeof spec === "string" && spec.trim() !== "" ? spec.trim() : defaultTriggerSpec(element);
    const triggers = [];
    const parts = normalized.split(",");
    for (let partIndex = 0; partIndex < parts.length; partIndex++) {
      const tokens = parts[partIndex].trim().split(/\s+/).filter(Boolean);
      if (tokens.length === 0) {
        continue;
      }
      const eventType = tokens[0].toLowerCase();
      let once = false;
      let delayMs = 0;
      for (let tokenIndex = 1; tokenIndex < tokens.length; tokenIndex++) {
        const token = tokens[tokenIndex].toLowerCase();
        if (token === "once") {
          once = true;
          continue;
        }
        const delay = parseDelayMs(tokens[tokenIndex]);
        if (delay !== null) {
          delayMs = delay;
        }
      }
      triggers.push({ eventType, once, delayMs });
    }
    if (triggers.length === 0) {
      const fallback = defaultTriggerSpec(element);
      triggers.push({
        eventType: fallback,
        once: false,
        delayMs: 0
      });
    }
    return triggers;
  }
  function triggersForElement(element) {
    const spec = element.getAttribute("data-trigger");
    return parseTriggerSpec(spec, element);
  }
  function triggerMatchesEvent(trigger, event) {
    return trigger.eventType === event.type;
  }
  function performRequest(triggerElement, request) {
    const init = {
      method: request.method
    };
    const body = requestBodyForElement(triggerElement, request.method);
    if (body !== void 0) {
      init.body = body;
    }
    const form = formFromTriggerElement(triggerElement);
    setPendingFormContext({
      form,
      clearOnSuccess: true
    });
    if (form !== null) {
      dispatchValidationCleared(form, "submit");
    }
    inFlightElements.add(triggerElement);
    setDeclarativeLoadingState(triggerElement, true);
    return fetch(request.url, init).catch(function(error) {
      clearPendingFormContext();
      throw error;
    }).finally(function() {
      inFlightElements.delete(triggerElement);
      setDeclarativeLoadingState(triggerElement, false);
    });
  }
  function runTrigger(triggerElement, trigger, event) {
    if (inFlightElements.has(triggerElement)) {
      return;
    }
    if (trigger.once && onceTriggeredElements.has(triggerElement)) {
      return;
    }
    const request = resolveRequest(triggerElement);
    if (request === null) {
      return;
    }
    if (shouldPreventDefault(triggerElement, event)) {
      event.preventDefault();
    }
    const execute = function() {
      performRequest(triggerElement, request).then(function() {
        if (trigger.once) {
          onceTriggeredElements.add(triggerElement);
        }
      }).catch(function(error) {
        console.error("[Bladex] Declarative request failed.", error);
      });
    };
    if (trigger.delayMs > 0) {
      window.setTimeout(execute, trigger.delayMs);
      return;
    }
    execute();
  }
  function handleDeclarativeEvent(event) {
    if (!(event.target instanceof Element)) {
      return;
    }
    const triggerElement = event.target.closest(ACTION_SELECTOR);
    if (triggerElement === null) {
      return;
    }
    const triggers = triggersForElement(triggerElement);
    let matched = null;
    for (let index = 0; index < triggers.length; index++) {
      if (triggerMatchesEvent(triggers[index], event)) {
        matched = triggers[index];
        break;
      }
    }
    if (matched === null) {
      return;
    }
    runTrigger(triggerElement, matched, event);
  }
  function bootDeclarativeActions() {
    if (declarativeBooted) {
      return;
    }
    for (let index = 0; index < DECLARATIVE_EVENT_TYPES.length; index++) {
      const eventType = DECLARATIVE_EVENT_TYPES[index];
      const listener = function(event) {
        handleDeclarativeEvent(event);
      };
      document.addEventListener(eventType, listener, false);
      declarativeListeners.push({ eventType, listener });
    }
    declarativeBooted = true;
  }
  function unbootDeclarativeActions() {
    if (!declarativeBooted) {
      return;
    }
    for (let index = 0; index < declarativeListeners.length; index++) {
      const entry = declarativeListeners[index];
      document.removeEventListener(entry.eventType, entry.listener, false);
    }
    declarativeListeners.length = 0;
    declarativeBooted = false;
  }
  function scheduleDeclarativeBoot() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bootDeclarativeActions, {
        once: true
      });
      return;
    }
    bootDeclarativeActions();
  }

  // packages/bladex/src/bladex.js
  var Bladex = {
    apply,
    processBladexResponse,
    dispatchValidationFailed,
    dispatchValidationCleared,
    normalizeErrors,
    resolveFieldsForErrors,
    VALIDATION_FAILED_EVENT,
    VALIDATION_CLEARED_EVENT,
    fetch,
    installFetchProxy,
    uninstallFetchProxy,
    bootDeclarativeActions,
    unbootDeclarativeActions,
    find(target) {
      if (target instanceof Element) {
        return componentFromElement(target);
      }
      return componentFromIdentifier(target);
    }
  };

  // packages/bladex/builds/cdn.js
  window.Bladex = Bladex;
  var currentScript = document.currentScript;
  if (currentScript !== null) {
    setDomUpdateMode(
      normalizeDomUpdateMode(
        currentScript.getAttribute("data-dom-update")
      )
    );
  }
  if (currentScript === null || currentScript.getAttribute("data-fetch-proxy") !== "false") {
    installFetchProxy();
  }
  scheduleDeclarativeBoot();
})();
