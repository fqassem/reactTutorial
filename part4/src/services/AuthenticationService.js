const API_ENDPOINT = 'http://localhost:8001/api/';

class AuthenticationService {
    static token = null;

    static signIn(username, password) {
        return fetch(`${API_ENDPOINT}signIn`, {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    static storeToken(token) {
        AuthenticationService.token = token;
    }
}
export default AuthenticationService;
