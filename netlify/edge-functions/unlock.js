// Real content for locked projects. This file runs server-side only (Netlify
// Edge Functions, Deno) and is never sent to the browser — unlike projects.js,
// which ships to every visitor. Password is checked against a SHA-256 hash
// stored in the LOCKED_PASSWORD_HASH env var, never a plaintext comparison.
const PROTECTED_CONTENT = {
    'project-two': {
        title: 'Project Two',
        tag: 'UX Research',
        year: '2023',
        body: [
            { type: 'paragraph', text: 'This is the real case study body, served only after a correct password — still placeholder text for now. Real content will be adapted from Behance later.' },
            { type: 'paragraph', text: 'It only ever reaches the browser in this response, proving it is genuinely gated rather than just hidden client-side like the public projects.js file.' }
        ]
    }
};

async function sha256Hex(value) {
    const data = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default async (request) => {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const expectedHash = Deno.env.get('LOCKED_PASSWORD_HASH');
    if (!expectedHash) {
        return new Response(JSON.stringify({ error: 'Password protection is not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    let payload;
    try {
        payload = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid request' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const { id, password } = payload || {};
    const content = typeof id === 'string' ? PROTECTED_CONTENT[id] : undefined;

    if (!content || typeof password !== 'string') {
        return new Response(JSON.stringify({ error: 'Not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const actualHash = await sha256Hex(password);
    if (actualHash !== expectedHash) {
        return new Response(JSON.stringify({ error: 'Incorrect password' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify(content), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};

export const config = { path: '/api/unlock' };
