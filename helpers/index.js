const emvqr = require("emvqr");
const { Merchant } = require("steplix-emv-qrcps");

async function generateQRString(merchantData) {
  const payloadFormatIndicator = Merchant.buildTLV("00", 2, "01");
  const pointOfInitiationMethod = Merchant.buildTLV("01", 2, "12");
  let merchantAccountInformation;

  Object.entries(merchantData.mai).forEach(([scheme, accountNumber]) => {
    const merchantAccountInformationData = Merchant.buildTLV(
      "04",
      accountNumber.length,
      accountNumber
    );
    console.log(accountNumber);
    merchantAccountInformation = Merchant.buildMerchantAccountInformation(
      merchantAccountInformationData
    );
  });

  const mcc = Merchant.buildTLV(
    "52",
    merchantData.mcc.length,
    merchantData.mcc
  );
  const currency = Merchant.buildTLV(
    "53",
    merchantData.currency.length,
    merchantData.currency
  );
  const countryCode = Merchant.buildTLV(
    "58",
    merchantData.countryCode.length,
    merchantData.countryCode
  );
  const merchantName = Merchant.buildTLV(
    "59",
    merchantData.merchantName.length,
    merchantData.merchantName
  );
  const merchantCity = Merchant.buildTLV(
    "60",
    merchantData.merchantCity.length,
    merchantData.merchantCity
  );
  const amount = Merchant.buildTLV(
    "54",
    String(merchantData.amount).length,
    String(merchantData.amount)
  );

  const qrData = [
    payloadFormatIndicator,
    pointOfInitiationMethod,
    { visa: merchantAccountInformation },
    mcc,
    currency,
    amount,
    undefined,
    undefined,
    undefined,
    countryCode,
    merchantName,
    merchantCity,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    ,
  ];

  const qrCode = Merchant.buildEMVQR(...qrData).generatePayload();
  return qrCode;
}

const parseQRCode = (qrCodeText) => {
  const parsed = Merchant.Parser.toEMVQR(qrCodeText).rawData();
  return JSON.stringify(parsed);
};

module.exports = {
  generateQRString,
  parseQRCode,
};
