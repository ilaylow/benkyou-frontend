
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
</script>

<style>
</style>

<main>
    {#if !isLoggedIn}
        <SignIn/>
    {:else if isSignUp}
        <SignIn/>
    {:else}
        <Title />
        <Button on:click={goToPractice}/>
        <Footer />
    {/if}
</main>
