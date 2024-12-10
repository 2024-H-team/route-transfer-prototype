// script.js
document.getElementById("routeForm").addEventListener("submit", async (e) => {
	e.preventDefault();
	const startStation = document.getElementById("startStation").value.trim();
	const endStation = document.getElementById("endStation").value.trim();

	if (!startStation || !endStation) {
		displayError("Please enter both station names");
		return;
	}

	try {
		const response = await fetch("/api/route", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ startStation, endStation }),
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.error);
		}

		displayRoute(data);
	} catch (error) {
		displayError(error.message);
	}
});

function displayError(message) {
	const resultDiv = document.getElementById("result");
	resultDiv.innerHTML = `
        <div class="error-message">
            ${message}
        </div>
    `;
}

function displayRoute(data) {
	console.log(data);
	const resultDiv = document.getElementById("result");
	let html = "<h2>乗り換え情報</h2>";
	const { route, transfers } = data;

	let currentLine = null;

	route.forEach((segment, index) => {
		// For first station, show name first
		if (index === 0) {
			html += `<div class="route-item">${segment.from_name}</div>`;
			html += `<div class="route-line">(${segment.line})</div>`;
			currentLine = segment.line;
			html += `<div class="route-arrow">↓</div>`;
			html += `<div class="route-item">${segment.to_name}</div>`;
		} else {
			// Show new line name when it changes
			if (segment.line !== currentLine) {
				// First show transfer information
				const transfer = transfers.find((t) => t.from_line === currentLine && t.to_line === segment.line);
				if (transfer) {
					html += `<div class="route-item transfer">
                        <strong>${transfer.to_line}に乗り換え</strong>
                    </div>`;
					html += `<div class="route-item">${segment.from_name}</div>`;
					html += `<div class="route-line">(${segment.line})</div>`;
				}
				currentLine = segment.line;
			}

			// Show arrow and next station
			html += `<div class="route-arrow">↓</div>`;
			html += `<div class="route-item">${segment.to_name}</div>`;
		}
	});

	resultDiv.innerHTML = html;
}
