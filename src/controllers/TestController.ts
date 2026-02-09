import express from "express";
import { getDatabases } from "../services/TestService"

export const getAllDatabases = async (req: express.Request, res: express.Response): Promise<void> => {
    res.render('databaseList.html', { databases: await getDatabases() });
}