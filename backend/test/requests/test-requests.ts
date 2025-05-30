async function fetchWrapper(urlEnding: string, method: string, body?: any, token?: string) {
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

    const request = new Request(`http://localhost:4000${urlEnding}`, requestInit);
    const response = await fetch(request);
    return response;
}

export async function getWrapper(urlEnding: string, token?: string) {
    return fetchWrapper(urlEnding, "GET", undefined, token);
}

export async function postWrapper(urlEnding: string, body: any, token?: string) {
    return fetchWrapper(urlEnding, "POST", body, token);
}
