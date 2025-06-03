import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST(request) {
  try {
    const body = await request.json();
    const { image_name } = body;

    if (!image_name) {
      return NextResponse.json({ error: 'image_name is required' }, { status: 400 });
    }

    const command = `trivy image --format json --quiet ${image_name}`;

    const { stdout, stderr } = await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject({ error, stdout, stderr });
        } else {
          resolve({ stdout, stderr });
        }
      });
    });

    if (stderr && !stdout) {
      // Trivy often prints warnings or info to stderr even on success,
      // so we only treat it as an error if stdout is empty.
      console.error(`Trivy stderr: ${stderr}`);
      // Attempt to parse stderr for a more specific error message if possible
      let errorMessage = 'Trivy scan failed';
      if (stderr.includes('image not found') || stderr.includes('name unknown')) {
        errorMessage = `Image not found: ${image_name}`;
        return NextResponse.json({ error: errorMessage, details: stderr }, { status: 404 });
      }
      return NextResponse.json({ error: errorMessage, details: stderr }, { status: 500 });
    }

    // If stdout is not valid JSON, it might indicate an issue not caught by stderr.
    let trivyOutput;
    try {
        trivyOutput = JSON.parse(stdout);
    } catch (parseError) {
        console.error(`Failed to parse Trivy output: ${parseError}`);
        console.error(`Trivy stdout: ${stdout}`);
        console.error(`Trivy stderr: ${stderr}`);
        return NextResponse.json({ error: 'Failed to parse Trivy output', details: stdout }, { status: 500 });
    }

    return NextResponse.json(trivyOutput, { status: 200 });

  } catch (error) {
    console.error('Error in scan-image handler:', error);
    if (error.code === 'ENOENT') { // Trivy command not found
        return NextResponse.json({ error: 'Trivy command not found. Please ensure it is installed and in PATH.' }, { status: 500 });
    }
    // Handle cases where request.json() fails due to invalid JSON
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    // Catch errors from the promise rejection (exec error)
    if (error.error) {
        console.error(`Trivy execution error: ${error.error.message}`);
        console.error(`Trivy stdout (on error): ${error.stdout}`);
        console.error(`Trivy stderr (on error): ${error.stderr}`);
        let errorMessage = 'Trivy scan failed during execution';
        let errorStatus = 500;
        if (error.stderr.includes('image not found') || error.stderr.includes('name unknown') || error.stdout.includes('image not found') || error.stdout.includes('name unknown')) {
            errorMessage = `Image not found: ${image_name}`;
            errorStatus = 404;
        } else if (error.error.code === 127) { // Command not found (less likely here, but good to check)
             errorMessage = 'Trivy command not found. Please ensure it is installed and in PATH.';
        }
        return NextResponse.json({ error: errorMessage, details: error.stderr || error.stdout }, { status: errorStatus });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
