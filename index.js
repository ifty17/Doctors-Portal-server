const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;
require('dotenv').config();

const app = express();

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3e0xlo7.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run(){
    try{
        const appointmentOptionCollection = client.db("milestoneDoctors").collection("appointmentOptions");
        const bookingsCollection = client.db("milestoneDoctors").collection("bookings");

        //Use aggregate to query multiple collection and then merge data;
          app.get("/appointmentOptions", async(req, res) =>{
            const date = req.query.date;
            console.log(date);
            const query = {};
            const options = await appointmentOptionCollection.find(query).toArray();

            //get the bookings of the provided date;
            const bookingQuery = { appointmentDate: date };
            const alreadyBooked = await bookingsCollection.find(bookingQuery).toArray();

            //code carefully
            options.forEach(option =>{
                const optionBooked = alreadyBooked.filter(book => book.treatment === option.name);
                const bookSlots = optionBooked.map(book => book.slot);
                const remainingSlots = option.slots.filter(slot => !bookSlots.includes(slot));
                option.slots = remainingSlots;
            })
            res.send(options);
          })

          app.post('/bookings', async(req, res) =>{
            const booking = req.body;
            
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
          })


    }
    finally{

    }
}
run().catch(error => console.log(error))


app.get('/', async(req, res) =>{
    res.send("doctors portal server is running")
})

app.listen(port, () => console.log(`Doctors portal running on ${port}`));