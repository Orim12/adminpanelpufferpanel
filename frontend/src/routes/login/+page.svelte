<script lang="ts">
	import { onMount } from 'svelte';
	let username = '';
	let password = '';
	let error = '';
	let loading = false;

	async function login() {
		error = '';
		loading = true;
		try {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			});
			const data = await res.json();
			if (!res.ok) {
				error = data.error || 'Login mislukt';
			} else {
				localStorage.setItem('user', data.user.username);
				localStorage.setItem('role', data.user.role || 'user');
				window.location.href = '/';
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
	<h1>Login</h1>
	{#if error}
		<p class="error">{error}</p>
	{/if}
	<form on:submit|preventDefault={login}>
		<input type="text" placeholder="Username" bind:value={username} required />
		<input type="password" placeholder="Password" bind:value={password} required />
		<button type="submit" disabled={loading}>{loading ? 'Bezig...' : 'Login'}</button>
	</form>
	<p><a href="/signup">Account aanmaken</a></p>
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
		background: #4caf50;
		color: #fff;
		font-weight: bold;
		cursor: pointer;
	}
	.error {
		color: #ff5252;
	}
</style>
