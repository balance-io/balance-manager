import {
  countDecimalPlaces,
  convertNumberToString,
  convertStringToNumber,
  convertHexToString,
  convertStringToHex,
  greaterThan,
  smallerThan,
} from '../helpers/bignumber';

describe(`countDecimalPlaces`, () => {
  it(`returns a typeof number if value is a number or string number`, () => {
    const input = `0.122000`;
    const output = countDecimalPlaces(input);
    const expected = 'number';
    expect(typeof output).toBe(expected);
  });
  it(`returns null if value is NaN`, () => {
    const input = `test`;
    const output = countDecimalPlaces(input);
    const expected = null;
    expect(output).toBe(expected);
  });
  it(`returns 5 if value is 243.35235`, () => {
    const input = `243.35235`;
    const output = countDecimalPlaces(input);
    const expected = 5;
    expect(output).toBe(expected);
  });
  it(`returns 3 if value is 0.122000`, () => {
    const input = `0.122000`;
    const output = countDecimalPlaces(input);
    const expected = 3;
    expect(output).toBe(expected);
  });
});

describe(`convertNumberToString`, () => {
  it(`returns '0' if string is NaN`, () => {
    const input = 'test';
    const output = convertNumberToString(input);
    const expected = '0';
    expect(output).toBe(expected);
  });
  it(`returns '2.54' if value is 2.54`, () => {
    const input = 2.54;
    const output = convertNumberToString(input);
    const expected = '2.54';
    expect(output).toBe(expected);
  });
  it(`returns '7' if value is '7'`, () => {
    const input = '7';
    const output = convertNumberToString(input);
    const expected = '7';
    expect(output).toBe(expected);
  });
});

describe(`convertStringToNumber`, () => {
  it(`returns 0 if string is NaN`, () => {
    const input = 'test';
    const output = convertStringToNumber(input);
    const expected = 0;
    expect(output).toBe(expected);
  });
  it(`returns 10.23 if value is '10.23'`, () => {
    const input = '10.23';
    const output = convertStringToNumber(input);
    const expected = 10.23;
    expect(output).toBe(expected);
  });
  it(`returns 321.23 if value is 321.23`, () => {
    const input = 321.23;
    const output = convertStringToNumber(input);
    const expected = 321.23;
    expect(output).toBe(expected);
  });
});

describe(`convertHexToString`, () => {
  it(`returns empty string if hex matches NaN`, () => {
    const input = 'test';
    const output = convertHexToString(input);
    const expected = '';
    expect(output).toBe(expected);
  });
  it(`returns '124' if hex is '7c'`, () => {
    const input = '7c';
    const output = convertHexToString(input);
    const expected = '124';
    expect(output).toBe(expected);
  });
  it(`returns '124' if value is '0x7c'`, () => {
    const input = '0x7c';
    const output = convertHexToString(input);
    const expected = '124';
    expect(output).toBe(expected);
  });
});

describe(`convertStringToHex`, () => {
  it(`returns '0x' if string matches NaN`, () => {
    const input = 'test';
    const output = convertStringToHex(input);
    const expected = '0x';
    expect(output).toBe(expected);
  });
  it(`returns '4d2' if hex is '1234'`, () => {
    const input = '1234';
    const output = convertStringToHex(input);
    const expected = '4d2';
    expect(output).toBe(expected);
  });
});

describe(`greaterThan`, () => {
  it(`returns false if numberOne is equal to numberTwo`, () => {
    const numberOne = 1;
    const numberTwo = 1;
    const output = greaterThan(numberOne, numberTwo);
    const expected = false;
    expect(output).toBe(expected);
  });
  it(`returns false if either numberOne or numberTwo is NaN`, () => {
    const numberOne = 'test';
    const numberTwo = 1;
    const output = greaterThan(numberOne, numberTwo);
    const expected = false;
    expect(output).toBe(expected);
  });
  it(`returns false if either numberOne is smaller than numberTwo`, () => {
    const numberOne = 1;
    const numberTwo = 2;
    const output = greaterThan(numberOne, numberTwo);
    const expected = false;
    expect(output).toBe(expected);
  });
  it(`returns true if either numberOne is greater than numberTwo`, () => {
    const numberOne = 2;
    const numberTwo = 1;
    const output = greaterThan(numberOne, numberTwo);
    const expected = true;
    expect(output).toBe(expected);
  });
});

describe(`smallerThan`, () => {
  it(`returns false if numberOne is equal to numberTwo`, () => {
    const numberOne = 1;
    const numberTwo = 1;
    const output = smallerThan(numberOne, numberTwo);
    const expected = false;
    expect(output).toBe(expected);
  });
  it(`returns false if either numberOne or numberTwo is NaN`, () => {
    const numberOne = 'test';
    const numberTwo = 1;
    const output = smallerThan(numberOne, numberTwo);
    const expected = false;
    expect(output).toBe(expected);
  });
  it(`returns false if either numberOne is greater than numberTwo`, () => {
    const numberOne = 2;
    const numberTwo = 1;
    const output = smallerThan(numberOne, numberTwo);
    const expected = false;
    expect(output).toBe(expected);
  });
  it(`returns true if either numberOne is smaller than numberTwo`, () => {
    const numberOne = 1;
    const numberTwo = 2;
    const output = smallerThan(numberOne, numberTwo);
    const expected = true;
    expect(output).toBe(expected);
  });
});
