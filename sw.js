// Must be unique so cache can be invalidated later
const CACHE_VERSION = 'perfv1';
const OFFLINE_PAGE = 'offline.html';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
        cache.addAll([
          './index.html',
          './lazyload.html',
          './skeleton.html',
          OFFLINE_PAGE
        ]);
      })
  );
});

// Use request as cache key
const fetchAndCache = request =>
  caches.open(CACHE_VERSION).then(cache =>
    fetch(request).then(response => {
      cache.put(request, response.clone());
      return response;
    })
  );


self.addEventListener('fetch', event => {
  // console.log(event.request);
  event.respondWith(
    caches
      .match(event.request)
      .then(data => {
        if (data) {
          console.log('Found cached data!', event.request);
          return data;
        }

        console.log('Fetching fresh data', event.request);
        // return fetch(event.request)
        return fetchAndCache(event.request);
      })
      .catch(() => {
        const url = new URL(event.request.url);

        if (url.pathname.match(/\.html$/)) {
          console.log(`Could not find ${url.pathname}`);
          return caches.match(OFFLINE_PAGE);
        }
      })
  );
});
