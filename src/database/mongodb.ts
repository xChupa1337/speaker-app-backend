import mongoose from 'mongoose';
import {MONGODB_URI, NODE_ENV} from "../config/env";
import { MongoMemoryServer } from 'mongodb-memory-server';

const connectToDataBase = async () => {
    try {
        if (!MONGODB_URI) throw new Error('MongoDB URI must be defined');
        await mongoose.connect(MONGODB_URI);
        console.log(`Connected to Database on ${NODE_ENV} mode`);
    } catch (e: any) {
        console.error('Remote DB connection failed, falling back to local memory server...');
        try {
            const mongoServer = await MongoMemoryServer.create();
            const uri = mongoServer.getUri();
            await mongoose.connect(uri);
            console.log(`Connected to IN-MEMORY Database on ${NODE_ENV} mode`);
        } catch (memError) {
            console.error('Error connecting to in-memory db', memError);
            process.exit(1);
        }
    }
};

export default connectToDataBase;
