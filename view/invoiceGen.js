const fs = require('fs');
const pdf = require('html-pdf');
const Handlebars = require('handlebars');
const PDFDocument = require('pdfkit');
const ejs = require('ejs');

const options = { 
    format: 'A5',
    orientation: 'portrait',
    border: '8.mm'
};

const generatePdf = async (req, res, next) => {
    const data = JSON.parse(fs.readFileSync('mockData/data.json', 'utf8'));
    const htmlTemplate = fs.readFileSync('taxinvoice_template.html', 'utf8');
    const fileName = 'Invoice' + data.invoiceNumber;
    let array =[];

    // Calculate total before tax, tax and subtotal after tax
    let total = 0;
    array.forEach(i => {
        total += i.total
    });

    const tax = (total * 7)/100;
    const grandTotal = total + tax;

    const invoiceTemplate = Handlebars.compile(htmlTemplate);
    const invoice_pdf = invoiceTemplate(data);

    pdf.create(invoice_pdf, options)
        .then(res => {
            console.log(res);
        }).catch(err => {
            console.log(err);
        });

        const filePath = 'http://localhost:3000/downloaded/' + fileName;

        res.render('download', {
            path: filePath
        })
};



// !! Below source code is for generate pdf invoice and save locally on disk

// // Read HTML file and retreive user data from JSON file
// const htmlTemplate = fs.readFileSync('taxinvoice_template.html', 'utf8');

// const data = JSON.parse(fs.readFileSync('user_data.json', 'utf8'));
// console.log('user data parsed')

// // Compile HTML file using a template engine (Handlebar)
// const invoiceTemplate = Handlebars.compile(htmlTemplate);

// const invoice_pdf = invoiceTemplate(data)
// console.log('complied template with data')

// // Create invoice as PDF file
// pdf.create(invoice_pdf).toFile('./taxinvoice1.pdf', 
// (err, res) => {
//     if (err) {
//         return console.log(err);
//     } else console.log(`PDF file saved to ${res.filename}`);
//   }
// );
