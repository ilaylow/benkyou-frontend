
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    // Adapted from https://github.com/then/is-promise/blob/master/index.js
    // Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE
    function is_promise(value) {
        return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function init_binding_group(group) {
        let _inputs;
        return {
            /* push */ p(...inputs) {
                _inputs = inputs;
                _inputs.forEach(input => group.push(input));
            },
            /* remove */ r() {
                _inputs.forEach(input => group.splice(group.indexOf(input), 1));
            }
        };
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        const options = { direction: 'in' };
        let config = fn(node, params, options);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config(options);
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        const options = { direction: 'out' };
        let config = fn(node, params, options);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config(options);
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind$1(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const LOCATION = {};
    const ROUTER = {};
    const HISTORY = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const PARAM = /^:(.+)/;
    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Split up the URI into segments delimited by `/`
     * Strip starting/ending `/`
     * @param {string} uri
     * @return {string[]}
     */
    const segmentize = (uri) => uri.replace(/(^\/+|\/+$)/g, "").split("/");
    /**
     * Strip `str` of potential start and end `/`
     * @param {string} string
     * @return {string}
     */
    const stripSlashes = (string) => string.replace(/(^\/+|\/+$)/g, "");
    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    const rankRoute = (route, index) => {
        const score = route.default
            ? 0
            : segmentize(route.path).reduce((score, segment) => {
                  score += SEGMENT_POINTS;

                  if (segment === "") {
                      score += ROOT_POINTS;
                  } else if (PARAM.test(segment)) {
                      score += DYNAMIC_POINTS;
                  } else if (segment[0] === "*") {
                      score -= SEGMENT_POINTS + SPLAT_PENALTY;
                  } else {
                      score += STATIC_POINTS;
                  }

                  return score;
              }, 0);

        return { route, score, index };
    };
    /**
     * Give a score to all routes and sort them on that
     * If two routes have the exact same score, we go by index instead
     * @param {object[]} routes
     * @return {object[]}
     */
    const rankRoutes = (routes) =>
        routes
            .map(rankRoute)
            .sort((a, b) =>
                a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
            );
    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    const pick = (routes, uri) => {
        let match;
        let default_;

        const [uriPathname] = uri.split("?");
        const uriSegments = segmentize(uriPathname);
        const isRootUri = uriSegments[0] === "";
        const ranked = rankRoutes(routes);

        for (let i = 0, l = ranked.length; i < l; i++) {
            const route = ranked[i].route;
            let missed = false;

            if (route.default) {
                default_ = {
                    route,
                    params: {},
                    uri,
                };
                continue;
            }

            const routeSegments = segmentize(route.path);
            const params = {};
            const max = Math.max(uriSegments.length, routeSegments.length);
            let index = 0;

            for (; index < max; index++) {
                const routeSegment = routeSegments[index];
                const uriSegment = uriSegments[index];

                if (routeSegment && routeSegment[0] === "*") {
                    // Hit a splat, just grab the rest, and return a match
                    // uri:   /files/documents/work
                    // route: /files/* or /files/*splatname
                    const splatName =
                        routeSegment === "*" ? "*" : routeSegment.slice(1);

                    params[splatName] = uriSegments
                        .slice(index)
                        .map(decodeURIComponent)
                        .join("/");
                    break;
                }

                if (typeof uriSegment === "undefined") {
                    // URI is shorter than the route, no match
                    // uri:   /users
                    // route: /users/:userId
                    missed = true;
                    break;
                }

                const dynamicMatch = PARAM.exec(routeSegment);

                if (dynamicMatch && !isRootUri) {
                    const value = decodeURIComponent(uriSegment);
                    params[dynamicMatch[1]] = value;
                } else if (routeSegment !== uriSegment) {
                    // Current segments don't match, not dynamic, not splat, so no match
                    // uri:   /users/123/settings
                    // route: /users/:id/profile
                    missed = true;
                    break;
                }
            }

            if (!missed) {
                match = {
                    route,
                    params,
                    uri: "/" + uriSegments.slice(0, index).join("/"),
                };
                break;
            }
        }

        return match || default_ || null;
    };
    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    const combinePaths = (basepath, path) =>
        `${stripSlashes(
        path === "/"
            ? basepath
            : `${stripSlashes(basepath)}/${stripSlashes(path)}`
    )}/`;

    const canUseDOM = () =>
        typeof window !== "undefined" &&
        "document" in window &&
        "location" in window;

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.59.2 */
    const get_default_slot_changes$1 = dirty => ({ params: dirty & /*routeParams*/ 4 });
    const get_default_slot_context$1 = ctx => ({ params: /*routeParams*/ ctx[2] });

    // (42:0) {#if $activeRoute && $activeRoute.route === route}
    function create_if_block$5(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$3, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(42:0) {#if $activeRoute && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (51:4) {:else}
    function create_else_block$5(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context$1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, routeParams*/ 132)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, get_default_slot_changes$1),
    						get_default_slot_context$1
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(51:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (43:4) {#if component}
    function create_if_block_1$3(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 12,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*component*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*component*/ 1 && promise !== (promise = /*component*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(43:4) {#if component}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>     import { getContext, onDestroy }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>     import { getContext, onDestroy }",
    		ctx
    	});

    	return block;
    }

    // (44:49)              <svelte:component                 this={resolvedComponent?.default || resolvedComponent}
    function create_then_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*routeParams*/ ctx[2], /*routeProps*/ ctx[3]];
    	var switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*routeParams, routeProps*/ 12)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(44:49)              <svelte:component                 this={resolvedComponent?.default || resolvedComponent}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>     import { getContext, onDestroy }
    function create_pending_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script>     import { getContext, onDestroy }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	let routeParams = {};
    	let routeProps = {};
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	registerRoute(route);

    	onDestroy(() => {
    		unregisterRoute(route);
    	});

    	$$self.$$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('path' in $$new_props) $$invalidate(6, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		canUseDOM,
    		path,
    		component,
    		routeParams,
    		routeProps,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		route,
    		$activeRoute
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate(6, path = $$new_props.path);
    		if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
    		if ('routeParams' in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ('routeProps' in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($activeRoute && $activeRoute.route === route) {
    			$$invalidate(2, routeParams = $activeRoute.params);
    			const { component: c, path, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);

    			if (c) {
    				if (c.toString().startsWith("class ")) $$invalidate(0, component = c); else $$invalidate(0, component = c());
    			}

    			canUseDOM() && !$activeRoute.preserveScroll && window?.scrollTo(0, 0);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		activeRoute,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { path: 6, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier} [start]
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let started = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (started) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            started = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
                // We need to set this to false because callbacks can still happen despite having unsubscribed:
                // Callbacks might already be placed in the queue which doesn't know it should no longer
                // invoke this derived store.
                started = false;
            };
        });
    }

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const getLocation = (source) => {
        return {
            ...source.location,
            state: source.history.state,
            key: (source.history.state && source.history.state.key) || "initial",
        };
    };
    const createHistory = (source) => {
        const listeners = [];
        let location = getLocation(source);

        return {
            get location() {
                return location;
            },

            listen(listener) {
                listeners.push(listener);

                const popstateListener = () => {
                    location = getLocation(source);
                    listener({ location, action: "POP" });
                };

                source.addEventListener("popstate", popstateListener);

                return () => {
                    source.removeEventListener("popstate", popstateListener);
                    const index = listeners.indexOf(listener);
                    listeners.splice(index, 1);
                };
            },

            navigate(to, { state, replace = false, preserveScroll = false } = {}) {
                state = { ...state, key: Date.now() + "" };
                // try...catch iOS Safari limits to 100 pushState calls
                try {
                    if (replace) source.history.replaceState(state, "", to);
                    else source.history.pushState(state, "", to);
                } catch (e) {
                    source.location[replace ? "replace" : "assign"](to);
                }
                location = getLocation(source);
                listeners.forEach((listener) =>
                    listener({ location, action: "PUSH", preserveScroll })
                );
                document.activeElement.blur();
            },
        };
    };
    // Stores history entries in memory for testing or other platforms like Native
    const createMemorySource = (initialPathname = "/") => {
        let index = 0;
        const stack = [{ pathname: initialPathname, search: "" }];
        const states = [];

        return {
            get location() {
                return stack[index];
            },
            addEventListener(name, fn) {},
            removeEventListener(name, fn) {},
            history: {
                get entries() {
                    return stack;
                },
                get index() {
                    return index;
                },
                get state() {
                    return states[index];
                },
                pushState(state, _, uri) {
                    const [pathname, search = ""] = uri.split("?");
                    index++;
                    stack.push({ pathname, search });
                    states.push(state);
                },
                replaceState(state, _, uri) {
                    const [pathname, search = ""] = uri.split("?");
                    stack[index] = { pathname, search };
                    states[index] = state;
                },
            },
        };
    };
    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const globalHistory = createHistory(
        canUseDOM() ? window : createMemorySource()
    );
    const { navigate } = globalHistory;

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.59.2 */

    const { Object: Object_1 } = globals;
    const file$a = "node_modules\\svelte-routing\\src\\Router.svelte";

    const get_default_slot_changes_1 = dirty => ({
    	route: dirty & /*$activeRoute*/ 4,
    	location: dirty & /*$location*/ 2
    });

    const get_default_slot_context_1 = ctx => ({
    	route: /*$activeRoute*/ ctx[2] && /*$activeRoute*/ ctx[2].uri,
    	location: /*$location*/ ctx[1]
    });

    const get_default_slot_changes = dirty => ({
    	route: dirty & /*$activeRoute*/ 4,
    	location: dirty & /*$location*/ 2
    });

    const get_default_slot_context = ctx => ({
    	route: /*$activeRoute*/ ctx[2] && /*$activeRoute*/ ctx[2].uri,
    	location: /*$location*/ ctx[1]
    });

    // (141:0) {:else}
    function create_else_block$4(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context_1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $activeRoute, $location*/ 16390)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, get_default_slot_changes_1),
    						get_default_slot_context_1
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(141:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (132:0) {#if viewtransition}
    function create_if_block$4(ctx) {
    	let previous_key = /*$location*/ ctx[1].pathname;
    	let key_block_anchor;
    	let current;
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			key_block.c();
    			key_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			key_block.m(target, anchor);
    			insert_dev(target, key_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$location*/ 2 && safe_not_equal(previous_key, previous_key = /*$location*/ ctx[1].pathname)) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block, 1);
    				key_block.m(key_block_anchor.parentNode, key_block_anchor);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(key_block_anchor);
    			key_block.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(132:0) {#if viewtransition}",
    		ctx
    	});

    	return block;
    }

    // (133:4) {#key $location.pathname}
    function create_key_block(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			add_location(div, file$a, 133, 8, 4629);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $activeRoute, $location*/ 16390)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!current) return;
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, /*viewtransitionFn*/ ctx[3], {});
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*viewtransitionFn*/ ctx[3], {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(133:4) {#key $location.pathname}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*viewtransition*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $location;
    	let $routes;
    	let $base;
    	let $activeRoute;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	let { viewtransition = null } = $$props;
    	let { history = globalHistory } = $$props;

    	const viewtransitionFn = (node, _, direction) => {
    		const vt = viewtransition(direction);
    		if (typeof vt?.fn === "function") return vt.fn(node, vt); else return vt;
    	};

    	setContext(HISTORY, history);
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, 'routes');
    	component_subscribe($$self, routes, value => $$invalidate(12, $routes = value));
    	const activeRoute = writable(null);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(2, $activeRoute = value));
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : history.location);

    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(1, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(13, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (!activeRoute) return base;

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	const registerRoute = route => {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) return;

    			const matchingRoute = pick([route], $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => [...rs, route]);
    		}
    	};

    	const unregisterRoute = route => {
    		routes.update(rs => rs.filter(r => r !== route));
    	};

    	let preserveScroll = false;

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = history.listen(event => {
    				$$invalidate(11, preserveScroll = event.preserveScroll || false);
    				location.set(event.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ['basepath', 'url', 'viewtransition', 'history'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(8, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(9, url = $$props.url);
    		if ('viewtransition' in $$props) $$invalidate(0, viewtransition = $$props.viewtransition);
    		if ('history' in $$props) $$invalidate(10, history = $$props.history);
    		if ('$$scope' in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		setContext,
    		derived,
    		writable,
    		HISTORY,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		combinePaths,
    		pick,
    		basepath,
    		url,
    		viewtransition,
    		history,
    		viewtransitionFn,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		preserveScroll,
    		$location,
    		$routes,
    		$base,
    		$activeRoute
    	});

    	$$self.$inject_state = $$props => {
    		if ('basepath' in $$props) $$invalidate(8, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(9, url = $$props.url);
    		if ('viewtransition' in $$props) $$invalidate(0, viewtransition = $$props.viewtransition);
    		if ('history' in $$props) $$invalidate(10, history = $$props.history);
    		if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
    		if ('preserveScroll' in $$props) $$invalidate(11, preserveScroll = $$props.preserveScroll);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 8192) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;
    				routes.update(rs => rs.map(r => Object.assign(r, { path: combinePaths(basepath, r._path) })));
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location, preserveScroll*/ 6146) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch ? { ...bestMatch, preserveScroll } : bestMatch);
    			}
    		}
    	};

    	return [
    		viewtransition,
    		$location,
    		$activeRoute,
    		viewtransitionFn,
    		routes,
    		activeRoute,
    		location,
    		base,
    		basepath,
    		url,
    		history,
    		preserveScroll,
    		$routes,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			basepath: 8,
    			url: 9,
    			viewtransition: 0,
    			history: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewtransition() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewtransition(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get history() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set history(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Title.svelte generated by Svelte v3.59.2 */

    const file$9 = "src\\components\\Title.svelte";

    function create_fragment$a(ctx) {
    	let h1;
    	let t1;
    	let div;
    	let h3;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "勉-You";
    			t1 = space();
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "An AI Powered Japanese Learning Experience";
    			attr_dev(h1, "class", "svelte-1az871f");
    			add_location(h1, file$9, 42, 0, 1202);
    			attr_dev(h3, "class", "svelte-1az871f");
    			add_location(h3, file$9, 44, 4, 1248);
    			attr_dev(div, "class", "typewriter svelte-1az871f");
    			add_location(div, file$9, 43, 0, 1218);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Title', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Title> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Title extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Title",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\components\Button.svelte generated by Svelte v3.59.2 */
    const file$8 = "src\\components\\Button.svelte";

    function create_fragment$9(ctx) {
    	let button;
    	let t;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*text*/ ctx[0]);
    			attr_dev(button, "class", button_class_value = "button " + /*style*/ ctx[2] + " svelte-1yz94xg");
    			button.disabled = /*loading*/ ctx[1];
    			add_location(button, file$8, 89, 0, 1836);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleClick*/ ctx[3], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1) set_data_dev(t, /*text*/ ctx[0]);

    			if (dirty & /*style*/ 4 && button_class_value !== (button_class_value = "button " + /*style*/ ctx[2] + " svelte-1yz94xg")) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*loading*/ 2) {
    				prop_dev(button, "disabled", /*loading*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, []);
    	const dispatch = createEventDispatcher();
    	let { text = "スタート" } = $$props;
    	let { loading = false } = $$props;
    	let { style = "button" } = $$props;

    	function handleClick() {
    		dispatch('click');
    	}

    	const writable_props = ['text', 'loading', 'style'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('loading' in $$props) $$invalidate(1, loading = $$props.loading);
    		if ('style' in $$props) $$invalidate(2, style = $$props.style);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		text,
    		loading,
    		style,
    		handleClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('loading' in $$props) $$invalidate(1, loading = $$props.loading);
    		if ('style' in $$props) $$invalidate(2, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, loading, style, handleClick];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { text: 0, loading: 1, style: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Footer.svelte generated by Svelte v3.59.2 */

    const file$7 = "src\\components\\Footer.svelte";

    function create_fragment$8(ctx) {
    	let footer;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			footer.textContent = "© 2023 勉You by ilaylow";
    			attr_dev(footer, "class", "svelte-idsc27");
    			add_location(footer, file$7, 13, 0, 396);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    const backendUrl$1 = "http://localhost:5215" ;
    const userSignInURL = `${backendUrl$1}/User/SignIn`;

    const headers = new Headers({
            'Content-Type': 'application/json'
        });


    const setSignInRequestOptions = (body) => {
        return {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        } 
    };

    const signInUser = async (body) => {
        const response = await fetch(userSignInURL, setSignInRequestOptions(body));
        for (let pair of response.headers.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
          }

        let data = await response.json();

        return data
    };

    /* src\components\Error.svelte generated by Svelte v3.59.2 */

    const { Error: Error_1$2 } = globals;
    const file$6 = "src\\components\\Error.svelte";

    function create_fragment$7(ctx) {
    	let p;
    	let t;
    	let p_class_value;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*text*/ ctx[1]);
    			attr_dev(p, "class", p_class_value = "error " + (/*showError*/ ctx[0] ? 'is-shown' : '') + " svelte-1bdm4cf");
    			add_location(p, file$6, 22, 0, 525);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$2("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 2) set_data_dev(t, /*text*/ ctx[1]);

    			if (dirty & /*showError*/ 1 && p_class_value !== (p_class_value = "error " + (/*showError*/ ctx[0] ? 'is-shown' : '') + " svelte-1bdm4cf")) {
    				attr_dev(p, "class", p_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Error', slots, []);
    	let { showError = false } = $$props;
    	let { text = "An error has occurred, please try again, or load a new set of questions." } = $$props;
    	const writable_props = ['showError', 'text'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Error> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('showError' in $$props) $$invalidate(0, showError = $$props.showError);
    		if ('text' in $$props) $$invalidate(1, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({ showError, text });

    	$$self.$inject_state = $$props => {
    		if ('showError' in $$props) $$invalidate(0, showError = $$props.showError);
    		if ('text' in $$props) $$invalidate(1, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showError, text];
    }

    let Error$1 = class Error extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { showError: 0, text: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Error",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get showError() {
    		throw new Error_1$2("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showError(value) {
    		throw new Error_1$2("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error_1$2("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error_1$2("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    };

    /* src\components\SignIn.svelte generated by Svelte v3.59.2 */

    const { Error: Error_1$1, console: console_1$2 } = globals;
    const file$5 = "src\\components\\SignIn.svelte";

    function create_fragment$6(ctx) {
    	let div2;
    	let h30;
    	let t1;
    	let input0;
    	let t2;
    	let h31;
    	let t4;
    	let input1;
    	let t5;
    	let div1;
    	let button;
    	let t6;
    	let div0;
    	let t7;
    	let error;
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				text: "ログイン",
    				disabled: /*clicked*/ ctx[0]
    			},
    			$$inline: true
    		});

    	button.$on("click", /*handleSignIn*/ ctx[3]);

    	error = new Error$1({
    			props: {
    				showError: /*showSignInError*/ ctx[1],
    				text: "Error signing in. Please try again later."
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Email";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			h31 = element("h3");
    			h31.textContent = "Password";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			t6 = space();
    			div0 = element("div");
    			t7 = space();
    			create_component(error.$$.fragment);
    			attr_dev(h30, "class", "login-form-title svelte-11osbxr");
    			add_location(h30, file$5, 95, 4, 2388);
    			attr_dev(input0, "class", "login-form-input svelte-11osbxr");
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "placeholder", "メール");
    			add_location(input0, file$5, 96, 4, 2433);
    			attr_dev(h31, "class", "login-form-title svelte-11osbxr");
    			add_location(h31, file$5, 98, 4, 2534);
    			attr_dev(input1, "class", "login-form-input svelte-11osbxr");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "パスワード");
    			add_location(input1, file$5, 99, 4, 2582);
    			attr_dev(div0, "class", "loading-icon svelte-11osbxr");
    			add_location(div0, file$5, 103, 6, 2834);
    			attr_dev(div1, "class", div1_class_value = "button-container " + (/*clicked*/ ctx[0] ? 'is-logging-in' : '') + " svelte-11osbxr");
    			add_location(div1, file$5, 101, 4, 2691);
    			attr_dev(div2, "class", "login-form svelte-11osbxr");
    			add_location(div2, file$5, 94, 0, 2358);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h30);
    			append_dev(div2, t1);
    			append_dev(div2, input0);
    			set_input_value(input0, /*userCreds*/ ctx[2].email);
    			append_dev(div2, t2);
    			append_dev(div2, h31);
    			append_dev(div2, t4);
    			append_dev(div2, input1);
    			set_input_value(input1, /*userCreds*/ ctx[2].password);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			mount_component(button, div1, null);
    			append_dev(div1, t6);
    			append_dev(div1, div0);
    			append_dev(div1, t7);
    			mount_component(error, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*userCreds*/ 4 && input0.value !== /*userCreds*/ ctx[2].email) {
    				set_input_value(input0, /*userCreds*/ ctx[2].email);
    			}

    			if (dirty & /*userCreds*/ 4 && input1.value !== /*userCreds*/ ctx[2].password) {
    				set_input_value(input1, /*userCreds*/ ctx[2].password);
    			}

    			const button_changes = {};
    			if (dirty & /*clicked*/ 1) button_changes.disabled = /*clicked*/ ctx[0];
    			button.$set(button_changes);
    			const error_changes = {};
    			if (dirty & /*showSignInError*/ 2) error_changes.showError = /*showSignInError*/ ctx[1];
    			error.$set(error_changes);

    			if (!current || dirty & /*clicked*/ 1 && div1_class_value !== (div1_class_value = "button-container " + (/*clicked*/ ctx[0] ? 'is-logging-in' : '') + " svelte-11osbxr")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			transition_in(error.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(error.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(button);
    			destroy_component(error);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SignIn', slots, []);
    	let clicked = false;
    	let showSignInError = false;
    	let userCreds = { email: "", password: "" };

    	async function handleSignIn() {
    		$$invalidate(0, clicked = true);
    		$$invalidate(1, showSignInError = false);

    		try {
    			let loginData = await signInUser(userCreds);
    			localStorage.setItem('jwt_token', loginData.jwt);
    			localStorage.setItem('uid', loginData.uid);
    			window.location.reload();
    		} catch(error) {
    			$$invalidate(1, showSignInError = true);
    			$$invalidate(0, clicked = false);
    			console.log(error);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<SignIn> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		userCreds.email = this.value;
    		$$invalidate(2, userCreds);
    	}

    	function input1_input_handler() {
    		userCreds.password = this.value;
    		$$invalidate(2, userCreds);
    	}

    	$$self.$capture_state = () => ({
    		signInUser,
    		Button,
    		Error: Error$1,
    		clicked,
    		showSignInError,
    		userCreds,
    		handleSignIn
    	});

    	$$self.$inject_state = $$props => {
    		if ('clicked' in $$props) $$invalidate(0, clicked = $$props.clicked);
    		if ('showSignInError' in $$props) $$invalidate(1, showSignInError = $$props.showSignInError);
    		if ('userCreds' in $$props) $$invalidate(2, userCreds = $$props.userCreds);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		clicked,
    		showSignInError,
    		userCreds,
    		handleSignIn,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class SignIn extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SignIn",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    function isTokenPresentAndValid() {
        const token = localStorage.getItem('jwt_token');

        if (!token) {
            return false;
        }

        try {
            // Decode the JWT token without verifying to get the payload
            const payload = JSON.parse(atob(token.split('.')[1]));

            // Get the current time and compare with the exp field in the token payload
            const currentTime = Date.now() / 1000;
            if (payload.exp < currentTime) {

            // Token has expired
            return false;
            }

            return true;
        } catch (e) {
            // If there's an error decoding the token, it's not valid
            return false;
        }
    }

    /* src\pages\Home.svelte generated by Svelte v3.59.2 */
    const file$4 = "src\\pages\\Home.svelte";

    // (40:4) {:else}
    function create_else_block$3(ctx) {
    	let title;
    	let t0;
    	let button;
    	let t1;
    	let footer;
    	let current;
    	title = new Title({ $$inline: true });
    	button = new Button({ $$inline: true });
    	button.$on("click", /*goToPractice*/ ctx[1]);
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(title.$$.fragment);
    			t0 = space();
    			create_component(button.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(title, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(button, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(title, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(button, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(40:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (38:23) 
    function create_if_block_1$2(ctx) {
    	let signin;
    	let current;
    	signin = new SignIn({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(signin.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(signin, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(signin.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(signin.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(signin, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(38:23) ",
    		ctx
    	});

    	return block;
    }

    // (36:4) {#if !isLoggedIn}
    function create_if_block$3(ctx) {
    	let signin;
    	let current;
    	signin = new SignIn({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(signin.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(signin, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(signin.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(signin.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(signin, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(36:4) {#if !isLoggedIn}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$3, create_if_block_1$2, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*isLoggedIn*/ ctx[0]) return 0;
    		if (/*isSignUp*/ ctx[2]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			add_location(main, file$4, 34, 0, 871);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(main, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);

    	function goToPractice() {
    		navigate("/practice");
    	}

    	let isLoggedIn = false;
    	let isSignUp = false;

    	onMount(() => {
    		// Ensure this code runs only in the browser
    		if (typeof window !== 'undefined') {
    			if (!isTokenPresentAndValid()) {
    				$$invalidate(0, isLoggedIn = false);
    			} else {
    				$$invalidate(0, isLoggedIn = true);
    			}
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Title,
    		Button,
    		Footer,
    		SignIn,
    		isTokenPresentAndValid,
    		onMount,
    		navigate,
    		goToPractice,
    		isLoggedIn,
    		isSignUp
    	});

    	$$self.$inject_state = $$props => {
    		if ('isLoggedIn' in $$props) $$invalidate(0, isLoggedIn = $$props.isLoggedIn);
    		if ('isSignUp' in $$props) $$invalidate(2, isSignUp = $$props.isSignUp);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isLoggedIn, goToPractice, isSignUp];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const backendUrl = "http://localhost:5215" ;

    const getQuestionUrl = `${backendUrl}/Translation/GetQuestion`;
    const markQuestionUrl = `${backendUrl}/Translation/MarkQuestion`;

    const setHeaders = (jwt) => {
        return new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
        })
    };

    const getQuestionRequestOptions = (headers) => {
        return {
            method: 'GET',  
            headers: headers,
        }
    };

    const getMarkRequestOptions = (body, headers) => {
        return {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        }
    };

    const getTranslationQuestion = async () => {
        let jwt = localStorage.getItem('jwt_token');

        const response = await fetch(getQuestionUrl, getQuestionRequestOptions(setHeaders(jwt)));
        return await response.json();

    };

    const getTranslationMark = async (translations) => {
        // Remove tokenized questions before sending to server for marking
        let sendTranslations = structuredClone(translations);
        for (let pair of sendTranslations.sentence_pairs) {
            delete pair.tokenized_question;
        }

        let jwt = localStorage.getItem('jwt_token');
        let uid = localStorage.getItem('uid');
        translations.uid = uid;

        const response = await fetch(markQuestionUrl, getMarkRequestOptions(translations, setHeaders(jwt)));
        let markedTranslations = await response.json();

        // Attach back tokenized questions when marked translations are received
        for (let pair of markedTranslations.sentence_pairs) {
            const matchPair = translations.sentence_pairs.find(p => p.id == pair.id);
            pair.tokenized_question = matchPair.tokenized_question;
        }

        return markedTranslations
    };

    /* src\components\Loading.svelte generated by Svelte v3.59.2 */

    const file$3 = "src\\components\\Loading.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let h2;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "This may take up to 30 seconds...";
    			attr_dev(div0, "class", "loading-spinner svelte-8a20zf");
    			add_location(div0, file$3, 30, 4, 694);
    			attr_dev(h2, "class", "svelte-8a20zf");
    			add_location(h2, file$3, 32, 4, 741);
    			attr_dev(div1, "class", "svelte-8a20zf");
    			add_location(div1, file$3, 29, 0, 683);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, h2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Loading', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Loading> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Loading extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loading",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /**
     * Returns detailed type as string (instead of just 'object' for arrays etc)
     * @private
     * @param {any} value js value
     * @returns {String} type of value
     * @example
     * typeOf({}); // 'object'
     * typeOf([]); // 'array'
     * typeOf(function() {}); // 'function'
     * typeOf(/a/); // 'regexp'
     * typeOf(new Date()); // 'date'
     * typeOf(null); // 'null'
     * typeOf(undefined); // 'undefined'
     * typeOf('a'); // 'string'
     * typeOf(1); // 'number'
     * typeOf(true); // 'boolean'
     * typeOf(new Map()); // 'map'
     * typeOf(new Set()); // 'map'
     */
    function typeOf(value) {
      if (value === null) {
        return 'null';
      }
      if (value !== Object(value)) {
        return typeof value;
      }
      return {}.toString
        .call(value)
        .slice(8, -1)
        .toLowerCase();
    }

    /**
     * Checks if input string is empty
     * @param  {String} input text input
     * @return {Boolean} true if no input
     */
    function isEmpty(input) {
      if (typeOf(input) !== 'string') {
        return true;
      }
      return !input.length;
    }

    /**
     * Takes a character and a unicode range. Returns true if the char is in the range.
     * @param  {String}  char  unicode character
     * @param  {Number}  start unicode start range
     * @param  {Number}  end   unicode end range
     * @return {Boolean}
     */
    function isCharInRange(char = '', start, end) {
      if (isEmpty(char)) return false;
      const code = char.charCodeAt(0);
      return start <= code && code <= end;
    }

    const VERSION = '5.2.0';

    const TO_KANA_METHODS = {
      HIRAGANA: 'toHiragana',
      KATAKANA: 'toKatakana',
    };

    const ROMANIZATIONS = {
      HEPBURN: 'hepburn',
    };

    /**
     * Default config for WanaKana, user passed options will be merged with these
     * @type {DefaultOptions}
     * @name defaultOptions
     * @property {Boolean} [useObsoleteKana=false] - Set to true to use obsolete characters, such as ゐ and ゑ.
     * @example
     * toHiragana('we', { useObsoleteKana: true })
     * // => 'ゑ'
     * @property {Boolean} [passRomaji=false] - Set to true to pass romaji when using mixed syllabaries with toKatakana() or toHiragana()
     * @example
     * toHiragana('only convert the katakana: ヒラガナ', { passRomaji: true })
     * // => "only convert the katakana: ひらがな"
     * @property {Object} [convertLongVowelMark=true] - Set to false to prevent conversions of 'ー' to extended vowels with toHiragana()
     * @example
     * toHiragana('ラーメン', { convertLongVowelMark: false });
     * // => 'らーめん
     * @property {Boolean} [upcaseKatakana=false] - Set to true to convert katakana to uppercase using toRomaji()
     * @example
     * toRomaji('ひらがな カタカナ', { upcaseKatakana: true })
     * // => "hiragana KATAKANA"
     * @property {Boolean|String} [IMEMode=false] - Set to true, 'toHiragana', or 'toKatakana' to handle conversion while it is being typed.
     * @property {String} [romanization='hepburn'] - choose toRomaji() romanization map (currently only 'hepburn')
     * @property {Object} [customKanaMapping] - custom map will be merged with default conversion
     * @example
     * toKana('wanakana', { customKanaMapping: { na: 'に', ka: 'Bana' }) };
     * // => 'わにBanaに'
     * @property {Object} [customRomajiMapping] - custom map will be merged with default conversion
     * @example
     * toRomaji('つじぎり', { customRomajiMapping: { じ: 'zi', つ: 'tu', り: 'li' }) };
     * // => 'tuzigili'
     */
    const DEFAULT_OPTIONS = {
      useObsoleteKana: false,
      passRomaji: false,
      upcaseKatakana: false,
      IMEMode: false,
      convertLongVowelMark: true,
      romanization: ROMANIZATIONS.HEPBURN,
    };
    const LATIN_UPPERCASE_START = 0x41;
    const LATIN_UPPERCASE_END = 0x5a;
    const LOWERCASE_ZENKAKU_START = 0xff41;
    const LOWERCASE_ZENKAKU_END = 0xff5a;
    const UPPERCASE_ZENKAKU_START = 0xff21;
    const UPPERCASE_ZENKAKU_END = 0xff3a;
    const HIRAGANA_START = 0x3041;
    const HIRAGANA_END = 0x3096;
    const KATAKANA_START = 0x30a1;
    const KATAKANA_END = 0x30fc;
    const KANJI_START = 0x4e00;
    const KANJI_END = 0x9faf;

    const KANJI_ITERATION_MARK = 0x3005; // 々
    const PROLONGED_SOUND_MARK = 0x30fc; // ー
    const KANA_SLASH_DOT = 0x30fb; // ・

    const ZENKAKU_NUMBERS = [0xff10, 0xff19];
    const ZENKAKU_UPPERCASE = [UPPERCASE_ZENKAKU_START, UPPERCASE_ZENKAKU_END];
    const ZENKAKU_LOWERCASE = [LOWERCASE_ZENKAKU_START, LOWERCASE_ZENKAKU_END];
    const ZENKAKU_PUNCTUATION_1 = [0xff01, 0xff0f];
    const ZENKAKU_PUNCTUATION_2 = [0xff1a, 0xff1f];
    const ZENKAKU_PUNCTUATION_3 = [0xff3b, 0xff3f];
    const ZENKAKU_PUNCTUATION_4 = [0xff5b, 0xff60];
    const ZENKAKU_SYMBOLS_CURRENCY = [0xffe0, 0xffee];

    const HIRAGANA_CHARS = [0x3040, 0x309f];
    const KATAKANA_CHARS = [0x30a0, 0x30ff];
    const HANKAKU_KATAKANA = [0xff66, 0xff9f];
    const KATAKANA_PUNCTUATION = [0x30fb, 0x30fc];
    const KANA_PUNCTUATION = [0xff61, 0xff65];
    const CJK_SYMBOLS_PUNCTUATION = [0x3000, 0x303f];
    const COMMON_CJK = [0x4e00, 0x9fff];
    const RARE_CJK = [0x3400, 0x4dbf];

    const KANA_RANGES = [
      HIRAGANA_CHARS,
      KATAKANA_CHARS,
      KANA_PUNCTUATION,
      HANKAKU_KATAKANA,
    ];

    const JA_PUNCTUATION_RANGES = [
      CJK_SYMBOLS_PUNCTUATION,
      KANA_PUNCTUATION,
      KATAKANA_PUNCTUATION,
      ZENKAKU_PUNCTUATION_1,
      ZENKAKU_PUNCTUATION_2,
      ZENKAKU_PUNCTUATION_3,
      ZENKAKU_PUNCTUATION_4,
      ZENKAKU_SYMBOLS_CURRENCY,
    ];

    // All Japanese unicode start and end ranges
    // Includes kanji, kana, zenkaku latin chars, punctuation, and number ranges.
    const JAPANESE_RANGES = [
      ...KANA_RANGES,
      ...JA_PUNCTUATION_RANGES,
      ZENKAKU_UPPERCASE,
      ZENKAKU_LOWERCASE,
      ZENKAKU_NUMBERS,
      COMMON_CJK,
      RARE_CJK,
    ];

    const MODERN_ENGLISH = [0x0000, 0x007f];
    const HEPBURN_MACRON_RANGES = [
      [0x0100, 0x0101], // Ā ā
      [0x0112, 0x0113], // Ē ē
      [0x012a, 0x012b], // Ī ī
      [0x014c, 0x014d], // Ō ō
      [0x016a, 0x016b], // Ū ū
    ];
    const SMART_QUOTE_RANGES = [
      [0x2018, 0x2019], // ‘ ’
      [0x201c, 0x201d], // “ ”
    ];

    const ROMAJI_RANGES = [MODERN_ENGLISH, ...HEPBURN_MACRON_RANGES];

    const EN_PUNCTUATION_RANGES = [
      [0x20, 0x2f],
      [0x3a, 0x3f],
      [0x5b, 0x60],
      [0x7b, 0x7e],
      ...SMART_QUOTE_RANGES,
    ];

    /**
     * Tests a character. Returns true if the character is [Katakana](https://en.wikipedia.org/wiki/Katakana).
     * @param  {String} char character string to test
     * @return {Boolean}
     */
    function isCharJapanese(char = '') {
      return JAPANESE_RANGES.some(([start, end]) => isCharInRange(char, start, end));
    }

    /**
     * Test if `input` only includes [Kanji](https://en.wikipedia.org/wiki/Kanji), [Kana](https://en.wikipedia.org/wiki/Kana), zenkaku numbers, and JA punctuation/symbols.”
     * @param  {String} [input=''] text
     * @param  {Regexp} [allowed] additional test allowed to pass for each char
     * @return {Boolean} true if passes checks
     * @example
     * isJapanese('泣き虫')
     * // => true
     * isJapanese('あア')
     * // => true
     * isJapanese('２月') // Zenkaku numbers allowed
     * // => true
     * isJapanese('泣き虫。！〜＄') // Zenkaku/JA punctuation
     * // => true
     * isJapanese('泣き虫.!~$') // Latin punctuation fails
     * // => false
     * isJapanese('A泣き虫')
     * // => false
     * isJapanese('≪偽括弧≫', /[≪≫]/);
     * // => true
     */
    function isJapanese(input = '', allowed) {
      const augmented = typeOf(allowed) === 'regexp';
      return isEmpty(input)
        ? false
        : [...input].every((char) => {
          const isJa = isCharJapanese(char);
          return !augmented ? isJa : isJa || allowed.test(char);
        });
    }

    var safeIsNaN = Number.isNaN ||
        function ponyfill(value) {
            return typeof value === 'number' && value !== value;
        };
    function isEqual(first, second) {
        if (first === second) {
            return true;
        }
        if (safeIsNaN(first) && safeIsNaN(second)) {
            return true;
        }
        return false;
    }
    function areInputsEqual(newInputs, lastInputs) {
        if (newInputs.length !== lastInputs.length) {
            return false;
        }
        for (var i = 0; i < newInputs.length; i++) {
            if (!isEqual(newInputs[i], lastInputs[i])) {
                return false;
            }
        }
        return true;
    }

    function memoizeOne(resultFn, isEqual) {
        if (isEqual === void 0) { isEqual = areInputsEqual; }
        var cache = null;
        function memoized() {
            var newArgs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                newArgs[_i] = arguments[_i];
            }
            if (cache && cache.lastThis === this && isEqual(newArgs, cache.lastArgs)) {
                return cache.lastResult;
            }
            var lastResult = resultFn.apply(this, newArgs);
            cache = {
                lastResult: lastResult,
                lastArgs: newArgs,
                lastThis: this,
            };
            return lastResult;
        }
        memoized.clear = function clear() {
            cache = null;
        };
        return memoized;
    }

    var has = Object.prototype.hasOwnProperty;

    function find(iter, tar, key) {
    	for (key of iter.keys()) {
    		if (dequal(key, tar)) return key;
    	}
    }

    function dequal(foo, bar) {
    	var ctor, len, tmp;
    	if (foo === bar) return true;

    	if (foo && bar && (ctor=foo.constructor) === bar.constructor) {
    		if (ctor === Date) return foo.getTime() === bar.getTime();
    		if (ctor === RegExp) return foo.toString() === bar.toString();

    		if (ctor === Array) {
    			if ((len=foo.length) === bar.length) {
    				while (len-- && dequal(foo[len], bar[len]));
    			}
    			return len === -1;
    		}

    		if (ctor === Set) {
    			if (foo.size !== bar.size) {
    				return false;
    			}
    			for (len of foo) {
    				tmp = len;
    				if (tmp && typeof tmp === 'object') {
    					tmp = find(bar, tmp);
    					if (!tmp) return false;
    				}
    				if (!bar.has(tmp)) return false;
    			}
    			return true;
    		}

    		if (ctor === Map) {
    			if (foo.size !== bar.size) {
    				return false;
    			}
    			for (len of foo) {
    				tmp = len[0];
    				if (tmp && typeof tmp === 'object') {
    					tmp = find(bar, tmp);
    					if (!tmp) return false;
    				}
    				if (!dequal(len[1], bar.get(tmp))) {
    					return false;
    				}
    			}
    			return true;
    		}

    		if (ctor === ArrayBuffer) {
    			foo = new Uint8Array(foo);
    			bar = new Uint8Array(bar);
    		} else if (ctor === DataView) {
    			if ((len=foo.byteLength) === bar.byteLength) {
    				while (len-- && foo.getInt8(len) === bar.getInt8(len));
    			}
    			return len === -1;
    		}

    		if (ArrayBuffer.isView(foo)) {
    			if ((len=foo.byteLength) === bar.byteLength) {
    				while (len-- && foo[len] === bar[len]);
    			}
    			return len === -1;
    		}

    		if (!ctor || typeof foo === 'object') {
    			len = 0;
    			for (ctor in foo) {
    				if (has.call(foo, ctor) && ++len && !has.call(bar, ctor)) return false;
    				if (!(ctor in bar) || !dequal(foo[ctor], bar[ctor])) return false;
    			}
    			return Object.keys(bar).length === len;
    		}
    	}

    	return foo !== foo && bar !== bar;
    }

    /**
     * Easy re-use of merging with default options
     * @param {Object} opts user options
     * @returns user options merged over default options
     */
    const mergeWithDefaultOptions = (opts = {}) => Object.assign({}, DEFAULT_OPTIONS, opts);

    function applyMapping(string, mapping, convertEnding) {
      const root = mapping;

      function nextSubtree(tree, nextChar) {
        const subtree = tree[nextChar];
        if (subtree === undefined) {
          return undefined;
        }
        // if the next child node does not have a node value, set its node value to the input
        return Object.assign({ '': tree[''] + nextChar }, tree[nextChar]);
      }

      function newChunk(remaining, currentCursor) {
        // start parsing a new chunk
        const firstChar = remaining.charAt(0);

        return parse(
          Object.assign({ '': firstChar }, root[firstChar]),
          remaining.slice(1),
          currentCursor,
          currentCursor + 1
        );
      }

      function parse(tree, remaining, lastCursor, currentCursor) {
        if (!remaining) {
          if (convertEnding || Object.keys(tree).length === 1) {
            // nothing more to consume, just commit the last chunk and return it
            // so as to not have an empty element at the end of the result
            return tree[''] ? [[lastCursor, currentCursor, tree['']]] : [];
          }
          // if we don't want to convert the ending, because there are still possible continuations
          // return null as the final node value
          return [[lastCursor, currentCursor, null]];
        }

        if (Object.keys(tree).length === 1) {
          return [[lastCursor, currentCursor, tree['']]].concat(
            newChunk(remaining, currentCursor)
          );
        }

        const subtree = nextSubtree(tree, remaining.charAt(0));

        if (subtree === undefined) {
          return [[lastCursor, currentCursor, tree['']]].concat(
            newChunk(remaining, currentCursor)
          );
        }
        // continue current branch
        return parse(subtree, remaining.slice(1), lastCursor, currentCursor + 1);
      }

      return newChunk(string, 0);
    }

    // transform the tree, so that for example hepburnTree['ゔ']['ぁ'][''] === 'va'
    // or kanaTree['k']['y']['a'][''] === 'きゃ'
    function transform(tree) {
      return Object.entries(tree).reduce((map, [char, subtree]) => {
        const endOfBranch = typeOf(subtree) === 'string';
        // eslint-disable-next-line no-param-reassign
        map[char] = endOfBranch ? { '': subtree } : transform(subtree);
        return map;
      }, {});
    }

    function getSubTreeOf(tree, string) {
      return string.split('').reduce((correctSubTree, char) => {
        if (correctSubTree[char] === undefined) {
          // eslint-disable-next-line no-param-reassign
          correctSubTree[char] = {};
        }
        return correctSubTree[char];
      }, tree);
    }

    /**
     * Creates a custom mapping tree, returns a function that accepts a defaultMap which the newly created customMapping will be merged with and returned
     * (customMap) => (defaultMap) => mergedMap
     * @param  {Object} customMap { 'ka' : 'な' }
     * @return {Function} (defaultMap) => defaultMergedWithCustomMap
     * @example
     * const sillyMap = createCustomMapping({ 'ちゃ': 'time', '茎': 'cookie'　});
     * // sillyMap is passed defaultMapping to merge with when called in toRomaji()
     * toRomaji("It's 茎 ちゃ よ", { customRomajiMapping: sillyMap });
     * // => 'It's cookie time yo';
     */
    function createCustomMapping(customMap = {}) {
      const customTree = {};

      if (typeOf(customMap) === 'object') {
        Object.entries(customMap).forEach(([roma, kana]) => {
          let subTree = customTree;
          roma.split('').forEach((char) => {
            if (subTree[char] === undefined) {
              subTree[char] = {};
            }
            subTree = subTree[char];
          });
          subTree[''] = kana;
        });
      }

      return function makeMap(map) {
        const mapCopy = JSON.parse(JSON.stringify(map));

        function transformMap(mapSubtree, customSubtree) {
          if (mapSubtree === undefined || typeOf(mapSubtree) === 'string') {
            return customSubtree;
          }
          return Object.entries(customSubtree).reduce(
            (newSubtree, [char, subtree]) => {
              // eslint-disable-next-line no-param-reassign
              newSubtree[char] = transformMap(mapSubtree[char], subtree);
              return newSubtree;
            },
            mapSubtree
          );
        }

        return transformMap(mapCopy, customTree);
      };
    }

    // allow consumer to pass either function or object as customMapping
    function mergeCustomMapping(map, customMapping) {
      if (!customMapping) {
        return map;
      }
      return typeOf(customMapping) === 'function'
        ? customMapping(map)
        : createCustomMapping(customMapping)(map);
    }

    // NOTE: not exactly kunrei shiki, for example ぢゃ -> dya instead of zya, to avoid name clashing
    /* eslint-disable */
    // prettier-ignore
    const BASIC_KUNREI = {
      a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
      k: { a: 'か', i: 'き', u: 'く', e: 'け', o: 'こ', },
      s: { a: 'さ', i: 'し', u: 'す', e: 'せ', o: 'そ', },
      t: { a: 'た', i: 'ち', u: 'つ', e: 'て', o: 'と', },
      n: { a: 'な', i: 'に', u: 'ぬ', e: 'ね', o: 'の', },
      h: { a: 'は', i: 'ひ', u: 'ふ', e: 'へ', o: 'ほ', },
      m: { a: 'ま', i: 'み', u: 'む', e: 'め', o: 'も', },
      y: { a: 'や', u: 'ゆ', o: 'よ' },
      r: { a: 'ら', i: 'り', u: 'る', e: 'れ', o: 'ろ', },
      w: { a: 'わ', i: 'ゐ', e: 'ゑ', o: 'を', },
      g: { a: 'が', i: 'ぎ', u: 'ぐ', e: 'げ', o: 'ご', },
      z: { a: 'ざ', i: 'じ', u: 'ず', e: 'ぜ', o: 'ぞ', },
      d: { a: 'だ', i: 'ぢ', u: 'づ', e: 'で', o: 'ど', },
      b: { a: 'ば', i: 'び', u: 'ぶ', e: 'べ', o: 'ぼ', },
      p: { a: 'ぱ', i: 'ぴ', u: 'ぷ', e: 'ぺ', o: 'ぽ', },
      v: { a: 'ゔぁ', i: 'ゔぃ', u: 'ゔ', e: 'ゔぇ', o: 'ゔぉ', },
    };

    const SPECIAL_SYMBOLS$1 = {
      '.': '。',
      ',': '、',
      ':': '：',
      '/': '・',
      '!': '！',
      '?': '？',
      '~': '〜',
      '-': 'ー',
      '‘': '「',
      '’': '」',
      '“': '『',
      '”': '』',
      '[': '［',
      ']': '］',
      '(': '（',
      ')': '）',
      '{': '｛',
      '}': '｝',
    };

    const CONSONANTS = {
      k: 'き',
      s: 'し',
      t: 'ち',
      n: 'に',
      h: 'ひ',
      m: 'み',
      r: 'り',
      g: 'ぎ',
      z: 'じ',
      d: 'ぢ',
      b: 'び',
      p: 'ぴ',
      v: 'ゔ',
      q: 'く',
      f: 'ふ',
    };
    const SMALL_Y$1 = { ya: 'ゃ', yi: 'ぃ', yu: 'ゅ', ye: 'ぇ', yo: 'ょ' };
    const SMALL_VOWELS = { a: 'ぁ', i: 'ぃ', u: 'ぅ', e: 'ぇ', o: 'ぉ' };

    // typing one should be the same as having typed the other instead
    const ALIASES = {
      sh: 'sy', // sha -> sya
      ch: 'ty', // cho -> tyo
      cy: 'ty', // cyo -> tyo
      chy: 'ty', // chyu -> tyu
      shy: 'sy', // shya -> sya
      j: 'zy', // ja -> zya
      jy: 'zy', // jye -> zye

      // exceptions to above rules
      shi: 'si',
      chi: 'ti',
      tsu: 'tu',
      ji: 'zi',
      fu: 'hu',
    };

    // xtu -> っ
    const SMALL_LETTERS = Object.assign(
      {
        tu: 'っ',
        wa: 'ゎ',
        ka: 'ヵ',
        ke: 'ヶ',
      },
      SMALL_VOWELS,
      SMALL_Y$1
    );

    // don't follow any notable patterns
    const SPECIAL_CASES = {
      yi: 'い',
      wu: 'う',
      ye: 'いぇ',
      wi: 'うぃ',
      we: 'うぇ',
      kwa: 'くぁ',
      whu: 'う',
      // because it's not thya for てゃ but tha
      // and tha is not てぁ, but てゃ
      tha: 'てゃ',
      thu: 'てゅ',
      tho: 'てょ',
      dha: 'でゃ',
      dhu: 'でゅ',
      dho: 'でょ',
    };

    const AIUEO_CONSTRUCTIONS = {
      wh: 'う',
      kw: 'く',
      qw: 'く',
      q: 'く',
      gw: 'ぐ',
      sw: 'す',
      ts: 'つ',
      th: 'て',
      tw: 'と',
      dh: 'で',
      dw: 'ど',
      fw: 'ふ',
      f: 'ふ',
    };

    /* eslint-enable */
    function createRomajiToKanaMap$1() {
      const kanaTree = transform(BASIC_KUNREI);
      // pseudo partial application
      const subtreeOf = (string) => getSubTreeOf(kanaTree, string);

      // add tya, sya, etc.
      Object.entries(CONSONANTS).forEach(([consonant, yKana]) => {
        Object.entries(SMALL_Y$1).forEach(([roma, kana]) => {
          // for example kyo -> き + ょ
          subtreeOf(consonant + roma)[''] = yKana + kana;
        });
      });

      Object.entries(SPECIAL_SYMBOLS$1).forEach(([symbol, jsymbol]) => {
        subtreeOf(symbol)[''] = jsymbol;
      });

      // things like うぃ, くぃ, etc.
      Object.entries(AIUEO_CONSTRUCTIONS).forEach(([consonant, aiueoKana]) => {
        Object.entries(SMALL_VOWELS).forEach(([vowel, kana]) => {
          const subtree = subtreeOf(consonant + vowel);
          subtree[''] = aiueoKana + kana;
        });
      });

      // different ways to write ん
      ['n', "n'", 'xn'].forEach((nChar) => {
        subtreeOf(nChar)[''] = 'ん';
      });

      // c is equivalent to k, but not for chi, cha, etc. that's why we have to make a copy of k
      kanaTree.c = JSON.parse(JSON.stringify(kanaTree.k));

      Object.entries(ALIASES).forEach(([string, alternative]) => {
        const allExceptLast = string.slice(0, string.length - 1);
        const last = string.charAt(string.length - 1);
        const parentTree = subtreeOf(allExceptLast);
        // copy to avoid recursive containment
        parentTree[last] = JSON.parse(JSON.stringify(subtreeOf(alternative)));
      });

      function getAlternatives(string) {
        return [...Object.entries(ALIASES), ...[['c', 'k']]].reduce(
          (list, [alt, roma]) => (string.startsWith(roma) ? list.concat(string.replace(roma, alt)) : list),
          []
        );
      }

      Object.entries(SMALL_LETTERS).forEach(([kunreiRoma, kana]) => {
        const last = (char) => char.charAt(char.length - 1);
        const allExceptLast = (chars) => chars.slice(0, chars.length - 1);
        const xRoma = `x${kunreiRoma}`;
        const xSubtree = subtreeOf(xRoma);
        xSubtree[''] = kana;

        // ltu -> xtu -> っ
        const parentTree = subtreeOf(`l${allExceptLast(kunreiRoma)}`);
        parentTree[last(kunreiRoma)] = xSubtree;

        // ltsu -> ltu -> っ
        getAlternatives(kunreiRoma).forEach((altRoma) => {
          ['l', 'x'].forEach((prefix) => {
            const altParentTree = subtreeOf(prefix + allExceptLast(altRoma));
            altParentTree[last(altRoma)] = subtreeOf(prefix + kunreiRoma);
          });
        });
      });

      Object.entries(SPECIAL_CASES).forEach(([string, kana]) => {
        subtreeOf(string)[''] = kana;
      });

      // add kka, tta, etc.
      function addTsu(tree) {
        return Object.entries(tree).reduce((tsuTree, [key, value]) => {
          if (!key) {
            // we have reached the bottom of this branch
            // eslint-disable-next-line no-param-reassign
            tsuTree[key] = `っ${value}`;
          } else {
            // more subtrees
            // eslint-disable-next-line no-param-reassign
            tsuTree[key] = addTsu(value);
          }
          return tsuTree;
        }, {});
      }
      // have to explicitly name c here, because we made it a copy of k, not a reference
      [...Object.keys(CONSONANTS), 'c', 'y', 'w', 'j'].forEach((consonant) => {
        const subtree = kanaTree[consonant];
        subtree[consonant] = addTsu(subtree);
      });
      // nn should not be っん
      delete kanaTree.n.n;
      // solidify the results, so that there there is referential transparency within the tree
      return Object.freeze(JSON.parse(JSON.stringify(kanaTree)));
    }

    let romajiToKanaMap = null;

    function getRomajiToKanaTree() {
      if (romajiToKanaMap == null) {
        romajiToKanaMap = createRomajiToKanaMap$1();
      }
      return romajiToKanaMap;
    }

    const USE_OBSOLETE_KANA_MAP = createCustomMapping({
      wi: 'ゐ',
      we: 'ゑ',
    });

    function IME_MODE_MAP(map) {
      // in IME mode, we do not want to convert single ns
      const mapCopy = JSON.parse(JSON.stringify(map));
      mapCopy.n.n = { '': 'ん' };
      mapCopy.n[' '] = { '': 'ん' };
      return mapCopy;
    }

    /**
     * Tests if char is in English unicode uppercase range
     * @param  {String} char
     * @return {Boolean}
     */
    function isCharUpperCase(char = '') {
      if (isEmpty(char)) return false;
      return isCharInRange(char, LATIN_UPPERCASE_START, LATIN_UPPERCASE_END);
    }

    /**
     * Returns true if char is 'ー'
     * @param  {String} char to test
     * @return {Boolean}
     */
    function isCharLongDash(char = '') {
      if (isEmpty(char)) return false;
      return char.charCodeAt(0) === PROLONGED_SOUND_MARK;
    }

    /**
     * Tests if char is '・'
     * @param  {String} char
     * @return {Boolean} true if '・'
     */
    function isCharSlashDot(char = '') {
      if (isEmpty(char)) return false;
      return char.charCodeAt(0) === KANA_SLASH_DOT;
    }

    /**
     * Tests a character. Returns true if the character is [Hiragana](https://en.wikipedia.org/wiki/Hiragana).
     * @param  {String} char character string to test
     * @return {Boolean}
     */
    function isCharHiragana(char = '') {
      if (isEmpty(char)) return false;
      if (isCharLongDash(char)) return true;
      return isCharInRange(char, HIRAGANA_START, HIRAGANA_END);
    }

    /**
     * Convert [Hiragana](https://en.wikipedia.org/wiki/Hiragana) to [Katakana](https://en.wikipedia.org/wiki/Katakana)
     * Passes through any non-hiragana chars
     * @private
     * @param  {String} [input=''] text input
     * @return {String} converted text
     * @example
     * hiraganaToKatakana('ひらがな')
     * // => "ヒラガナ"
     * hiraganaToKatakana('ひらがな is a type of kana')
     * // => "ヒラガナ is a type of kana"
     */
    function hiraganaToKatakana(input = '') {
      const kata = [];
      input.split('').forEach((char) => {
        // Short circuit to avoid incorrect codeshift for 'ー' and '・'
        if (isCharLongDash(char) || isCharSlashDot(char)) {
          kata.push(char);
        } else if (isCharHiragana(char)) {
          // Shift charcode.
          const code = char.charCodeAt(0) + (KATAKANA_START - HIRAGANA_START);
          const kataChar = String.fromCharCode(code);
          kata.push(kataChar);
        } else {
          // Pass non-hiragana chars through
          kata.push(char);
        }
      });
      return kata.join('');
    }

    // memoize and deeply compare args so we only recreate when necessary
    const createRomajiToKanaMap = memoizeOne(
      (IMEMode, useObsoleteKana, customKanaMapping) => {
        let map = getRomajiToKanaTree();

        map = IMEMode ? IME_MODE_MAP(map) : map;
        map = useObsoleteKana ? USE_OBSOLETE_KANA_MAP(map) : map;

        if (customKanaMapping) {
          map = mergeCustomMapping(map, customKanaMapping);
        }

        return map;
      },
      dequal
    );

    /**
     * Convert [Romaji](https://en.wikipedia.org/wiki/Romaji) to [Kana](https://en.wikipedia.org/wiki/Kana), lowercase text will result in [Hiragana](https://en.wikipedia.org/wiki/Hiragana) and uppercase text will result in [Katakana](https://en.wikipedia.org/wiki/Katakana).
     * @param  {String} [input=''] text
     * @param  {DefaultOptions} [options=defaultOptions]
     * @return {String} converted text
     * @example
     * toKana('onaji BUTTSUUJI')
     * // => 'おなじ ブッツウジ'
     * toKana('ONAJI buttsuuji')
     * // => 'オナジ ぶっつうじ'
     * toKana('座禅‘zazen’スタイル')
     * // => '座禅「ざぜん」スタイル'
     * toKana('batsuge-mu')
     * // => 'ばつげーむ'
     * toKana('!?.:/,~-‘’“”[](){}') // Punctuation conversion
     * // => '！？。：・、〜ー「」『』［］（）｛｝'
     * toKana('we', { useObsoleteKana: true })
     * // => 'ゑ'
     * toKana('wanakana', { customKanaMapping: { na: 'に', ka: 'bana' } });
     * // => 'わにbanaに'
     */
    function toKana(input = '', options = {}, map) {
      let config;
      if (!map) {
        config = mergeWithDefaultOptions(options);
        map = createRomajiToKanaMap(
          config.IMEMode,
          config.useObsoleteKana,
          config.customKanaMapping
        );
      } else {
        config = options;
      }

      // throw away the substring index information and just concatenate all the kana
      return splitIntoConvertedKana(input, config, map)
        .map((kanaToken) => {
          const [start, end, kana] = kanaToken;
          if (kana === null) {
            // haven't converted the end of the string, since we are in IME mode
            return input.slice(start);
          }
          const enforceHiragana = config.IMEMode === TO_KANA_METHODS.HIRAGANA;
          const enforceKatakana = config.IMEMode === TO_KANA_METHODS.KATAKANA
            || [...input.slice(start, end)].every(isCharUpperCase);

          return enforceHiragana || !enforceKatakana
            ? kana
            : hiraganaToKatakana(kana);
        })
        .join('');
    }

    /**
     *
     * @private
     * @param {String} [input=''] input text
     * @param {DefaultOptions} [options=defaultOptions] toKana options
     * @param {Object} [map] custom mapping
     * @returns {Array[]} [[start, end, token]]
     * @example
     * splitIntoConvertedKana('buttsuuji')
     * // => [[0, 2, 'ぶ'], [2, 6, 'っつ'], [6, 7, 'う'], [7, 9, 'じ']]
     */
    function splitIntoConvertedKana(input = '', options = {}, map) {
      const { IMEMode, useObsoleteKana, customKanaMapping } = options;

      if (!map) {
        map = createRomajiToKanaMap(IMEMode, useObsoleteKana, customKanaMapping);
      }

      return applyMapping(input.toLowerCase(), map, !IMEMode);
    }

    let LISTENERS = [];
    /**
     * Automagically replaces input values with converted text to kana
     * @param  {defaultOptions} [options] user config overrides, default conversion is toKana()
     * @return {Function} event handler with bound options
     * @private
     */
    function makeOnInput(options) {
      let prevInput;

      // Enforce IMEMode if not already specified
      const mergedConfig = Object.assign({}, mergeWithDefaultOptions(options), {
        IMEMode: options.IMEMode || true,
      });

      const preConfiguredMap = createRomajiToKanaMap(
        mergedConfig.IMEMode,
        mergedConfig.useObsoleteKana,
        mergedConfig.customKanaMapping
      );

      const triggers = [
        ...Object.keys(preConfiguredMap),
        ...Object.keys(preConfiguredMap).map((char) => char.toUpperCase()),
      ];

      return function onInput({ target }) {
        if (
          target.value !== prevInput
          && target.dataset.ignoreComposition !== 'true'
        ) {
          convertInput(target, mergedConfig, preConfiguredMap, triggers);
        }
      };
    }

    function convertInput(target, options, map, triggers, prevInput) {
      const [head, textToConvert, tail] = splitInput(
        target.value,
        target.selectionEnd,
        triggers
      );
      const convertedText = toKana(textToConvert, options, map);
      const changed = textToConvert !== convertedText;

      if (changed) {
        const newCursor = head.length + convertedText.length;
        const newValue = head + convertedText + tail;
        // eslint-disable-next-line no-param-reassign
        target.value = newValue;

        if (tail.length) {
          // push later on event loop (otherwise mid-text insertion can be 1 char too far to the right)
          setTimeout(() => target.setSelectionRange(newCursor, newCursor), 1);
        } else {
          target.setSelectionRange(newCursor, newCursor);
        }
      }
    }

    function onComposition({ type, target, data }) {
      // navigator.platform is not 100% reliable for singling out all OS,
      // but for determining desktop "Mac OS" it is effective enough.
      const isMacOS = /Mac/.test(window.navigator && window.navigator.platform);
      // We don't want to ignore on Android:
      // https://github.com/WaniKani/WanaKana/issues/82
      // But MacOS IME auto-closes if we don't ignore:
      // https://github.com/WaniKani/WanaKana/issues/71
      // Other platform Japanese IMEs pass through happily
      if (isMacOS) {
        if (type === 'compositionupdate' && isJapanese(data)) {
          // eslint-disable-next-line no-param-reassign
          target.dataset.ignoreComposition = 'true';
        }

        if (type === 'compositionend') {
          // eslint-disable-next-line no-param-reassign
          target.dataset.ignoreComposition = 'false';
        }
      }
    }

    function trackListeners(id, inputHandler, compositionHandler) {
      LISTENERS = LISTENERS.concat({
        id,
        inputHandler,
        compositionHandler,
      });
    }

    function untrackListeners({ id: targetId }) {
      LISTENERS = LISTENERS.filter(({ id }) => id !== targetId);
    }

    function findListeners(el) {
      return (
        el && LISTENERS.find(({ id }) => id === el.getAttribute('data-wanakana-id'))
      );
    }

    // Handle non-terminal inserted input conversion:
    // | -> わ| -> わび| -> わ|び -> わs|び -> わsh|び -> わshi|び -> わし|び
    // or multiple ambiguous positioning (to select which "s" to work from)
    // こsこs|こsこ -> こsこso|こsこ -> こsこそ|こsこ
    function splitInput(text = '', cursor = 0, triggers = []) {
      let head;
      let toConvert;
      let tail;

      if (cursor === 0 && triggers.includes(text[0])) {
        [head, toConvert, tail] = workFromStart(text, triggers);
      } else if (cursor > 0) {
        [head, toConvert, tail] = workBackwards(text, cursor);
      } else {
        [head, toConvert] = takeWhileAndSlice(
          text,
          (char) => !triggers.includes(char)
        );
        [toConvert, tail] = takeWhileAndSlice(
          toConvert,
          (char) => !isJapanese(char)
        );
      }

      return [head, toConvert, tail];
    }

    function workFromStart(text, catalystChars) {
      return [
        '',
        ...takeWhileAndSlice(
          text,
          (char) => catalystChars.includes(char) || !isJapanese(char, /[0-9]/)
        ),
      ];
    }

    function workBackwards(text = '', startIndex = 0) {
      const [toConvert, head] = takeWhileAndSlice(
        [...text.slice(0, startIndex)].reverse(),
        (char) => !isJapanese(char)
      );
      return [
        head.reverse().join(''),
        toConvert
          .split('')
          .reverse()
          .join(''),
        text.slice(startIndex),
      ];
    }

    function takeWhileAndSlice(source = {}, predicate = (x) => !!x) {
      const result = [];
      const { length } = source;
      let i = 0;
      while (i < length && predicate(source[i], i)) {
        result.push(source[i]);
        i += 1;
      }
      return [result.join(''), source.slice(i)];
    }

    /* eslint-disable no-console */
    const onInput = ({ target: { value, selectionStart, selectionEnd } }) => console.log('input:', { value, selectionStart, selectionEnd });
    const onCompositionStart = () => console.log('compositionstart');
    const onCompositionUpdate = ({
      target: { value, selectionStart, selectionEnd },
      data,
    }) => console.log('compositionupdate', {
      data,
      value,
      selectionStart,
      selectionEnd,
    });
    const onCompositionEnd = () => console.log('compositionend');

    const events = {
      input: onInput,
      compositionstart: onCompositionStart,
      compositionupdate: onCompositionUpdate,
      compositionend: onCompositionEnd,
    };

    const addDebugListeners = (input) => {
      Object.entries(events).forEach(([event, handler]) => input.addEventListener(event, handler)
      );
    };

    const removeDebugListeners = (input) => {
      Object.entries(events).forEach(([event, handler]) => input.removeEventListener(event, handler)
      );
    };

    const ELEMENTS = ['TEXTAREA', 'INPUT'];

    let idCounter = 0;
    const newId = () => {
      idCounter += 1;
      return `${Date.now()}${idCounter}`;
    };

    /**
     * Binds eventListener for 'input' events to an input field to automagically replace values with kana
     * Can pass `{ IMEMode: 'toHiragana' || 'toKatakana' }` to enforce kana conversion type
     * @param  {HTMLElement} element textarea, input[type="text"] etc
     * @param  {DefaultOptions} [options=defaultOptions] defaults to { IMEMode: true } using `toKana`
     * @example
     * bind(document.querySelector('#myInput'));
     */
    function bind(element = {}, options = {}, debug = false) {
      if (!ELEMENTS.includes(element.nodeName)) {
        throw new Error(
          `Element provided to Wanakana bind() was not a valid input or textarea element.\n Received: (${JSON.stringify(
        element
      )})`
        );
      }
      if (element.hasAttribute('data-wanakana-id')) {
        return;
      }
      const onInput = makeOnInput(options);
      const id = newId();
      const attributes = [
        { name: 'data-wanakana-id', value: id },
        { name: 'lang', value: 'ja' },
        { name: 'autoCapitalize', value: 'none' },
        { name: 'autoCorrect', value: 'off' },
        { name: 'autoComplete', value: 'off' },
        { name: 'spellCheck', value: 'false' },
      ];
      const previousAttributes = {};
      attributes.forEach((attribute) => {
        previousAttributes[attribute.name] = element.getAttribute(attribute.name);
        element.setAttribute(attribute.name, attribute.value);
      });
      element.dataset.previousAttributes = JSON.stringify(previousAttributes);
      element.addEventListener('input', onInput);
      element.addEventListener('compositionupdate', onComposition);
      element.addEventListener('compositionend', onComposition);
      trackListeners(id, onInput, onComposition);
      if (debug === true) {
        addDebugListeners(element);
      }
    }

    /**
     * Unbinds eventListener from input field
     * @param  {HTMLElement} element textarea, input
     */
    function unbind(element, debug = false) {
      const listeners = findListeners(element);
      if (listeners == null) {
        throw new Error(
          `Element provided to Wanakana unbind() had no listener registered.\n Received: ${JSON.stringify(
        element
      )}`
        );
      }
      const { inputHandler, compositionHandler } = listeners;
      const attributes = JSON.parse(element.dataset.previousAttributes);
      Object.keys(attributes).forEach((key) => {
        if (attributes[key]) {
          element.setAttribute(key, attributes[key]);
        } else {
          element.removeAttribute(key);
        }
      });
      element.removeAttribute('data-previous-attributes');
      element.removeAttribute('data-ignore-composition');
      element.removeEventListener('input', inputHandler);
      element.removeEventListener('compositionstart', compositionHandler);
      element.removeEventListener('compositionupdate', compositionHandler);
      element.removeEventListener('compositionend', compositionHandler);
      untrackListeners(listeners);
      if (debug === true) {
        removeDebugListeners(element);
      }
    }

    /**
     * Tests a character. Returns true if the character is [Romaji](https://en.wikipedia.org/wiki/Romaji) (allowing [Hepburn romanisation](https://en.wikipedia.org/wiki/Hepburn_romanization))
     * @param  {String} char character string to test
     * @return {Boolean}
     */
    function isCharRomaji(char = '') {
      if (isEmpty(char)) return false;
      return ROMAJI_RANGES.some(([start, end]) => isCharInRange(char, start, end));
    }

    /**
     * Test if `input` is [Romaji](https://en.wikipedia.org/wiki/Romaji) (allowing [Hepburn romanisation](https://en.wikipedia.org/wiki/Hepburn_romanization))
     * @param  {String} [input=''] text
     * @param  {Regexp} [allowed] additional test allowed to pass for each char
     * @return {Boolean} true if [Romaji](https://en.wikipedia.org/wiki/Romaji)
     * @example
     * isRomaji('Tōkyō and Ōsaka')
     * // => true
     * isRomaji('12a*b&c-d')
     * // => true
     * isRomaji('あアA')
     * // => false
     * isRomaji('お願い')
     * // => false
     * isRomaji('a！b&cーd') // Zenkaku punctuation fails
     * // => false
     * isRomaji('a！b&cーd', /[！ー]/)
     * // => true
     */
    function isRomaji(input = '', allowed) {
      const augmented = typeOf(allowed) === 'regexp';
      return isEmpty(input)
        ? false
        : [...input].every((char) => {
          const isRoma = isCharRomaji(char);
          return !augmented ? isRoma : isRoma || allowed.test(char);
        });
    }

    /**
     * Tests a character. Returns true if the character is [Katakana](https://en.wikipedia.org/wiki/Katakana).
     * @param  {String} char character string to test
     * @return {Boolean}
     */
    function isCharKatakana(char = '') {
      return isCharInRange(char, KATAKANA_START, KATAKANA_END);
    }

    /**
     * Tests a character. Returns true if the character is [Hiragana](https://en.wikipedia.org/wiki/Hiragana) or [Katakana](https://en.wikipedia.org/wiki/Katakana).
     * @param  {String} char character string to test
     * @return {Boolean}
     */
    function isCharKana(char = '') {
      if (isEmpty(char)) return false;
      return isCharHiragana(char) || isCharKatakana(char);
    }

    /**
     * Test if `input` is [Kana](https://en.wikipedia.org/wiki/Kana) ([Katakana](https://en.wikipedia.org/wiki/Katakana) and/or [Hiragana](https://en.wikipedia.org/wiki/Hiragana))
     * @param  {String} [input=''] text
     * @return {Boolean} true if all [Kana](https://en.wikipedia.org/wiki/Kana)
     * @example
     * isKana('あ')
     * // => true
     * isKana('ア')
     * // => true
     * isKana('あーア')
     * // => true
     * isKana('A')
     * // => false
     * isKana('あAア')
     * // => false
     */
    function isKana(input = '') {
      if (isEmpty(input)) return false;
      return [...input].every(isCharKana);
    }

    /**
     * Test if `input` is [Hiragana](https://en.wikipedia.org/wiki/Hiragana)
     * @param  {String} [input=''] text
     * @return {Boolean} true if all [Hiragana](https://en.wikipedia.org/wiki/Hiragana)
     * @example
     * isHiragana('げーむ')
     * // => true
     * isHiragana('A')
     * // => false
     * isHiragana('あア')
     * // => false
     */
    function isHiragana(input = '') {
      if (isEmpty(input)) return false;
      return [...input].every(isCharHiragana);
    }

    /**
     * Test if `input` is [Katakana](https://en.wikipedia.org/wiki/Katakana)
     * @param  {String} [input=''] text
     * @return {Boolean} true if all [Katakana](https://en.wikipedia.org/wiki/Katakana)
     * @example
     * isKatakana('ゲーム')
     * // => true
     * isKatakana('あ')
     * // => false
     * isKatakana('A')
     * // => false
     * isKatakana('あア')
     * // => false
     */
    function isKatakana(input = '') {
      if (isEmpty(input)) return false;
      return [...input].every(isCharKatakana);
    }

    /**
     * Returns true if char is '々'
     * @param  {String} char to test
     * @return {Boolean}
     */
    function isCharIterationMark(char = '') {
      if (isEmpty(char)) return false;
      return char.charCodeAt(0) === KANJI_ITERATION_MARK;
    }

    /**
     * Tests a character. Returns true if the character is a CJK ideograph (kanji).
     * @param  {String} char character string to test
     * @return {Boolean}
     */
    function isCharKanji(char = '') {
      return isCharInRange(char, KANJI_START, KANJI_END) || isCharIterationMark(char);
    }

    /**
     * Tests if `input` is [Kanji](https://en.wikipedia.org/wiki/Kanji) ([Japanese CJK ideographs](https://en.wikipedia.org/wiki/CJK_Unified_Ideographs))
     * @param  {String} [input=''] text
     * @return {Boolean} true if all [Kanji](https://en.wikipedia.org/wiki/Kanji)
     * @example
     * isKanji('刀')
     * // => true
     * isKanji('切腹')
     * // => true
     * isKanji('勢い')
     * // => false
     * isKanji('あAア')
     * // => false
     * isKanji('🐸')
     * // => false
     */
    function isKanji(input = '') {
      if (isEmpty(input)) return false;
      return [...input].every(isCharKanji);
    }

    /**
     * Test if `input` contains a mix of [Romaji](https://en.wikipedia.org/wiki/Romaji) *and* [Kana](https://en.wikipedia.org/wiki/Kana), defaults to pass through [Kanji](https://en.wikipedia.org/wiki/Kanji)
     * @param  {String} input text
     * @param  {Object} [options={ passKanji: true }] optional config to pass through kanji
     * @return {Boolean} true if mixed
     * @example
     * isMixed('Abあア'))
     * // => true
     * isMixed('お腹A')) // ignores kanji by default
     * // => true
     * isMixed('お腹A', { passKanji: false }))
     * // => false
     * isMixed('ab'))
     * // => false
     * isMixed('あア'))
     * // => false
     */
    function isMixed(input = '', options = { passKanji: true }) {
      const chars = [...input];
      let hasKanji = false;
      if (!options.passKanji) {
        hasKanji = chars.some(isKanji);
      }
      return (chars.some(isHiragana) || chars.some(isKatakana)) && chars.some(isRomaji) && !hasKanji;
    }

    const isCharInitialLongDash = (char, index) => isCharLongDash(char) && index < 1;
    const isCharInnerLongDash = (char, index) => isCharLongDash(char) && index > 0;
    const isKanaAsSymbol = (char) => ['ヶ', 'ヵ'].includes(char);
    const LONG_VOWELS = {
      a: 'あ',
      i: 'い',
      u: 'う',
      e: 'え',
      o: 'う',
    };

    // inject toRomaji to avoid circular dependency between toRomaji <-> katakanaToHiragana
    function katakanaToHiragana(
      input = '',
      toRomaji,
      { isDestinationRomaji, convertLongVowelMark } = {}
    ) {
      let previousKana = '';

      return input
        .split('')
        .reduce((hira, char, index) => {
          // Short circuit to avoid incorrect codeshift for 'ー' and '・'
          if (
            isCharSlashDot(char)
            || isCharInitialLongDash(char, index)
            || isKanaAsSymbol(char)
          ) {
            return hira.concat(char);
          }

          // Transform long vowels: 'オー' to 'おう'
          if (
            convertLongVowelMark
            && previousKana
            && isCharInnerLongDash(char, index)
          ) {
            // Transform previousKana back to romaji, and slice off the vowel
            const romaji = toRomaji(previousKana).slice(-1);
            // However, ensure 'オー' => 'おお' => 'oo' if this is a transform on the way to romaji
            if (
              isCharKatakana(input[index - 1])
              && romaji === 'o'
              && isDestinationRomaji
            ) {
              return hira.concat('お');
            }
            return hira.concat(LONG_VOWELS[romaji]);
            // Transform all other chars
          }

          if (!isCharLongDash(char) && isCharKatakana(char)) {
            const code = char.charCodeAt(0) + (HIRAGANA_START - KATAKANA_START);
            const hiraChar = String.fromCharCode(code);
            previousKana = hiraChar;
            return hira.concat(hiraChar);
          }

          // Pass non katakana chars through
          previousKana = '';
          return hira.concat(char);
        }, [])
        .join('');
    }

    let kanaToHepburnMap = null;

    /* eslint-disable */
    // prettier-ignore
    const BASIC_ROMAJI = {
      あ:'a',    い:'i',   う:'u',   え:'e',    お:'o',
      か:'ka',   き:'ki',  く:'ku',  け:'ke',   こ:'ko',
      さ:'sa',   し:'shi', す:'su',  せ:'se',   そ:'so',
      た:'ta',   ち:'chi', つ:'tsu', て:'te',   と:'to',
      な:'na',   に:'ni',  ぬ:'nu',  ね:'ne',   の:'no',
      は:'ha',   ひ:'hi',  ふ:'fu',  へ:'he',   ほ:'ho',
      ま:'ma',   み:'mi',  む:'mu',  め:'me',   も:'mo',
      ら:'ra',   り:'ri',  る:'ru',  れ:'re',   ろ:'ro',
      や:'ya',   ゆ:'yu',  よ:'yo',
      わ:'wa',   ゐ:'wi',  ゑ:'we',  を:'wo',
      ん: 'n',
      が:'ga',   ぎ:'gi',  ぐ:'gu',  げ:'ge',   ご:'go',
      ざ:'za',   じ:'ji',  ず:'zu',  ぜ:'ze',   ぞ:'zo',
      だ:'da',   ぢ:'ji',  づ:'zu',  で:'de',   ど:'do',
      ば:'ba',   び:'bi',  ぶ:'bu',  べ:'be',   ぼ:'bo',
      ぱ:'pa',   ぴ:'pi',  ぷ:'pu',  ぺ:'pe',   ぽ:'po',
      ゔぁ:'va', ゔぃ:'vi', ゔ:'vu',  ゔぇ:'ve', ゔぉ:'vo',
    };
    /* eslint-enable  */

    const SPECIAL_SYMBOLS = {
      '。': '.',
      '、': ',',
      '：': ':',
      '・': '/',
      '！': '!',
      '？': '?',
      '〜': '~',
      'ー': '-',
      '「': '‘',
      '」': '’',
      '『': '“',
      '』': '”',
      '［': '[',
      '］': ']',
      '（': '(',
      '）': ')',
      '｛': '{',
      '｝': '}',
      '　': ' ',
    };

    // んい -> n'i
    const AMBIGUOUS_VOWELS = ['あ', 'い', 'う', 'え', 'お', 'や', 'ゆ', 'よ'];
    const SMALL_Y = { ゃ: 'ya', ゅ: 'yu', ょ: 'yo' };
    const SMALL_Y_EXTRA = { ぃ: 'yi', ぇ: 'ye' };
    const SMALL_AIUEO = {
      ぁ: 'a',
      ぃ: 'i',
      ぅ: 'u',
      ぇ: 'e',
      ぉ: 'o',
    };
    const YOON_KANA = [
      'き',
      'に',
      'ひ',
      'み',
      'り',
      'ぎ',
      'び',
      'ぴ',
      'ゔ',
      'く',
      'ふ',
    ];
    const YOON_EXCEPTIONS = {
      し: 'sh',
      ち: 'ch',
      じ: 'j',
      ぢ: 'j',
    };
    const SMALL_KANA = {
      っ: '',
      ゃ: 'ya',
      ゅ: 'yu',
      ょ: 'yo',
      ぁ: 'a',
      ぃ: 'i',
      ぅ: 'u',
      ぇ: 'e',
      ぉ: 'o',
    };

    // going with the intuitive (yet incorrect) solution where っや -> yya and っぃ -> ii
    // in other words, just assume the sokuon could have been applied to anything
    const SOKUON_WHITELIST = {
      b: 'b',
      c: 't',
      d: 'd',
      f: 'f',
      g: 'g',
      h: 'h',
      j: 'j',
      k: 'k',
      m: 'm',
      p: 'p',
      q: 'q',
      r: 'r',
      s: 's',
      t: 't',
      v: 'v',
      w: 'w',
      x: 'x',
      z: 'z',
    };

    function getKanaToHepburnTree() {
      if (kanaToHepburnMap == null) {
        kanaToHepburnMap = createKanaToHepburnMap();
      }
      return kanaToHepburnMap;
    }

    function getKanaToRomajiTree(romanization) {
      switch (romanization) {
        case ROMANIZATIONS.HEPBURN:
          return getKanaToHepburnTree();
        default:
          return {};
      }
    }

    function createKanaToHepburnMap() {
      const romajiTree = transform(BASIC_ROMAJI);

      const subtreeOf = (string) => getSubTreeOf(romajiTree, string);
      const setTrans = (string, transliteration) => {
        subtreeOf(string)[''] = transliteration;
      };

      Object.entries(SPECIAL_SYMBOLS).forEach(([jsymbol, symbol]) => {
        subtreeOf(jsymbol)[''] = symbol;
      });

      [...Object.entries(SMALL_Y), ...Object.entries(SMALL_AIUEO)].forEach(
        ([roma, kana]) => {
          setTrans(roma, kana);
        }
      );

      // きゃ -> kya
      YOON_KANA.forEach((kana) => {
        const firstRomajiChar = subtreeOf(kana)[''][0];
        Object.entries(SMALL_Y).forEach(([yKana, yRoma]) => {
          setTrans(kana + yKana, firstRomajiChar + yRoma);
        });
        // きぃ -> kyi
        Object.entries(SMALL_Y_EXTRA).forEach(([yKana, yRoma]) => {
          setTrans(kana + yKana, firstRomajiChar + yRoma);
        });
      });

      Object.entries(YOON_EXCEPTIONS).forEach(([kana, roma]) => {
        // じゃ -> ja
        Object.entries(SMALL_Y).forEach(([yKana, yRoma]) => {
          setTrans(kana + yKana, roma + yRoma[1]);
        });
        // じぃ -> jyi, じぇ -> je
        setTrans(`${kana}ぃ`, `${roma}yi`);
        setTrans(`${kana}ぇ`, `${roma}e`);
      });

      romajiTree['っ'] = resolveTsu(romajiTree);

      Object.entries(SMALL_KANA).forEach(([kana, roma]) => {
        setTrans(kana, roma);
      });

      AMBIGUOUS_VOWELS.forEach((kana) => {
        setTrans(`ん${kana}`, `n'${subtreeOf(kana)['']}`);
      });

      // NOTE: could be re-enabled with an option?
      // // んば -> mbo
      // const LABIAL = [
      //   'ば', 'び', 'ぶ', 'べ', 'ぼ',
      //   'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ',
      //   'ま', 'み', 'む', 'め', 'も',
      // ];
      // LABIAL.forEach((kana) => {
      //   setTrans(`ん${kana}`, `m${subtreeOf(kana)['']}`);
      // });

      return Object.freeze(JSON.parse(JSON.stringify(romajiTree)));
    }

    function resolveTsu(tree) {
      return Object.entries(tree).reduce((tsuTree, [key, value]) => {
        if (!key) {
          // we have reached the bottom of this branch
          const consonant = value.charAt(0);
          // eslint-disable-next-line no-param-reassign
          tsuTree[key] = Object.keys(SOKUON_WHITELIST).includes(consonant)
            ? SOKUON_WHITELIST[consonant] + value
            : value;
        } else {
          // more subtrees
          // eslint-disable-next-line no-param-reassign
          tsuTree[key] = resolveTsu(value);
        }
        return tsuTree;
      }, {});
    }

    // memoize and deeply compare args so we only recreate when necessary
    const createKanaToRomajiMap = memoizeOne(
      (romanization, customRomajiMapping) => {
        let map = getKanaToRomajiTree(romanization);

        if (customRomajiMapping) {
          map = mergeCustomMapping(map, customRomajiMapping);
        }

        return map;
      },
      dequal
    );

    /**
     * Convert kana to romaji
     * @param  {String} kana text input
     * @param  {DefaultOptions} [options=defaultOptions]
     * @param  {Object} map custom mapping
     * @return {String} converted text
     * @example
     * toRomaji('ひらがな　カタカナ')
     * // => 'hiragana katakana'
     * toRomaji('げーむ　ゲーム')
     * // => 'ge-mu geemu'
     * toRomaji('ひらがな　カタカナ', { upcaseKatakana: true })
     * // => 'hiragana KATAKANA'
     * toRomaji('つじぎり', { customRomajiMapping: { じ: 'zi', つ: 'tu', り: 'li' } });
     * // => 'tuzigili'
     */
    function toRomaji(input = '', options = {}, map) {
      const config = mergeWithDefaultOptions(options);

      if (!map) {
        map = createKanaToRomajiMap(
          config.romanization,
          config.customRomajiMapping
        );
      }

      // just throw away the substring index information and simply concatenate all the kana
      return splitIntoRomaji(input, config, map)
        .map((romajiToken) => {
          const [start, end, romaji] = romajiToken;
          const makeUpperCase = config.upcaseKatakana && isKatakana(input.slice(start, end));
          return makeUpperCase ? romaji.toUpperCase() : romaji;
        })
        .join('');
    }

    function splitIntoRomaji(input, options, map) {
      if (!map) {
        map = createKanaToRomajiMap(
          options.romanization,
          options.customRomajiMapping
        );
      }

      const config = Object.assign({}, { isDestinationRomaji: true }, options);

      return applyMapping(
        katakanaToHiragana(input, toRomaji, config),
        map,
        !options.IMEMode
      );
    }

    /**
     * Tests a character. Returns true if the character is considered English punctuation.
     * @param  {String} char character string to test
     * @return {Boolean}
     */
    function isCharEnglishPunctuation(char = '') {
      if (isEmpty(char)) return false;
      return EN_PUNCTUATION_RANGES.some(([start, end]) => isCharInRange(char, start, end));
    }

    /**
     * Convert input to [Hiragana](https://en.wikipedia.org/wiki/Hiragana)
     * @param  {String} [input=''] text
     * @param  {DefaultOptions} [options=defaultOptions]
     * @return {String} converted text
     * @example
     * toHiragana('toukyou, オオサカ')
     * // => 'とうきょう、　おおさか'
     * toHiragana('only カナ', { passRomaji: true })
     * // => 'only かな'
     * toHiragana('wi')
     * // => 'うぃ'
     * toHiragana('wi', { useObsoleteKana: true })
     * // => 'ゐ'
     */
    function toHiragana(input = '', options = {}) {
      const config = mergeWithDefaultOptions(options);
      if (config.passRomaji) {
        return katakanaToHiragana(input, toRomaji, config);
      }

      if (isMixed(input, { passKanji: true })) {
        const convertedKatakana = katakanaToHiragana(input, toRomaji, config);
        return toKana(convertedKatakana.toLowerCase(), config);
      }

      if (isRomaji(input) || isCharEnglishPunctuation(input)) {
        return toKana(input.toLowerCase(), config);
      }

      return katakanaToHiragana(input, toRomaji, config);
    }

    /**
     * Convert input to [Katakana](https://en.wikipedia.org/wiki/Katakana)
     * @param  {String} [input=''] text
     * @param  {DefaultOptions} [options=defaultOptions]
     * @return {String} converted text
     * @example
     * toKatakana('toukyou, おおさか')
     * // => 'トウキョウ、　オオサカ'
     * toKatakana('only かな', { passRomaji: true })
     * // => 'only カナ'
     * toKatakana('wi')
     * // => 'ウィ'
     * toKatakana('wi', { useObsoleteKana: true })
     * // => 'ヰ'
     */
    function toKatakana(input = '', options = {}) {
      const mergedOptions = mergeWithDefaultOptions(options);
      if (mergedOptions.passRomaji) {
        return hiraganaToKatakana(input);
      }

      if (isMixed(input) || isRomaji(input) || isCharEnglishPunctuation(input)) {
        const hiragana = toKana(input.toLowerCase(), mergedOptions);
        return hiraganaToKatakana(hiragana);
      }

      return hiraganaToKatakana(input);
    }

    /**
     * Tests a character. Returns true if the character is considered Japanese punctuation.
     * @param  {String} char character string to test
     * @return {Boolean}
     */
    function isCharJapanesePunctuation(char = '') {
      if (isEmpty(char) || isCharIterationMark(char)) return false;
      return JA_PUNCTUATION_RANGES.some(([start, end]) => isCharInRange(char, start, end));
    }

    const isCharEnSpace = (x) => x === ' ';
    const isCharJaSpace = (x) => x === '　';
    const isCharJaNum = (x) => /[０-９]/.test(x);
    const isCharEnNum = (x) => /[0-9]/.test(x);

    const TOKEN_TYPES = {
      EN: 'en',
      JA: 'ja',
      EN_NUM: 'englishNumeral',
      JA_NUM: 'japaneseNumeral',
      EN_PUNC: 'englishPunctuation',
      JA_PUNC: 'japanesePunctuation',
      KANJI: 'kanji',
      HIRAGANA: 'hiragana',
      KATAKANA: 'katakana',
      SPACE: 'space',
      OTHER: 'other',
    };

    // prettier-ignore
    function getType(input, compact = false) {
      const {
        EN, JA, EN_NUM, JA_NUM, EN_PUNC, JA_PUNC, KANJI, HIRAGANA, KATAKANA, SPACE, OTHER,
      } = TOKEN_TYPES;

      if (compact) {
        switch (true) {
          case isCharJaNum(input): return OTHER;
          case isCharEnNum(input): return OTHER;
          case isCharEnSpace(input): return EN;
          case isCharEnglishPunctuation(input): return OTHER;
          case isCharJaSpace(input): return JA;
          case isCharJapanesePunctuation(input): return OTHER;
          case isCharJapanese(input): return JA;
          case isCharRomaji(input): return EN;
          default: return OTHER;
        }
      } else {
        switch (true) {
          case isCharJaSpace(input): return SPACE;
          case isCharEnSpace(input): return SPACE;
          case isCharJaNum(input): return JA_NUM;
          case isCharEnNum(input): return EN_NUM;
          case isCharEnglishPunctuation(input): return EN_PUNC;
          case isCharJapanesePunctuation(input): return JA_PUNC;
          case isCharKanji(input): return KANJI;
          case isCharHiragana(input): return HIRAGANA;
          case isCharKatakana(input): return KATAKANA;
          case isCharJapanese(input): return JA;
          case isCharRomaji(input): return EN;
          default: return OTHER;
        }
      }
    }

    /**
     * Splits input into array of strings separated by opinionated token types
     * `'en', 'ja', 'englishNumeral', 'japaneseNumeral','englishPunctuation', 'japanesePunctuation','kanji', 'hiragana', 'katakana', 'space', 'other'`.
     * If `{ compact: true }` then many same-language tokens are combined (spaces + text, kanji + kana, numeral + punctuation).
     * If `{ detailed: true }` then return array will contain `{ type, value }` instead of `'value'`
     * @param  {String} input text
     * @param  {Object} [options={ compact: false, detailed: false}] options to modify output style
     * @return {String|Object[]} text split into tokens containing values, or detailed object
     * @example
     * tokenize('ふふフフ')
     * // ['ふふ', 'フフ']
     *
     * tokenize('感じ')
     * // ['感', 'じ']
     *
     * tokenize('人々')
     * // ['人々']
     *
     * tokenize('truly 私は悲しい')
     * // ['truly', ' ', '私', 'は', '悲', 'しい']
     *
     * tokenize('truly 私は悲しい', { compact: true })
     * // ['truly ', '私は悲しい']
     *
     * tokenize('5romaji here...!?人々漢字ひらがなカタ　カナ４「ＳＨＩＯ」。！')
     * // [ '5', 'romaji', ' ', 'here', '...!?', '人々漢字', 'ひらがな', 'カタ', '　', 'カナ', '４', '「', 'ＳＨＩＯ', '」。！']
     *
     * tokenize('5romaji here...!?人々漢字ひらがなカタ　カナ４「ＳＨＩＯ」。！', { compact: true })
     * // [ '5', 'romaji here', '...!?', '人々漢字ひらがなカタ　カナ', '４「', 'ＳＨＩＯ', '」。！']
     *
     * tokenize('5romaji here...!?人々漢字ひらがなカタ　カナ４「ＳＨＩＯ」。！ لنذهب', { detailed: true })
     * // [
     *  { type: 'englishNumeral', value: '5' },
     *  { type: 'en', value: 'romaji' },
     *  { type: 'space', value: ' ' },
     *  { type: 'en', value: 'here' },
     *  { type: 'englishPunctuation', value: '...!?' },
     *  { type: 'kanji', value: '人々漢字' },
     *  { type: 'hiragana', value: 'ひらがな' },
     *  { type: 'katakana', value: 'カタ' },
     *  { type: 'space', value: '　' },
     *  { type: 'katakana', value: 'カナ' },
     *  { type: 'japaneseNumeral', value: '４' },
     *  { type: 'japanesePunctuation', value: '「' },
     *  { type: 'ja', value: 'ＳＨＩＯ' },
     *  { type: 'japanesePunctuation', value: '」。！' },
     *  { type: 'space', value: ' ' },
     *  { type: 'other', value: 'لنذهب' },
     * ]
     *
     * tokenize('5romaji here...!?人々漢字ひらがなカタ　カナ４「ＳＨＩＯ」。！ لنذهب', { compact: true, detailed: true})
     * // [
     *  { type: 'other', value: '5' },
     *  { type: 'en', value: 'romaji here' },
     *  { type: 'other', value: '...!?' },
     *  { type: 'ja', value: '人々漢字ひらがなカタ　カナ' },
     *  { type: 'other', value: '４「' },
     *  { type: 'ja', value: 'ＳＨＩＯ' },
     *  { type: 'other', value: '」。！' },
     *  { type: 'en', value: ' ' },
     *  { type: 'other', value: 'لنذهب' },
     *]
     */
    function tokenize(input, { compact = false, detailed = false } = {}) {
      if (input == null || isEmpty(input)) {
        return [];
      }
      const chars = [...input];
      let initial = chars.shift();
      let prevType = getType(initial, compact);
      initial = detailed ? { type: prevType, value: initial } : initial;

      const result = chars.reduce(
        (tokens, char) => {
          const currType = getType(char, compact);
          const sameType = currType === prevType;
          prevType = currType;
          let newValue = char;

          if (sameType) {
            newValue = (detailed ? tokens.pop().value : tokens.pop()) + newValue;
          }

          return detailed
            ? tokens.concat({ type: currType, value: newValue })
            : tokens.concat(newValue);
        },
        [initial]
      );
      return result;
    }

    const isLeadingWithoutInitialKana = (input, leading) => leading && !isKana(input[0]);
    const isTrailingWithoutFinalKana = (input, leading) => !leading && !isKana(input[input.length - 1]);
    const isInvalidMatcher = (input, matchKanji) =>
      (matchKanji && ![...matchKanji].some(isKanji)) || (!matchKanji && isKana(input));

    /**
     * Strips [Okurigana](https://en.wikipedia.org/wiki/Okurigana)
     * @param  {String} input text
     * @param  {Object} [options={ leading: false, matchKanji: '' }] optional config
     * @return {String} text with okurigana removed
     * @example
     * stripOkurigana('踏み込む')
     * // => '踏み込'
     * stripOkurigana('お祝い')
     * // => 'お祝'
     * stripOkurigana('お腹', { leading: true });
     * // => '腹'
     * stripOkurigana('ふみこむ', { matchKanji: '踏み込む' });
     * // => 'ふみこ'
     * stripOkurigana('おみまい', { matchKanji: 'お祝い', leading: true });
     * // => 'みまい'
     */
    function stripOkurigana(input = '', { leading = false, matchKanji = '' } = {}) {
      if (
        !isJapanese(input) ||
        isLeadingWithoutInitialKana(input, leading) ||
        isTrailingWithoutFinalKana(input, leading) ||
        isInvalidMatcher(input, matchKanji)
      ) {
        return input;
      }

      const chars = matchKanji || input;
      const okuriganaRegex = new RegExp(
        leading ? `^${tokenize(chars).shift()}` : `${tokenize(chars).pop()}$`
      );
      return input.replace(okuriganaRegex, '');
    }

    var wanakana = /*#__PURE__*/Object.freeze({
        __proto__: null,
        ROMANIZATIONS: ROMANIZATIONS,
        TO_KANA_METHODS: TO_KANA_METHODS,
        VERSION: VERSION,
        bind: bind,
        isHiragana: isHiragana,
        isJapanese: isJapanese,
        isKana: isKana,
        isKanji: isKanji,
        isKatakana: isKatakana,
        isMixed: isMixed,
        isRomaji: isRomaji,
        stripOkurigana: stripOkurigana,
        toHiragana: toHiragana,
        toKana: toKana,
        toKatakana: toKatakana,
        toRomaji: toRomaji,
        tokenize: tokenize,
        unbind: unbind
    });

    /* src\components\Toggle.svelte generated by Svelte v3.59.2 */

    const file$2 = "src\\components\\Toggle.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (56:0) {:else}
    function create_else_block$2(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let each_value = /*options*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*label*/ ctx[1]);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "legend");
    			attr_dev(div0, "id", `label-${/*uniqueID*/ ctx[6]}`);
    			add_location(div0, file$2, 62, 4, 1806);
    			attr_dev(div1, "role", "radiogroup");
    			attr_dev(div1, "class", "group-container svelte-ssa65k");
    			attr_dev(div1, "aria-labelledby", `label-${/*uniqueID*/ ctx[6]}`);
    			set_style(div1, "font-size", /*fontSize*/ ctx[4] + "px");
    			attr_dev(div1, "id", `group-${/*uniqueID*/ ctx[6]}`);
    			add_location(div1, file$2, 57, 4, 1634);
    			attr_dev(div2, "class", "s s--multi svelte-ssa65k");
    			add_location(div2, file$2, 56, 0, 1604);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 2) set_data_dev(t0, /*label*/ ctx[1]);

    			if (dirty & /*options, uniqueID, value*/ 73) {
    				each_value = /*options*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*fontSize*/ 16) {
    				set_style(div1, "font-size", /*fontSize*/ ctx[4] + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(56:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (46:29) 
    function create_if_block_1$1(ctx) {
    	let div;
    	let span;
    	let t0;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(/*label*/ ctx[1]);
    			t1 = space();
    			button = element("button");
    			attr_dev(span, "id", `switch-${/*uniqueID*/ ctx[6]}`);
    			add_location(span, file$2, 47, 4, 1375);
    			attr_dev(button, "role", "switch");
    			attr_dev(button, "aria-checked", /*checked*/ ctx[5]);
    			attr_dev(button, "aria-labelledby", `switch-${/*uniqueID*/ ctx[6]}`);
    			attr_dev(button, "class", "svelte-ssa65k");
    			add_location(button, file$2, 48, 4, 1427);
    			attr_dev(div, "class", "s s--slider svelte-ssa65k");
    			set_style(div, "font-size", /*fontSize*/ ctx[4] + "px");
    			add_location(div, file$2, 46, 0, 1313);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleClick*/ ctx[7], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 2) set_data_dev(t0, /*label*/ ctx[1]);

    			if (dirty & /*checked*/ 32) {
    				attr_dev(button, "aria-checked", /*checked*/ ctx[5]);
    			}

    			if (dirty & /*fontSize*/ 16) {
    				set_style(div, "font-size", /*fontSize*/ ctx[4] + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(46:29) ",
    		ctx
    	});

    	return block;
    }

    // (34:0) {#if design == 'inner'}
    function create_if_block$2(ctx) {
    	let div;
    	let span0;
    	let t0;
    	let t1;
    	let button;
    	let span1;
    	let t3;
    	let span2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(/*label*/ ctx[1]);
    			t1 = space();
    			button = element("button");
    			span1 = element("span");
    			span1.textContent = "on";
    			t3 = space();
    			span2 = element("span");
    			span2.textContent = "off";
    			attr_dev(span0, "id", `switch-${/*uniqueID*/ ctx[6]}`);
    			attr_dev(span0, "class", "svelte-ssa65k");
    			add_location(span0, file$2, 35, 4, 1003);
    			attr_dev(span1, "class", "svelte-ssa65k");
    			add_location(span1, file$2, 41, 12, 1212);
    			attr_dev(span2, "class", "svelte-ssa65k");
    			add_location(span2, file$2, 42, 12, 1241);
    			attr_dev(button, "role", "switch");
    			attr_dev(button, "aria-checked", /*checked*/ ctx[5]);
    			attr_dev(button, "aria-labelledby", `switch-${/*uniqueID*/ ctx[6]}`);
    			attr_dev(button, "class", "svelte-ssa65k");
    			add_location(button, file$2, 36, 4, 1055);
    			attr_dev(div, "class", "s s--inner svelte-ssa65k");
    			add_location(div, file$2, 34, 0, 973);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(div, t1);
    			append_dev(div, button);
    			append_dev(button, span1);
    			append_dev(button, t3);
    			append_dev(button, span2);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleClick*/ ctx[7], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 2) set_data_dev(t0, /*label*/ ctx[1]);

    			if (dirty & /*checked*/ 32) {
    				attr_dev(button, "aria-checked", /*checked*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(34:0) {#if design == 'inner'}",
    		ctx
    	});

    	return block;
    }

    // (64:8) {#each options as option}
    function create_each_block$1(ctx) {
    	let input;
    	let input_id_value;
    	let input_value_value;
    	let value_has_changed = false;
    	let t0;
    	let label_1;
    	let t1_value = /*option*/ ctx[11] + "";
    	let t1;
    	let t2;
    	let label_1_for_value;
    	let binding_group;
    	let mounted;
    	let dispose;
    	binding_group = init_binding_group(/*$$binding_groups*/ ctx[9][0]);

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			label_1 = element("label");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "radio");
    			attr_dev(input, "id", input_id_value = `${/*option*/ ctx[11]}-${/*uniqueID*/ ctx[6]}`);
    			input.__value = input_value_value = /*option*/ ctx[11];
    			input.value = input.__value;
    			attr_dev(input, "class", "svelte-ssa65k");
    			add_location(input, file$2, 64, 12, 1913);
    			attr_dev(label_1, "for", label_1_for_value = `${/*option*/ ctx[11]}-${/*uniqueID*/ ctx[6]}`);
    			attr_dev(label_1, "class", "svelte-ssa65k");
    			add_location(label_1, file$2, 65, 12, 2010);
    			binding_group.p(input);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			input.checked = input.__value === /*value*/ ctx[0];
    			insert_dev(target, t0, anchor);
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, t1);
    			append_dev(label_1, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 8 && input_id_value !== (input_id_value = `${/*option*/ ctx[11]}-${/*uniqueID*/ ctx[6]}`)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*options*/ 8 && input_value_value !== (input_value_value = /*option*/ ctx[11])) {
    				prop_dev(input, "__value", input_value_value);
    				input.value = input.__value;
    				value_has_changed = true;
    			}

    			if (value_has_changed || dirty & /*value, options*/ 9) {
    				input.checked = input.__value === /*value*/ ctx[0];
    			}

    			if (dirty & /*options*/ 8 && t1_value !== (t1_value = /*option*/ ctx[11] + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*options*/ 8 && label_1_for_value !== (label_1_for_value = `${/*option*/ ctx[11]}-${/*uniqueID*/ ctx[6]}`)) {
    				attr_dev(label_1, "for", label_1_for_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(label_1);
    			binding_group.r();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(64:8) {#each options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*design*/ ctx[2] == 'inner') return create_if_block$2;
    		if (/*design*/ ctx[2] == 'slider') return create_if_block_1$1;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Toggle', slots, []);
    	let { label } = $$props;
    	let { design = 'inner label' } = $$props;
    	let { options = [] } = $$props;
    	let { fontSize = 16 } = $$props;
    	let { value = 'on' } = $$props;
    	let checked = false;
    	const uniqueID = Math.floor(Math.random() * 100);

    	function handleClick(event) {
    		const target = event.target;
    		const state = target.getAttribute('aria-checked');
    		$$invalidate(5, checked = state === 'true' ? false : true);
    		$$invalidate(0, value = checked === true ? true : false);
    	}

    	const slugify = (str = "") => str.toLowerCase().replace(/ /g, "-").replace(/\./g, "");

    	$$self.$$.on_mount.push(function () {
    		if (label === undefined && !('label' in $$props || $$self.$$.bound[$$self.$$.props['label']])) {
    			console.warn("<Toggle> was created without expected prop 'label'");
    		}
    	});

    	const writable_props = ['label', 'design', 'options', 'fontSize', 'value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Toggle> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		value = this.__value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('label' in $$props) $$invalidate(1, label = $$props.label);
    		if ('design' in $$props) $$invalidate(2, design = $$props.design);
    		if ('options' in $$props) $$invalidate(3, options = $$props.options);
    		if ('fontSize' in $$props) $$invalidate(4, fontSize = $$props.fontSize);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		label,
    		design,
    		options,
    		fontSize,
    		value,
    		checked,
    		uniqueID,
    		handleClick,
    		slugify
    	});

    	$$self.$inject_state = $$props => {
    		if ('label' in $$props) $$invalidate(1, label = $$props.label);
    		if ('design' in $$props) $$invalidate(2, design = $$props.design);
    		if ('options' in $$props) $$invalidate(3, options = $$props.options);
    		if ('fontSize' in $$props) $$invalidate(4, fontSize = $$props.fontSize);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('checked' in $$props) $$invalidate(5, checked = $$props.checked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		label,
    		design,
    		options,
    		fontSize,
    		checked,
    		uniqueID,
    		handleClick,
    		input_change_handler,
    		$$binding_groups
    	];
    }

    class Toggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			label: 1,
    			design: 2,
    			options: 3,
    			fontSize: 4,
    			value: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toggle",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get label() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get design() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set design(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fontSize() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fontSize(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\PracticeInput.svelte generated by Svelte v3.59.2 */

    const { Error: Error_1, console: console_1$1 } = globals;
    const file$1 = "src\\components\\PracticeInput.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i].id;
    	child_ctx[12] = list[i].question;
    	child_ctx[13] = list[i].tokenized_question;
    	child_ctx[14] = list[i].answer;
    	child_ctx[15] = list[i].solution;
    	child_ctx[16] = list[i].score;
    	child_ctx[17] = list;
    	child_ctx[18] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i].surface_form;
    	child_ctx[20] = list[i].reading;
    	return child_ctx;
    }

    // (188:16) {:else}
    function create_else_block$1(ctx) {
    	let ruby;
    	let t_value = /*surface_form*/ ctx[19] + "";
    	let t;

    	const block = {
    		c: function create() {
    			ruby = element("ruby");
    			t = text(t_value);
    			attr_dev(ruby, "class", "svelte-b6xhbc");
    			add_location(ruby, file$1, 188, 20, 5832);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ruby, anchor);
    			append_dev(ruby, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*translations*/ 1 && t_value !== (t_value = /*surface_form*/ ctx[19] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ruby);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(188:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (184:16) {#if tokenShouldShowFurigana(surface_form) && showFurigana}
    function create_if_block$1(ctx) {
    	let ruby;
    	let t0_value = /*surface_form*/ ctx[19] + "";
    	let t0;
    	let rt;
    	let t1_value = /*reading*/ ctx[20] + "";
    	let t1;

    	const block = {
    		c: function create() {
    			ruby = element("ruby");
    			t0 = text(t0_value);
    			rt = element("rt");
    			t1 = text(t1_value);
    			add_location(rt, file$1, 185, 38, 5738);
    			attr_dev(ruby, "class", "svelte-b6xhbc");
    			add_location(ruby, file$1, 184, 20, 5692);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ruby, anchor);
    			append_dev(ruby, t0);
    			append_dev(ruby, rt);
    			append_dev(rt, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*translations*/ 1 && t0_value !== (t0_value = /*surface_form*/ ctx[19] + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*translations*/ 1 && t1_value !== (t1_value = /*reading*/ ctx[20] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ruby);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(184:16) {#if tokenShouldShowFurigana(surface_form) && showFurigana}",
    		ctx
    	});

    	return block;
    }

    // (183:12) {#each tokenized_question as { surface_form, reading }}
    function create_each_block_1(ctx) {
    	let show_if;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*translations, showFurigana*/ 9) show_if = null;
    		if (show_if == null) show_if = !!(/*tokenShouldShowFurigana*/ ctx[7](/*surface_form*/ ctx[19]) && /*showFurigana*/ ctx[3]);
    		if (show_if) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(183:12) {#each tokenized_question as { surface_form, reading }}",
    		ctx
    	});

    	return block;
    }

    // (181:4) {#each translations.sentence_pairs as { id, question, tokenized_question, answer, solution, score }}
    function create_each_block(ctx) {
    	let div1;
    	let t0;
    	let input;
    	let t1;
    	let div0;
    	let p0;
    	let t2;
    	let t3_value = /*solution*/ ctx[15] + "";
    	let t3;
    	let t4;
    	let p1;
    	let t5;
    	let t6_value = /*score*/ ctx[16] + "";
    	let t6;
    	let t7;
    	let div0_class_value;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*tokenized_question*/ ctx[13];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[9].call(input, /*each_value*/ ctx[17], /*each_index*/ ctx[18]);
    	}

    	function input_handler(...args) {
    		return /*input_handler*/ ctx[10](/*id*/ ctx[11], ...args);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			input = element("input");
    			t1 = space();
    			div0 = element("div");
    			p0 = element("p");
    			t2 = text("Solution: ");
    			t3 = text(t3_value);
    			t4 = space();
    			p1 = element("p");
    			t5 = text("Score: ");
    			t6 = text(t6_value);
    			t7 = text("/5");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "答え。。。");
    			attr_dev(input, "class", "svelte-b6xhbc");
    			add_location(input, file$1, 193, 12, 5965);
    			attr_dev(p0, "class", "svelte-b6xhbc");
    			add_location(p0, file$1, 195, 16, 6166);
    			attr_dev(p1, "class", "svelte-b6xhbc");
    			add_location(p1, file$1, 196, 16, 6211);
    			attr_dev(div0, "class", div0_class_value = "solution-container " + (/*showSolution*/ ctx[2] ? 'is-shown' : '') + " svelte-b6xhbc");
    			add_location(div0, file$1, 194, 12, 6083);
    			attr_dev(div1, "class", "question svelte-b6xhbc");
    			add_location(div1, file$1, 181, 8, 5502);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			append_dev(div1, t0);
    			append_dev(div1, input);
    			set_input_value(input, /*answer*/ ctx[14]);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(div0, t4);
    			append_dev(div0, p1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(p1, t7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", input_input_handler),
    					listen_dev(input, "input", input_handler, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*translations, tokenShouldShowFurigana, showFurigana*/ 137) {
    				each_value_1 = /*tokenized_question*/ ctx[13];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*translations*/ 1 && input.value !== /*answer*/ ctx[14]) {
    				set_input_value(input, /*answer*/ ctx[14]);
    			}

    			if (dirty & /*translations*/ 1 && t3_value !== (t3_value = /*solution*/ ctx[15] + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*translations*/ 1 && t6_value !== (t6_value = /*score*/ ctx[16] + "")) set_data_dev(t6, t6_value);

    			if (dirty & /*showSolution*/ 4 && div0_class_value !== (div0_class_value = "solution-container " + (/*showSolution*/ ctx[2] ? 'is-shown' : '') + " svelte-b6xhbc")) {
    				attr_dev(div0, "class", div0_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(181:4) {#each translations.sentence_pairs as { id, question, tokenized_question, answer, solution, score }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div3;
    	let h1;
    	let t1;
    	let div0;
    	let h2;
    	let t3;
    	let toggle;
    	let updating_value;
    	let t4;
    	let button0;
    	let t5;
    	let t6;
    	let div2;
    	let button1;
    	let t7;
    	let div1;
    	let t8;
    	let error;
    	let div2_class_value;
    	let div3_class_value;
    	let current;

    	function toggle_value_binding(value) {
    		/*toggle_value_binding*/ ctx[8](value);
    	}

    	let toggle_props = { label: "Furigana", design: "slider" };

    	if (/*showFurigana*/ ctx[3] !== void 0) {
    		toggle_props.value = /*showFurigana*/ ctx[3];
    	}

    	toggle = new Toggle({ props: toggle_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(toggle, 'value', toggle_value_binding));

    	button0 = new Button({
    			props: { style: "retry", text: "更新" },
    			$$inline: true
    		});

    	button0.$on("click", handleRefreshQuestions);
    	let each_value = /*translations*/ ctx[0].sentence_pairs;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	button1 = new Button({
    			props: {
    				text: "確認",
    				disabled: /*isMarking*/ ctx[1]
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*handleMark*/ ctx[6]);

    	error = new Error$1({
    			props: { showError: /*showError*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			h1 = element("h1");
    			h1.textContent = "練習しましょう";
    			t1 = space();
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "下一つ一つの文を翻訳して答えを入力してください。";
    			t3 = space();
    			create_component(toggle.$$.fragment);
    			t4 = space();
    			create_component(button0.$$.fragment);
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			div2 = element("div");
    			create_component(button1.$$.fragment);
    			t7 = space();
    			div1 = element("div");
    			t8 = space();
    			create_component(error.$$.fragment);
    			attr_dev(h1, "class", "svelte-b6xhbc");
    			add_location(h1, file$1, 174, 4, 5123);
    			attr_dev(h2, "class", "svelte-b6xhbc");
    			add_location(h2, file$1, 176, 8, 5185);
    			attr_dev(div0, "class", "header-container svelte-b6xhbc");
    			add_location(div0, file$1, 175, 4, 5145);
    			attr_dev(div1, "class", "loading-icon svelte-b6xhbc");
    			add_location(div1, file$1, 202, 8, 6433);
    			attr_dev(div2, "class", div2_class_value = "button-container " + (/*isMarking*/ ctx[1] ? 'is-marking' : '') + " svelte-b6xhbc");
    			add_location(div2, file$1, 200, 4, 6289);
    			attr_dev(div3, "class", div3_class_value = "container " + (/*isMarking*/ ctx[1] ? 'is-marking' : '') + " svelte-b6xhbc");
    			add_location(div3, file$1, 173, 0, 5062);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, h1);
    			append_dev(div3, t1);
    			append_dev(div3, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t3);
    			mount_component(toggle, div0, null);
    			append_dev(div0, t4);
    			mount_component(button0, div0, null);
    			append_dev(div3, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div3, null);
    				}
    			}

    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			mount_component(button1, div2, null);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div2, t8);
    			mount_component(error, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const toggle_changes = {};

    			if (!updating_value && dirty & /*showFurigana*/ 8) {
    				updating_value = true;
    				toggle_changes.value = /*showFurigana*/ ctx[3];
    				add_flush_callback(() => updating_value = false);
    			}

    			toggle.$set(toggle_changes);

    			if (dirty & /*showSolution, translations, handleInput, tokenShouldShowFurigana, showFurigana*/ 173) {
    				each_value = /*translations*/ ctx[0].sentence_pairs;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, t6);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const button1_changes = {};
    			if (dirty & /*isMarking*/ 2) button1_changes.disabled = /*isMarking*/ ctx[1];
    			button1.$set(button1_changes);
    			const error_changes = {};
    			if (dirty & /*showError*/ 16) error_changes.showError = /*showError*/ ctx[4];
    			error.$set(error_changes);

    			if (!current || dirty & /*isMarking*/ 2 && div2_class_value !== (div2_class_value = "button-container " + (/*isMarking*/ ctx[1] ? 'is-marking' : '') + " svelte-b6xhbc")) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!current || dirty & /*isMarking*/ 2 && div3_class_value !== (div3_class_value = "container " + (/*isMarking*/ ctx[1] ? 'is-marking' : '') + " svelte-b6xhbc")) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(error.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggle.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(error.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(toggle);
    			destroy_component(button0);
    			destroy_each(each_blocks, detaching);
    			destroy_component(button1);
    			destroy_component(error);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handleRefreshQuestions() {
    	window.location.reload();
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PracticeInput', slots, []);
    	let { translations = [] } = $$props;

    	// Reactive variable for loading state
    	let isMarking = false;

    	let showSolution = false;
    	let showFurigana = false;
    	let showError = false;

    	// A function to handle the input event
    	function handleInput(event, id) {
    		// Find the sentence pair by id
    		const pair = translations.sentence_pairs.find(p => p.id === id);

    		if (pair) {
    			pair.answer = event.target.value; // Update the answer property
    		}

    		const nextPairs = translations.sentence_pairs.map(p => {
    			if (p.id == pair.id) {
    				return { ...p, answer: pair.answer };
    			} else {
    				return p;
    			}
    		});

    		$$invalidate(0, translations.sentence_pairs = nextPairs, translations);
    	}

    	async function handleMark() {
    		$$invalidate(4, showError = false);
    		$$invalidate(1, isMarking = true);

    		try {
    			const markedTranslations = await getTranslationMark(translations);
    			$$invalidate(0, translations = markedTranslations);
    			$$invalidate(2, showSolution = true);
    		} catch(error) {
    			console.error('Error fetching data:', error);
    			$$invalidate(4, showError = true);
    		}

    		$$invalidate(1, isMarking = false);
    	}

    	function tokenShouldShowFurigana(token) {
    		for (const char of token) {
    			if (isKanji(char)) {
    				return true;
    			}
    		}

    		return false;
    	}

    	const writable_props = ['translations'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<PracticeInput> was created with unknown prop '${key}'`);
    	});

    	function toggle_value_binding(value) {
    		showFurigana = value;
    		$$invalidate(3, showFurigana);
    	}

    	function input_input_handler(each_value, each_index) {
    		each_value[each_index].answer = this.value;
    		$$invalidate(0, translations);
    	}

    	const input_handler = (id, event) => handleInput(event, id);

    	$$self.$$set = $$props => {
    		if ('translations' in $$props) $$invalidate(0, translations = $$props.translations);
    	};

    	$$self.$capture_state = () => ({
    		getTranslationMark,
    		wanakana,
    		Button,
    		Toggle,
    		Error: Error$1,
    		translations,
    		isMarking,
    		showSolution,
    		showFurigana,
    		showError,
    		handleInput,
    		handleMark,
    		handleRefreshQuestions,
    		tokenShouldShowFurigana
    	});

    	$$self.$inject_state = $$props => {
    		if ('translations' in $$props) $$invalidate(0, translations = $$props.translations);
    		if ('isMarking' in $$props) $$invalidate(1, isMarking = $$props.isMarking);
    		if ('showSolution' in $$props) $$invalidate(2, showSolution = $$props.showSolution);
    		if ('showFurigana' in $$props) $$invalidate(3, showFurigana = $$props.showFurigana);
    		if ('showError' in $$props) $$invalidate(4, showError = $$props.showError);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		translations,
    		isMarking,
    		showSolution,
    		showFurigana,
    		showError,
    		handleInput,
    		handleMark,
    		tokenShouldShowFurigana,
    		toggle_value_binding,
    		input_input_handler,
    		input_handler
    	];
    }

    class PracticeInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { translations: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PracticeInput",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get translations() {
    		throw new Error_1("<PracticeInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set translations(value) {
    		throw new Error_1("<PracticeInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\PracticeTranslation.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file = "src\\pages\\PracticeTranslation.svelte";

    // (121:4) {:else}
    function create_else_block(ctx) {
    	let button;
    	let t;
    	let practiceinput;
    	let current;

    	button = new Button({
    			props: { style: "logout", text: "ログアウト" },
    			$$inline: true
    		});

    	button.$on("click", /*handleLogOut*/ ctx[2]);

    	practiceinput = new PracticeInput({
    			props: { translations: /*data*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    			t = space();
    			create_component(practiceinput.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(practiceinput, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const practiceinput_changes = {};
    			if (dirty & /*data*/ 1) practiceinput_changes.translations = /*data*/ ctx[0];
    			practiceinput.$set(practiceinput_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			transition_in(practiceinput.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(practiceinput.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(practiceinput, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(121:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (118:28) 
    function create_if_block_1(ctx) {
    	let loading;
    	let current;
    	loading = new Loading({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loading.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loading, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loading.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loading.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loading, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(118:28) ",
    		ctx
    	});

    	return block;
    }

    // (109:4) {#if error}
    function create_if_block(ctx) {
    	let div1;
    	let h1;
    	let t1;
    	let div0;
    	let button0;
    	let t2;
    	let button1;
    	let current;
    	button0 = new Button({ props: { text: "リトライ" }, $$inline: true });
    	button0.$on("click", reloadPage);

    	button1 = new Button({
    			props: { style: "error", text: "ログアウト" },
    			$$inline: true
    		});

    	button1.$on("click", /*handleLogOut*/ ctx[2]);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "An error has occurred.";
    			t1 = space();
    			div0 = element("div");
    			create_component(button0.$$.fragment);
    			t2 = space();
    			create_component(button1.$$.fragment);
    			attr_dev(h1, "class", "svelte-paxoy3");
    			add_location(h1, file, 111, 12, 3700);
    			attr_dev(div0, "class", "button-container svelte-paxoy3");
    			add_location(div0, file, 112, 12, 3745);
    			add_location(div1, file, 110, 8, 3681);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			mount_component(button0, div0, null);
    			append_dev(div0, t2);
    			mount_component(button1, div0, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(109:4) {#if error}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*error*/ ctx[1]) return 0;
    		if (/*data*/ ctx[0] === null) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			add_location(main, file, 107, 0, 3619);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(main, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function reloadPage() {
    	window.location.reload();
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PracticeTranslation', slots, []);
    	let data = null;
    	let error = false;

    	onMount(async () => {
    		if (typeof window !== 'undefined') {
    			if (!isTokenPresentAndValid()) {
    				navigate('/');
    			}
    		}

    		// Async load tokenizer
    		const tokenizer = await new Promise((resolve, reject) => {
    				kuromoji.builder({ dicPath: "/dict/" }).build((err, builtTokenizer) => {
    					if (err) {
    						reject(err);
    					} else {
    						resolve(builtTokenizer);
    					}
    				});
    			});

    		try {
    			//data = await getTranslationQuestion();
    			$$invalidate(0, data = {
    				id: "123123123123123",
    				uid: "",
    				user: null,
    				sentence_pairs: [
    					{
    						id: "12345",
    						question: "彼が部屋に入ってきた時、私はテレビを見ていたわけではなく、ラジオを聴いていた。彼が部屋に入ってきた時、私はテレビを見ていたわけではなく、ラジオを聴いていた。彼が部屋に入ってきた時、私はテレビを見ていたわけではなく、ラジオを聴いていた。",
    						answer: "",
    						solution: "",
    						score: 0
    					},
    					{
    						id: "123456",
    						question: "この小説は直訳すると意味がよくわからないが、読み手が感じたことを大切にすれば、非常に面白い作品であるといえる。",
    						answer: "",
    						solution: "",
    						score: 0
    					},
    					{
    						id: "1234567",
    						question: "私が知りたいことは、あなたがその問題を解決するために何を考えているか、そして具体的にどのような行動を取るつもりなのかです。",
    						answer: "",
    						solution: "",
    						score: 0
    					}
    				],
    				language: "Japanese"
    			});

    			let tokenized_sentence_pairs = [];

    			for (let pair of data.sentence_pairs) {
    				let tokenized_question = tokenizer.tokenize(pair.question);

    				// Convert reading strings of each kanji to hiragana, for some reason they're set to katakana?
    				for (let token of tokenized_question) {
    					let hiragana_reading = toHiragana(token.reading);
    					token.reading = hiragana_reading;
    				}

    				pair.tokenized_question = tokenized_question;
    				tokenized_sentence_pairs.push(pair);
    			}

    			$$invalidate(0, data.sentence_pairs = tokenized_sentence_pairs, data);
    		} catch(e) {
    			console.error('Error fetching translation question:', e);
    			$$invalidate(1, error = true);
    		}
    	});

    	function handleLogOut() {
    		localStorage.removeItem('jwt_token');
    		localStorage.removeItem('uid');
    		navigate('/');
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<PracticeTranslation> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		getTranslationQuestion,
    		Button,
    		Loading,
    		PracticeInput,
    		navigate,
    		isTokenPresentAndValid,
    		wanakana,
    		data,
    		error,
    		reloadPage,
    		handleLogOut
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('error' in $$props) $$invalidate(1, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, error, handleLogOut];
    }

    class PracticeTranslation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PracticeTranslation",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.59.2 */

    // (9:0) <Router>
    function create_default_slot(ctx) {
    	let route0;
    	let t;
    	let route1;
    	let current;

    	route0 = new Route({
    			props: { path: "/", component: Home },
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/practice",
    				component: PracticeTranslation
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t = space();
    			create_component(route1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(route1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(route1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(9:0) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Router, Route, Home, PracticeTranslation });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
