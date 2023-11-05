// URL to send the request to
const getQuestionUrl = 'http://localhost:5215/Translation/GetQuestion';
const markQuestionUrl = 'http://localhost:5215/Translation/MarkQuestion';

// Headers for the request
const headers = new Headers({
    'Content-Type': 'application/json',
    'oaitoken': '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'
});

// Options for the request
const getQuestionRequestOptions = {
    method: 'GET',    // Specify the request method
    headers: headers,  // Specify the headers
};

const getMarkRequestOptions = (body) => {
    return {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    }
}

const getTranslationQuestion = async () => {
    const response = await fetch(getQuestionUrl, getQuestionRequestOptions);
    let data = await response.json();

    return data
};

const getTranslationMark = async (translations) => {
    console.log(getMarkRequestOptions(translations))

    let data = null;
    try {
        const response = await fetch(markQuestionUrl, getMarkRequestOptions(translations));
        data = await response.json();
    } catch (error) {
        console.log(error)
    }
    
    return data
}

export { getTranslationQuestion, getTranslationMark };