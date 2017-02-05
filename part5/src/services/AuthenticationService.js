const API_ENDPOINT = 'http://localhost:8001/api/';
const TOKEN_KEY = 'TUTORIAL_APP_TOKEN_KEY';

class AuthenticationService {
    static signIn(username, password) {
        return fetch(`${API_ENDPOINT}/signIn`, {
            method: 'POST',
            body: `username=${username}&password=${password}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    }

    static register(userInfo) {
        return fetch(`${API_ENDPOINT}/signIn`, {
            method: 'POST',
            body: `userInfo=${userInfo}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    }

    static editProfile(userInfo, token) {
        return fetch(`${API_ENDPOINT}/signIn`, {
            method: 'POST',
            body: `userInfo=${userInfo}&token=${token}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    }

    static removeToken() {
        sessionStorage.removeItem(TOKEN_KEY);
    }

    static storeToken(token) {
        sessionStorage.setItem(TOKEN_KEY, token);
    }
}
export default AuthenticationService;
