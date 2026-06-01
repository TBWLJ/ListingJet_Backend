import { Country, State } from "country-state-city";

export function countries(_req, res) {
  const countries = Country.getAllCountries()
    .map((country) => ({
      name: country.name,
      isoCode: country.isoCode,
      phonecode: country.phonecode,
      currency: country.currency,
      flag: country.flag
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json({ countries });
}

export function states(req, res) {
  const country = String(req.query.country || "");
  const matchedCountry = Country.getCountryByCode(country) ||
    Country.getAllCountries().find((item) => item.name.toLowerCase() === country.toLowerCase());

  if (!matchedCountry) return res.json({ states: [] });

  const states = State.getStatesOfCountry(matchedCountry.isoCode)
    .map((state) => ({
      name: state.name,
      isoCode: state.isoCode,
      countryCode: state.countryCode
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json({ states });
}
