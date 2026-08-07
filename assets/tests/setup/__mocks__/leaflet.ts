const mockMap = {
    invalidateSize: jest.fn(),
    addLayer: jest.fn(),
    setView: jest.fn(),
    setCenter: jest.fn(),
    remove: jest.fn(),
    on: jest.fn(),
};

const mockTileLayer = {
    addTo: jest.fn(() => mockTileLayer),
};

const mockMarker = {
    addTo: jest.fn(() => mockMarker),
    on: jest.fn(),
    getLatLng: jest.fn(() => ({ lat: 48.8566, lng: 2.3522 })),
    setLatLng: jest.fn(),
    setPosition: jest.fn(),
    remove: jest.fn(),
};

module.exports = {
    map: jest.fn(() => mockMap),
    tileLayer: jest.fn(() => mockTileLayer),
    marker: jest.fn(() => mockMarker),
    Icon: class Icon {},
};
