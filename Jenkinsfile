pipeline {

    agent any

    environment {
        APP_VERSION = "1.0"
    }

    stages {

        stage('Checkout') {
            steps {
                echo '===== CHECKOUT ====='

                checkout scm
            }
        }

        stage('Verify Environment') {
            steps {
                echo '===== VERIFY ENVIRONMENT ====='

                bat '''
                    echo.
                    echo ===== CURRENT DIRECTORY =====
                    cd

                    echo.
                    echo ===== PROJECT FILES =====
                    dir

                    echo.
                    echo ===== DOCKER VERSION =====
                    docker --version

                    echo.
                    echo ===== DOCKER COMPOSE VERSION =====
                    docker compose version

                    echo.
                    echo ===== NODE VERSION =====
                    node --version

                    echo.
                    echo ===== NPM VERSION =====
                    npm --version
                '''
            }
        }

        stage('Backend Test') {
            steps {
                echo '===== BACKEND TEST ====='

                dir('backend') {

                    bat '''
                        echo Installing backend dependencies...
                        npm ci

                        if errorlevel 1 (
                            echo Backend dependency installation FAILED
                            exit /b 1
                        )

                        echo.
                        echo Running backend tests...
                        npm test

                        if errorlevel 1 (
                            echo Backend tests FAILED
                            exit /b 1
                        )

                        echo.
                        echo Backend tests PASSED
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo '===== DOCKER BUILD ====='

                bat '''
                    echo.
                    echo ===== DOCKER COMPOSE CONFIGURATION =====
                    docker compose config

                    if errorlevel 1 (
                        echo Docker Compose configuration FAILED
                        exit /b 1
                    )

                    echo.
                    echo ===== BUILDING DOCKER IMAGES =====
                    docker compose build --no-cache

                    if errorlevel 1 (
                        echo Docker image build FAILED
                        exit /b 1
                    )

                    echo.
                    echo ===== DOCKER IMAGES =====
                    docker images

                    echo.
                    echo Docker images built successfully.
                '''
            }
        }

        stage('Docker Login') {
            steps {
                echo '===== DOCKER HUB LOGIN ====='

                /*
                 * IMPORTANT:
                 * Both Jenkins credentials are configured as
                 * "Secret text".
                 *
                 * Therefore use string(), NOT usernamePassword().
                 */

                withCredentials([
                    string(
                        credentialsId: 'dockerhub-username',
                        variable: 'DOCKER_USERNAME'
                    ),
                    string(
                        credentialsId: 'dockerhub-password',
                        variable: 'DOCKER_PASSWORD'
                    )
                ]) {

                    bat '''
                        echo Logging in to Docker Hub...

                        echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin

                        if errorlevel 1 (
                            echo.
                            echo ==========================================
                            echo Docker Hub login FAILED
                            echo ==========================================
                            echo.
                            echo Check:
                            echo 1. Docker Hub username
                            echo 2. Docker Hub Access Token
                            echo 3. Jenkins credential IDs
                            echo.
                            exit /b 1
                        )

                        echo.
                        echo ==========================================
                        echo Docker Hub login SUCCESS
                        echo ==========================================
                    '''
                }
            }
        }

        stage('Docker Tag') {
            steps {
                echo '===== DOCKER TAG ====='

                withCredentials([
                    string(
                        credentialsId: 'dockerhub-username',
                        variable: 'DOCKER_USERNAME'
                    )
                ]) {

                    bat '''
                        echo Docker Hub username is configured.

                        echo.
                        echo ===== TAGGING BACKEND =====

                        docker tag cicd-demo-backend:%APP_VERSION% %DOCKER_USERNAME%/jenkins-docker-cicd-demo-backend:%APP_VERSION%

                        if errorlevel 1 (
                            echo Backend version tag FAILED
                            exit /b 1
                        )

                        docker tag cicd-demo-backend:%APP_VERSION% %DOCKER_USERNAME%/jenkins-docker-cicd-demo-backend:latest

                        if errorlevel 1 (
                            echo Backend latest tag FAILED
                            exit /b 1
                        )

                        echo.
                        echo ===== TAGGING FRONTEND =====

                        docker tag cicd-demo-frontend:%APP_VERSION% %DOCKER_USERNAME%/jenkins-docker-cicd-demo-frontend:%APP_VERSION%

                        if errorlevel 1 (
                            echo Frontend version tag FAILED
                            exit /b 1
                        }

                        docker tag cicd-demo-frontend:%APP_VERSION% %DOCKER_USERNAME%/jenkins-docker-cicd-demo-frontend:latest

                        if errorlevel 1 (
                            echo Frontend latest tag FAILED
                            exit /b 1
                        )

                        echo.
                        echo ===== TAGGED IMAGES =====

                        docker images %DOCKER_USERNAME%/jenkins-docker-cicd-demo-backend

                        docker images %DOCKER_USERNAME%/jenkins-docker-cicd-demo-frontend
                    '''
                }
            }
        }

        stage('Docker Push') {
            steps {
                echo '===== DOCKER PUSH ====='

                withCredentials([
                    string(
                        credentialsId: 'dockerhub-username',
                        variable: 'DOCKER_USERNAME'
                    )
                ]) {

                    bat '''
                        echo.
                        echo ===== PUSHING BACKEND VERSION =====

                        docker push %DOCKER_USERNAME%/jenkins-docker-cicd-demo-backend:%APP_VERSION%

                        if errorlevel 1 (
                            echo Backend version push FAILED
                            exit /b 1
                        }

                        echo.
                        echo ===== PUSHING BACKEND LATEST =====

                        docker push %DOCKER_USERNAME%/jenkins-docker-cicd-demo-backend:latest

                        if errorlevel 1 (
                            echo Backend latest push FAILED
                            exit /b 1
                        }

                        echo.
                        echo ===== PUSHING FRONTEND VERSION =====

                        docker push %DOCKER_USERNAME%/jenkins-docker-cicd-demo-frontend:%APP_VERSION%

                        if errorlevel 1 (
                            echo Frontend version push FAILED
                            exit /b 1
                        }

                        echo.
                        echo ===== PUSHING FRONTEND LATEST =====

                        docker push %DOCKER_USERNAME%/jenkins-docker-cicd-demo-frontend:latest

                        if errorlevel 1 (
                            echo Frontend latest push FAILED
                            exit /b 1
                        }

                        echo.
                        echo ==========================================
                        echo ALL DOCKER IMAGES PUSHED SUCCESSFULLY
                        echo ==========================================
                    '''
                }
            }
        }

        stage('Deployment') {
            steps {
                echo '===== DEPLOYMENT ====='

                bat '''
                    echo.
                    echo ===== STOPPING OLD CONTAINERS =====

                    docker compose down

                    echo.
                    echo ===== STARTING APPLICATION =====

                    docker compose up -d

                    if errorlevel 1 (
                        echo Docker Compose startup FAILED
                        exit /b 1
                    )

                    echo.
                    echo ===== WAITING FOR CONTAINERS =====

                    timeout /t 15 /nobreak

                    echo.
                    echo ===== CONTAINER STATUS =====

                    docker compose ps
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '===== HEALTH CHECK ====='

                powershell '''
                    $maxAttempts = 12
                    $attempt = 1

                    while ($attempt -le $maxAttempts) {

                        Write-Host ""
                        Write-Host "=========================================="
                        Write-Host "Backend health check attempt $attempt of $maxAttempts"
                        Write-Host "=========================================="

                        try {

                            $response = Invoke-WebRequest `
                                -Uri "http://localhost:5000/" `
                                -UseBasicParsing `
                                -TimeoutSec 5

                            if ($response.StatusCode -eq 200) {

                                Write-Host ""
                                Write-Host "Backend health check PASSED"
                                Write-Host "Response:"
                                Write-Host $response.Content

                                exit 0
                            }

                        }
                        catch {

                            Write-Host "Backend is not ready yet..."
                            Write-Host $_.Exception.Message
                        }

                        Start-Sleep -Seconds 5

                        $attempt++
                    }

                    Write-Error "Backend health check FAILED"

                    docker compose ps

                    exit 1
                '''

                bat '''
                    echo.
                    echo ==========================================
                    echo FRONTEND HEALTH CHECK
                    echo ==========================================

                    curl.exe --fail --silent --show-error http://localhost:8081/

                    if errorlevel 1 (
                        echo.
                        echo Frontend health check FAILED
                        exit /b 1
                    )

                    echo.
                    echo Frontend health check PASSED
                '''
            }
        }

        stage('Final Status') {
            steps {
                echo '===== FINAL STATUS ====='

                withCredentials([
                    string(
                        credentialsId: 'dockerhub-username',
                        variable: 'DOCKER_USERNAME'
                    )
                ]) {

                    bat '''
                        echo.
                        echo ==========================================
                        echo DOCKER COMPOSE CONTAINERS
                        echo ==========================================

                        docker compose ps

                        echo.
                        echo ==========================================
                        echo DOCKER IMAGES
                        echo ==========================================

                        docker images | findstr "cicd-demo"

                        echo.
                        echo ==========================================
                        echo DOCKER HUB IMAGES
                        echo ==========================================

                        docker images | findstr "%DOCKER_USERNAME%/jenkins-docker-cicd-demo"

                        echo.
                        echo ==========================================
                        echo DEPLOYMENT COMPLETED
                        echo ==========================================
                    '''
                }
            }
        }
    }

    post {

        success {
            echo '=========================================='
            echo '       CI/CD PIPELINE SUCCESSFUL'
            echo '=========================================='
            echo 'Backend tests passed.'
            echo 'Docker images built successfully.'
            echo 'Docker images pushed to Docker Hub.'
            echo 'Application deployed successfully.'
            echo 'Health checks passed.'
            echo '=========================================='
        }

        failure {
            echo '=========================================='
            echo '          CI/CD PIPELINE FAILED'
            echo '=========================================='
            echo 'Check the failed stage above for details.'
            echo '=========================================='
        }

        always {
            echo '=========================================='
            echo 'Pipeline execution completed.'
            echo '=========================================='
        }
    }
}