/*SERVICE WORKER*/
function requestPermission() {
	Notification.requestPermission().then(function (result) {
		if (result === "denied") {
			console.log("Fitur notifikasi tidak diizinkan.");
			return;
		} else if (result === "default") {
			console.error("Pengguna menutup dialog permintaan izin.");
			return;
		}      
		
		if (('PushManager' in window)) {
				navigator.serviceWorker.getRegistration().then(function(reg) {
					reg.pushManager.subscribe({
						userVisibleOnly: true,
						applicationServerKey: urlBase64ToUint8Array("BD85Gg9MW2X8CHEtcdEzZTx-aTZ9dNr4WeGoBAN6TykgSukltW8L4Ff0GFAk2eu9qXAPdUJGPF64SGEbIFtbyyQ")
					}).then(function (sub) {
						console.log('Berhasil melakukan subscribe dengan endpoint: ', sub.endpoint);
						console.log('Berhasil melakukan subscribe dengan p256dh key: ', btoa(String.fromCharCode.apply(
							null, new Uint8Array(sub.getKey('p256dh')))));
						console.log('Berhasil melakukan subscribe dengan auth key: ', btoa(String.fromCharCode.apply(
							null, new Uint8Array(sub.getKey('auth')))));
					}).catch(function (e) {
						console.error('Tidak dapat melakukan subscribe ', e);
					});
				});
			} 
	});
}
/*END SERVICE WORKER*/


/*PAGE OPERATION*/
function loadNav() {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState === 4) {
			if (this.status !== 200) return;

			document.querySelectorAll(".topnav, .sidenav").forEach(function(elm) {
				elm.innerHTML = xhttp.responseText;
			});

			document.querySelectorAll(".sidenav a, .topnav a").forEach(function(elm) {
				elm.addEventListener("click", function(event) {
					let sidenav = document.querySelector(".sidenav");
					M.Sidenav.getInstance(sidenav).close();

					page = event.target.getAttribute("href").substr(1);
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
				});
			});
		}
	};
	xhttp.open("GET", "/shell/nav.html", true);
	xhttp.send();
}

function loadFooter() {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState === 4) {
			if (this.status !== 200) return;
			document.querySelector("footer").innerHTML = xhttp.responseText;
		}
	};
	xhttp.open("GET", "/shell/footer.html", true);
	xhttp.send();
}

function loadPage(page) {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState === 4) {
			let content = document.querySelector("#body-content");
			if (this.status === 200) {
				content.innerHTML = xhttp.responseText;
			} else if (this.status === 404) {
				content.innerHTML = "<h1>Ups.. halaman tidak ditemukan :)</h1>";
			} else {
				content.innerHTML = "<h1>Ups.. halaman tidak dapat diakses.</h1>";
			}
		}
	};
	xhttp.open("GET", `/pages/${page}.html`, true);
	xhttp.send();
}
/*END PAGE OPERATION*/

/*HELPER*/
function urlBase64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
			.replace(/-/g, '+')
			.replace(/_/g, '/');
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

function isEmptyObject(obj) {
	var name;
	for (name in obj) {
		if (obj.hasOwnProperty(name)) {
			return false;
		}
	}
	return true;
}

function inArray(value,arr){
  var status = false;
 
  for(var i=0; i<arr.length; i++){
    var name = arr[i];
    if(name == value){
      status = true;
      break;
    }
  }

  return status;
}
/*END HELPER*/

/*FETCH API*/
function json(response) {
	return response.json();
}

function error(error) {
	console.error("Error from error() : " + error);
}

function reloadOnce() {
	if(window.localStorage) {
    if(!localStorage.getItem('reloaded')) {
      localStorage['reloaded'] = true;

      setTimeout(function() {
		    document.querySelector(".loading-spinner").style = "display: none";
	      document.querySelector(".loading-text").innerText = "Memuat selesai. Halaman di-reload.";
      }, 5000);
      setTimeout(function() {
	      location.reload(false);
	    }, 7000);
    } else {
    	document.getElementById("loading").classList.add("scale-out");
			requestPermission();
			getTeams(true);
    }
  }
}

function status(response) {
	if (response.status !== 200) {
		console.error("Error from status() : " + response.status);
		return Promise.reject(new Error(response.statusText));
	} else {
		return Promise.resolve(response);
	}
}

function getStandings() {
	if ('caches' in window) {
		caches.match(standing_url).then(function(response) {
			if (response) {
				response.json().then(function (data) {
					setTimeout(function() {
					  standingHtml(data);
					}, 1000)
				})
			}
		})
	}

	fetchApi(standing_url)
	.then(status)
	.then(json)
	.then(function(data) {
		standingHtml(data)   
	})
	.catch(error);
}

