<!-- src/components/PracticeInput.svelte -->
<script>

  import { getTranslationMark } from "../services/translation";
  import * as wanakana from 'wanakana';
  import Button from "./Button.svelte";
  import Toggle from "./Toggle.svelte";
  import Error from "./Error.svelte";

    // Your data objects
    export let translations = [];

    // Reactive variable for loading state
    let isMarking = false;
    let showSolution = false;
    let showFurigana = false;
    let showError = false;

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
            translations = markedTranslations;
            showSolution = true;
        } catch (error) {
            console.error('Error fetching data:', error);
            showError = true;
        }
        isMarking = false;   
    }

    function handleRefreshQuestions() {
        window.location.reload()
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
        justify-content: space-between; /* This will put space between the h1 and the button */
        margin-bottom: -1%;
    }
    
    .question {
        margin-bottom: 0.5em;
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
        margin-right: auto;
        font-family: Meiryo, Yu Gothic, sans-serif;
        text-decoration: underline;
        text-decoration-color: currentColor; /* optional, to specify the color of the underline */
        text-decoration-thickness: 18%; /* controls the thickness of the underline */
        text-underline-offset: 0.2em; /* controls the distance between text and underline */
    }

    h2 {
        color: #969494;
        font-size: 40;
        margin-bottom: 3%;
    }

    ruby {
      word-wrap: break-word; /* This ensures text goes to the next line */
      hyphens: auto; /* Optional: This will hyphenate words if necessary */
      font-size: 120%;
      font-family: Meiryo, Yu Gothic, sans-serif;
      font-weight: bold;
    }

    p {
      word-wrap: break-word; /* This ensures text goes to the next line */
      hyphens: auto; /* Optional: This will hyphenate words if necessary */
      font-size: 120%;
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

    @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
</style>
  
<div class="container {isMarking ? 'is-marking' : ''}">
    <h1>練習しましょう</h1>
    <div class="header-container">
        <h2>下一つ一つの文を翻訳して答えを入力してください。</h2>
        <Toggle bind:value={showFurigana} label="Furigana" design="slider" />
        <Button style="retry" on:click={handleRefreshQuestions} text="更新"/>
    </div>
    {#each translations.sentence_pairs as { id, question, tokenized_question, answer, solution, score }}
        <div class="question">
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
            <input type="text" bind:value={answer} on:input={(event) => handleInput(event, id)} placeholder="答え。。。">
            <div class="solution-container {showSolution ? 'is-shown' : ''}">
                <p>Solution: {solution}</p>
                <p>Score: {score}/5</p>
            </div>
        </div>
    {/each}
    <div class="button-container {isMarking ? 'is-marking' : ''}">
        <Button text="確認" on:click={handleMark} disabled={isMarking}/>
        <div class="loading-icon"></div>
        <Error showError={showError}/>
    </div>
</div>