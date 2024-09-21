import dotenv from "dotenv"
import connectDB from "./db/db.js";
import {app} from './app.js'

dotenv.config()

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 7000, ()=>{
        console.log('Server is running on PORT : ' + process.env.PORT);
    } )
})
.catch(()=>{
    console.log('MONGODB connection failed !!' + error)
})


