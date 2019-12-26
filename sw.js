importScripts("/js/workbox-sw.js");

if (workbox){
	console.log("Workbox berhasil dimuat.");
	workbox.precaching.precacheAndRoute([
		{ url: "/", revision: "1" },

		{ url: "/css/main.css", revision: "1" },
		{ url: "/css/materialize.min.css", revision: "1" },

		{ url: "/fonts/AirbnbCereal-Bold.ttf", revision: "1" },
		{ url: "/fonts/AirbnbCereal-Book.ttf", revision: "1" },
		{ url: "/fonts/MaterialIcons-Regular.ttf", revision: "1" },

		{ url: "/img/icon-192.png", revision: "1" },
		{ url: "/img/icon-512.png", revision: "1" },

		{ url: "/js/api.js", revision: "1" },
		{ url: "/js/functions.js", revision: "1" },
		{ url: "/js/idb.js", revision: "1" },
		{ url: "/js/main.js", revision: "1" },
		{ url: "/js/materialize.min.js", revision: "1" },
		{ url: "/js/workbox-sw.js", revision: "1" },

		{ url: "/pages/about.html", revision: "1" },
		{ url: "/pages/favorite.html", revision: "1" },
		{ url: "/pages/home.html", revision: "1" },
		{ url: "/pages/teams.html", revision: "1" },

		{ url: "/shell/footer.html", revision: "1" },
		{ url: "/shell/nav.html", revision: "1" },

		{ url: "/index.html", revision: "1" },
		{ url: "/manifest.json", revision: "1" },
	]);


	workbox.routing.registerRoute(
		/.*(?:png|gif|jpg|jpeg|svg)$/,
		workbox.strategies.cacheFirst({
			cacheName: "image-cache",
			plugins: [
				new workbox.cacheableResponse.Plugin({
					statuses: [0, 200]
				}),
				new workbox.expiration.Plugin({
					maxEntries: 100,
					maxAgeSeconds: 30 * 24 * 60 * 60,
				}),
			]
		})
	);

	workbox.routing.registerRoute(
		new RegExp("https://api.football-data.org/v2/"),
		workbox.strategies.staleWhileRevalidate({
			cacheName: "api-cache",
			plugins: [
				new workbox.cacheableResponse.Plugin({
					statuses: [0, 200]
				}),
				new workbox.expiration.Plugin({
					maxEntries: 100,
					maxAgeSeconds: 30 * 24 * 60 * 60,
				}),
			]
		})
	);
	
} else {
	console.error("Workbox gagal dimuat.");
}

self.addEventListener('push', function(event) {
	let title = "BOKI - Info Sepak Bola";
	let body;

	if (event.data) {
		body = event.data.text();
	} else {
		body = 'Push message tanpa payload';
	}

	let options = {
		body: body,
		badge: '/img/icon-192.png',
		icon: '/img/icon-192.png',
		vibrate: [100, 50, 100],
		data: {
			dateOfArrival: Date.now(),
			primaryKey: 1
		}
	};

	event.waitUntil(
		self.registration.showNotification(title, options)
	);
});