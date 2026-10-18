/**
 * @license
 * Copyright 2013 The Emscripten Authors
 * SPDX-License-Identifier: MIT
 */

addToLibrary({
  $SocketEvents: {
    callbacks: {},
    on(event, callback) {
      SocketEvents.callbacks[event] = callback;
    },
    emit(event, value) {
      SocketEvents.callbacks[event]?.(value);
    },
  },
  /*
   * Mechanism to register handlers for the various Socket Events from C code.
   * The registration functions are mostly variations on a theme, so we use this
   * generic handler. Most of the callback functions take a file descriptor as a
   * parameter, which will get passed to them by the emitting call. The error
   * callback also takes an int representing the errno and a char* representing the
   * error message, which we extract from the data passed to _callback and convert
   * to a char* string before calling the registered C callback.
   * Passing a NULL callback function to a emscripten_set_socket_*_callback call
   * will deregister the callback registered for that Event.
   */
  $_setNetworkCallback__deps: ['$SocketEvents', '$withStackSave', '$callUserCallback', '$stringToUTF8OnStack'],
  $_setNetworkCallback: (event, userData, callback) => {
    function _callback(data) {
      callUserCallback(() => {
        if (event === 'error') {
          withStackSave(() => {
            var msg = stringToUTF8OnStack(data[2]);
            {{{ makeDynCall('viipp', 'callback') }}}(data[0], data[1], msg, userData);
          });
        } else {
          {{{ makeDynCall('vip', 'callback') }}}(data, userData);
        }
      });
    };

    // FIXME(sbc): This has no corresponding Pop so will currently keep the
    // runtime alive indefinitely.
    {{{ runtimeKeepalivePush() }}}
    SocketEvents.on(event, callback ? _callback : null);
  },
  emscripten_set_socket_error_callback__deps: ['$_setNetworkCallback'],
  emscripten_set_socket_error_callback: (userData, callback) =>
    _setNetworkCallback('error', userData, callback),
  emscripten_set_socket_open_callback__deps: ['$_setNetworkCallback'],
  emscripten_set_socket_open_callback: (userData, callback) =>
    _setNetworkCallback('open', userData, callback),
  emscripten_set_socket_listen_callback__deps: ['$_setNetworkCallback'],
  emscripten_set_socket_listen_callback: (userData, callback) =>
    _setNetworkCallback('listen', userData, callback),
  emscripten_set_socket_connection_callback__deps: ['$_setNetworkCallback'],
  emscripten_set_socket_connection_callback: (userData, callback) =>
    _setNetworkCallback('connection', userData, callback),
  emscripten_set_socket_message_callback__deps: ['$_setNetworkCallback'],
  emscripten_set_socket_message_callback: (userData, callback) =>
    _setNetworkCallback('message', userData, callback),
  emscripten_set_socket_close_callback__deps: ['$_setNetworkCallback'],
  emscripten_set_socket_close_callback: (userData, callback) =>
    _setNetworkCallback('close', userData, callback),
});
