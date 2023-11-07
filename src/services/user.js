const backendUrl = process.env.BACKEND_URL || 'http://localhost:5215';
const userSignInURL = `${backendUrl}/User/SignIn`;

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
    for (let pair of response.headers.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

    let data = await response.json();

    return data
};

export {signInUser};