# Jenkins Docker CI/CD Demo

## 1. Project Overview

This project demonstrates a practical **CI/CD implementation using Jenkins, Git, Docker, Docker Compose, Docker Hub, MySQL, and Trivy**.

The objective is to automate the complete application delivery process starting from source-code checkout through application testing, Docker image creation, security scanning, image publishing, deployment, health verification, and rollback support.

The project uses a backend application, frontend application, and MySQL database running as Docker containers.

---

## 2. Assessment Objective

The objective of this project is to develop practical knowledge of:

* Continuous Integration (CI)
* Continuous Delivery/Deployment (CD)
* Jenkins Pipeline automation
* Git integration
* Node.js application dependency installation
* Docker image creation
* Docker Compose orchestration
* Docker Hub image publishing
* Trivy container security scanning
* Environment configuration
* Persistent database storage
* Automated deployment
* Application health checks
* Docker image cleanup
* Versioned Docker images
* Rollback concepts

---

## 3. Technologies Used

| Technology     | Purpose                                   |
| -------------- | ----------------------------------------- |
| Git            | Source code management                    |
| GitHub         | Remote source-code repository             |
| Jenkins        | CI/CD automation                          |
| Docker         | Containerization                          |
| Docker Compose | Multi-container application orchestration |
| Docker Hub     | Docker image registry                     |
| Node.js        | Backend runtime                           |
| npm            | Dependency management                     |
| MySQL 8.0      | Database                                  |
| Trivy          | Container vulnerability scanning          |
| Windows        | Jenkins/Docker host environment           |
| PowerShell     | Health-check automation                   |
| Batch Script   | Windows Jenkins pipeline commands         |

---

## 4. Application Architecture

The application consists of three main services:

```text
                    Developer
                       |
                       v
                    GitHub
                       |
                       v
                    Jenkins
                       |
       +---------------+----------------+
       |               |                |
       v               v                v
   Backend Build   Frontend Build   Trivy Scan
       |               |                |
       +---------------+----------------+
                       |
                       v
                  Docker Images
                       |
                       v
                  Docker Hub
                       |
                       v
                Docker Compose
                       |
       +---------------+----------------+
       |               |                |
       v               v                v
   Backend         Frontend          MySQL
   :5000            :8081            :3306
                                       |
                                       v
                              Persistent Volume
                              cicd-demo-mysql-data
```

---

## 5. Project Structure

```text
jenkins-docker-cicd-demo/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── products.js
│   │   ├── db.js
│   │   └── server.js
│   ├── tests/
│   │   └── health.test.js
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── app.js
│   ├── index.html
│   ├── style.css
│   ├── Dockerfile
│   └── .dockerignore
│
├── database/
│   └── init.sql
│
├── trivy/
│   └── reports/
│       ├── backend-trivy-report.txt
│       └── frontend-trivy-report.txt
│
├── Jenkinsfile
├── docker-compose.yml
├── .env
├── .gitignore
└── README.md
```

---

# 6. CI/CD Workflow

The Jenkins pipeline follows this workflow:

```text
Checkout
   ↓
Verify Environment
   ↓
Backend Test
   ↓
Docker Build
   ↓
Trivy Security Scan
   ↓
Docker Hub Login
   ↓
Docker Tag
   ↓
Docker Push
   ↓
Deployment
   ↓
Health Check
   ↓
Final Status
   ↓
Rollback Information
```

---

# 7. Jenkins Pipeline Stages

## Stage 1 — Checkout

Jenkins retrieves the latest source code from the configured Git repository.

```groovy
checkout scm
```

This ensures that the pipeline always works with the source code associated with the Jenkins build.

---

## Stage 2 — Verify Environment

The pipeline verifies the availability of the required tools:

* Docker
* Docker Compose
* Node.js
* npm
* Git

Example commands:

```cmd
docker --version
docker compose version
node --version
npm --version
git --version
```

This helps identify environment problems before starting the build.

---

# 8. Backend Test

The pipeline enters the backend directory and installs dependencies using:

```cmd
npm ci
```

`npm ci` provides a clean and reproducible dependency installation based on `package-lock.json`.

If dependency installation fails, the Jenkins pipeline stops.

---

# 9. Docker Build

Docker Compose configuration is first validated:

```cmd
docker compose config
```

The application images are then built:

```cmd
docker compose build --no-cache
```

The main application images are:

```text
cicd-demo-backend:1.0
cicd-demo-frontend:1.0
```

