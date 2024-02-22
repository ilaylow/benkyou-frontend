
<!-- src/pages/Home.svelte -->
<script>
    import Title from '../components/Title.svelte';
    import Button from '../components/Button.svelte';
    import Footer from '../components/Footer.svelte';
    import SignIn from '../components/SignIn.svelte';

    import {isTokenPresentAndValid} from '../utils/jwt';

    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';
    function goToPractice() {
        navigate("/practice")
    }

    let isLoggedIn = false;
    let isSignUp = false;

    onMount(() => {
        // Ensure this code runs only in the browser
        if (typeof window !== 'undefined') {
            if (!isTokenPresentAndValid()) {
                isLoggedIn = false;
            } else {
                isLoggedIn = true;
            }
        }
    });

    function handleLogOut() {
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => window.location.reload(), 750)
    }
</script>

<style>
    
    .logout-container {
        position: fixed;
        margin-bottom: 90vh;
        margin-left: 65%;
    }

    .title-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: 25vh;
    }

    .translation-practice-button-container {
        position: fixed;
        margin-left: 63vw;
        margin-top: 35vh;
        transform: rotate(30deg);
    }

    .kanji-practice-button-container {
        position: fixed;
        margin-top: 39vh;
        margin-right: 0vw;
        transform: rotate(-15deg);
    }

    .sentence-analysis-button-container {
        position: fixed;
        margin-top: 25vh;
        margin-right: 64vw;
        transform: rotate(10deg);
    }
</style>

<main>
    {#if !isLoggedIn}
        <SignIn/>
    {:else if isSignUp}
        <SignIn/>
    {:else}
        <div class="logout-container">
            <Button style="logout" on:click={handleLogOut} text="ログアウト"/>
        </div> 
        <div class="title-container">
            <Title />
            <div class="translation-practice-button-container">
                <Button style="router" on:click={goToPractice} text="翻訳練習"/> 
            </div>
            <div class="kanji-practice-button-container">
                <Button style="router kanji" on:click={goToPractice} text="漢字"/> 
            </div>
            <div class="sentence-analysis-button-container">
                <Button style="router sentence-analysis" on:click={goToPractice} text="A.Iで文の分析"/> 
            </div>
        </div>
        <Footer />
    {/if}
</main>
