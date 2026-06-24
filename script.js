// init map
let map;
function initEverything() {
	if (map) {
		map.remove();
		map = null;
	}
	map = L.map('wama-guide-map', {closePopupOnClick: false}).setView([41.8194262,-71.3966686], 15);
	L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
		attribution: '© OpenStreetMap contributors © CARTO',
		minZoom: 14,
		maxZoom: 19,
	}).addTo(map);
	map.setMaxBounds([[41.787997, -71.422022], [41.863128, -71.354635]]);
	generateWAMAMap();
	setTimeout(() => {map.flyTo([41.8194262,-71.3966686], 18);}, 250);
}
initEverything();

let targetDevice = 'desktop';
if (window.innerWidth < 800) {
	targetDevice = 'mobile';
}
window.addEventListener('resize', () => {
	console.log(1)
	if (window.innerWidth < 800 && targetDevice == 'desktop') {
		targetDevice = 'mobile';
		setTimeout(initEverything, 50);
	} else if (window.innerWidth >= 800 && targetDevice == 'mobile') {
		targetDevice = 'desktop';
		setTimeout(initEverything, 50);
	}
})

// convert data to plain array
let businessesRaw = [];
for (let key in businesses) {
	let section = businesses[key];
	for (let biz of section) {
		businessesRaw.push(biz);
	}
}

function generateWAMAMap() {
	let temp = '';
	let jumpTemp = '';
	let i = 1;
	for (let key in businesses) {

		let section = businesses[key];
		let sectionTemp = '';

		let primary = "purple";
		if (key == "Shop") {
			primary = "purple";
		} else if (key == "Dine") {
			primary = "orange";
		} else if (key == "Services") {
			primary = "pink";
		}

		jumpTemp += `
			<a href="#${key.toLowerCase()}" class="wama-guide-jump-link" style="--primary: var(--wama-${primary});">
				${key}
			</a>
		`;

		for (let biz of section) {

			// build address
			let address = "";
			if (biz.address != "") {
				address = `<a href="${biz.googleMapsLink}" target="_blank" class="wama-guide-list-group-item-link">${biz.address}</a>`;
			}

			// build phone
			let phone = "";
			if (biz.phone != "") {
				phone = `<a href="tel:${biz.phone}" class="wama-guide-list-group-item-link">${biz.phone}</a>`;
			}

			// build url
			let title = biz.name;
			if (biz.url != "") {
				title = `<a href="${biz.url}" target="_blank">${biz.name}</a>`;
			}

			sectionTemp += `
				<div onmouseenter="highlightOnMap(${i});" onclick="highlightOnMapMobile(${i});" class="wama-guide-list-group-item" data-guide-index="${i}">
					<div class="wama-guide-list-group-item-index">
						${i}
					</div>
					<div class="wama-guide-list-group-item-content">
						<h3 class="wama-guide-list-group-item-title">${title}</h3>
						<div class="wama-guide-list-group-item-info">
							${address}
							${phone}
						</div>
					</div>
				</div>
			`;

			L.marker([biz.latitude, biz.longitude], {
				icon: L.divIcon({
					className: `marker-${i}`,
					html: `
						<div class="wama-guide-map-marker" data-marker-index="${i}" style="--primary: var(--wama-${primary})" onmouseenter="highlightInList(${i});" onclick="showMapInfo(${i});">
							<div class="wama-guide-map-marker-index">${i}</div>
							<svg viewBox="0 0 76.63 95.52" class="wama-guide-map-marker-pin" preserveAspectRatio="none"><path d="M76.63,38.32c0,32.68-38.32,57.21-38.32,57.21,0,0-38.32-24.63-38.32-57.21C0,17.15,17.15,0,38.32,0s38.32,17.15,38.32,38.32Z"/></svg>
						</div>`,
					iconSize: [24, 30],
					iconAnchor: [12, 30]
				})
			}).addTo(map);

			i++;
		}

		temp += `
			<div class="wama-guide-list-group" style="--primary: var(--wama-${primary});" id="${key.toLowerCase()}">
				<h2 class="wama-guide-list-group-heading"><div><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span></div><div><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span><span>${key}</span></div></h2>
				<div class="wama-guide-list-group-items">
					${sectionTemp}
				</div>
			</div>
		`;
	}
	let elmnt = document.querySelector('.wama-guide-list');
	elmnt.innerHTML = `
		<button class="wama-guide-mobile-return" onclick="toggleDirectory();">Open Map</button>
		${temp}
		<div class="wama-guide-jump">
			${jumpTemp}
		</div>
	`;
}

