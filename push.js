var webPush = require('web-push');
 
const vapidKeys = {
	"publicKey": "BD85Gg9MW2X8CHEtcdEzZTx-aTZ9dNr4WeGoBAN6TykgSukltW8L4Ff0GFAk2eu9qXAPdUJGPF64SGEbIFtbyyQ",
	"privateKey": "4t8ALRr06qAc3savLyd6RJoB4Nng3T6Kh1xWnHgexhs"
};
 
webPush.setVapidDetails(
	'mailto:afarhansib@gmail.com',
	vapidKeys.publicKey,
	vapidKeys.privateKey
)

var pushSubscription = {
	"endpoint": "https://fcm.googleapis.com/fcm/send/cj0W4hKX-Ls:APA91bEKd88ju1mYZvi2F4nPIvqWBTzHnn_HMl0-AEOgmwtVLIKWyiFvUA-X3FHbLNetxHwtsv_Yfwf9iJ_EbmxvJejtalz3-dpl90ZLkjeqCFCxm43vKScobLFYE6UjjkfPy4ifTWZl",
	"keys": {
			"p256dh": "BE6+WmbRaP5YdCQuENqWUsjeH4pC4s3VMkaAEN3kobtfJUnG3IVQg53hNOxFi3nKEMVarNO4nnMCelhorPWIJ3w=",
			"auth": "DUz282CKNModfcZbDnXPUQ=="
	}
};

var payload = 'Selamat! Aplikasi Anda sudah dapat menerima push notifikasi!';
 
var options = {
	gcmAPIKey: '769226805395',
	TTL: 60
};

webPush.sendNotification(
	pushSubscription,
	payload,
	options
);