The `--no-cache` option ensures that the Docker build does not reuse previous intermediate layers.

---

# 10. Trivy Security Scanning

Trivy is used to scan the Docker images for known vulnerabilities.

Trivy is executed as a Docker container:

```cmd
docker run --rm aquasec/trivy:latest --version
```

The project uses a persistent Docker volume for the Trivy vulnerability database:

```text
trivy-cache
```

This avoids downloading the vulnerability database unnecessarily on every scan.

The backend image is scanned using:

```text
cicd-demo-backend:1.0
```

The frontend image is scanned using:

```text
cicd-demo-frontend:1.0
```

The reports are saved under:

```text
trivy/reports/
```

Reports:

```text
backend-trivy-report.txt
frontend-trivy-report.txt
```

The Jenkins pipeline archives these reports as build artifacts.

---

# 11. Docker Hub Authentication

Jenkins authenticates to Docker Hub using a Jenkins credential:

```text
dockerhub-credentials
```

The credential contains:

```text
Docker Hub Username
Docker Hub Personal Access Token
```

Credentials are injected into the pipeline using Jenkins `withCredentials`.

The Docker Hub repositories used by the project are:

```text
deekshith7204/jenkins-docker-cicd-demo-backend
```

```text
deekshith7204/jenkins-docker-cicd-demo-frontend
```

---

# 12. Docker Image Versioning

The Jenkins build number is used as the Docker image version.

For example, the current Jenkins build is:

```text
25
```

Therefore, the images are tagged as:

```text
deekshith7204/jenkins-docker-cicd-demo-backend:25
deekshith7204/jenkins-docker-cicd-demo-frontend:25
```

The images also receive the `latest` tag:

```text
deekshith7204/jenkins-docker-cicd-demo-backend:latest
deekshith7204/jenkins-docker-cicd-demo-frontend:latest
```

This provides traceability between a Jenkins build and the Docker image created by that build.

---

# 13. Docker Image Push

After tagging, Jenkins pushes the images to Docker Hub.

Backend:

```cmd
docker push deekshith7204/jenkins-docker-cicd-demo-backend:latest
docker push deekshith7204/jenkins-docker-cicd-demo-backend:%IMAGE_TAG%
```

Frontend:

```cmd
docker push deekshith7204/jenkins-docker-cicd-demo-frontend:latest
docker push deekshith7204/jenkins-docker-cicd-demo-frontend:%IMAGE_TAG%
```

This makes versioned application images available in the Docker registry.

---

# 14. Docker Compose Deployment

The deployment stage first stops the existing application containers:

```cmd
docker compose down
```

The application is then started again:

```cmd
docker compose up -d
```

The deployed services are:

```text
cicd-demo-backend
cicd-demo-frontend
cicd-demo-mysql
```

Container status can be checked using:

```cmd
docker compose ps
```

---

# 15. Application Ports

The application uses the following ports:

| Service  | Container Port |               Host Port |
| -------- | -------------: | ----------------------: |
| Backend  |           5000 |                    5000 |
| Frontend |             80 |                    8081 |
| MySQL    |           3306 | Internal Docker network |

Application URLs:

```text
Frontend:
http://localhost:8081

Backend:
http://localhost:5000
```

---

# 16. MySQL Database

The project uses:

```text
MySQL 8.0
```

Database name:

```text
cicd_demo
```

The database initialization script is:

```text
database/init.sql
```

The database currently contains the:

```text
products
```

table.

Database verification:

```cmd
docker exec -it cicd-demo-mysql mysql -u root -prootpassword -D cicd_demo -e "SHOW TABLES;"
```

Expected output includes:

```text
products
```

---

# 17. Persistent Storage

MySQL uses a Docker named volume:

```text
cicd-demo-mysql-data
```

The volume is mounted to:

```text
/var/lib/mysql
```

This allows MySQL data to persist independently of the lifecycle of the MySQL container.

The volume can be verified using:

```cmd
docker volume ls
```

Expected volume:

```text
cicd-demo-mysql-data
```

Detailed information can be viewed using:

```cmd
docker volume inspect cicd-demo-mysql-data
```

This demonstrates persistent storage as required by the assessment.

---

# 18. Container Health Checks

Docker Compose provides health checks for the application services.

MySQL health is checked using:

```cmd
mysqladmin ping
```

The Jenkins pipeline additionally performs application-level health checks.

Backend:

```text
http://localhost:5000/
```

Frontend:

```text
http://localhost:8081/
```

The Jenkins pipeline waits for the application to become available before marking the deployment successful.

