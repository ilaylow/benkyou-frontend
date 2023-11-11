<!-- src/components/Slider.svelte -->
<script>
    // Local state for the slider value
    export let value = sessionStorage.getItem("difficulty") || 3;
    export let childFunction = null;

    $: trackColor = `linear-gradient(to right, white 0%, white ${(value - 1) * 25}%, #ff4081 ${(value - 1) * 25}%, #ff4081 100%)`;

    // Function to handle value changes
    function handleChange(event) {
        value = event.target.value;
        if (childFunction) {
            childFunction(event);
        }
    }
</script>

<style>
    div {
        display: flex;
        align-items: center; /* This aligns items vertically at the center */
    }

    input[type=range] {
        height: 5%;
        appearance: none;
        margin: 0.5% 0;
        width: 25%;
        background-color: rgb(78, 78, 78);
        border-radius: 5rem;
        border: none;
        transform: rotate(180deg); /* Rotates the slider */
    }
    input[type=range]:focus {
        outline: none;
    }
    input[type=range]::-webkit-slider-runnable-track {
        width: 100%;
        height: 30%;
        cursor: pointer;
        box-shadow: 0px 0px 0px #000000;
        background: var(--track-color);
        border-radius: 5rem;
    }
    input[type=range]::-webkit-slider-thumb {
        height: 1.2rem;
        width: 1.2rem;
        border-radius: 5rem;
        background: #FFFFFF;
        cursor: pointer;
        -webkit-appearance: none;
        margin-top: -0.55rem;
    }

    p {
        font-family: Meiryo, Yu Gothic, sans-serif;
        text-decoration: bold;
        margin-left: 1rem;
        font-size: 110%;
    }

    .para-reminder {
        font-size: 70%;
        margin-left: 2%;
        color: #807e7e;
    }
</style>

<div>
    <!-- Slider input -->
    <input style="--track-color: {trackColor};" type="range" min="1" max="5" step="1" value={value} on:input={handleChange} />

    <!-- Display the current value -->
    <p>難易度: N{value}</p>
    <p class="para-reminder">＊レベルが変わったら、ページを更新してください</p>
</div>

