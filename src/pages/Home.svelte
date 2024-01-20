
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
        window.location.reload()
    }
</script>

<style>
    
    .logout-container {
        margin-left: 65%;
        margin-top: -20%;
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
        <Title />
        <Button on:click={goToPractice} text="翻訳練習"/>
        <Footer />
    {/if}
</main>
