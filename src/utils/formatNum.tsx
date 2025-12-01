interface FormattedNum {
  formattedNum: string,
  integer: string,
  float: string,
}

export default function formatNum(a: number): FormattedNum {
  let isNegative = false;
  let floatPart = '';
  let formattedNum: string | string[] = a.toString();

  if (formattedNum.match(/^-/)) {
    isNegative = true;
    formattedNum = formattedNum.slice(1);
  }

  const floatMatch = formattedNum.match(/\.\d{1,2}/);

  if (floatMatch) {
    [floatPart] = floatMatch;

    if (floatPart.length === 2) {
      floatPart += '0';
    }

    formattedNum = formattedNum.slice(0, floatMatch.index);
  }

  formattedNum = formattedNum.split('').reverse();

  for (let i = 3; i < formattedNum.length; i += 3) {
    formattedNum.splice(i, 0, ',');
    i += 1;
  }

  if (isNegative) {
    formattedNum.push('-');
  }

  const integerPart = formattedNum.reverse().join('');

  formattedNum = `${integerPart}${floatPart}`;

  return {
    formattedNum,
    integer: integerPart,
    float: floatPart,
  };
}
