const fs = require('fs');
const pdf = require('html-pdf');
const Handlebars = require('handlebars');
const { getOrders } = require('./database.js')

const options = { 
    format: 'A4',
    orientation: 'portrait',
};

(async function generatePdf() {
  const data = await getOrders();

  let orders = {}; // parse data as json
  const cusOrderNum = "2023012242526065"

  console.log('Grouping transaction data with same order number')
  data.forEach(item => {
    const orderNumber = item.orderNumber

    if (!orders[orderNumber]) {
      orders[orderNumber] = [{
        name: item.productName,
        price: item.productPrice,
        quantity: item.productQuantity,
        shipFee: item.shipFee,
        discount: item.discount,
        linePoints: item.linePoints,
        lspDiscount: item.lspDiscount,

        total: item.productPrice*item.productQuantity

      }];

    } else {
      orders[orderNumber].push({
        name: item.productName,
        price: item.productPrice,
        quantity: item.productQuantity,
        shipFee: item.shipFee,
        discount: item.discount,
        linePoints: item.linePoints,
        lspDiscount: item.lspDiscount,
        total: item.productPrice*item.productQuantity

      });
    }
  }) 

  let targetOrder = null;
  let subTotal = 0
  let shipFee = 0
  let vat = 0
  let grandTotal = 0
  let totalBeforeTax = 0
  let discount = 0
  let linePoints = 0
  let lspDiscount = 0
  let sumDiscount = 0

  if (orders[cusOrderNum]) {
    targetOrder = orders[cusOrderNum];
    console.log('Targetting to the request order number from customer')

    targetOrder.forEach(i => {
      subTotal += i.total
      shipFee += i.shipFee
    });

    sumDiscount = discount+linePoints+lspDiscount
    totalBeforeTax = (subTotal + shipFee) - sumDiscount // totalBeforeTax => total price of every product plus shipping fee
    vat = (totalBeforeTax * 7) / 100   // VAT 7% that was already include in product price
    grandTotal = subTotal - vat   // Actual total price of product before VAT
    console.log('Calculate all value at the end of tax invoice')
  }

  const obj = {
    orders: orders,
    targetOrder: targetOrder,
    subtotal: totalBeforeTax,
    discount: sumDiscount,
    shipFee: shipFee,
    vat: vat,
    gtotal: grandTotal
  }

  const htmlTemplate = fs.readFileSync('invoiceTemplate.hbs', 'utf8')
  const invoiceTemplate = Handlebars.compile(htmlTemplate)

  const date = new Date().toLocaleDateString()
  const invoice_pdf = invoiceTemplate({date: date, obj: obj})

  // Create invoice as PDF file
  pdf.create(invoice_pdf, options).toFile('./taxinvoice.pdf', 
    (err, res) => {
      if (err) {
          return console.log(err);
      } else console.log(`PDF file saved to ${res.filename}`);
    }
  );
})();






