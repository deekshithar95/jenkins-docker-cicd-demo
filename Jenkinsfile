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
                    echo Current directory:
                    cd

                    echo.
                    echo Project files:
                    dir

                    echo.
                    echo Docker version:
                    docker --version

                    echo.
                    echo Docker Compose version:
                    docker compose version

                    echo.
                    echo Node version:
                    node --version

                    echo.
                    echo NPM version:
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
                            echo npm ci FAILED
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
                    echo Docker Compose configuration:
                    docker compose config

                    if errorlevel 1 (
                        echo Docker Compose configuration FAILED
                        exit /b 1
                    )

                    echo.
                    echo Building Docker images...

                    docker compose build

                    if errorlevel 1 (
                        echo Docker image build FAILED
                        exit /b 1
                    )

                    echo.
                    echo Docker images:

                    docker images
                '''
            }
        }

        stage('Docker Login') {
            steps {
                echo '===== DOCKER HUB LOGIN ====='

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
                            echo Docker Hub login FAILED
                            exit /b 1
                        )

                        echo.
                        echo Docker Hub login SUCCESS
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
                        echo Docker Hub username:
                        echo %DOCKER_USERNAME%

                        echo.
                        echo Tagging backend image...

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
                        echo Tagging frontend image...

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
                        echo ===== TAGGING COMPLETED =====

                        echo.
                        echo Backend Docker images:
                        docker images %DOCKER_USERNAME%/cicd-demo-backend

                        echo.
                        echo Frontend Docker images:
                        docker images %DOCKER_USERNAME%/cicd-demo-frontend
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
                        echo Pushing backend version %APP_VERSION%...

                        docker push %DOCKER_USERNAME%/cicd-demo-backend:%APP_VERSION%

                        if errorlevel 1 (
                            echo Backend version push FAILED
                            exit /b 1
                        )

                        echo.
                        echo Pushing backend latest...

                        docker push %DOCKER_USERNAME%/cicd-demo-backend:latest

                        if errorlevel 1 (
                            echo Backend latest push FAILED
                            exit /b 1
                        )

                        echo.
                        echo Pushing frontend version %APP_VERSION%...

                        docker push %DOCKER_USERNAME%/cicd-demo-frontend:%APP_VERSION%

                        if errorlevel 1 (
                            echo Frontend version push FAILED
                            exit /b 1
                        )

                        echo.
                        echo Pushing frontend latest...

                        docker push %DOCKER_USERNAME%/cicd-demo-frontend:latest

                        if errorlevel 1 (
                            echo Frontend latest push FAILED
                            exit /b 1
                        )

                        echo.
                        echo ==========================================
                        echo       DOCKER PUSH COMPLETED
                        echo ==========================================
                    '''
                }
            }
        }

        stage('Deployment') {
            steps {
                echo '===== DEPLOYMENT ====='

                bat '''
                    echo Stopping existing containers...

                    docker compose down

                    if errorlevel 1 (
                        echo Warning: docker compose down returned an error.
                        echo Continuing with deployment...
                    )

                    echo.
                    echo Starting application...

                    docker compose up -d

                    if errorlevel 1 (
                        echo Docker Compose deployment FAILED
                        exit /b 1
                    )

                    echo.
                    echo Waiting for containers to start...

                    timeout /t 10 /nobreak

                    echo.
                    echo Container status:

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
                        }

                        Start-Sleep -Seconds 5

                        $attempt++
                    }

                    Write-Error "Backend health check FAILED"

                    docker compose ps

                    docker compose logs backend

                    exit 1
                '''

                bat '''
                    echo.
                    echo ==========================================
                    echo Frontend health check...
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

                bat '''
                    echo.
                    echo ==========================================
                    echo Docker Compose containers:
                    echo ==========================================

                    docker compose ps

                    echo.
                    echo ==========================================
                    echo Docker images:
                    echo ==========================================

                    docker images | findstr "cicd-demo"

                    echo.
                    echo ==========================================
                    echo Application URLs:
                    echo ==========================================

                    echo Backend:
                    echo http://localhost:5000/

                    echo.
                    echo Frontend:
                    echo http://localhost:8081/

                    echo.
                    echo ==========================================
                    echo FINAL STATUS CHECK COMPLETED
                    echo ==========================================
                '''
            }
        }
    }

    post {

        success {

            echo '=========================================='
            echo '       CI/CD PIPELINE SUCCESSFUL'
            echo '=========================================='

            echo 'Backend tests passed.'
            echo 'Docker images were built successfully.'
            echo 'Docker Hub login successful.'
            echo 'Docker images were tagged successfully.'
            echo 'Docker images were pushed successfully.'
            echo 'Application deployment completed.'
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
