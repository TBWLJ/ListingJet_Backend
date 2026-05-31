import { locations } from "../utils/locations.js";

export function countries(_req, res) {
  res.json({ countries: locations.map((item) => item.country) });
}

export function states(req, res) {
  const match = locations.find((item) => item.country.toLowerCase() === String(req.query.country || "").toLowerCase());
  res.json({ states: match?.states || [] });
}
