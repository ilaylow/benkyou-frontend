<!-- src/components/Button.svelte -->
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
		padding: 1.2vh 1.3vw;
		font-size: clamp(14px, 1.4vw, 18px);
		font-family: Meiryo, Yu Gothic, sans-serif;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: background-color 0.3s;
		margin-top: 1.5rem;  /* Space above button */
		margin-bottom: 1.5rem;
		white-space: nowrap;
	}

	.router {
		background-color: #2e2e2e;
		color: #5b5b5b;
		border: none;
		padding: 1.2vh 1.3vw;
		font-size: clamp(30px, 4.7vw, 70px);
		font-family: MS PMincho, Meiryo, Yu Gothic, sans-serif;
		font-weight: bold;
		border-radius: 0.25rem;
		cursor: pointer;
		white-space: nowrap;
		letter-spacing: 5px;
		transition: color 0s;
	}

	.kanji{
		font-size: clamp(30px, 10vw, 130px);
	}

	.sentence-analysis{
		font-size: clamp(30px, 3.5vw, 50px);
		letter-spacing: 0px;
	}

	.error {
        margin-left: 23%;
        background-color: #be780f;
		color: #fff;
		border: none;
		padding: 1.2vh 1.3vw;
		font-size: clamp(14px, 1.4vw, 18px);
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
		padding: 1vh 1.3vw;
		font-size: clamp(15px, 0.9vw, 20px);
		font-family: Meiryo, Yu Gothic, sans-serif;
        text-decoration: bold;
		border-radius: 0.25rem;
		cursor: pointer;
    }

	.logout {
        background-color: #be780f;
		color: #fff;
		border: none;
		padding: 1vh 1vw;
		font-size: clamp(14px, 1vw, 16px);
		font-family: Meiryo, Yu Gothic, sans-serif;
        text-decoration: bold;
		border-radius: 0.25rem;
		cursor: pointer;
    }

	.swap {
		background-color: #ff4081;
		color: #fff;
		border: none;
		padding: 1.2vh 0.7vw;
		margin-top: 0.2rem;
		font-size: clamp(12px, 1vw, 14px);
		font-family: Meiryo, Yu Gothic, sans-serif;
		border-radius: 1.5rem;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.home {
        background-color: #ff4081;
		color: #fff;
		border: none;
		padding: 1vh 1vw;
		font-size: clamp(13px, 1vw, 16px);
		font-family: Meiryo, Yu Gothic, sans-serif;
        text-decoration: bold;
		border-radius: 0.25rem;
		cursor: pointer;
	}

	.button:hover {
		background-color: rgb(116, 19, 51);
	}

	.button.router:hover {
		background-color: #2e2e2e;
		color: #ff4081;
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

	.button.home:hover {
		background-color: rgb(116, 19, 51);
	}

</style>

<button class="button {style}" on:click={handleClick} disabled={loading}>{text}</button>
