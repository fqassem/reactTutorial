const API_ENDPOINT = 'http://localhost:8001/api/';
const TOKEN_KEY = 'TUTORIAL_APP_TOKEN_KEY';

class AuthenticationService {
    static TOKEN = null;

    static signIn(username, password) {
        return fetch(`${API_ENDPOINT}signIn`, {
            method: 'POST',
            body: `username=${username}&password=${password}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    }

    static storeToken(token) {
        AuthenticationService.TOKEN = null;
    }
}
export default AuthenticationService;
