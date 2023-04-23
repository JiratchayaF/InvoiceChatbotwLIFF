const { MongoClient } = require('mongodb')
const url = 'mongodb+srv://fuengjiratchaya:mongotest123@testmongo.wxnjfzh.mongodb.net/invoiceData'

async function getOrders() {
  const client = new MongoClient(url, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true })

  try {
    console.log("Connecting to the database...");
    await client.connect()

    console.log("Connected to the database");
    const db = client.db('InvoiceData')
    const collection = db.collection('transactions');
    const data = await collection.find().toArray();

    console.log(`Retrieved ${data.length} records from the database`);
    return data;
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
    console.log("Database connection closed");
  }
}


module.exports = {
    getOrders
}


