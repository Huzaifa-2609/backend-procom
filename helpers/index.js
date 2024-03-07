function generateQRString(merchantData) {
  let qrString = "000201";
  qrString += "010212";

  Object.entries(merchantData.mai).forEach(([scheme, accountNumber]) => {
    qrString += `26${("00" + scheme.length).slice(-2)}${scheme}${(
      "00" + accountNumber.length
    ).slice(-2)}${accountNumber}`;
  });

  qrString += `52${("00" + merchantData.mcc.length).slice(-2)}${
    merchantData.mcc
  }`;

  qrString += `53${("00" + merchantData.currency.length).slice(-2)}${
    merchantData.currency
  }`;

  qrString += `58${("00" + merchantData.countryCode.length).slice(-2)}${
    merchantData.countryCode
  }`;
  qrString += `59${("00" + merchantData.merchantName.length).slice(-2)}${
    merchantData.merchantName
  }`;
  qrString += `60${("00" + merchantData.merchantCity.length).slice(-2)}${
    merchantData.merchantCity
  }`;
  const crc = calculateCRC(qrString);
  qrString += `6304${crc}`;
  return qrString;
}

function calculateCRC(data) {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      if ((crc & 1) !== 0) {
        crc = (crc >> 1) ^ 0xa001;
      } else {
        crc = crc >> 1;
      }
    }
  }
  return crc.toString(16).toUpperCase();
}

module.exports = {
  generateQRString,
};
