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
	let html = "<h2>Route Details</h2>";

	// Display route
	data.route.forEach((station) => {
		const isTransfer = data.transfers.some((t) => t.station_name === station.from_name);
		html += `
            <div class="route-item">
                <span class="${isTransfer ? "transfer-station" : ""}">${station.from_name}</span>
                → ${station.to_name} 
                <span class="line-name">(${station.line})</span>
            </div>
        `;
	});

	// Display transfers
	if (data.transfers.length > 0) {
		html += '<div class="transfers"><h3>Transfers:</h3>';
		data.transfers.forEach((transfer) => {
			html += `
                <div>At <span class="transfer-station">${transfer.station_name}</span>: 
                <span class="line-name">${transfer.from_line}</span> → 
                <span class="line-name">${transfer.to_line}</span></div>
            `;
		});
		html += "</div>";
	}

	resultDiv.innerHTML = html;
}
