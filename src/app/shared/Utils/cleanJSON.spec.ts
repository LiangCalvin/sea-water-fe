import { cleanObject } from './cleanJSON';

describe('cleanObject', () => {
    it('should remove empty fields from objects', () => {
        const input = {
            name: 'John',
            age: null,
            email: '',
            address: {
                city: '',
                country: 'Thailand',
                zipcode: undefined,
                misc: {}
            },
            score: NaN
        };

        const result = cleanObject(input);

        expect(result).toEqual({
            name: 'John',
            address: {
                country: 'Thailand'
            }
        });
    });

    it('should recursively clean nested objects', () => {
        const input = {
            outer: {
                inner: {
                    emptyString: '',
                    valid: 'value',
                    deep: {
                        invalid: undefined
                    }
                }
            }
        };

        const result = cleanObject(input);

        expect(result).toEqual({
            outer: {
                inner: {
                    valid: 'value'
                }
            }
        });
    });

    it('should clean arrays and remove null/undefined items', () => {
        const input = {
            items: [
                null,
                undefined,
                { name: 'Item 1' },
                { name: '' },
                {},
                { nested: null }
            ]
        };

        const result = cleanObject(input);

        expect(result).toEqual({
            items: [
                { name: 'Item 1' },
                {},
                {},
                {}
            ]
        });
    });

    it('should not remove empty strings or NaN from arrays', () => {
        const input = ['', NaN, undefined, null, 'valid'];

        const result = cleanObject(input);

        // Only undefined and null are removed; '' and NaN remain
        expect(result).toEqual(['', NaN, 'valid']);
    });

    it('should return empty object if all keys are empty', () => {
        const input = {
            a: '',
            b: null,
            c: undefined,
            d: NaN,
            e: {}
        };

        const result = cleanObject(input);

        expect(result).toEqual({});
    });

    it('should return input as-is if it is a primitive value', () => {
        expect(cleanObject('text')).toBe('text');
        expect(cleanObject(123)).toBe(123);
        expect(cleanObject(false)).toBe(false);
    });
});