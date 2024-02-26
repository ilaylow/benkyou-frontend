<!-- src/components/SignIn.svelte -->
<script>
	import { signInUser } from "../services/user";
  import Button from "./Button.svelte";
  import Error from "./Error.svelte";

	let clicked = false;
  let showSignInError = false;
  let userCreds = {
    email: "",
    password: ""
  }

	async function handleSignIn() {
    clicked = true;
    showSignInError = false;
		try {
      let loginData = await signInUser(userCreds);
      localStorage.setItem('jwt_token', loginData.jwt);
      localStorage.setItem('uid', loginData.uid);
      window.location.reload();
    } catch (error) {
      showSignInError = true;
      clicked = false;
      console.log(error)
    }
}

</script>

<style>
    .login-form {
      width: 28%;
      max-width: 100%;
      padding: 2rem;
      background-color: #f3f3f3;
      border-radius: 2%;
    }
  
    .login-form-title {
      margin-bottom: 0.5rem;
      color: #333;
      font-size: 1.2rem;
    }
  
    .login-form-input {
      width: 100%;
      padding: 0.75rem;
      margin-bottom: 1rem;
      border: 2% solid #ccc;
      border-radius: 2%;
      box-sizing: border-box; /* So padding doesn't affect width */
    }
  
    .login-form-input::placeholder {
      color: #888;
    }
  
    .login-form-input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.1rem rgba(0,123,255,.25);
    }

    .button-container {
        display: flex;
        align-items: center; /* Align items vertically */
        justify-content: flex-start; /* Align button to the start of the container */
    }

    .button-container.is-logging-in .loading-icon {
        display: inline-block;
    }

    .loading-icon {
        display: none; /* Hide by default */
        margin-left: 3rem;
        margin-top: 2.3rem;
        border: 0.5rem solid #181818; /* Background color */
        border-top: 0.5rem solid #ff4081; /* Foreground color */
        border-radius: 50%;
        width: 1vw;
        height: 1vw;
        transform: translate(-50%, -50%); /* Adjust the position */
        animation: spin 2s linear infinite;
    }

    @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
    }

</style>

<div class="login-form">
    <h3 class="login-form-title">Email</h3>
    <input class="login-form-input" bind:value={userCreds.email} type="email" placeholder="メール"/>

    <h3 class="login-form-title">Password</h3>
    <input class="login-form-input" bind:value={userCreds.password} type="password" placeholder="パスワード"/>

    <div class="button-container {clicked ? 'is-logging-in' : ''}">
      <Button text="ログイン" on:click={handleSignIn} disabled={clicked}/>
      <div class="loading-icon"></div>
      <Error showError={showSignInError} text="Error signing in. Please try again later."/>
  </div>
</div>
