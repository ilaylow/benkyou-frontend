<!-- src/pages/PracticeTranslation.svelte -->
<script>
    import { onMount } from 'svelte';
    import {getTranslationQuestion} from '../services/translation';
    import Button from '../components/Button.svelte';
    import Loading  from '../components/Loading.svelte';
    import PracticeInput from '../components/PracticeInput.svelte';
    import { navigate } from 'svelte-routing/src/history';
    import {isTokenPresentAndValid} from "../utils/jwt";

    let data = null;
    let error = false;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            if (!isTokenPresentAndValid()) {
                navigate('/');
            }
        }

        try {
            data = await getTranslationQuestion();
            // data = {
            //     id: "123123123123123",
            //     uid: "",
            //     user: null,
            //     sentence_pairs: [
            //         {
            //             id: "12345",
            //             question: "彼が部屋に入ってきた時、私はテレビを見ていたわけではなく、ラジオを聴いていた。彼が部屋に入ってきた時、私はテレビを見ていたわけではなく、ラジオを聴いていた。彼が部屋に入ってきた時、私はテレビを見ていたわけではなく、ラジオを聴いていた。",
            //             answer: "",
            //             solution: "",
            //             score: 0,
            //         },
            //         {
            //             id: "123456",
            //             question: "この小説は直訳すると意味がよくわからないが、読み手が感じたことを大切にすれば、非常に面白い作品であるといえる。",
            //             answer: "",
            //             solution: "",
            //             score: 0,
            //         },
            //         {
            //             id: "1234567",
            //             question: "私が知りたいことは、あなたがその問題を解決するために何を考えているか、そして具体的にどのような行動を取るつもりなのかです。",
            //             answer: "",
            //             solution: "",
            //             score: 0,
            //         }
            //     ],
            //     language: "Japanese",
            // }
        } catch (e) {
            console.error('Error fetching translation question:', e);
            error = true;
        }
    });

    function reloadPage() {
        window.location.reload()
    }

    function handleLogOut() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('uid');
        navigate('/');
    }
</script>

<style>
    h1 {
        margin: 0%;
        padding: 0%;
        font-family: Meiryo, Yu Gothic, sans-serif;
    }

    .button-container {
        display: flexbox;
    }
</style>

<main>
    {#if error}
        <!-- Error Page -->
        <div>
            <h1>An error has occurred.</h1>
            <div class="button-container">
                <Button on:click={reloadPage} text="リトライ"/>
                <Button style="error" on:click={handleLogOut} text="ログアウト"/>
            </div>
        </div>
    {:else if data === null}
        <!-- Loading Page -->
        <Loading />
    {:else}
        <!-- Practice Page -->
        <Button style="logout" on:click={handleLogOut} text="ログアウト"/>
        <PracticeInput translations={data}/>
    {/if}   
</main>