const express = require('express')
const app  =  express()
const dotenv = require('dotenv')

const connectDB = require('./db/db.js')

app.use(express.json())
connectDB()


dotenv.config()


 

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
})
