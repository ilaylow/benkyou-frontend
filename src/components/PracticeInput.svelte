<!-- src/components/PracticeInput.svelte -->
<script>
    import { onMount } from 'svelte';
    import { getTranslationMark, tokenizeTranslations } from "../services/translation";
    import * as wanakana from 'wanakana';
    import Button from "./Button.svelte";
    import Toggle from "./Toggle.svelte";
    import Error from "./Error.svelte";
    import Slider from "./Slider.svelte";

    export let translations = [];
    export let tokenizer = null;
    let subject = sessionStorage.getItem("subject") || "";
    // Reactive variable for loading state
    let isMarking = false;
    let showSolution = false;
    let showFurigana = false;
    let showError = false;

    onMount(async () => {
        if (translations.sentence_pairs[0].solution != "") {
            showSolution = true;
        }
    })

    // A function to handle the input event
    function handleInput(event, id) {
        // Find the sentence pair by id
        const pair = translations.sentence_pairs.find(p => p.id === id);
        if (pair) {
            pair.answer = event.target.value; // Update the answer property
        }
        const nextPairs = translations.sentence_pairs.map(p => {
            if (p.id == pair.id) {
                return {
                    ...p,
                    answer: pair.answer
                }
            } else {
                return p;
            }
        })
        translations.sentence_pairs = nextPairs;
    }

    async function handleMark() {
        showError = false;
        isMarking = true;
        try {
            const markedTranslations = await getTranslationMark(translations);
            tokenizeTranslations(markedTranslations, tokenizer);
            translations = markedTranslations;
            showSolution = true;

            sessionStorage.setItem("translations", JSON.stringify(translations))
        } catch (error) {
            console.error('Error fetching data:', error);
            showError = true;
        }
        isMarking = false;   
    }

    function handleRefreshQuestions() {
        sessionStorage.removeItem("translations")
        window.location.reload()
    }

    function getNextFromLanguage() {
        let currLanguage = sessionStorage.getItem("from_language") || "Japanese";
        let nextLanguage = currLanguage == "Japanese" ? "English" : "Japanese";
        return nextLanguage;
    }

    function handleSwapFromLanguage() {
        sessionStorage.setItem("from_language", getNextFromLanguage());
        sessionStorage.removeItem("translations")
        window.location.reload();
    }

    function handleDifficultyChange(event) {
        sessionStorage.setItem("difficulty", event.target.value);
    }

    function handleSubjectInput(event) {
        console.log(event.target.value)
        sessionStorage.setItem("subject", event.target.value);
    }

    function tokenShouldShowFurigana(token) {
        for (const char of token) {
            if (wanakana.isKanji(char)) {
                return true
            }
        }
        return false;
    } 
  </script>

