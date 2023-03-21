export function getHostName() {
    const deploymentId = Deno.env.get("DENO_DEPLOYMENT_ID");
    if (deploymentId) {
        return `https://nrss-${deploymentId}.deno.dev`;
    } else {
        // assume env
        return 'http://localhost:8000';
    }
}


