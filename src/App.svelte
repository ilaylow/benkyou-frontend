<!-- src/App.svelte -->
<script>
	import './global.css';  // Import the global stylesheet
    import { Router, Route } from 'svelte-routing';
    import Home from './pages/Home.svelte';
    import PracticeTranslation from './pages/PracticeTranslation.svelte';
</script>

<Router>
    <Route path="/" component={Home} />
    <Route path="/practice" component={PracticeTranslation} />
</Router>