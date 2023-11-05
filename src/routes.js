// src/routes.js
import Home from './pages/Home.svelte';
import PracticeTranslation from './pages/PracticeTranslation.svelte';

const routes = [
    { name: '/', component: Home },
    { name: '/practice', component: PracticeTranslation }
];

export default routes;