require('dotenv').config();
const app=require('./app');
const {connectPostgres}=require('./config/postgres');
const connectMongo = require('./config/mongo');

const PORT=process.env.PORT || 5000;

const startServer=async()=>{
    try{
        await connectPostgres();
        await connectMongo();
        app.listen(PORT,()=>{
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch(error){
        console.log('Failed to start server: ',error.message);
        process.exit(1);
    }
};
startServer();