function getTeams(cache = false) {
	if ('caches' in window) {
		caches.match(teams_url).then(function(response) {
			if (response) {
				response.json().then(function (data) {
					setTimeout(function() {
						if(!cache) {
							teamsHtml(data)   
						}
					}, 1000)
				})
			}
		})
	}

	fetchApi(teams_url)
	.then(status)
	.then(json)
	.then(function(data) {
		if(!cache) {
			teamsHtml(data)   
		}
	})
	.catch(error);
}

function getFavTeams() {
	getFavTeamsDb().then(function(data) {
		setTimeout(function() {
			favTeamsHtml(data);
		}, 1000)
	})
}

function standingHtml(data){
	let content = '';
	let str = JSON.stringify(data).replace(/http:/g, 'https:');
	data = JSON.parse(str);
	content += `
		<div class="card">
			<div class="card-content">
				<span class="card-title">${data.competition.name}</span>
				<table class="responsive-table striped">
					<thead>
						<tr>
							<th class="center-align">Position</th>
							<th>Team</th>
							<th class="center-align">Played</th>
							<th class="center-align">Won</th>
							<th class="center-align">Draw</th>
							<th class="center-align">Lost</th>
							<th class="center-align">GF</th>
							<th class="center-align">GA</th>
							<th class="center-align">GD</th>
							<th class="center-align">Points</th>
						</tr>
					</thead>
					<tbody>
	`
	data.standings[0].table.forEach(function(team){
		content += `<tr>
		<td class="center-align">${team.position}</td>
		<td>
			<img class="responsive-img" width="20" height="20" src="${team.team.crestUrl}" style="vertical-align:middle">
			<span style="padding-left:10px;">${team.team.name}</span>
		</td>
		<td class="center-align">${team.playedGames}</td>
		<td class="center-align">${team.won}</td>
		<td class="center-align">${team.draw}</td>
		<td class="center-align">${team.lost}</td>
		<td class="center-align">${team.goalsFor}</td>
		<td class="center-align">${team.goalsAgainst}</td>
		<td class="center-align">${team.goalDifference}</td>
		<td class="center-align">${team.points}</td>
		</tr>
	`;
	})

	content += `
					</tbody>
				</table>
			</div>
		</div>
	`
	document.getElementById("standingContent").innerHTML = content;
}

function teamsHtml(data){
	let favId = [];
	getFavTeamsDb().then(function(data) {
		data.forEach(function(team, i) {
    	favId.push(team.id)
		})
	})
	let content = '';
	let str = JSON.stringify(data).replace(/http:/g, 'https:');
	data = JSON.parse(str);

	teamData = data;

	setTimeout(function() {
	data.teams.forEach(function(team){
		content += `
		<div class="card">
			<div class="card-content">
				<div class="row" style="margin-bottom:0">
					<div class="col s12 m5 center">
						<img style="width:60%" src="${team.crestUrl}">
					</div>
					<div class="col s12 m7">
						<h3>${team.name}</h3>
						<table class="striped">
							<tr>
								<th>Singkatan</th>
								<td>${team.tla}</td>
							</tr>
							<tr>
								<th>Negara</th>
								<td>${team.area.name}</td>
							</tr>
							<tr>
								<th>Tahun dibentuk</th>
								<td>${team.founded}</td>
							</tr>
							<tr>
								<th>Warna Tim</th>
								<td>${team.clubColors}</td>
							</tr>
							<tr>
								<th>Stadium</th>
								<td>${team.venue} <a target="_blank" href="https://www.google.com/search?q=${team.venue}"><i class="material-icons">open_in_new</i></a></td>
							</tr>
							<tr>
								<th>Website</th>
								<td><a href="${team.website}" target="_blank">${team.website}</a></td>
							</tr>
						</table>`;

		if(inArray(team.id, favId)) {
			content += `
						<a data-timid="${team.id}" class="waves-effect waves-light btn" style="float:right; margin-top:20px; background-color:#1b5e20; display:none;" onclick="addTeamBtn(${team.id})"><i class="material-icons left">favorite</i>Favorit</a>
						<button data-timid="${team.id}" class="btn waves-effect waves-light red" style="float:right; margin-top:20px;" onclick="deleteTeamBtn(${team.id},true);"><i class="material-icons left">delete</i>Hapus Favorit</button>
			`
		} else {
			content += `
						<a data-timid="${team.id}" class="waves-effect waves-light btn" style="float:right; margin-top:20px; background-color:#1b5e20" onclick="addTeamBtn(${team.id})"><i class="material-icons left">favorite</i>Favorit</a>
						<button data-timid="${team.id}" class="btn waves-effect waves-light red" style="float:right; margin-top:20px; display:none;" onclick="deleteTeamBtn(${team.id},true);"><i class="material-icons left">delete</i>Hapus Favorit</button>
			`
		}
		
		content += `
					</div>
				</div>
			</div>
		</div>
		`;
	})
	document.getElementById("teamList").innerHTML = content;
	}, 1000);
}

