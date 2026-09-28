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
                '''
            }
        }

        stage('Backend Test') {
            steps {
                echo '===== BACKEND TEST ====='

                dir('backend') {
                    bat 'npm ci'
                    bat 'npm test'
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo '===== DOCKER BUILD ====='

                bat '''
                    echo Docker Compose configuration:
                    docker compose config

                    echo.
                    echo Building Docker images:
                    docker compose build

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
                    usernamePassword(
                        credentialsId: 'dockerhub-password',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    bat '''
                        echo Logging in to Docker Hub...
                        echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin

                        if errorlevel 1 (
                            echo Docker Hub login FAILED
                            exit /b 1
                        )

                        echo Docker Hub login SUCCESS
                    '''
                }
            }
        }

        stage('Docker Tag') {
            steps {
                echo '===== DOCKER TAG ====='

                bat '''
                    echo Tagging backend image...

                    docker tag cicd-demo-backend:%APP_VERSION% %DOCKER_USERNAME%/cicd-demo-backend:%APP_VERSION%
                    docker tag cicd-demo-backend:%APP_VERSION% %DOCKER_USERNAME%/cicd-demo-backend:latest

                    echo.
                    echo Tagging frontend image...

                    docker tag cicd-demo-frontend:%APP_VERSION% %DOCKER_USERNAME%/cicd-demo-frontend:%APP_VERSION%
                    docker tag cicd-demo-frontend:%APP_VERSION% %DOCKER_USERNAME%/cicd-demo-frontend:latest

                    echo.
                    echo Tagged images:
                    docker images %DOCKER_USERNAME%/cicd-demo-backend
                    docker images %DOCKER_USERNAME%/cicd-demo-frontend
                '''
            }
        }

        stage('Docker Push') {
            steps {
                echo '===== DOCKER PUSH ====='

                bat '''
                    echo Pushing backend version %APP_VERSION%...
                    docker push %DOCKER_USERNAME%/cicd-demo-backend:%APP_VERSION%

                    echo.
                    echo Pushing backend latest...
                    docker push %DOCKER_USERNAME%/cicd-demo-backend:latest

                    echo.
                    echo Pushing frontend version %APP_VERSION%...
                    docker push %DOCKER_USERNAME%/cicd-demo-frontend:%APP_VERSION%

                    echo.
                    echo Pushing frontend latest...
                    docker push %DOCKER_USERNAME%/cicd-demo-frontend:latest

                    echo.
                    echo ===== DOCKER PUSH COMPLETED =====
                '''
            }
        }

        stage('Deployment') {
            steps {
                echo '===== DEPLOYMENT ====='

                bat '''
                    echo Stopping existing containers...
                    docker compose down

                    echo.
                    echo Starting application...
                    docker compose up -d

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

                        Write-Host "Backend health check attempt $attempt of $maxAttempts"

                        try {
                            $response = Invoke-WebRequest `
                                -Uri "http://localhost:5000/" `
                                -UseBasicParsing `
                                -TimeoutSec 5

                            if ($response.StatusCode -eq 200) {
                                Write-Host "Backend health check PASSED"
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

                bat '''
                    echo.
                    echo Frontend health check...

                    curl.exe --fail --silent --show-error http://localhost:8081/

                    if errorlevel 1 (
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
                    echo Docker Compose containers:
                    docker compose ps

                    echo.
                    echo Docker images:
                    docker images | findstr "cicd-demo"
                '''
            }
        }
    }

    post {

        success {
            echo '=========================================='
            echo '       CI/CD PIPELINE SUCCESSFUL'
            echo '=========================================='
            echo 'Docker images were built and pushed.'
            echo 'Application deployment completed.'
        }

        failure {
            echo '=========================================='
            echo '          CI/CD PIPELINE FAILED'
            echo '=========================================='
            echo 'Check the failed stage above for details.'
        }

        always {
            echo '=========================================='
            echo 'Pipeline execution completed.'
            echo '=========================================='
        }
    }
}
