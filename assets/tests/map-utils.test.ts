import {
    buildLeafletIcon,
    buildGoogleMarkerOptions,
    LEAFLET_DEFAULT_MARKER_ICON,
} from '../src/modules/map-utils';

describe('map-utils', () => {
    describe('buildLeafletIcon', () => {
        const L: any = {
            Icon: jest.fn(function (opts: any) {
                this.options = opts;
                return this;
            }),
            divIcon: jest.fn(function (opts: any) {
                this.options = opts;
                this.isDivIcon = true;
                return this;
            }),
        };

        it('should return the default icon when no marker options are provided', () => {
            const icon = buildLeafletIcon(L);

            expect(icon.options.iconUrl).toBe(LEAFLET_DEFAULT_MARKER_ICON);
            expect(icon.options.iconSize).toEqual([25, 41]);
        });

        it('should return a custom icon when iconUrl is provided', () => {
            const icon = buildLeafletIcon(L, { iconUrl: 'https://example.com/pin.svg', iconSize: [40, 40] });

            expect(icon.options.iconUrl).toBe('https://example.com/pin.svg');
            expect(icon.options.iconSize).toEqual([40, 40]);
        });

        it('should return a div icon when only a label is provided', () => {
            const icon = buildLeafletIcon(L, { label: 'A' });

            expect(icon.isDivIcon).toBe(true);
            expect(icon.options.html).toContain('A');
        });

        it('should fall back to default when label-only icon has no explicit anchor', () => {
            const icon = buildLeafletIcon(L, { label: 'B' });

            expect(icon.options.iconAnchor).toEqual([12, 24]);
        });
    });

    describe('buildGoogleMarkerOptions', () => {
        const Size = jest.fn(function (w: number, h: number) {
            this.width = w;
            this.height = h;
        });
        const Point = jest.fn(function (x: number, y: number) {
            this.x = x;
            this.y = y;
        });

        beforeEach(() => {
            (window as any).google = { maps: { Size, Point } };
        });

        it('should return empty options when no marker is provided', () => {
            expect(buildGoogleMarkerOptions()).toEqual({});
        });

        it('should return empty options when no iconUrl is provided', () => {
            expect(buildGoogleMarkerOptions({ label: 'A' })).toEqual({});
        });

        it('should use default size when iconUrl is provided without size', () => {
            const opts = buildGoogleMarkerOptions({ iconUrl: 'https://example.com/pin.svg' });

            expect(opts.url).toBe('https://example.com/pin.svg');
            expect(opts.scaledSize.width).toBe(25);
            expect(opts.scaledSize.height).toBe(41);
        });

        it('should use custom size, anchor and label', () => {
            const opts = buildGoogleMarkerOptions({
                iconUrl: 'https://example.com/pin.svg',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                label: 'A',
            });

            expect(opts.scaledSize.width).toBe(40);
            expect(opts.anchor.x).toBe(20);
            expect(opts.anchor.y).toBe(40);
            expect(opts.label).toBe('A');
        });
    });
});
