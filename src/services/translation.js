import * as wanakana from 'wanakana';

const backendUrl = process.env.BACKEND_URL || 'http://localhost:5215';

const getQuestionUrl = `${backendUrl}/Translation/GetQuestion`;
const markQuestionUrl = `${backendUrl}/Translation/MarkQuestion`;

const setHeaders = (jwt) => {
    return new Headers({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
    })
}

const getQuestionRequestOptions = (body, headers) => {
    return {
        method: 'POST',  
        headers: headers,
        body: JSON.stringify(body)
    }
};

const getMarkRequestOptions = (body, headers) => {
    return {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    }
}

const getTranslationQuestion = async (fromLanguage, tokenizer) => {
    let jwt = localStorage.getItem('jwt_token');
    let request = {
        japanese_level: "N2", // Change this after
        from_language: fromLanguage,
    }

    const response = await fetch(getQuestionUrl, getQuestionRequestOptions(request, setHeaders(jwt)));
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

    console.log(translations)

    const response = await fetch(markQuestionUrl, getMarkRequestOptions(translations, setHeaders(jwt)));
    let markedTranslations = await response.json();

    for (let pair of markedTranslations.sentence_pairs) {
        const matchPair = translations.sentence_pairs.find(p => p.id == pair.id)
        if (translations.language == "Japanese") {
            pair.tokenized_question = matchPair.tokenized_question
        }
    }

    return markedTranslations
}

// Tokenize the question if the language is in Japanese, so that the user can select furigana for the question.
// Otherwise, if the language is English, we want to tokenize only the solution, as the solution will be the japanese translation of the english question.
// Also helps to attach back tokenized questions when marked translations are received, but only if language is japanese
const tokenizeTranslations = (translations, tokenizer) => {
    let tokenized_sentence_pairs = []
    for (let pair of translations.sentence_pairs) {
        let tokenized_sentence = null;
        if (translations.language == "Japanese") {
            tokenized_sentence = tokenizer.tokenize(pair.question);
        } else {
            tokenized_sentence = pair.solution != null ? tokenizer.tokenize(pair.solution) : "";
        }

        // Convert reading strings of each kanji to hiragana, for some reason they're set to katakana?
        for (let token of tokenized_sentence) {
            let hiragana_reading = wanakana.toHiragana(token.reading);
            token.reading = hiragana_reading;
        }   

        if (translations.language == "Japanese") {
            pair.tokenized_question = tokenized_sentence;
        } else {
            pair.tokenized_solution = tokenized_sentence;
        }

        tokenized_sentence_pairs.push(pair)
    }
    translations.sentence_pairs = tokenized_sentence_pairs;
}

export { getTranslationQuestion, getTranslationMark, tokenizeTranslations };