<style>
    .container {
        margin-top: 0%; /* Adjusted to be relative to the parent container */
        margin-left: -6%; /* Adjusted to be relative to the parent container */
        width: 60%; /* Set a fixed width relative to the parent container */
        height: 90%;
    }

    .header-container {
        display: flex;
        align-items: center;
        margin-bottom: -1%;
        gap: 2.5%;
    }
    
    .question {
        margin-bottom: 0.5em;
    }

    .subject-container {
        display: flex;
        align-items: center;
        width: 45rem;
        margin-bottom: -1%;
    }

    .subject-container .subject {
        height: 1.8rem;
    }

    .subject-container .note{
        margin-bottom: 1.75rem;
        margin-left: 1rem;
        font-size: 68%;
        color: #807e7e;
        white-space: nowrap;
        font-weight: normal;
    }
  
    input[type="text"] {
      width: 100%;
      padding: 8px;
      margin-bottom: 1em;
      box-sizing: border-box; /* ensures padding doesn't affect width */
      border: none;
    }

    input[type="text"]:focus {
        outline: none;
    }

    h1 {
        font-size: clamp(25px, 3vw, 40px);
        margin-right: auto;
        font-family: Meiryo, Yu Gothic, sans-serif;
        text-decoration: underline;
        text-decoration-color: currentColor; /* optional, to specify the color of the underline */
        text-decoration-thickness: 18%; /* controls the thickness of the underline */
        text-underline-offset: 0.2em; /* controls the distance between text and underline */
    }

    h2 {
        color: #969494;
        font-size: clamp(15px, 2vw, 25px);
        margin-bottom: 3%;
    }

    ruby {
      word-wrap: break-word; /* This ensures text goes to the next line */
      hyphens: auto; /* Optional: This will hyphenate words if necessary */
      font-size: clamp(17px, 1.1vw, 21px);
      font-family: Meiryo, Yu Gothic, sans-serif;
      font-weight: bold;
    }

    p {
      word-wrap: break-word; /* This ensures text goes to the next line */
      hyphens: auto; /* Optional: This will hyphenate words if necessary */
      font-size: clamp(18px, 1.1vw, 30px);
      font-family: Meiryo, Yu Gothic, sans-serif;
      font-weight: bold;
    }

    .button-container {
        display: flex;
        align-items: center; /* Align items vertically */
        justify-content: flex-start; /* Align button to the start of the container */
    }

    .button-container.is-marking .loading-icon {
        display: inline-block;
    }

    .loading-icon {
        display: none; /* Hide by default */
        margin-left: 3rem;
        margin-top: 2rem;
        border: 0.5rem solid #181818; /* Background color */
        border-top: 0.5rem solid #ff4081; /* Foreground color */
        border-radius: 50%;
        width: 1rem;
        height: 1rem;
        transform: translate(-50%, -50%); /* Adjust the position */
        animation: spin 2s linear infinite;
    }

    .container.is-marking .loading-icon {
        display: block;
    }

    .solution-container {
        display: none;
    }

    .solution-container.is-shown {
        display: block;
        font-size: 70%;
        margin-bottom: 2%;
        border-bottom: 0.01rem solid #ccc;
	    border-radius: 1%;
    }

    .question-para {
        font-size: 100%;
    }

    .solution-ruby {
        font-size: 120%;
    }

    .solution-rt {
        font-size: 70%;
    }

    @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
</style>
  
<div class="container {isMarking ? 'is-marking' : ''}">
    <h1>翻訳練習しましょう</h1>
    <div class="subject-container">
        <input class="subject" type="text" bind:value={subject} on:input={(event) => handleSubjectInput(event)} placeholder="サブジェクト">
        <p class="note">＊強調したい所（任意）（e.g. Sports, School, Travelling） ＊入力してから、ページを更新してください</p>
    </div>
    <Slider childFunction={handleDifficultyChange}/>
    <div class="header-container">
        <h2>下一つ一つの文を翻訳して答えを入力してください。</h2>
        <Button style="swap" on:click={handleSwapFromLanguage} text="Translate from {getNextFromLanguage()}"/>
        <Toggle bind:value={showFurigana} label="Furigana" design="slider" />
        <Button style="retry" on:click={handleRefreshQuestions} text="更新"/>
    </div>
    {#each translations.sentence_pairs as { id, question, tokenized_question, answer, solution, tokenized_solution, score }}
        <div class="question">
            {#if tokenized_question == null}
                <p class="question-para">{question}</p>
            {:else}    
                {#each tokenized_question as { surface_form, reading }}
                    {#if tokenShouldShowFurigana(surface_form) && showFurigana}
                        <ruby>
                            {surface_form}<rt>{reading}</rt>
                        </ruby>
                    {:else}
                        <ruby>
                            {surface_form}
                        </ruby>
                    {/if}
                {/each}
            {/if}
            <input type="text" bind:value={answer} on:input={(event) => handleInput(event, id)} placeholder="答え。。。">
            <div class="solution-container {showSolution ? 'is-shown' : ''}">
                {#if tokenized_solution == null}
                    <p>{solution}</p>
                {:else}    
                    {#each tokenized_solution as { surface_form, reading }}
                        {#if tokenShouldShowFurigana(surface_form) && showFurigana}
                            <ruby class="solution-ruby">
                                {surface_form}<rt class="solution-rt">{reading}</rt>
                            </ruby>
                        {:else}
                            <ruby class="solution-ruby">
                                {surface_form}
                            </ruby>
                        {/if}
                    {/each}
                {/if}
                <p>Score: {score}/5</p>
            </div>
        </div>
    {/each}
    <div class="button-container {isMarking ? 'is-marking' : ''}">
        <Button text="確認" on:click={handleMark} loading={isMarking}/>
        <div class="loading-icon"></div>
        <Error showError={showError}/>
    </div>
</div>