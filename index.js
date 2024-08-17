const express = require('express');
const cors = require('cors');
//for .env file
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;


// middleware
app.use(cors())
app.use(express.json())


// botanicalStore
//RGk51YFtpJedmsZW





const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://botanicalStore:RGk51YFtpJedmsZW@cluster0.ev0lfe7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ev0lfe7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();


        // const botanicalCollection = client.db("botanicalDB").collection("botanical")
        const botanicalCollection = client.db("botanicalDB").collection("products")


        app.get('/products', async (req, res) => {
            const result = await botanicalCollection.find().toArray()
            res.send(result)
        })


          //   pagination

          app.get('/count', async (req, res) => {
            const {name, category, minPrice, maxPrice } = req.query;
        
            const query = {};
        
            if (name) {
                query.name = { $in: name.split(',') };
            }
            if (category) {
                query.category = { $in: category.split(',') };
            }
            if (minPrice && maxPrice) {
                query.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
            }
        
            try {
                const count = await botanicalCollection.countDocuments(query);
                res.send({ count });
            } catch (error) {
                res.status(500).send({ error: 'Error fetching count' });
            }
        });
        
        // Route to get paginated and filtered products
        app.get('/pagination', async (req, res) => {
            const size = parseInt(req.query.size);
            const page = parseInt(req.query.page) - 1;
        
            // Filters
            const {name, category, minPrice, maxPrice, filter } = req.query;
        
            const query = {};
        
            if (name) {
                query.name = { $in: name.split(',') };
            }
        
            if (category) {
                query.category = { $in: category.split(',') };
            }
        
            if (minPrice && maxPrice) {
                query.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
            }
        
            if (filter) {
                query.name = { $regex: filter, $options: 'i' }; // Case-insensitive search
            }
        
            try {
                // Fetch paginated and filtered data
                const items = await botanicalCollection.find(query)
                    .skip(page * size)
                    .limit(size)
                    .toArray();
        
                // Get the total count for pagination
                const totalCount = await botanicalCollection.countDocuments(query);
        
                // Send both items and totalCount as a response
                res.send({ products: items, totalCount });
            } catch (error) {
                res.status(500).send({ error: 'Error fetching products' });
            }
        });



        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





// see in the website
app.get('/', (req, res) => {
    res.send('botanical store in running')
})

//for running on server side cmd
app.listen(port, () => {
    console.log(`botanical store is running on port: ${port}`)
})