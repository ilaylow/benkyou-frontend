<!-- src/components/Loading.svelte -->
<style>
    div {
        margin-left: -5%;
    }

    .loading-spinner {
        border: 0.5rem solid #181818; /* Background color */
        border-top: 0.5rem solid #ff4081; /* Foreground color */
        border-radius: 50%;
        width: 3rem;
        height: 3rem;
        margin-left: 38%;
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
        color: #6d6d6d;
    }
</style>

<div>
    <div class="loading-spinner">
    </div>
    <h2>This may take up to 30 seconds...</h2>
</div>
