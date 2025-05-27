<script lang="ts">
	import { onMount } from 'svelte';
	let jarFile: File | null = null;
	let link = '';
	let message = '';
	let error = '';
	let user: string | null = null;

	onMount(() => {
		user = localStorage.getItem('user');
		if (!user) {
			window.location.href = '/login';
		}
	});

	function handleFileChange(event: Event) {
		const files = (event.target as HTMLInputElement).files;
		if (files && files.length > 0) {
			jarFile = files[0];
		}
	}

	async function submitForm() {
		error = '';
		message = '';
		if (!jarFile || !link) {
			error = 'Please provide both a .jar file and a link.';
			return;
		}
		if (!user) {
			error = 'You must be logged in.';
			return;
		}
		// Store submission in localStorage for admin review
		const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
		submissions.push({
			user,
			filename: jarFile.name,
			link,
			status: 'pending'
		});
		localStorage.setItem('submissions', JSON.stringify(submissions));
		message = 'Submission received! Await admin review.';
		jarFile = null;
		link = '';
		(document.querySelector('input[type=file]') as HTMLInputElement).value = '';
	}
</script>

<main class="submit-container">
	<h1>Submit Plugin/Mod</h1>
	{#if error}
		<p class="error">{error}</p>
	{/if}
	{#if message}
		<p class="success">{message}</p>
	{/if}
	<form on:submit|preventDefault={submitForm}>
		<label>
			.jar File:
			<input type="file" accept=".jar" on:change={handleFileChange} required />
		</label>
		<label>
			Link (e.g. documentation, source):
			<input type="url" placeholder="https://..." bind:value={link} required />
		</label>
		<button type="submit">Submit</button>
	</form>
</main>

<style>
	.submit-container {
		max-width: 450px;
		margin: 3rem auto;
		padding: 2rem;
		border-radius: 8px;
		background: #23272f;
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
	label {
		margin-bottom: 1rem;
		display: block;
	}
	.error {
		color: #ff5252;
	}
	.success {
		color: #4caf50;
	}
</style>
