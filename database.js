import {MongoClient} from 'mongodb';

const databaseInfo = 'mongodb://localhost:27017/nbatop75';
const client = new MongoClient(databaseInfo);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to NBA Top 75 database!");
        return client.db();
    } catch (err) {
        console.error("Error connecting to NBA Top 75 database: ", err);
    }
}

export default connectToDatabase;