const API_ENDPOINT = 'http://localhost:8001/api/';

class AuthenticationService {
    static token = null;

    static signIn(username, password) {
        return fetch(`${API_ENDPOINT}signIn`, {
            method: 'POST',
            body: `username=${username}&password=${password}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    }

    static register(userInfo) {
        return fetch(`${API_ENDPOINT}register`, {
            method: 'POST',
            body: JSON.stringify(userInfo),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    static editProfile(userInfo) {
        const token = AuthenticationService.getToken();
        return fetch(`${API_ENDPOINT}editProfile`, {
            method: 'POST',
            body: JSON.stringify({
                userInfo,
                token
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    static removeToken() {
        AuthenticationService.token = null;
    }

    static storeToken(token) {
        AuthenticationService.token = token;
    }

    static getToken() {
        return AuthenticationService.token;
    }

    static isLoggedIn() {
        return AuthenticationService.token !== null;
    }
}
export default AuthenticationService;
