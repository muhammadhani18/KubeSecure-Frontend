# Kubernetes Dashboard

A modern, secure Kubernetes cluster management dashboard with vulnerability scanning capabilities.

## Features

- **Cluster Monitoring**: Real-time monitoring of Kubernetes resources
- **Vulnerability Scanning**: Security scanning of container images using Trivy
- **Rate Limiting**: Monitor and manage API rate limits
- **Security Tools**: Integration with Tetragon for runtime security
- **Code Analysis**: Detect Kubernetes configuration issues
- **Service Mapping**: Visualize service dependencies
- **Alerting**: Monitor cluster events and alerts

## Architecture

This project consists of two main components:

- **Frontend**: Next.js application with modern UI
- **Backend**: FastAPI service for vulnerability scanning and other operations

## Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.8+ (for backend)
- [Trivy](https://trivy.dev/) - Security scanner for containers
- Docker (optional, for containerized deployment)

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd kubernetes-dashboard
   ```

2. Start both frontend and backend:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Option 2: Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Trivy:
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install wget apt-transport-https gnupg lsb-release
   wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
   echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
   sudo apt-get update
   sudo apt-get install trivy
   ```

3. Set up Python environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:
   ```bash
   python main.py
   ```

#### Frontend Setup

1. In a new terminal, navigate to the project root:
   ```bash
   cd ..  # If you're in the backend directory
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set environment variable (optional):
   ```bash
   export NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### FastAPI Backend (Port 8000)

- `GET /health` - Health check
- `POST /api/scan-image` - Scan container image for vulnerabilities
- `GET /docs` - Interactive API documentation

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Backend
```
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=INFO
```

## Development

### Frontend Development
```bash
npm run dev
```

### Backend Development
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Deployment

### Docker Deployment
```bash
docker-compose up --build -d
```

### Manual Deployment
1. Build the frontend:
   ```bash
   npm run build
   npm start
   ```

2. Run the backend:
   ```bash
   cd backend
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue in the GitHub repository.
