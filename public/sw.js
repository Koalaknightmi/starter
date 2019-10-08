'use strict';

importScripts('./js/lib/localforage.js');
// CODELAB: Update cache names any time any of the cached files change.
var v = 17;
var CACHE_NAME = 'static-cache-v'+v;
var DATA_CACHE_NAME = 'data-cache-v'+v;
var DATA_POSTS = 'post-catch-v1';
// CODELAB: Update cache names any time any of the cached files change.
var jsfiles = [
  "/js/bundles/leaderboard.bundle.js",
  "/js/bundles/main.bundle.js",
  "/js/bundles/nav.bundle.js",
  "/js/bundles/offline.bundle.js",
  /*"/js/bundles/scriptureportion.bundle.js",
  "/js/bundles/search.bundle.js",
  "/js/bundles/settings.bundle.js",
  "/js/bundles/onlinequizzing.bundle.js",
  "/js/bundles/typequiz.bundle.js",
  "/js/bundles/voicequiz.bundle.js"*/
];
var htmlfiles = [
  "/html/index.html",
  /*"/html/leaderboard.html",
  "/html/offline.html",
  "/html/scripture-portion.html",
  "/html/search.html",
  "/html/settings.html",
  "/html/onlinequizzing.html",
  "/html/typequizzing.html",
  "/html/voicequizzing.html",
  "/html/createquestion.html"*/
];
var  imgfiles = [
  /*"/images/NBQO logo.jpg",
  "/images/android-chrome-192x192.png",
  "/images/apple-touch-icon.png",
  "/images/avatar generic.png",
  "/images/favicon-16x16.png",
  "/images/favicon-32x32.png",
  "/images/favicon.ico",
  "/images/loading.gif",
  "/images/typequizzing logo.png",*/
]
var cssfiles = [
  /*"/css/leaderboard.css",
  "/css/scriptureport.css",
  "/css/search.css",*/
  "/css/style.css",/*
  "/css/onlinequizzing.css",
  "/css/typing-quizzing.css",
  "/css/user.css",
  "/css/voicequizzing.css"*/
]
var FILES_TO_CACHE = [
  '/'/*,
  '/gettext'*/
];
FILES_TO_CACHE = FILES_TO_CACHE.concat(cssfiles,imgfiles,jsfiles,htmlfiles)
self.addEventListener('install', function (evt) {
  console.log('[ServiceWorker] Install');
  // CODELAB: Precache static resources here.
  evt.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
    console.log('[ServiceWorker] Pre-caching offline files',FILES_TO_CACHE);
    return cache.addAll(FILES_TO_CACHE);
  }));
  self.skipWaiting();
});
self.addEventListener('activate', function (evt) {
  console.log('[ServiceWorker] Activate');
  // CODELAB: Remove previous cached data from disk.
  evt.waitUntil(caches.keys().then(function (keyList) {
    return Promise.all(keyList.map(function (key) {
      if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
        console.log('[ServiceWorker] Removing old cache', key);
        return caches.delete(key);
      }
    }));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function (evt) {
  if (evt.request.method === "POST") {
    console.log('[Service Worker] Fetch (url)', evt.request);
    //evt.respondWith(
    var req = evt.request;
    if (!navigator.onLine) {
      console.log('No network availability, enqueuing');
      return enqueue(req).then(function () {
        return new Response(null, {
          status: 202
        });
      });
    }
    console.log('%c Network available! Flushing queue.', "color:red");
    return flushQueue().then(function () {
      console.log("test")
      //return fetch(req);
   });
    //)
    return;
  }
  //console.log(evt.request.url);
  if (evt.request.url.includes('/leaderboardfetch')) {
    console.log('[Service Worker] Fetch (data)', evt.request.url);
    evt.respondWith(caches.open(DATA_CACHE_NAME).then(function (cache) {
      return fetch(evt.request).then(function (response) {
        // If the response was good, clone it and store it in the cache.
        if (response.status === 200) {
          cache.put(evt.request.url, response.clone());
        }
        return response;
      }).catch(function (err) {
        // Network request failed, try to get it from the cache.
        return cache.match(evt.request).catch(function () {
          return caches.open(CACHE_NAME).then(function (cache) {
            return cache.match('html/offline.html');
          });
        });
      });
    }));
    return;
  }
  if (evt.request.url.includes('/user/')) {
    console.log('[Service Worker] Fetch (data)', evt.request.url);
    evt.respondWith(caches.open(DATA_CACHE_NAME).then(function (cache) {
      return fetch(evt.request).then(function (response) {
        // If the response was good, clone it and store it in the cache.
        if (response.status === 200) {
          cache.put(evt.request.url, response.clone());
        }
        return response;
      }).catch(function (err) {
        return cache.match(evt.request).catch(function () {
          return caches.open(CACHE_NAME).then(function (cache) {
            return cache.match('html/offline.html');
          });
        });
      });
    }));
    return;
  }
  if (evt.request.method === "POST") {
   console.log(evt.request)
  }
  evt.respondWith(fetch(evt.request).catch(function () {
    return caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(evt.request).then(function (response) {
        return response || fetch(evt.request);
      });
    });
  }));
});
self.addEventListener('push', function (event) {
  console.log(event.data);
  var payload = event.data ? event.data.text() : 'no payload';
  var options = {
    body: payload,
    icon: "/images/NBQO logo.jpg",
    /*image: "https://cdn.glitch.com/project-avatar/cfc340a0-db08-47ab-ae0f-2f9aacd8294c.png?1559424076873",*/
    badge: "https://cdn.glitch.com/eb5b036c-82b3-497e-9d05-ce2a5a9d85e1%2Fimage%20(4).png?v=1560030827542",
    vibrate: [100, 100, 100, 200, 300, 100, 100, 100],
    sound: "https://cdn.glitch.com/cfc340a0-db08-47ab-ae0f-2f9aacd8294c%2Fnotif.mp3",
    /*actions: [
      {
        action: 'coffee-action',
        title: 'Coffee',
        icon: 'https://cdn.glitch.com/project-avatar/cfc340a0-db08-47ab-ae0f-2f9aacd8294c.png?1559424076873'
       },
      {
        action: 'doughnut-action',
        title: 'Doughnut',
        icon: 'https://cdn.glitch.com/project-avatar/cfc340a0-db08-47ab-ae0f-2f9aacd8294c.png?1559424076873'
       }
     ],*/
    tag: 'biblenotif'
  };
  event.waitUntil(self.registration.showNotification('bible quizzing', options));
});
self.addEventListener('notificationclick', function (event) {
  console.log(event);
  if (!event.action) {
    // Was a normal notification click
    console.log('Notification Click.');
    var urlToOpen = new URL("/", self.location.origin).href;
    var promiseChain = clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function (windowClients) {
      var matchingClient = null;
      console.log(windowClients);
      for (var i = 0; i < windowClients.length; i++) {
        var windowClient = windowClients[i];
        if (windowClient.url === urlToOpen) {
          matchingClient = windowClient;
          matchingClient.postMessage({
            message: 'Received a push message.',
            time: new Date().toString()
          });
          break;
        }
      }
      if (matchingClient) {
        event.notification.close();
        return matchingClient.focus();
      } else {
        event.notification.close();
        //return clients.openWindow(urlToOpen);
      }
    });
    event.waitUntil(promiseChain);
    return;
  }
  switch (event.action) {
    case 'coffee-action':
      console.log('User ❤️️\'s coffee.');
      break;
    case 'doughnut-action':
      console.log('User ❤️️\'s doughnuts.');
      break;
    default:
      console.log('Unknown action clicked: \'' + event.action + '\'');
      break;
  }
  event.notification.close();
});
/*
worker.broadcastMessage("hi there")*/
function enqueue(request) {
  return serialize(request).then(function (serialized) {
    localforage.getItem('queue').then(function (queue) {
      /* eslint no-param-reassign: 0 */
      queue = queue || [];
      queue.push(serialized);
      return localforage.setItem('queue', queue).then(function () {
        console.log(serialized.method, serialized.url, 'enqueued!');
      });
    });
  });
}
// Flush is a little more complicated. It consists of getting
// the elements of the queue in order and sending each one,
// keeping track of not yet sent request. Before sending a request
// we need to recreate it from the alternative representation
// stored in IndexedDB.
function flushQueue() {
  return localforage.getItem('queue').then(function (queue) {
    console.log(queue.length,queue)
    if (!queue.length) {
      return Promise.resolve();
    }
    console.log('Sending ', queue.length, ' requests...');
    return sendInOrder(queue).then(function () {
      return localforage.setItem('queue', []);
    });
  });
}
// Send the requests inside the queue in order. Waiting for the current before
// sending the next one.
function sendInOrder(requests) {
  // The `reduce()` chains one promise per serialized request, not allowing to
  // progress to the next one until completing the current.
  var sending = requests.reduce(function (prevPromise, serialized) {
    console.log('Sending', serialized.method, serialized.url);
    return prevPromise.then(function () {
      return deserialize(serialized).then(function (request) {
        return fetch(request);
      });
    });
  }, Promise.resolve());
  return sending;
}
function serialize(request) {
  var headers = {};
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = request.headers.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var entry = _step.value;

      headers[entry[0]] = entry[1];
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var serialized = {
    url: request.url,
    headers: headers,
    method: request.method,
    mode: request.mode,
    credentials: request.credentials,
    cache: request.cache,
    redirect: request.redirect,
    referrer: request.referrer
  };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return request.clone().text().then(function (body) {
      serialized.body = body;
      return Promise.resolve(serialized);
    });
  }
  return Promise.resolve(serialized);
}
function deserialize(data) {
  return Promise.resolve(new Request(data.url, data));
}