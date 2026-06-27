const $ = {
  _anim: new WeakMap(), // store {id, type} per element so we can cancel

  _cancel(el) {
    const state = this._anim.get(el);
    if (state && state.id) {
      cancelAnimationFrame(state.id);
    }
    this._anim.delete(el);
  },
  // --- DOM SELECTION ---
  // $('.class') or $('#id') or $('div')
  select(selector, context = document) {
    const nodes = context.querySelectorAll(selector);
    return nodes.length === 1 ? nodes[0] : Array.from(nodes);
  },

  one(selector, context = document) {
    return context.querySelector(selector);
  },

  all(selector, context = document) {
    return [...context.querySelectorAll(selector)];
  },

  // $(document).ready(...)
  ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  },

  // --- DOM TRAVERSAL ---
  parent(el) {
    return el.parentElement;
  },

  next(el) {
    return el.nextElementSibling;
  },

  prev(el) {
    return el.previousElementSibling;
  },

  children(el, selector) {
    const kids = Array.from(el.children);
    return selector ? kids.filter(k => k.matches(selector)) : kids;
  },

  find(el, selector) {
    return Array.from(el.querySelectorAll(selector));
  },

  // --- DOM MANIPULATION ---
  create(tag, props = {}, children = []) {
    const el = document.createElement(tag);
    Object.assign(el, props);
    children.forEach(child => el.append(child));
    return el;
  },

  append(parent, child) {
    parent.append(child);
  },

  prepend(parent, child) {
    parent.prepend(child);
  },

  remove(el) {
    el.remove();
  },

  empty(el) {
    el.innerHTML = '';
  },

  html(el, html) {
    if (html === undefined) return el.innerHTML;
    el.innerHTML = html;
  },

  text(el, text) {
    if (text === undefined) return el.textContent;
    el.textContent = text;
  },

  // --- ATTRIBUTES & CLASSES ---
  attr(el, name, value) {
    if (value === undefined) return el.getAttribute(name);
    el.setAttribute(name, value);
  },

  removeAttr(el, name) {
    el.removeAttribute(name);
  },

  addClass(el, ...classes) {
    el.classList.add(...classes);
  },

  removeClass(el, ...classes) {
    el.classList.remove(...classes);
  },

  toggleClass(el, className) {
    el.classList.toggle(className);
  },

  hasClass(el, className) {
    return el.classList.contains(className);
  },

  css(el, prop, value) {
    if (typeof prop === 'object') {
      Object.assign(el.style, prop);
    } else if (value === undefined) {
      return getComputedStyle(el)[prop];
    } else {
      el.style[prop] = value;
    }
  },

  // --- EVENTS ---
  on(el, event, selectorOrHandler, handler) {
    // Event delegation: $.on(container, 'click', '.btn', fn)
    if (typeof selectorOrHandler === 'string') {
      el.addEventListener(event, e => {
        if (e.target.closest(selectorOrHandler)) handler.call(e.target, e);
      });
    } else {
      el.addEventListener(event, selectorOrHandler);
    }
  },

  off(el, event, handler) {
    el.removeEventListener(event, handler);
  },

  trigger(el, eventName, detail = {}) {
    el.dispatchEvent(new CustomEvent(eventName, { detail }));
  },

  // --- EFFECTS ---

  hide(el) {
    this._cancel(el);
    el.style.display = 'none';
    el.style.opacity = ''; // reset so fadeIn works next time
  },

  show(el, display = 'block') {
    this._cancel(el); // stop any fadeOut in progress
    el.style.display = display;
    el.style.opacity = ''; // reset inline opacity
  },

  toggle(el, display = 'block') {
    const isHidden = getComputedStyle(el).display === 'none';
    isHidden ? this.show(el, display) : this.hide(el);
  },

  fadeIn(el, duration = 300, display = 'block') {
    this._cancel(el); // if fading out, stop it

    const computed = getComputedStyle(el);
    if (computed.display !== 'none' && parseFloat(el.style.opacity || 1) === 1) return; // already visible

    el.style.display = display;
    el.style.opacity = 0;

    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      el.style.opacity = p;
      if (p < 1) {
        const id = requestAnimationFrame(step);
        this._anim.set(el, { id, type: 'fadeIn' });
      } else {
        el.style.opacity = ''; // clean up inline style like jQuery
        this._anim.delete(el);
      }
    };
    const id = requestAnimationFrame(step);
    this._anim.set(el, { id, type: 'fadeIn' });
  },

  fadeOut(el, duration = 300) {
    this._cancel(el); // if fading in, stop it

    const computed = getComputedStyle(el);
    if (computed.display === 'none') return; // already hidden

    let start = null;
    const startOpacity = parseFloat(el.style.opacity) || 1;

    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      el.style.opacity = startOpacity * (1 - p);
      if (p < 1) {
        const id = requestAnimationFrame(step);
        this._anim.set(el, { id, type: 'fadeOut' });
      } else {
        el.style.display = 'none';
        el.style.opacity = ''; // clean up
        this._anim.delete(el);
      }
    };
    const id = requestAnimationFrame(step);
    this._anim.set(el, { id, type: 'fadeOut' });
  },

  fadeToggle(el, duration = 300, display = 'block') {
    const isHidden = getComputedStyle(el).display === 'none' || parseFloat(getComputedStyle(el).opacity) === 0;
    isHidden ? this.fadeIn(el, duration, display) : this.fadeOut(el, duration);
  },
  // --- AJAX ---
  // Unified get/post with options object
  async ajax(method, url, data, { success, error, before, after } = {}) {
    try {
      before?.();
      const opts = {
        method: method.toUpperCase(),
        headers: { 'Content-Type': 'application/json' },
        ...(data && { body: JSON.stringify(data) })
      };
      const res = await fetch(url, opts);
      const result = await res.json();
      success?.(result);
    } catch (e) {
      error?.(e);
    } finally {
      after?.();
    }
  },
  // $.get('/api', fn)
  get(url, opts) {
    return this.ajax('get', url, null, opts);
  },

  // $.post('/api', data, fn)
  post(url, data, opts) {
    return this.ajax('post', url, data, opts);
  },

  // async get(url, success, error, before, after) {
  //   try {
  //     before?.();
  //     const res = await fetch(url);
  //     const data = await res.json();
  //     success?.(data);
  //   } catch (e) {
  //     error?.(e);
  //   } finally {
  //     after?.();
  //   }
  // },

  // async post(url, data, success, error, before, after) {
  //   try {
  //     before?.();
  //     const res = await fetch(url, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(data)
  //     });
  //     const result = await res.json();
  //     success?.(result);
  //   } catch (e) {
  //     error?.(e);
  //   } finally {
  //     after?.();
  //   }
  // },

  // --- UTILITIES ---

  each(arr, fn) {
    arr.forEach(fn);
  },

  map(arr, fn) {
    return arr.map(fn);
  },

  extend(...objs) {
    return Object.assign({}, ...objs);
  }
};

if (!Object.fromEntries) {
  Object.fromEntries = function (entries) {
    const obj = {};
    for (const [key, value] of entries) {
      obj[key] = value;
    }
    return obj;
  };
}