The health-check mechanism retries the request multiple times before failing the pipeline.

---

# 19. Deployment Verification

The deployed containers can be verified using:

```cmd
docker compose ps
```

Expected state:

```text
cicd-demo-backend     Up     healthy
cicd-demo-frontend    Up     healthy
cicd-demo-mysql       Up     healthy
```

The application can then be accessed from:

```text
http://localhost:8081
```

The Products section should successfully load product information from the backend/database.

---

# 20. Docker Image Cleanup

Docker images and containers can consume significant disk space during repeated Jenkins builds.

The project therefore supports Docker image cleanup after builds.

Older local images can be identified using:

```cmd
docker images
```

Unused Docker resources can be inspected using:

```cmd
docker system df
```

Unused resources can be cleaned carefully using:

```cmd
docker image prune
```

or:

```cmd
docker system prune
```

**Important:** Cleanup commands should be used carefully because unused containers, networks, and images may be removed.

The MySQL persistent volume should not be removed when database data needs to be preserved.

---

# 21. Rollback Strategy

The pipeline uses Jenkins build numbers as Docker image tags.

For example:

```text
Build 24
Build 25
```

The current deployment is:

```text
Build 25
```

The previous version can be represented by:

```text
Build 24
```

Docker Hub retains versioned images so that an earlier application version can be retrieved when required.

Example:

```cmd
docker pull deekshith7204/jenkins-docker-cicd-demo-backend:24
```

```cmd
docker pull deekshith7204/jenkins-docker-cicd-demo-frontend:24
```

The required previous image tag can then be configured in the deployment configuration and redeployed using Docker Compose.

Rollback concept:

```text
Current Version
     |
     v
Build 25
     |
     | Deployment problem
     v
Select previous version
     |
     v
Build 24
     |
     v
Pull previous Docker images
     |
     v
Deploy with Docker Compose
     |
     v
Health Check
```

The Jenkins pipeline also displays rollback instructions in the Jenkins console output.

---

# 22. Environment Configuration

Application configuration is managed using environment variables.

Typical configuration includes:

```text
MYSQL_HOST
MYSQL_DATABASE
MYSQL_USER
MYSQL_PASSWORD
MYSQL_ROOT_PASSWORD
```

The Docker Compose configuration uses environment variables rather than hardcoding application configuration throughout the application.

Sensitive credentials should not be committed to Git.

The `.env` file should therefore be protected through `.gitignore` when it contains real credentials.

---

# 23. Security Practices

The project implements several security-related practices:

### Trivy scanning

Docker images are scanned for known vulnerabilities before deployment.

### Docker Hub authentication

Docker Hub authentication is handled through Jenkins credentials.

### Personal Access Token

A Docker Hub Personal Access Token should be used instead of exposing a Docker Hub password.

### Secret protection

Sensitive environment variables should not be committed to the Git repository.

### Versioned images

Build-number tags provide traceability and make rollback possible.

---

# 24. Jenkins Credentials

The Jenkins pipeline expects the following credential ID:

```text
dockerhub-credentials
```

The credential should contain:

```text
Username: Docker Hub username
Password: Docker Hub Personal Access Token
```

The Jenkinsfile references it using:

```groovy
withCredentials([
    usernamePassword(
        credentialsId: "dockerhub-credentials",
        usernameVariable: "DOCKER_USERNAME",
        passwordVariable: "DOCKER_PASSWORD"
    )
])
```

---

# 25. Jenkinsfile

The main CI/CD pipeline configuration is stored in:

```text
Jenkinsfile
```

The Jenkinsfile automates:

```text
Git Checkout
Environment Verification
Backend Dependency Installation
Docker Build
Trivy Scan
Docker Hub Login
Docker Tagging
Docker Push
Deployment
Health Check
Final Status
Rollback Information
```

---

# 26. Docker Compose

The multi-container application is defined in:

```text
docker-compose.yml
```

Docker Compose manages:

```text
Backend
Frontend
MySQL
Network
Persistent MySQL Volume
Health Checks
Environment Variables
```

The application can be started manually using:

```cmd
docker compose up -d
```

It can be stopped using:

```cmd
docker compose down
```

---

# 27. Useful Docker Commands

### View running containers

```cmd
docker ps
```

### View all containers

```cmd
docker ps -a
```

### View Compose services

```cmd
docker compose ps
```

### View backend logs

```cmd
docker logs cicd-demo-backend
```

### View frontend logs