function favTeamsHtml(data){
	var elemModal = document.querySelectorAll('#modalHapus');
	var mModal = M.Modal.init(elemModal);
	let content = "";
	if(isEmptyObject(data)) {
		content = `<p class="center">Belum ada tim favorit.</p>`;
	} else {
		data.forEach(function(team){
			content += `
				<div class="card">
					<div class="card-content">
						<div class="row" style="margin-bottom:0">
							<div class="col s12 m5 center">
								<img style="width:60%" src="${team.crestUrl}">
							</div>
							<div class="col s12 m7">
								<h3>${team.name}</h3>
								<table class="striped">
									<tr>
										<th>Singkatan</th>
										<td>${team.tla}</td>
									</tr>
									<tr>
										<th>Negara</th>
										<td>${team.area.name}</td>
									</tr>
									<tr>
										<th>Tahun dibentuk</th>
										<td>${team.founded}</td>
									</tr>
									<tr>
										<th>Warna Tim</th>
										<td>${team.clubColors}</td>
									</tr>
									<tr>
										<th>Stadium</th>
										<td>${team.venue} <a target="_blank" href="https://www.google.com/search?q=${team.venue}"><i class="material-icons">open_in_new</i></a></td>
									</tr>
									<tr>
										<th>Website</th>
										<td><a href="${team.website}" target="_blank">${team.website}</a></td>
									</tr>
								</table>
								<button data-target="modalHapus" class="btn modal-trigger waves-effect waves-light red" style="float:right; margin-top:20px;" onclick="teamToDelete = ${team.id};"><i class="material-icons left">delete</i>Hapus Favorit</button>
							</div>
						</div>
					</div>
				</div>
			`;
		})
	}
	document.getElementById("teamList").innerHTML = content;
}
/*END FETCH API*/

/*DATABASE*/
let dbPromised = idb.open("boki", 1, function(upgradeDb) {
	let teamsObjStore = upgradeDb.createObjectStore("teams", {
		keyPath: "id"
	});
});

function addTeamBtn(teamId) {
	let team = teamData.teams.filter(function(el) { return el.id === teamId })[0];
	dbPromised.then(function(db) {
		let tx = db.transaction("teams", "readwrite");
		let store = tx.objectStore("teams");
		store.put(team);
		return tx.complete;
	}).then(function() {
		M.toast({html: `${team.name} berhasil ditambahkan!`});
		document.querySelector(`a[data-timid="${team.id}"]`).style = "display:none;";
		document.querySelector(`button[data-timid="${team.id}"]`).style = "display:inline-block; float:right; margin-top:20px;";
		if (Notification.permission === 'granted') {
			navigator.serviceWorker.ready.then(function(registration) {
				registration.showNotification(`${team.name} berhasil ditambahkan ke favorit.`);
			});
		} else {
			console.error("Notifikasi tidak diizinkan.")
		}
	}).catch(function(error) {
		console.error(`${team.name} gagal ditambahkan! Error: ${error}`)
	})
}

function deleteTeamBtn(teamId, fromTeams = false) {
	let team = teamData.teams.filter(function(el) { return el.id === teamId })[0];
	dbPromised.then(function(db) {
		let tx = db.transaction("teams", "readwrite");
		let store = tx.objectStore("teams");
		store.delete(teamId);
		return tx.complete;
	}).then(function() {
		M.toast({html: `Tim berhasil dihapus!`});
		if(fromTeams) {
			document.querySelector(`a[data-timid="${team.id}"]`).style = "float:right; margin-top:20px; background-color:#1b5e20; display:inline-block;";
			document.querySelector(`button[data-timid="${team.id}"]`).style = "display:none;";
		} else {
			getFavTeams();
		}
	}).catch(function(error) {
		console.error(`Tim gagal dihapus. Error: ${error}`)
	})
}

function getFavTeamsDb() {
	return dbPromised.then(function(db) {
		var tx = db.transaction('teams', 'readonly');
		var store = tx.objectStore('teams');
		return store.getAll();	
	})
}
/*END DATABASE*/