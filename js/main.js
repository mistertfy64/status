const GRAPH_LOWER_POINT = 0;
const GRAPH_UPPER_POINT = 1;
const LIMIT = 360;
const GRAPH_MARGIN = 16;
const GOOD_STATUS_CODES = [200, 301, 302];
const SERVICES = 4;
const SERVICE_STATUS = {};

async function getSectionHTML(data, serviceID) {
	const html = document.createElement("div");
	html.classList.add("graph");
	const headerHTML = getStatusGraphHeader(data);
	html.appendChild(headerHTML);
	const graphHTML = await getGraph(data, serviceID);
	html.appendChild(graphHTML);
	return html;
}

async function getGraph(data, serviceID) {
	const statusData = data.status;
	const html = document.createElement("div");
	html.classList.add("status-graph");

	let number = 0;
	for (const statusAtTime of statusData) {
		const bar = document.createElement("div");
		bar.classList.add("graph-bar");
		bar.classList.add(getBarColor(statusAtTime));
		bar.append(getFilledBar(statusAtTime, serviceID, number));
		html.append(bar);
		number++;
	}
	return html;
}

function getBarColor(data) {
	if (GOOD_STATUS_CODES.indexOf(data.statusCode) > -1) {
		return "graph-bar--good";
	}
	return "graph-bar--bad";
}

function getFilledBar(data, serviceID, number) {
	const filledBar = document.createElement("div");
	filledBar.classList.add("graph-bar__bar");
	// bar color
	if (GOOD_STATUS_CODES.indexOf(data.statusCode) === -1) {
		filledBar.style.background = `repeating-linear-gradient(
    45deg,
    var(--color-bad),
    var(--color-bad) 8px,#cf0000 8px,#cf0000 16px
  )`;
	} else {
		filledBar.style.background = `linear-gradient(to top, var(--color-good), var(--color-good) ${Math.min(
			(data.timeTotal / GRAPH_UPPER_POINT) * 100,
			100
		)}%, var(--color-good) ${Math.min(
			(data.timeTotal / GRAPH_UPPER_POINT) * 100,
			100
		)}%, var(--color-transparent) ${Math.min(
			(data.timeTotal / GRAPH_UPPER_POINT) * 100,
			100
		)}%, var(--color-transparent) 100%)`;
	}

	const barInformation = document.createElement("div");
	barInformation.classList.add("graph-bar__details");
	barInformation.classList.add("monospace");
	barInformation.append(getBarUppermostText(data));
	barInformation.append(getBarUpperText(data, serviceID, number));
	barInformation.append(getBarMiddleText(data));
	barInformation.append(getBarLowerText(data));
	barInformation.style.display = "none";

	if (GOOD_STATUS_CODES.indexOf(data.statusCode) === -1) {
		barInformation.classList.add("graph-bar__details--bad");
	} else {
		barInformation.classList.add("graph-bar__details--good");
	}
	filledBar.appendChild(barInformation);
	addEventListenersToBar(filledBar);

	return filledBar;
}

function addEventListenersToBar(filledBar) {
	filledBar.addEventListener("mouseover", function (event) {
		const details = Array.from(this.children).filter(function (element) {
			return (
				Array.from(element.classList).indexOf("graph-bar__details") > -1
			);
		});
		details[0].style.display = "block";
		const rectangle = details[0].getBoundingClientRect();
		const vw = Math.max(
			document.documentElement.clientWidth || 0,
			window.innerWidth || 0
		);
		if (rectangle.left < GRAPH_MARGIN) {
			details[0].style.left = `${
				Math.max(GRAPH_MARGIN, rectangle.left) - GRAPH_MARGIN
			}px`;
		} else if (rectangle.right > vw - GRAPH_MARGIN) {
			details[0].style.right = `${
				Math.max(GRAPH_MARGIN, vw - rectangle.right) - GRAPH_MARGIN
			}px`;
		}
	});
	filledBar.addEventListener("mouseout", function (event) {
		const details = Array.from(this.children).filter(function (element) {
			return (
				Array.from(element.classList).indexOf("graph-bar__details") > -1
			);
		});
		details[0].style.left = `initial`;
		details[0].style.right = `initial`;
		details[0].style.display = "none";
	});
}

function getBarUppermostText(data) {
	const text = document.createElement("div");
	text.textContent = `${new Date(data.timestamp).toISOString()}`;
	text.style.fontSize = "10px";
	return text;
}

function getBarUpperText(data, serviceID, order) {
	const text = document.createElement("div");
	const number = document.createElement("span");
	number.classList.add("ago");
	number.id = `ago-${serviceID}-${order}`;
	number.textContent = `${getFormattedTime(data)}`;
	text.append("(");
	text.append(number);
	text.append(" min. ago)");
	text.style.fontSize = "8px";
	return text;
}

function getBarMiddleText(data) {
	const text = document.createElement("div");
	if (GOOD_STATUS_CODES.indexOf(data.statusCode) === -1) {
		text.textContent = `ERROR`;
	} else {
		text.textContent = `${Math.round(data.timeTotal * 1000)}ms`;
	}
	text.style.fontSize = "14px";
	return text;
}

function getBarLowerText(data) {
	const text = document.createElement("div");
	text.textContent = `${data.statusCode}`;
	text.style.fontSize = "10px";
	return text;
}

function getFormattedTime(data) {
	const time = new Date();
	const minutes = Math.floor((time - data.timestamp) / 60000);
	return `${minutes}`;
}

async function getData(id) {
	const data = fetch(`https://api.mistertfy64.com/service-status/${id}`);
	return data;
}

function getStatusGraphHeader(data) {
	const header = document.createElement("div");
	header.classList.add("graph__header");
	const name = document.createElement("div");
	name.textContent = data.service;
	const percentage = document.createElement("div");
	percentage.style.textAlign = "right";
	const good = data.status.filter(
		(element) => GOOD_STATUS_CODES.indexOf(element.statusCode) > -1
	);
	const total = data.status.length;
	const uptime = `${((good.length / total) * 100).toFixed(
		3
	)}% (last 360 min.)`;
	percentage.textContent = uptime;
	header.appendChild(name);
	header.appendChild(percentage);
	name.style.padding = "4px";
	percentage.style.padding = "4px";
	return header;
}

async function initialize() {
	ok = true;
	for (let serviceID = 0; serviceID < SERVICES; serviceID++) {
		const response = await getData(serviceID);
		const data = await response.json();
		const html = await getSectionHTML(data, serviceID);
		const main = document.getElementsByTagName("main")[0];
		main.append(html);
		SERVICE_STATUS[serviceID] = data;
		const statusCode = SERVICE_STATUS[serviceID].status[LIMIT - 1].code;
		if (GOOD_STATUS_CODES.indexOf(statusCode) > -1) {
			ok = false;
		}
	}
	if (ok) {
		document.getElementById("status-summary").textContent = `ONLINE`;
	} else {
		document.getElementById("status-summary").textContent = `OUTAGE`;
	}
	const lastUpdated = `${new Date().toISOString()}`;
	document.getElementById("status-last-update").textContent = lastUpdated;
}

initialize();

setInterval(function () {
	for (let serviceID = 0; serviceID < SERVICES; serviceID++) {
		for (let agoNumber = 0; agoNumber < LIMIT; agoNumber++) {
			const elementID = `ago-${serviceID}-${agoNumber}`;
			const element = document.getElementById(elementID);
			const data = SERVICE_STATUS[serviceID].status[agoNumber];
			element.textContent = getFormattedTime(data);
		}
	}
}, 1000);
