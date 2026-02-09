import axios, { AxiosResponse } from "axios";

export const getDatabases = async (): Promise<string[]> => {
    try {
        const response: AxiosResponse = await axios.get("http://localhost:8080/api/test");

        return response.data;
    } catch (e) {
        console.log(e);
        throw new Error('Failed to get databases');
    }
}