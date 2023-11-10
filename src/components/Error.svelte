<!-- src/components/Error.svelte -->
 
<script>
    export let showError = false;
    export let text = "An error has occurred, please try again, or load a new set of questions."
</script>

<style>
    .error {
        display: none;
    }

    .error.is-shown {
        margin-left: 2rem;
        display: block;
        word-wrap: break-word; /* This ensures text goes to the next line */
        font-size: 80%;
        font-family: Meiryo, Yu Gothic, sans-serif;
        color: red;
    }
</style>

<p class="error {showError ? 'is-shown' : ''}">{text}</p>