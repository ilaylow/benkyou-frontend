function isTokenPresentAndValid() {
    const token = localStorage.getItem('jwt_token');

    if (!token) {
        return false;
    }

    try {
        // Decode the JWT token without verifying to get the payload
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Get the current time and compare with the exp field in the token payload
        const currentTime = Date.now() / 1000;
        if (payload.exp < currentTime) {

        // Token has expired
        return false;
        }

        return true;
    } catch (e) {
        // If there's an error decoding the token, it's not valid
        return false;
    }
}

export {isTokenPresentAndValid}