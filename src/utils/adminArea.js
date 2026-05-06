const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

export async function resolveAdministrativeArea({ latitude, longitude, language = "fr" }) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(lat),
    lon: String(lng),
    addressdetails: "1",
    "accept-language": language
  });

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`);
  if (!response.ok) throw new Error("Area lookup unavailable");
  const data = await response.json();
  const address = data.address || {};
  const province = address.state || address.region || address.province || address.county || address.city || "";
  const commune =
    address.city_district ||
    address.suburb ||
    address.municipality ||
    address.town ||
    address.city ||
    address.county ||
    address.village ||
    "";

  return {
    country: address.country || "",
    countryCode: address.country_code || "",
    province,
    commune,
    addressText: data.display_name || ""
  };
}
