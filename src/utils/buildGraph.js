function buildGraph(connections, stations) {
	const graph = {};
	const groupedStations = {};

	stations.forEach((station) => {
		if (!groupedStations[station.station_g_cd]) {
			groupedStations[station.station_g_cd] = [];
		}
		groupedStations[station.station_g_cd].push(station.station_cd);
	});

	stations.forEach((station) => {
		const stationGroup = groupedStations[station.station_g_cd];
		stations.forEach((otherStation) => {
			if (
				station.station_cd !== otherStation.station_cd &&
				station.lat === otherStation.lat &&
				station.lon === otherStation.lon
			) {
				if (!stationGroup.includes(otherStation.station_cd)) {
					stationGroup.push(otherStation.station_cd);
				}
			}
		});
	});

	connections.forEach((conn) => {
		const station1 = stations.find((s) => s.station_cd === conn.station_cd1);
		const station2 = stations.find((s) => s.station_cd === conn.station_cd2);

		if (!station1 || !station2) return;

		const stationGcd1 = station1.station_g_cd;
		const stationGcd2 = station2.station_g_cd;

		if (stationGcd1 && stationGcd2 && stationGcd1 !== stationGcd2) {
			graph[stationGcd1] = graph[stationGcd1] || [];
			graph[stationGcd1].push({ to: stationGcd2, line: conn.line_cd });

			graph[stationGcd2] = graph[stationGcd2] || [];
			graph[stationGcd2].push({ to: stationGcd1, line: conn.line_cd });
		}
	});

	return { graph, groupedStations };
}

module.exports = buildGraph;
