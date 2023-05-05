const fs = require('fs');
const {SignedXml} = require('xml-crypto');
const forge = require('node-forge');

// Read the XML document to be signed
const xml = fs.readFileSync('document.xml', 'utf8');

// Create a signer object
const sig = new SignedXml()

// Configure the signer object
// signer.signatureAlgorithm = 'ttp://www.w3.org/2000/09/xmldsig#enveloped-signature';
sig.addReference('//*[local-name(.)="catalog"]', ['http://www.w3.org/2000/09/xmldsig#enveloped-signature']);

const privateKey = fs.readFileSync('./built/private_key.pem', 'utf-8')
sig.signingKey = {
  key: privateKey,
  passphrase: '3500101376'
}

var certificate = fs.readFileSync('./built/certificate.pem', 'utf-8')
var encodedCertificate = Buffer.from(certificate).toString('base64');

// // อันนี้ใช้ได้ชัว
sig.keyInfoProvider = {
    getKeyInfo() {
      return `<X509Data><X509Certificate>${encodedCertificate}</X509Certificate></X509Data>`;
    },
  }

// sig.keyInfoProvider = {
//     getKeyInfo() {
      
//       // Get the issuer name and serial number of the certificate
//       const cert = forge.pki.certificateFromPem(certificate);
//       const issuerName = cert.issuer.attributes.map(attr => `${attr.shortName}=${attr.value}`).join(', ');
//       const serialNumber = cert.serialNumber.toString();
      
//       // Create the <xades:Certificate> element
//       const certificateXml = `<xades:Certificate><xades:IssuerName>${issuerName}</xades:IssuerName><xades:SerialNumber>${serialNumber}</xades:SerialNumber><xades:Cert>${encodedCertificate}</xades:Cert></xades:Certificate>`;
      
//       // Return the <KeyInfo> element with t <xades:Cert><xades:CertDigest><DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256" /><DigestValue>${sha256(encodedCertificate)}</DigestValue></xades:CertDigest><xades:IssuerSerial><X509IssuerName>${getIssuerName(certificate)}</X509IssuerName><X509SerialNumber>${getSerialNumber(certificate)}</X509SerialNumber></xades:IssuerSerial></xades:Cert>`;
//     return certInfoXml;
//   }

// const certInfoXml = getCertificateInfo()

// Create the signed XML document
sig.computeSignature(xml)
let signedXml = sig.getSignedXml()
// console.log(sig.getSignedXml())

// console.log('signedXml: ', signedXml)

// Create an object to include in the signature
const objectXml = '<Object></Object>';
const cert = forge.pki.certificateFromPem(certificate);
const issuerName = cert.issuer.attributes.map(attr => `${attr.shortName}=${attr.value}`).join(', ');
const serialNumber = cert.serialNumber.toString();

// Create the qualifying properties
const qualifyingPropertiesXml = `<xades:QualifyingProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Target="#xmldsig-69b3d670-04e4-419f-8d45-938ea867f571"><xades:SignedProperties Id="xmldsig-69b3d670-04e4-419f-8d45-938ea867f571-signedprops"><xades:SignedSignatureProperties><xades:SigningTime>2023-05-06T12:34:56.789Z</xades:SigningTime><xades:SigningCertificate><xades:Cert><xades:CertDigest><DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256" /><DigestValue>${encodedCertificate}</DigestValue></xades:CertDigest><xades:IssuerSerial><X509IssuerName>${issuerName}</X509IssuerName><X509SerialNumber>${serialNumber}</X509SerialNumber></xades:IssuerSerial></xades:Cert></xades:SigningCertificate></xades:SignedSignatureProperties></xades:SignedProperties></xades:QualifyingProperties>`
// const qualifyingPropertiesXml = qualifyingPropertiesXml.replace('</xades:SignedSignatureProperties>', `</xades:SignedSignatureProperties>${certInfoXml}`);

// Add the qualifying properties to the object
const objectWithQualifyingPropertiesXml = objectXml.replace('</Object>', qualifyingPropertiesXml + '</Object>');

// // Add certificate properties
// const certificateXml = `<xades:IssuerName>${issuerName}</xades:IssuerName><xades:SerialNumber>${serialNumber}</xades:SerialNumber><xades:Cert>${encodedCertificate}</xades:Cert>`;

// const objectWithcertificateXml = objectWithQualifyingPropertiesXml.replace(certificateXml);


// Add the object to the signed XML document
const signedXmlWithObject = signedXml.replace('</Signature>', objectWithQualifyingPropertiesXml + '</Signature>');

// Create the <xades:Certificate> element

const finalXml = sig.getSignedXml({ pretty: true });

// Write the signed XML document to a file
fs.writeFileSync('signedDocument.xml', signedXmlWithObject, 'utf8');