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
	barInformation.style.position = "absolute";
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

function getTextBar(data) {
	const text = document.createElement("div");
	text.style.textAlign = "center";
	text.classList.add("monospace");
	text.style.position = "absolute";
	text.style.fontSize = "12px";
	if (GOOD_STATUS_CODES.indexOf(data.statusCode) === -1) {
		// text.innerText = `ERROR ${data.statusCode}` ?? "ERROR ???";
	}
	return text;
}

function getBarUppermostText(data) {
	const text = document.createElement("div");
	text.textContent = `${new Date(data.timestamp).toISOString()}`;
	text.style.fontSize = "10px";
	return text;
}

function getBarUpperText(data) {
	const text = document.createElement("div");
	text.textContent = `(${getFormattedTime(data)})`;
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
	return `${minutes} min. ago`;
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
