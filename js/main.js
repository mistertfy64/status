const GRAPH_UPPER_POINT = 0;
const GRAPH_LOWER_POINT = 1;
const LIMIT = 900;

const GOOD_STATUS_CODES = [200, 301, 302];

async function getSectionHTML(id) {
	const html = document.createElement("div");
	const graphHTML = await getGraph(id);
	html.appendChild(graphHTML);
	return html;
}

async function getGraph(id) {
	const response = await getData(id);
	const data = await response.json();
	const statusData = data.status;
	const html = document.createElement("div");
	html.classList.add("status-graph");
	for (const statusAtTime of statusData) {
		const bar = document.createElement("div");
		bar.classList.add("graph-bar");
		bar.classList.add(getBarColor(statusAtTime));
		bar.append(getFilledBar(statusAtTime));
		bar.append(getTextBar(statusAtTime));
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
	return filledBar;
}

function getTextBar(data) {
	const text = document.createElement("div");
	text.style.textAlign = "center";
	if (GOOD_STATUS_CODES.indexOf(data.statusCode) === -1) {
		text.innerText = data.statusCode ?? "ERROR";
	} else {
		text.innerText = `${Math.round(data.timeTotal * 1000)}ms`;
	}

	return text;
}

async function getData(id) {
	const data = fetch(`http://localhost:10002/service-status/${id}`);
	return data;
}

async function initialize() {
	const html = await getSectionHTML(0);
	const main = document.getElementsByTagName("main")[0];
	main.append(html);
}

initialize();
