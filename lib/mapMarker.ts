import L from "leaflet";

/** Custom map pin icon (vote.png). Image is 254×158; we scale to reasonable size and preserve aspect ratio. */
const W = 254;
const H = 158;
const scale = 40 / H;
const w = Math.round(W * scale);
const h = Math.round(H * scale);

export const markerIcon = L.icon({
  iconUrl: "/vote.png",
  iconSize: [w, h],
  iconAnchor: [0, h],
  className: "vote-marker-icon",
});

/** Icon for suggested (not yet placed) sign locations. */
export const suggestionIcon = L.divIcon({
  className: "suggestion-marker-icon",
  html: '<div style="width:24px;height:24px;border:3px dashed #bb29bb;border-radius:50%;background:rgba(187,41,187,0.2);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});
