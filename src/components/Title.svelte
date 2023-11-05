<!-- src/components/Title.svelte -->
<style>
	/* Typography Styles */
	h1 {
		font-size: 4.5rem;
		font-family: Meiryo, Yu Gothic, sans-serif;
		text-align: center;
		text-shadow: 0.125rem 0.125rem 0.25rem #aaa;
		margin-top: -3rem;
		margin-bottom: 1rem;
	}

	.typewriter {
        display: inline-block;
        max-width: 0;  /* Start with a max-width of 0 */
        overflow: hidden;
        white-space: nowrap;  /* Keep text on a single line */
        border-right: 0.5rem solid #ffffff;
		font-size: 1rem; /* Adjust the font-size to control the caret size */
        animation: typing 3s steps(40, end) forwards,  /* Added forwards to keep text visible */
                  blink-caret .75s step-end infinite;
    }

    h3 {
		font-size: 1.2rem;
        font-family: Meiryo, Yu Gothic, sans-serif;
		margin: 0%;
		text-decoration: underline;
    }

    /* Typewriter Effect */
    @keyframes typing {
        from { max-width: 0; }
        to { max-width: 100%; }  /* Transition max-width to reveal the text */
    }

    @keyframes blink-caret {
        from, to { border-color: transparent; }
        50% { border-color: #ffffff; }
    }
</style>

<h1>勉-You</h1>
<div class="typewriter">
    <h3>An AI Powered Japanese Learning Experience</h3>
</div>
