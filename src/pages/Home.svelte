
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
        margin-left: 65%;
        margin-bottom: 13vh;
    }

    .title-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: 39vh;
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
            <Button on:click={goToPractice} text="翻訳練習"/>
        </div>
        <Footer />
    {/if}
</main>
