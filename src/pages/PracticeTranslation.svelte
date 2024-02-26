<!-- src/pages/PracticeTranslation.svelte -->
<script>
    import { onMount } from 'svelte';
    import {getTranslationQuestion, tokenizeTranslations} from '../services/translation';
    import Button from '../components/Button.svelte';
    import Loading  from '../components/Loading.svelte';
    import PracticeInput from '../components/PracticeInput.svelte';
    import { navigate } from 'svelte-routing/src/history';
    import {isTokenPresentAndValid} from "../utils/jwt";

    let data = null;
    let error = false;
    let tokenizer = null;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            if (!isTokenPresentAndValid()) {
                navigate('/');
            }
        }

        // Async load tokenizer
        tokenizer = await new Promise((resolve, reject) => {
            kuromoji.builder({ dicPath: "/dict/" }).build((err, builtTokenizer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(builtTokenizer);
                }
            });
        });

        try {
            // Get current "from" language
            let fromLanguage = sessionStorage.getItem('from_language') || "Japanese";
            let difficulty = sessionStorage.getItem('difficulty') || 3;
            let subject = sessionStorage.getItem("subject") || "";
            let storageData = JSON.parse(sessionStorage.getItem("translations"));
            if (storageData != null) {
                data = storageData;
            } else {
                data = await getTranslationQuestion(fromLanguage, difficulty, subject);
                sessionStorage.setItem("translations", JSON.stringify(data));
            }

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
            // data = {
            //     id: "dab93d8f-200e-4875-9e83-25073fee9fa1",
            //     uid: "",
            //     user: null,
            //     sentence_pairs: [
            //         {
            //             id: "acc8bd96-52b1-4f7b-90dd-3a32678aa129",
            //             question: "The cherry blossoms in Japan bloom beautifully in the spring, attracting tourists from all around the world.",
            //             answer: "",
            //             score: 0,
            //             solution: ""
            //         },
            //         {
            //             id: "d49f0502-95f8-4ab9-9e93-713d63debf7b",
            //             question: "The restaurant was so crowded that we had to wait for about an hour to get a table, but the food was definitely worth the wait.",
            //             answer: "",
            //             score: 0,
            //             solution: ""
            //         },
            //         {
            //             id: "9c1b08be-8a35-414e-9c63-a86df5e78801",
            //             question: "My grandmother, who lives in the countryside, loves to grow her own vegetables and fruits in her large garden.",
            //             answer: "",
            //             score: 0,
            //             solution: ""
            //         }
            //     ],
            //     language: "English"
            // }
            tokenizeTranslations(data, tokenizer);
        } catch (e) {
            console.error('Error fetching translation question:', e);
            error = true;
        }
    });

    function reloadPage() {
        window.location.reload()
    }

    function reloadPageFromError() {
        sessionStorage.removeItem("translations")
        reloadPage()
    }

    function handleHome() {
        navigate('/')
    }

    function handleLogOut() {
        setTimeout(() => navigate('/'), 750)
        localStorage.clear();
        sessionStorage.clear();
        // localStorage.removeItem('difficulty');
        // localStorage.removeItem('from_language');
        // localStorage.removeItem('jwt_token');
        // localStorage.removeItem('uid');
    }
</script>

<style>
    h1 {
        margin: 0%;
        padding: 0%;
        font-family: Meiryo, Yu Gothic, sans-serif;
    }

    .error-header {
		font-size: clamp(25px, 3vw, 35px);
    }

    .button-container {
        display: flexbox;
    }

    .button-container-logout {
        width: 15rem;
        display: flex;
        align-items: center;
        margin-left: 55vw;
        gap: 5%;
    }

</style>

<main>
    {#if error}
        <!-- Error Page -->
        <div>
            <h1 class="error-header">An error has occurred.</h1>
            <div class="button-container">
                <Button on:click={reloadPageFromError} text="再試行"/>
                <Button style="error" on:click={handleHome} text="ホーム"/>
            </div>
        </div>
    {:else if data === null}
        <!-- Loading Page -->
        <Loading />
    {:else}
        <!-- Practice Page -->
        <div class="button-container-logout">
            <Button style="home" on:click={handleHome} text="ホーム"/>
            <Button style="logout" on:click={handleLogOut} text="ログアウト"/>
        </div>
        <PracticeInput translations={data} tokenizer={tokenizer}/>
    {/if}   
</main>