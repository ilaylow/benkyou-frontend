const backendUrl = process.env.BACKEND_URL || 'http://localhost:5215';

const getQuestionUrl = `${backendUrl}/Translation/GetQuestion`;
const markQuestionUrl = `${backendUrl}/Translation/MarkQuestion`;

const setHeaders = (jwt) => {
    return new Headers({
        'Content-Type': 'application/json',
        'oaitoken': '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',
        'Authorization': 'Bearer ' + jwt
    })
}

const getQuestionRequestOptions = (headers) => {
    return {
        method: 'GET',  
        headers: headers,
    }
};

const getMarkRequestOptions = (body, headers) => {
    return {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    }
}

const getTranslationQuestion = async () => {
    let jwt = localStorage.getItem('jwt_token');

    const response = await fetch(getQuestionUrl, getQuestionRequestOptions(setHeaders(jwt)));
    return await response.json();

};

const getTranslationMark = async (translations) => {
    // Remove tokenized questions before sending to server for marking
    let sendTranslations = structuredClone(translations);
    for (let pair of sendTranslations.sentence_pairs) {
        delete pair.tokenized_question;
    }

    let jwt = localStorage.getItem('jwt_token');
    let uid = localStorage.getItem('uid');
    translations.uid = uid;

    const response = await fetch(markQuestionUrl, getMarkRequestOptions(translations, setHeaders(jwt)));
    let markedTranslations = await response.json();

    // Attach back tokenized questions when marked translations are received
    for (let pair of markedTranslations.sentence_pairs) {
        const matchPair = translations.sentence_pairs.find(p => p.id == pair.id)
        pair.tokenized_question = matchPair.tokenized_question
    }

    return markedTranslations
}

export { getTranslationQuestion, getTranslationMark };