const $ = {
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
    el.style.display = 'none';
  },

  show(el, display = 'block') {
    el.style.display = display;
  },

  toggle(el, display = 'block') {
    el.style.display = el.style.display === 'none' ? display : 'none';
  },

  fadeIn(el, duration = 300) {
    el.style.opacity = 0;
    el.style.display = 'block';
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = (timestamp - start) / duration;
      el.style.opacity = Math.min(progress, 1);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  fadeOut(el, duration = 300) {
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = (timestamp - start) / duration;
      el.style.opacity = 1 - Math.min(progress, 1);
      if (progress < 1) requestAnimationFrame(step);
      else el.style.display = 'none';
    };
    requestAnimationFrame(step);
  },

  // --- AJAX ---
  // $.get('/api', fn) or $.post('/api', data, fn)
  async get(url, success, error) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      success?.(data);
    } catch (e) {
      error?.(e);
    }
  },

  async post(url, data, success, error) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      success?.(result);
    } catch (e) {
      error?.(e);
    }
  },

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
