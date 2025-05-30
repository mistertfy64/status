const GRAPH_UPPER_POINT = 0;
const GRAPH_LOWER_POINT = 1;
const LIMIT = 360;

const GOOD_STATUS_CODES = [200, 301, 302];

async function getSectionHTML(id) {
	const response = await getData(id);
	const data = await response.json();
	const html = document.createElement("div");
	html.classList.add("graph");
	const headerHTML = getStatusGraphHeader(data);
	html.appendChild(headerHTML);
	const graphHTML = await getGraph(data);
	html.appendChild(graphHTML);
	return html;
}

async function getGraph(data) {
	const statusData = data.status;
	const html = document.createElement("div");
	html.classList.add("status-graph");

	for (const statusAtTime of statusData) {
		const bar = document.createElement("div");
		bar.classList.add("graph-bar");
		bar.classList.add(getBarColor(statusAtTime));
		bar.append(getFilledBar(statusAtTime));
		html.append(bar);
	}
	return html;
}

function getBarColor(data) {
	if (GOOD_STATUS_CODES.indexOf(data.statusCode) > -1) {
		return "graph-bar--good";
	}
	return "graph-bar--bad";
}

function getFilledBar(data) {
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
		filledBar.style.background = `linear-gradient(to top, var(--color-good), var(--color-good) ${
			100 - (data.timeTotal / GRAPH_LOWER_POINT) * 100
		}%, var(--color-good) ${
			100 - (data.timeTotal / GRAPH_LOWER_POINT) * 100
		}%, var(--color-transparent) ${
			100 - (data.timeTotal / GRAPH_LOWER_POINT) * 100
		}%, var(--color-transparent) 100%)`;
	}

	const barInformation = document.createElement("div");
	barInformation.classList.add("graph-bar__details");
	barInformation.classList.add("monospace");
	barInformation.append(getBarUppermostText(data));
	barInformation.append(getBarUpperText(data));
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
	});
	filledBar.addEventListener("mouseout", function (event) {
		const details = Array.from(this.children).filter(function (element) {
			return (
				Array.from(element.classList).indexOf("graph-bar__details") > -1
			);
		});
		details[0].style.display = "none";
	});
}

function getBarUppermostText(data) {
	const text = document.createElement("div");
	text.textContent = `${new Date(data.timestamp).toISOString()}`;
	text.style.fontSize = "10px";
	return text;
}

function getBarUpperText(data) {
	const text = document.createElement("div");
	const number = document.createElement("span");
	number.classList.add("ago");
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
	const minutes = Math.floor((time - data.timestamp) / (60 * 1000));
	return `${minutes}`;
}

async function getData(id) {
	const data = fetch(`http://localhost:10002/service-status/${id}`);
	return data;
}

function getStatusGraphHeader(data) {
	const header = document.createElement("div");
	header.classList.add("graph__header");
	const name = document.createElement("div");
	name.textContent = data.service;
	const percentage = document.createElement("div");
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
	for (let serviceID = 0; serviceID < 4; serviceID++) {
		const html = await getSectionHTML(serviceID);
		const main = document.getElementsByTagName("main")[0];
		main.append(html);
	}
}

initialize();
