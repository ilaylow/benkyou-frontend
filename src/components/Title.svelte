<!-- src/components/Title.svelte -->
<style>
	/* Typography Styles */
	h1 {
		font-size: clamp(65px, 5.5vw, 80px);
		font-family: Meiryo, Yu Gothic, sans-serif;
		text-align: center;
		text-shadow: 0.125rem 0.125rem 0.25rem #aaa;
		margin-bottom: 0.2vh;
	}

	.typewriter {
        display: inline-block;
        max-width: 0;  /* Start with a max-width of 0 */
        overflow: hidden;
        white-space: nowrap;  /* Keep text on a single line */
        border-right: 0.5rem solid #ffffff;
		font-size: 1rem; /* Adjust the font-size to control the caret size */
        animation: typing 1.2s steps(40, end) forwards,  /* Added forwards to keep text visible */
                  blink-caret .75s step-end infinite;
        margin-bottom: 0.5vh;
    }

    h3 {
		font-size: clamp(15px, 1.2vw, 20px);
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
