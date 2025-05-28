const GRAPH_UPPER_POINT = 0;
const GRAPH_LOWER_POINT = 1;
const LIMIT = 900;

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
		bar.append(getFilledBar(statusAtTime));
		bar.append(`${Math.round(statusAtTime.timeTotal * 1000)}ms`);
		html.append(bar);
	}
	return html;
}

function getFilledBar(data) {
	const filledBar = document.createElement("div");
	filledBar.classList.add("graph-bar__bar");
	filledBar.style.background = `linear-gradient(to top, var(--color-good), var(--color-good) ${
		100 - (data.timeTotal / GRAPH_LOWER_POINT) * 100
	}%, var(--color-good) ${
		100 - (data.timeTotal / GRAPH_LOWER_POINT) * 100
	}%, var(--color-transparent) ${
		100 - (data.timeTotal / GRAPH_LOWER_POINT) * 100
	}%, var(--color-transparent) 100%)`;
	return filledBar;
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
