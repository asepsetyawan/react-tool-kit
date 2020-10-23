import { formatCurrency, roundTo, unformatCurrency } from './currency';

describe('generic util - roundTo', () => {
  it('should round to fixed', () => {
    const res = roundTo(0.12345678, 2);
    expect(res).toEqual(0.12);
  });

  it('should round up correctly', () => {
    const res = roundTo(0.128, 2);
    expect(res).toEqual(0.13);
  });

  it('should round down correctly', () => {
    const res = roundTo(0.123, 2);
    expect(res).toEqual(0.12);
  });

  it('should round to zero when zeroes exceed digits', () => {
    const res = roundTo(0.00001, 4);
    expect(res).toEqual(0);
  });
});

describe('Currency util', () => {
  it('should format non decimal value with default fraction', () => {
    const res = formatCurrency(100000);
    expect(res).toEqual('100.000');
  });

  it('should format zero', () => {
    const res = formatCurrency(0);
    expect(res).toEqual('0');
  });

  it('should format decimal value with fraction set', () => {
    const res = formatCurrency(100000.45, 2);
    expect(res).toEqual('100.000,45');
  });

  it('should format decimal value with no fraction', () => {
    const res = formatCurrency(100000.45, 0);
    expect(res).toEqual('100.000');
  });

  it('should format decimal with no ending zeroes', () => {
    const res = formatCurrency(100000.4, 2);
    expect(res).toEqual('100.000,4');
  });

  it('should handle millions decimal', () => {
    const res = formatCurrency(3000000.45, 2);
    expect(res).toEqual('3.000.000,45');
  });

  it('should handle 4 digits comma', () => {
    const res = formatCurrency(100000.4539, 4);
    expect(res).toEqual('100.000,4539');
  });

  it('should handle 4 digits comma without ending zeroes', () => {
    const res = formatCurrency(100000.453, 4);
    expect(res).toEqual('100.000,453');
  });

  it('should unformat currency - hundred thousands', () => {
    const res = unformatCurrency('100.000');
    expect(res).toEqual('100000');
  });

  it('should unformat currency - millions', () => {
    const res = unformatCurrency('1.000.000');
    expect(res).toEqual('1000000');
  });

  it('should unformat currency - millions with vary', () => {
    const res = unformatCurrency('12.345.000');
    expect(res).toEqual('12345000');
  });

  it('should unformat currency - hundred', () => {
    const res = unformatCurrency('100');
    expect(res).toEqual('100');
  });

  it('should unformat currency with comma', () => {
    const res = unformatCurrency('100.000,2');
    expect(res).toEqual('100000,2');
  });

  it('should unformat currency with empty', () => {
    const res = unformatCurrency('');
    expect(res).toEqual('0');
  });

  it('should unformat currency with zero', () => {
    const res = unformatCurrency('0');
    expect(res).toEqual('0');
  });
});
