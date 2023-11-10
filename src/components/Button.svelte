<!-- src/components/StartButton.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let text = "スタート";  // Default text is "スタート"
	export let loading = false;
	export let style = "button";

	function handleClick() {
		dispatch('click');
}

</script>

<style>
	/* Button Styles */
	.button {
		background-color: #ff4081;
		color: #fff;
		border: none;
		padding: 1rem 2rem;
		font-size: 1rem;
		font-family: Meiryo, Yu Gothic, sans-serif;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: background-color 0.3s;
		margin-top: 1.5rem;  /* Space above button */
		margin-bottom: 1.5rem;
	}

	.error {
        margin-left: 23%;
        background-color: #be780f;
		color: #fff;
		border: none;
		padding: 1rem 2rem;
		font-size: 1rem;
		font-family: Meiryo, Yu Gothic, sans-serif;
        text-decoration: bold;
		border-radius: 0.25rem;
		cursor: pointer;
    }

	.retry {
		margin-top: -0.1%;
        background-color: #686868;
		color: #fff;
		border: none;
		padding: 0.5rem 1.4rem;
		font-size: 1rem;
		font-family: Meiryo, Yu Gothic, sans-serif;
        text-decoration: bold;
		border-radius: 0.25rem;
		cursor: pointer;
    }

	.logout {
        margin-left: 47%;
        background-color: #be780f;
		color: #fff;
		border: none;
		padding: 0.7rem 1.5rem;
		font-size: 1rem;
		font-family: Meiryo, Yu Gothic, sans-serif;
        text-decoration: bold;
		border-radius: 0.25rem;
		cursor: pointer;
    }

	.button:hover {
		background-color: rgb(116, 19, 51);
	}

	.button.error:hover {
		background-color: rgb(168, 104, 8);
	}

	.button.retry:hover {
		background-color: rgb(5, 5, 5);
	}

	.button.logout:hover {
		background-color: rgb(139, 86, 6);
	}

</style>

<button class="button {style}" on:click={handleClick} disabled={loading}>{text}</button>
