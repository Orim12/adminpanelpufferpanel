<script lang="ts">
	import { onMount } from 'svelte';
	let submissions: { user: string; filename: string; link: string; status: string }[] = [];
	let isAdmin = false;

	onMount(() => {
		// Check if user is admin by role
		isAdmin = localStorage.getItem('role') === 'admin';
		// Demo: load submissions from localStorage
		const data = localStorage.getItem('submissions');
		if (data) {
			submissions = JSON.parse(data);
		}
	});

	function approve(index: number) {
		submissions[index].status = 'approved';
		save();
	}
	function reject(index: number) {
		submissions[index].status = 'rejected';
		save();
	}
	function save() {
		localStorage.setItem('submissions', JSON.stringify(submissions));
	}
</script>

<main class="admin-container">
	<h1>Admin Review</h1>
	{#if !isAdmin}
		<p>You must be logged in as <b>admin</b> to view this page.</p>
	{:else if submissions.length === 0}
		<p>No submissions yet.</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th>User</th>
					<th>File</th>
					<th>Link</th>
					<th>Status</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each submissions as sub, i}
					<tr>
						<td>{sub.user}</td>
						<td>{sub.filename}</td>
						<td
							><a href={sub.link} target="_blank" class="truncate-link" title={sub.link}
								>{sub.link.length > 40 ? sub.link.slice(0, 37) + '...' : sub.link}</a
							></td
						>
						<td>{sub.status}</td>
						<td>
							{#if sub.status === 'pending'}
								<button on:click={() => approve(i)}>Approve</button>
								<button on:click={() => reject(i)}>Reject</button>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</main>

<style>
	.admin-container {
		max-width: 900px;
		margin: 3rem auto;
		padding: 2rem;
		border-radius: 8px;
		background: #181c20;
		color: #fff;
		box-shadow: 0 2px 16px #0002;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 2rem;
	}
	th,
	td {
		border: 1px solid #333;
		padding: 0.75rem;
		text-align: left;
		max-width: 250px;
		word-break: break-all;
	}
	th {
		background: #23272f;
	}
	button {
		margin-right: 0.5rem;
		background: #4caf50;
		color: #fff;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
	}
	button:last-child {
		background: #ff5252;
	}
	.truncate-link {
		display: inline-block;
		max-width: 220px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		vertical-align: bottom;
	}
</style>