```cmd
docker logs cicd-demo-frontend
```

### View MySQL logs

```cmd
docker logs cicd-demo-mysql
```

### Follow backend logs

```cmd
docker logs -f cicd-demo-backend
```

### List images

```cmd
docker images
```

### List volumes

```cmd
docker volume ls
```

### Inspect MySQL volume

```cmd
docker volume inspect cicd-demo-mysql-data
```

### Check Docker disk usage

```cmd
docker system df
```

---

# 28. Useful Jenkins Commands/Operations

The Jenkins job executes the pipeline automatically.

A successful build performs:

```text
Checkout        ✓
Environment     ✓
Backend Test    ✓
Docker Build    ✓
Trivy Scan      ✓
Docker Login    ✓
Docker Tag      ✓
Docker Push     ✓
Deployment      ✓
Health Check    ✓
Final Status    ✓
```

The current successful deployment demonstrated during the assessment uses:

```text
Jenkins Build: 25
```

---

# 29. Trivy Reports

The generated Trivy reports are stored under:

```text
trivy/reports/
```

Files:

```text
backend-trivy-report.txt
frontend-trivy-report.txt
```

These reports should be submitted as part of the assessment deliverables.

Jenkins also archives the reports as build artifacts.

---

# 30. Assessment Deliverables

The following files/evidence should be submitted:

### 1. Jenkinsfile

```text
Jenkinsfile
```

Contains the complete CI/CD pipeline.

### 2. Docker Compose

```text
docker-compose.yml
```

Contains the multi-container application configuration.

### 3. Backend Dockerfile

```text
backend/Dockerfile
```

### 4. Frontend Dockerfile

```text
frontend/Dockerfile
```

### 5. Database initialization

```text
database/init.sql
```

### 6. Trivy reports

```text
trivy/reports/backend-trivy-report.txt
trivy/reports/frontend-trivy-report.txt
```

### 7. Jenkins screenshots

Recommended screenshots:

* Jenkins pipeline overview
* Successful Jenkins build
* Docker Build stage
* Trivy Security Scan stage
* Docker Push stage
* Deployment stage
* Health Check stage
* Final Status
* Rollback information

### 8. Docker verification screenshots

Recommended terminal evidence:

```cmd
docker compose ps
```

```cmd
docker images
```

```cmd
docker volume ls
```

```cmd
docker system df
```

### 9. Application screenshot

Show the running frontend:

```text
http://localhost:8081
```

with the Products section successfully loading.

---

# 31. Complete CI/CD Flow

The complete implementation can be summarized as:

```text
Developer
   |
   v
Git Repository
   |
   v
Jenkins
   |
   +---- Checkout
   |
   +---- Verify Environment
   |
   +---- Install/Test Backend
   |
   +---- Docker Build
   |
   +---- Trivy Security Scan
   |
   +---- Docker Hub Authentication
   |
   +---- Create Version Tags
   |
   +---- Push Images
   |
   +---- Docker Compose Deployment
   |
   +---- Health Check
   |
   +---- Final Status
   |
   +---- Rollback Support
   |
   v
Running Application
   |
   +---- Frontend :8081
   |
   +---- Backend  :5000
   |
   +---- MySQL
          |
          v
   Persistent Docker Volume
```

---

# 32. Result

The project successfully demonstrates an automated CI/CD workflow using Jenkins and Docker.

The pipeline automates source checkout, backend dependency installation, Docker image creation, Trivy security scanning, Docker Hub publishing, application deployment, health verification, and rollback support.

The current deployment uses Jenkins build **25** as the versioned Docker image tag.

The application is available locally at:

```text
Frontend:
http://localhost:8081

Backend:
http://localhost:5000
```

The MySQL database uses persistent storage through:

```text
cicd-demo-mysql-data
```

The implementation provides versioned Docker images, security scanning, persistent database storage, automated deployment, health checks, cleanup support, and a documented rollback strategy.

---

# 33. Conclusion

This project demonstrates how Jenkins can be used to automate a practical CI/CD pipeline for a containerized application.

Instead of manually building, scanning, publishing, and deploying application components, Jenkins performs these activities as a repeatable pipeline.

The implementation also demonstrates important DevOps practices such as:

* Automation
* Continuous Integration
* Continuous Deployment
* Containerization
* Infrastructure configuration
* Security scanning
* Image versioning
* Persistent storage
* Health monitoring
* Artifact management
* Rollback planning

This provides a practical foundation for implementing CI/CD workflows in real-world DevOps environments.
