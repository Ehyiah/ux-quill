const mockMap = {
    invalidateSize: jest.fn(),
    addLayer: jest.fn(),
};

const mockTileLayer = {
    addTo: jest.fn(),
};

const mockMarker = {
    addTo: jest.fn(),
    on: jest.fn(),
    getLatLng: jest.fn(() => ({ lat: 48.8566, lng: 2.3522 })),
};

module.exports = {
    map: jest.fn(() => mockMap),
    tileLayer: jest.fn(() => mockTileLayer),
    marker: jest.fn(() => mockMarker),
};
