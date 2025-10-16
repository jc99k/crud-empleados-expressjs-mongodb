
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

// Connection URL
const url = 'mongodb://db:27017';
const dbName = 'employeesDB';
const client = new MongoClient(url);

let db;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'templates')));


async function connectToDb() {
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB');
        db = client.db(dbName);
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
}

connectToDb();


app.get('/', async (req, res) => {
    const employees = await db.collection('employees').find({}).toArray();
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

app.get('/employees', async (req, res) => {
    const employees = await db.collection('employees').find({}).toArray();
    res.json(employees);
});

app.post('/employees', async (req, res) => {
    const { name, email, birthday, phone } = req.body;
    await db.collection('employees').insertOne({ name, email, birthday, phone });
    res.redirect('/');
});

app.post('/employees/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, birthday, phone } = req.body;
    await db.collection('employees').updateOne({ _id: new ObjectId(id) }, { $set: { name, email, birthday, phone } });
    res.redirect('/');
});

app.post('/employees/delete/:id', async (req, res) => {
    const { id } = req.params;
    await db.collection('employees').deleteOne({ _id: new ObjectId(id) });
    res.redirect('/');
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
