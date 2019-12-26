const API_KEY = '184ad6eabd8f4496b4fd3fc6684cbca7';
const LEAGUE_ID = 2021;
const BASE_URL = "https://api.football-data.org/v2";
let standing_url = `${BASE_URL}/competitions/${LEAGUE_ID}/standings`;
let teams_url = `${BASE_URL}/competitions/${LEAGUE_ID}/teams`;

let fetchApi = function(url) {
	return fetch(url, {
		headers: {
			'X-Auth-Token': API_KEY
		}
	});
}