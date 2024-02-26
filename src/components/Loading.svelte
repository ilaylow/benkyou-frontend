<!-- src/components/Loading.svelte -->
<style>
    .container {
        display: grid;
        place-items: center;
    }

    .loading-spinner {
        border: 0.5rem solid #181818; /* Background color */
        border-top: 0.5rem solid #ff4081; /* Foreground color */
        border-radius: 50%;
        width: 3vw;
        height: 3vw;
        animation: spin 2s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    h2 {
        font-size: 1rem;
        font-family: Meiryo, Yu Gothic, sans-serif;
        text-align: center;
        margin-top: 10%;
        margin-left: 2%;
        color: #6d6d6d;
    }
</style>

<div class="container">
    <div class="loading-spinner"></div>
    <h2>This may take up to 30 seconds...</h2>
</div>
