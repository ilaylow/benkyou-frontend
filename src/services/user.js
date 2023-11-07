const userSignInURL = 'http://localhost:5215/User/SignIn';

const headers = new Headers({
        'Content-Type': 'application/json'
    })


const setSignInRequestOptions = (body) => {
    return {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    } 
};

const signInUser = async (body) => {
    const response = await fetch(userSignInURL, setSignInRequestOptions(body));
    let data = await response.json();

    return data
};

export {signInUser};