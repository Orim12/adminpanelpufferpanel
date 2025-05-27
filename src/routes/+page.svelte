<script lang="ts">
	import { onMount } from 'svelte';
	let user: string | null = null;
	onMount(() => {
		user = localStorage.getItem('user');
	});
	function logout() {
		localStorage.removeItem('user');
		window.location.reload();
	}
</script>

<main class="home-container">
	<h1>Minecraft Plugin/Mod Submission Panel</h1>
	{#if user}
		<p>Welcome, <b>{user}</b>! <button on:click={logout}>Logout</button></p>
		<nav>
			<a href="/submit">Submit Plugin/Mod</a>
			{#if user === 'admin'}
				<a href="/admin">Admin Review</a>
			{/if}
		</nav>
	{:else}
		<nav>
			<a href="/login">Login</a>
		</nav>
	{/if}
</main>

<style>
	.home-container {
		max-width: 600px;
		margin: 4rem auto;
		padding: 2rem;
		border-radius: 8px;
		background: #23272f;
		color: #fff;
		box-shadow: 0 2px 16px #0002;
		text-align: center;
	}
	nav {
		margin-top: 2rem;
	}
	nav a {
		margin: 0 1rem;
		color: #2196f3;
		text-decoration: none;
		font-weight: bold;
	}
	button {
		margin-left: 1rem;
		background: #ff5252;
		color: #fff;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
	}
</style>
