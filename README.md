# FYP

Fresh repository — Final Year Project, built from scratch.

## Setup

Clone the repo and open it in OpenCode. The project ships an `opencode.json`
that configures the official **Google Stitch MCP server**
(`https://stitch.googleapis.com/mcp`) so agents can generate and manage UI
screens.

### Stitch MCP API key

Each team member needs their own Stitch API key:

1. Open [stitch.withgoogle.com](https://stitch.withgoogle.com) and sign in.
2. Click your profile icon (top right) → **Stitch Settings** → **API Keys** →
   **Create Key**.
3. Export the key in your shell (add to `~/.bashrc` or `~/.zshrc` to keep it
   across sessions):

   ```sh
   export STITCH_API_KEY="your-key-here"
   ```

4. Restart OpenCode so it picks up the environment variable. The key stays out
   of git — it is read via `{env:STITCH_API_KEY}` from `opencode.json`.

Stitch MCP is free of charge. See the
[Stitch MCP setup docs](https://stitch.withgoogle.com/docs/mcp/setup/) for
details.
