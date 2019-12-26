if ("serviceWorker" in navigator) {
	navigator.serviceWorker
		.register("/sw.js")
		.then(function() {
			console.log("Pendaftaran ServiceWorker berhasil!");
		})
		.catch(function(err) {
			console.error("Pendaftaran ServiceWorker gagal! Error: " + err);
		});
} else {
	console.log("Browser anda belum mendukung ServiceWorker.");
}

document.addEventListener("DOMContentLoaded", function() {
	let elems = document.querySelectorAll(".sidenav");
	M.Sidenav.init(elems);
	loadNav();
	loadFooter();
	let page = window.location.hash.substr(1);
	if (page === "") page = "home";
	loadPage(page);
	switch(page) {
		case "home":
			getStandings();
			break;
		case "teams":
			getTeams();
			break
		case "favorite":
			getFavTeams();
			break
		default:
	}
	reloadOnce();
});

/*Global Variable*/
let teamToDelete;
let teamData;