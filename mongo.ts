import {MongoClient, Db} from 'mongodb';

class Database{
    private static instance: Database;
    private dbClient: MongoClient;
    private db!: Db;

    private constructor(uri: string, dbName: string){
        this.dbClient = new MongoClient(uri);
    }

    private async connectAndPing(dbName: string): Promise<void> {
        try {
            await this.dbClient.connect();
            this.db = this.dbClient.db(dbName);
            await this.db.command({ ping: 1 });
            console.log("Connected to MongoDB and pinged successfully.");
        } catch (error) {
            console.error("MongoDB connection error:", error);
            throw error; 
        }
    }

    public static async getInstance(): Promise<Database>{
        if(!Database.instance){
            Database.instance  = new Database('mongodb+srv://rohankanti:Gogginsnow2527_@cluster0.zglu69c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0','main');
            await Database.instance.connectAndPing('main');
        }
        return Database.instance;
    }

    public getDb(): Db{
        if (!this.db) {
            throw new Error("Database not initialized");
        }
        return this.db;
    }
}

export { Database };