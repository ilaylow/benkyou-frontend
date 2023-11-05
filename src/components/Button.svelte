<!-- src/components/StartButton.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let text = "スタート";  // Default text is "スタート"
	export let loading = false;

	function handleClick() {
		dispatch('click');
}

</script>

<style>
	/* Button Styles */
	button {
		background-color: #ff4081;
		color: #fff;
		border: none;
		padding: 1rem 2rem;
		font-size: 1rem;
		font-family: Meiryo, Yu Gothic, sans-serif;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: background-color 0.3s;
		margin-top: 2rem;  /* Space above button */
	}

	button:hover {
		background-color: #ff669a;
	}
</style>

<button on:click={handleClick} disabled={loading}>{text}</button>
