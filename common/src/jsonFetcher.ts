export default class JSONFetcher {
    url: string;

    constructor(url: string) {
        this.url = url;
    }

    async fetch(urlEnding: string, method: string, body?: any, token?: string) {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        if (token) {
            headers.append("Authorization", `Bearer ${token}`);
        }

        const requestInit: RequestInit = {
            method: method,
            headers: headers
        }
        if (body) {
            requestInit.body = JSON.stringify(body);
        }

        const request = new Request(`${this.url}${urlEnding}`, requestInit);
        const response = await fetch(request);
        return response;
    }

    async get(urlEnding: string, token?: string) {
        return this.fetch(urlEnding, "GET", undefined, token);
    }

    async post(urlEnding: string, body: any, token?: string) {
        return this.fetch(urlEnding, "POST", body, token);
    }
}
