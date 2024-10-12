const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const { readdirSync } = require('fs');

const corsOption = {
    origin: '*',
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOption));

require('dotenv').config()

readdirSync('./routes').map((router)=>{
    app.use('/',require('./routes/' + router))
})

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})