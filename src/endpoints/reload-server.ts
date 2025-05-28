import type { Endpoint, PayloadRequest } from 'payload';
import https from 'https';

export const reloadServerEndpoint: Endpoint = {
  path: '/api/reload-server/:id',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    // For custom endpoints, use req.query for route params
    const id = req.query?.id as string;

    try {
      // Use node-fetch for agent support
      const fetch = (await import('node-fetch')).default as typeof import('node-fetch')['default'];
      const response = await fetch(`https://your-daemon-host:8080/daemon/server/${id}/reload`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer'+ process.env.PUFFERPANEL_API_KEY || '',
          'Content-Type': 'application/json',
        },
        // @ts-ignore
        agent: new https.Agent({ rejectUnauthorized: false })
      });

      if (response.status === 204) {
        return new Response(JSON.stringify({ message: 'Server reloaded successfully' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const errorText = await response.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return new Response(JSON.stringify({ error: 'Failed to reload server', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
};