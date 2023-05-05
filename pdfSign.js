const fs = require('fs');
const pdfSigner = require('pdf-signer');
const asn1js = require('asn1js');
const pkijs = require('pkijs');
const crypto = require('node-webcrypto-ossl');

async function signPdf() {
  // Load the PDF document to be signed
  const pdfData = fs.readFileSync('pdftest.pdf');

  // Load the private key and certificate
  const privateKeyData = fs.readFileSync('./built/private_key.pem');
  const certificateData = fs.readFileSync('./built/csr.pem');

  // Parse the private key and certificate with the pkijs library
  const privateKeyAsn1 = asn1js.fromBER(privateKeyData);
  const privateKey = await crypto.subtle.importKey('pkcs8', privateKeyAsn1.result, { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } }, true, ['sign']);  const certificateAsn1 = asn1js.fromBER(certificateData);
  const certificate = new pkijs.Certificate({ schema: certificateAsn1.result });

  // Choose the signature policies and parameters
  const signatureOptions = {
    reason: 'I am the author of this document',
    location: 'New York, NY',
    signerName: 'John Doe',
    signaturePolicy: pkijs.PolicyIdentifier.fromString('1.2.840.113549.1.9.16.6.1'),
  };

  // Create the signature using the pdf-signer library
  const signedPdf = await pdfSigner.sign(pdfData, {
    signatureOptions,
    privateKey,
    certificate,
  });

  // Save the signed PDF to a file or stream
  fs.writeFileSync('signed.pdf', signedPdf);
  console.log('PDF signed successfully');
}

signPdf().catch((error) => {
  console.error('Error signing PDF:', error);
});
