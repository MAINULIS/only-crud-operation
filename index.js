const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9fxhf2q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();
    const productCollections = client.db('onlyCrudOperation').collection('products');
    // 1. post operation
    app.post('/products', async(req, res) =>{
        const query = req.body;
        const result = await productCollections.insertOne(query);
        res.send(result);
    })

    // 2. find and findOne methods
    app.get('/products', async(req, res) => {
        //  Query for a movie that has the category 'Bag'
        // const query = {category: 'Bag'}
        const cursor = productCollections.find()
        // sort: to get high to low or low to high
        .sort({price: -1})
        .skip(0)
        .limit(4);
        // project filed to get the specific filed
        // .project({name: true, category: true, price:true});
        const products = await cursor.toArray();
        res.send(products);
    })

    //3. get specific single product //route params
    app.get('/product/:id', async(req, res) => {
        const id = req.params.id; //route params
        const query = {_id: new ObjectId(id)};
        const result = await productCollections.findOne(query, {projection: {name:1 , price:1}});
        res.send(result);
    })

    //4.query params(delete, update can be done by query params)
    app.get('/users', async(req, res) => {
      // console.log(req.query.email)
      const email = req.query.email;
      const category= req.query.category;
      let query = {};
      if(email && category){
        query = {email: email, category: category}
      }
      else if(email){
        query = { email: email};
      }
      else{
        query = { category: category};
      }
      const result = await productCollections.find(query).toArray();
      res.send
      (result);
    })


    // 5. update(put: put method update all the data.that's why it is needed to give all the data. we don't add any new data using put)
    app.put('/product/:id', async(req, res) => {
        const id = req.params.id;
        const product = req.body;
        const filter = {_id: new ObjectId(id)};
        const updateDoc = {
            $set: {
                category:product.category,
                name: product.name,
                seller: product.seller,
                price: product.price,
                ratings:product.ratings,
                ratingsCount:product.ratingsCount,
                quantity: product.quantity
            }
        }
        const options = {upsert: true};
        const result = await productCollections.updateOne(filter, updateDoc, options);
        res.send(result)
    })

    //6. patch: is a HTTP protocol method.that is used to modify some specific data. patch method don't modify all the data at all.that's why it is no needed to send all the data for operation.if we add any data then we also can use patch.

    app.patch('/product/:id', async(req, res) => {
      const id = req.params.id;
      const product = req.body;
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set: product
      }
      const result = await productCollections.updateOne(filter, updateDoc);
      res.send(result);
    })

    // 7. delete one
    app.delete('/product/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await productCollections.deleteOne(query);
        res.send(result);
    })

    // 8. delete many
    app.delete('/deleteProduct', async(req, res) =>{
        const query = {category: "Men's Boot"};
        const result = await productCollections.deleteMany(query);
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('crud operation is operating')
})


app.listen(port, () =>{
    console.log(`crud operation is running on port ${port}`)
});