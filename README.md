# GeoPhysAI Proxy 🔐

A lightweight serverless backend proxy that securely handles 
all communication between the GeoPhysAI frontend and the 
Anthropic Claude API.

## Why This Exists
The GeoPhysAI frontend is a static HTML app hosted on GitHub 
Pages. To prevent the Anthropic API key from being exposed 
in the browser source code, all API calls are routed through 
this proxy instead.

## How It Works

## Security Features
- API key stored as a secret environment variable on Vercel
- Requests restricted to the GeoPhysAI frontend domain only
- No API key ever touches the client/browser

## Deployment
Deployed as a serverless function on Vercel.

## Related
- [GeoPhysAI Frontend](https://github.com/XixGhoul/geophysai)
- [Live App](https://XixGhoul.github.io/geophysai/)

## Author
David Tom
