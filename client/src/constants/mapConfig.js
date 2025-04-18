// Map defaults that are exported
export const DEFAULT_POSITION = [60.1699, 24.9384];
export const DEFAULT_ZOOM = 12;

// Transport type colors
export const TRANSPORT_COLORS = {
    SUBWAY: '#ff6600',
    TRAM: '#00AA66',
    RAIL: '#ff0000',
    LIGHTRAIL: 'purple'
};

// Tile layer configuration
export const TILE_LAYER = {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
};
