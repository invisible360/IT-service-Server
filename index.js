const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');//require('crypto').randomBytes(64).toString ('hex')
require('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectID } = require('bson');


const app = express();


//middle wares
app.use(cors());
app.use(express.json());

const dbUsername = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

//token verfiation
/* const verifyToken = (req, res, next) => {
    // console.log(req.headers.authorization);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1]
    // console.log(token);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' });
        }
        req.decoded = decoded;
        next();
    })
} */


const uri = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.bmwcolr.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);// for checking
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('itSolutionDatabase').collection('services');
        const reviewsCollection = client.db('itSolutionDatabase').collection('reviews');

        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        })
        app.get('/allservices', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const allServices = await cursor.toArray();
            res.send(allServices);
        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        app.post('/reviews', async (req, res) => {
            const reviews = req.body;
            const result = await reviewsCollection.insertOne(reviews);
            res.send(result);
        })
        app.post('/allservices', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })

        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewsCollection.find(query);
            const allReviews = await cursor.toArray();
            res.send(allReviews);
        })

        app.post('/reviewsByServiceID', async (req, res) => {
            const ids = req.body;
            const filterIDS = ids.map(id => id)
            const query = { service: { $in: filterIDS } };
            const cursor = reviewsCollection.find(query);
            const allReviews = await cursor.toArray();
            res.send(allReviews);

        })

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const result = await reviewsCollection.deleteOne(query)
            res.send(result)
        })

        app.get('/update/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const user = await reviewsCollection.findOne(query);
            res.send(user);
        })

        app.put('/review/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: ObjectID(id) };
            const review = req.body;
            console.log(review);

            const options = { upsert: true };
            const updatedReview = {
                $set: {
                    reviewerMessage: review.updatedRev
                }
            };
            const result = await reviewsCollection.updateOne(filter, updatedReview, options);
            res.send(result);
        })

    }
    finally {

    }

}
run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('IT service Server is Running');
})

app.listen(port, () => {
    console.log(`IT service server is running on port ${port}`)
})