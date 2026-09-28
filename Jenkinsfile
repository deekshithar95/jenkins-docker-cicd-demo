pipeline {

    agent any

    environment {
        APP_VERSION = "1.0"

        // Jenkins Credentials IDs
        DOCKER_USERNAME = credentials('dockerhub-username')
        DOCKER_PASSWORD = credentials('dockerhub-password')
    }

    stages {

        stage('Checkout') {
            steps {
                echo '===== CHECKOUT SOURCE CODE ====='
                checkout scm
            }
        }

        stage('Verify Environment') {
            steps {
                echo '===== VERIFYING ENVIRONMENT ====='

                bat '''
                    echo.
                    echo ===== Project Files =====
                    dir

                    echo.
                    echo ===== Docker Version =====
                    docker --version

                    echo.
                    echo ===== Docker Compose Version =====
                    docker compose version

                    echo.
                    echo ===== Node Version =====
                    node --version

                    echo.
                    echo ===== NPM Version =====
                    npm --version
                '''
            }
        }

        stage('Backend Test') {
            steps {
                echo '===== RUNNING BACKEND TESTS ====='

                dir('backend') {
                    bat '''
                        echo Installing dependencies...
                        call npm ci

                        echo.
                        echo Running tests...
                        call npm test
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo '===== BUILDING DOCKER IMAGES ====='

                bat '''
                    echo.
                    echo ===== Docker Compose Configuration =====
                    docker compose config

                    if errorlevel 1 (
                        echo Docker Compose configuration FAILED
                        exit /b 1
                    )

                    echo.
                    echo ===== Building Backend and Frontend =====
                    docker compose build --no-cache

                    if errorlevel 1 (
                        echo Docker image build FAILED
                        exit /b 1
                    )

                    echo.
                    echo ===== Docker Images Created =====
                    docker images
                '''
            }
        }

        stage('Docker Login') {
            steps {
                echo '===== LOGIN TO DOCKER HUB ====='

                bat '''
                    echo Logging into Docker Hub...

                    echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin

                    if errorlevel 1 (
                        echo.
                        echo ========================================
                        echo DOCKER HUB LOGIN FAILED
                        echo ========================================
                        echo.
                        echo Check the following:
                        echo 1. Docker Hub username is correct
                        echo 2. Docker Hub password/token is correct
                        echo 3. Jenkins credentials IDs are correct
                        echo 4. Docker Hub access token has write permission
                        echo.
                        exit /b 1
                    )

                    echo.
                    echo ========================================
                    echo DOCKER HUB LOGIN SUCCESSFUL
                    echo ========================================
                '''
            }
        }

        stage('Docker Tag') {
            steps {
                echo '===== TAGGING DOCKER IMAGES ====='

                bat '''
                    echo.
                    echo ===== Tagging Backend =====

                    docker tag cicd-demo-backend:%APP_VERSION% %DOCKER_USERNAME%/cicd-demo-backend:%APP_VERSION%

                    if errorlevel 1 (
                        echo Backend version tag FAILED
                        exit /b 1
                    )

                    docker tag cicd-demo-backend:%APP_VERSION% %DOCKER_USERNAME%/cicd-demo-backend:latest

                    if errorlevel 1 (
                        echo Backend latest tag FAILED
                        exit /b 1
                    )

                    echo.
                    echo ===== Tagging Frontend =====

                    docker tag cicd-demo-frontend:%APP_VERSION% %DOCKER_USERNAME%/cicd-demo-frontend:%APP_VERSION%

                    if errorlevel 1 (
                        echo Frontend version tag FAILED
                        exit /b 1
                    )

                    docker tag cicd-demo-frontend:%APP_VERSION% %DOCKER_USERNAME%/cicd-demo-frontend:latest

                    if errorlevel 1 (
                        echo Frontend latest tag FAILED
                        exit /b 1
                    )

                    echo.
                    echo ===== Tagged Images =====
                    docker images | findstr "cicd-demo"
                '''
            }
        }

        stage('Docker Push') {
            steps {
                echo '===== PUSHING IMAGES TO DOCKER HUB ====='

                bat '''
                    echo.
                    echo ========================================
                    echo PUSHING BACKEND VERSION %APP_VERSION%
                    echo ========================================

                    docker push %DOCKER_USERNAME%/cicd-demo-backend:%APP_VERSION%

                    if errorlevel 1 (
                        echo Backend version push FAILED
                        exit /b 1
                    )

                    echo.
                    echo ========================================
                    echo PUSHING BACKEND LATEST
                    echo ========================================

                    docker push %DOCKER_USERNAME%/cicd-demo-backend:latest

                    if errorlevel 1 (
                        echo Backend latest push FAILED
                        exit /b 1
                    )

                    echo.
                    echo ========================================
                    echo PUSHING FRONTEND VERSION %APP_VERSION%
                    echo ========================================

                    docker push %DOCKER_USERNAME%/cicd-demo-frontend:%APP_VERSION%

                    if errorlevel 1 (
                        echo Frontend version push FAILED
                        exit /b 1
                    )

                    echo.
                    echo ========================================
                    echo PUSHING FRONTEND LATEST
                    echo ========================================

                    docker push %DOCKER_USERNAME%/cicd-demo-frontend:latest

                    if errorlevel 1 (
                        echo Frontend latest push FAILED
                        exit /b 1
                    )

                    echo.
                    echo ========================================
                    echo ALL DOCKER IMAGES PUSHED SUCCESSFULLY
                    echo ========================================
                '''
            }
        }

        stage('Verify Docker Hub Images') {
            steps {
                echo '===== VERIFYING DOCKER IMAGES ====='

                bat '''
                    echo.
                    echo ===== Local Docker Images =====
                    docker images

                    echo.
                    echo Backend repository:
                    echo %DOCKER_USERNAME%/cicd-demo-backend

                    echo.
                    echo Frontend repository:
                    echo %DOCKER_USERNAME%/cicd-demo-frontend

                    echo.
                    echo Docker Hub push stage completed successfully.
                '''
            }
        }

        stage('Deployment') {
            steps {
                echo '===== DEPLOYING APPLICATION ====='

                bat '''
                    echo.
                    echo ===== Stopping Existing Containers =====
                    docker compose down

                    echo.
                    echo ===== Starting Application =====
                    docker compose up -d

                    if errorlevel 1 (
                        echo Docker Compose deployment FAILED
                        exit /b 1
                    )

                    echo.
                    echo ===== Container Status =====
                    docker compose ps
                '''
            }
        }

        stage('Health Check') {
            steps {

                echo '===== BACKEND HEALTH CHECK ====='

                powershell '''
                    $maxAttempts = 12
                    $attempt = 1

                    while ($attempt -le $maxAttempts) {

                        Write-Host "Health check attempt $attempt of $maxAttempts..."

                        try {

                            $response = Invoke-WebRequest `
                                -Uri "http://localhost:5000/" `
                                -UseBasicParsing `
                                -TimeoutSec 5

                            if ($response.StatusCode -eq 200) {

                                Write-Host ""
                                Write-Host "========================================"
                                Write-Host "BACKEND HEALTH CHECK PASSED"
                                Write-Host "========================================"
                                Write-Host ""

                                Write-Host $response.Content

                                exit 0
                            }

                        }
                        catch {

                            Write-Host "Backend is not ready yet..."
                        }

                        Start-Sleep -Seconds 5
                        $attempt++
                    }

                    Write-Error "Backend health check FAILED"
                    exit 1
                '''

                echo '===== FRONTEND HEALTH CHECK ====='

                bat '''
                    curl.exe --fail --silent --show-error http://localhost:8081/

                    if errorlevel 1 (
                        echo Frontend health check FAILED
                        exit /b 1
                    )

                    echo.
                    echo ========================================
                    echo FRONTEND HEALTH CHECK PASSED
                    echo ========================================
                '''

                echo '===== FINAL CONTAINER STATUS ====='

                bat '''
                    docker compose ps
                '''
            }
        }
    }

    post {

        success {

            echo '''
========================================
      CI/CD PIPELINE SUCCESS
========================================

GitHub
   |
   v
Jenkins
   |
   +---- Checkout
   |
   +---- Backend Test
   |
   +---- Docker Build
   |
   +---- Docker Hub Login
   |
   +---- Docker Tag
   |
   +---- Docker Push
   |
   +---- Docker Compose Deployment
   |
   +---- Backend Health Check
   |
   +---- Frontend Health Check
   |
   v
Application Running Successfully
========================================
'''
        }

        failure {

            echo '''
========================================
      CI/CD PIPELINE FAILED
========================================
'''

            bat '''
                echo.
                echo ===== Docker Compose Status =====
                docker compose ps

                echo.
                echo ===== Docker Compose Logs =====
                docker compose logs --tail=100
            '''
        }

        always {

            echo 'Pipeline execution completed.'

            bat '''
                echo.
                echo ===== Final Docker Containers =====
                docker ps -a
            '''
        }
    }
}
