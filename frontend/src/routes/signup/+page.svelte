<script lang="ts">
	import { onMount } from 'svelte';
	let username = '';
	let password = '';
	let error = '';
	let success = '';
	let loading = false;

	async function signup() {
		error = '';
		success = '';
		loading = true;
		try {
			const res = await fetch('/api/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			});
			const data = await res.json();
			if (!res.ok) {
				error = data.error || 'Registratie mislukt';
			} else {
				success = 'Account aangemaakt! Je kunt nu inloggen.';
				username = '';
				password = '';
			}
		} catch (e) {
			error = 'Server niet bereikbaar';
		}
		loading = false;
	}

	onMount(() => {
		if (localStorage.getItem('user')) {
			window.location.href = '/';
		}
	});
</script>

<main class="login-container">
	<h1>Account aanmaken</h1>
	{#if error}
		<p class="error">{error}</p>
	{/if}
	{#if success}
		<p class="success">{success}</p>
	{/if}
	<form on:submit|preventDefault={signup}>
		<input type="text" placeholder="Username" bind:value={username} required />
		<input type="password" placeholder="Password" bind:value={password} required />
		<button type="submit" disabled={loading}>{loading ? 'Bezig...' : 'Account aanmaken'}</button>
	</form>
	<p><a href="/login">Terug naar login</a></p>
</main>

<style>
	.login-container {
		max-width: 350px;
		margin: 5rem auto;
		padding: 2rem;
		border-radius: 8px;
		background: #222;
		color: #fff;
		box-shadow: 0 2px 16px #0002;
	}
	input,
	button {
		display: block;
		width: 100%;
		margin: 1rem 0;
		padding: 0.75rem;
		border-radius: 4px;
		border: none;
	}
	button {
		background: #2196f3;
		color: #fff;
		font-weight: bold;
		cursor: pointer;
	}
	.error {
		color: #ff5252;
	}
	.success {
		color: #4caf50;
	}
</style>
