/* Uncommit for caching to work

const CACHE_NAME = 'UCD cache';


self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Opened cache', CACHE_NAME);
            return cache.addAll([
                '/html/students.html',
                '/html/dashboard.html',
                '/html/tasks.html',
                '/css/students.css',
                '/css/bootstrap.min.css',
                '/css/headerStyles.css',
                '/js/students.js',
                '/js/bootstrap.bundle.min.js',
                '/manifest.json',
                '/img/UserIcon.png',
                '/img/UserIcon2.png',
                '/img/add-user.png',
                '/img/DeleteStudent.png',
                '/img/EditStudent.png',
                '/img/NotificationBell.png',
            ]);
        })
    );
});



self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response;
                }

                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function(response) {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

*/