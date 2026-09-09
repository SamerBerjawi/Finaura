import { useMemo } from 'react';

interface CartoBasemapResult {
  tileUrl: string;
  attribution: string;
  isCarto: boolean;
  subdomains: string[];
}

/**
 * Returns the appropriate tile URL, attribution and subdomain list based on
 * whether a CARTO API key is configured and whether dark mode is active.
 *
 * If no key is provided, falls back to standard OpenStreetMap tiles which
 * require no authentication.
 *
 * IMPORTANT: Always pass `key={tileUrl}` to <TileLayer> so React-Leaflet
 * remounts the layer when the URL changes (e.g. on theme switch).
 */
export function useCartoBasemap(
  cartoApiKey: string | undefined,
  darkMode: boolean,
): CartoBasemapResult {
  return useMemo(() => {
    const hasKey = Boolean(cartoApiKey && cartoApiKey.trim().length > 0);

    if (hasKey) {
      const theme = darkMode ? 'dark_all' : 'light_all';
      return {
        tileUrl: `https://basemaps.cartocdn.com/rastertiles/${theme}/{z}/{x}/{y}.png?key=${cartoApiKey!.trim()}`,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        isCarto: true,
        subdomains: ['a', 'b', 'c', 'd'],
      };
    }

    // Fallback — standard OpenStreetMap, no API key required
    return {
      tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      isCarto: false,
      subdomains: ['a', 'b', 'c'],
    };
  }, [cartoApiKey, darkMode]);
}
