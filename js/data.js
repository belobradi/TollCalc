// data.js
export let STATIONS = []

export async function loadStations () {
  STATIONS = await (await fetch('data/json/stations.json')).json()
}
