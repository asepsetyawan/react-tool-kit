export const formatCurrency = (num, fraction = 0) => {
  let n = roundTo(num, fraction);
  let newnum = n.toString();
  let commas = newnum.split('.');
  newnum = commas[0];
  let i = newnum.length - 3;
  while (i > 0) {
    newnum = newnum.substr(0, i) + '.' + newnum.substr(i);
    i -= 3;
  }
  return newnum + ((commas[1] && ',' + commas[1]) || '');
};

export const roundTo = (number, precision) => {
  let factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
};

export const unformatCurrency = num => {
  let newnum = num ? num.toString() : '0';
  newnum = newnum.split('.').join('');
  return newnum;
};
