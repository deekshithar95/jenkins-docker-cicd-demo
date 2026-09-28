# Jenkins Docker CI/CD Demo

A practical CI/CD assessment project demonstrating Jenkins, Docker,
Docker Compose, MySQL, Trivy security scanning, automated testing,
health checks, persistent storage, deployment automation, cleanup,
and rollback.

## Architecture

- Frontend: Nginx
- Backend: Node.js + Express
- Database: MySQL 8
- Containerization: Docker
- Orchestration: Docker Compose
- CI/CD: Jenkins
- Security scanning: Trivy
- Source control: Git/GitHub

## Local Ports

| Service | Port |
|---|---:|
| Frontend | 8081 |
| Backend | 5000 |
| MySQL | Internal Docker network |

## Run Locally

```bash
docker compose up --build -d

## Check Containers

docker compose ps

## Health Check

http://localhost:5000/api/health

## Frontend

http://localhost:8081

## Stop Application

docker compose down