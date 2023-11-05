
<!-- src/pages/Home.svelte -->
<script>
    import Title from '../components/Title.svelte';
    import Button from '../components/Button.svelte';
    import Footer from '../components/Footer.svelte';

    import { navigate } from 'svelte-routing';
    function goToPractice() {
        navigate("/practice")
    }
</script>

<style>
</style>

<main>
    <Title />
    <Button on:click={goToPractice}/>
    <Footer />
</main>
