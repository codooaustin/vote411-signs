/**
 * Reverse geocode lat/lng to a human-readable address using Nominatim (OpenStreetMap).
 * Returns the nearest road/address to help identify sign location for take-down.
 * Per Nominatim usage policy: https://operations.osmfoundation.org/policies/nominatim/
 */

interface NominatimAddress {
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  county?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

export type ReverseGeocodeResult = {
  nearestIntersection: string | null;
  zipcode: string | null;
  county: string | null;
};

interface NominatimResponse {
  display_name?: string;
  address?: NominatimAddress;
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Vote411-Signs/1.0",
      },
    });

    if (!res.ok) return { nearestIntersection: null, zipcode: null, county: null };

    const data = (await res.json()) as NominatimResponse;
    const addr = data.address;
    if (!addr) return { nearestIntersection: null, zipcode: null, county: null };

    let nearestIntersection: string | null = null;
    // Prefer road; fall back to suburb/neighbourhood, then truncated display_name
    if (addr.road) {
      const parts: string[] = [addr.road];
      if (addr.suburb && addr.suburb !== addr.road) parts.push(addr.suburb);
      else if (addr.neighbourhood && addr.neighbourhood !== addr.road)
        parts.push(addr.neighbourhood);
      nearestIntersection = parts.join(", ");
    } else if (addr.suburb) {
      nearestIntersection = addr.suburb;
    } else if (addr.neighbourhood) {
      nearestIntersection = addr.neighbourhood;
    } else if (addr.city) {
      nearestIntersection = addr.city;
    } else if (data.display_name) {
      nearestIntersection = data.display_name.slice(0, 120);
    }

    const zipcode = addr.postcode ?? null;
    const county = addr.county ?? null;
    return { nearestIntersection, zipcode, county };
  } catch {
    return { nearestIntersection: null, zipcode: null, county: null };
  }
}