// highlight from list interaction
function highlightOnMapMobile(index) {
	if (window.innerWidth >= 800) {
		return
	}
	closeDirectory();

	// fly to location
	let currentBiz = businessesRaw[index-1];
	let offset = 0;
	if (currentBiz.image != "") {
		offset = 0.0005;
	}
	map.flyTo([currentBiz.latitude + offset, currentBiz.longitude], 18);

	showMapInfo(index)
}
function highlightOnMap(index) {
	if (window.innerWidth < 800) {
		return
	}

	// unhighlight everything
	for (let item of document.querySelectorAll(`.wama-guide-list-group-item`)) {
		item.dataset.active = 0
	}
	for (let item of document.querySelectorAll(`.leaflet-marker-icon`)) {
		item.dataset.active = 0
	}

	// highlight item
	let guideItem = document.querySelector(`.wama-guide-list-group-item[data-guide-index="${index}"]`);
	guideItem.dataset.active = 1;
	let markerItem = document.querySelector(`.marker-${index}`);
	markerItem.dataset.active = 1;

	// fly to location
	let currentBiz = businessesRaw[index-1];
	let offset = 0;
	if (currentBiz.image != "") {
		offset = 0.0005;
	}
	map.flyTo([currentBiz.latitude + offset, currentBiz.longitude], 18);

	showMapInfo(index)
}

// highlight from map interaction
function highlightInList(index) {
	if (window.innerWidth < 800) {
		return
	}

	// unhighlight everything
	for (let item of document.querySelectorAll(`.wama-guide-list-group-item`)) {
		item.dataset.active = 0
	}
	for (let item of document.querySelectorAll(`.leaflet-marker-icon`)) {
		item.dataset.active = 0
	}

	// highlight item
	let guideItem = document.querySelector(`.wama-guide-list-group-item[data-guide-index="${index}"]`);
	guideItem.dataset.active = 1;
	let markerItem = document.querySelector(`.marker-${index}`);
	markerItem.dataset.active = 1;

	// scroll to list item
	guideItem.scrollIntoView({
		behavior: "smooth",
		block: "center"
	});
}

// show popup on map
function showMapInfo(index) {
	let biz = businessesRaw[index-1];

	// build address
	let address = "";
	if (biz.address != "") {
		address = `<a href="${biz.googleMapsLink}" target="_blank" class="wama-guide-map-popup-link">${biz.address}</a>`;
	}

	// build phone
	let phone = "";
	if (biz.phone != "") {
		phone = `<a href="tel:${biz.phone}" class="wama-guide-map-popup-link">${biz.phone}</a>`;
	}

	// build url
	let title = biz.name;
	if (biz.url != "") {
		title = `<a href="${biz.url}" target="_blank">${biz.name}</a>`;
	}

	// build image
	let image = "";
	if (biz.image != "") {
		image = `<img src="${biz.image}" class="wama-guide-map-popup-image">`;
	}

	popupTemp = `
		<div class="wama-guide-map-popup">
			${image}
			<h3 class="wama-guide-map-popup-title">${title}</h3>
			<div class="wama-guide-map-popup-info">
				${address}
				${phone}
			</div>
		</div>
	`;

	L.popup()
		.setLatLng([biz.latitude, biz.longitude])
		.setContent(popupTemp)
		.openOn(map);
}

let directory = false;
function toggleDirectory() {
	directory = !directory;
	let guide = document.querySelector('.wama-guide');
	if (directory) {
		guide.dataset.menu = 1;
	} else {
		guide.dataset.menu = 0;
	}
}
function closeDirectory() {
	directory = false;
	let guide = document.querySelector('.wama-guide');
	guide.dataset.menu = 0;
}