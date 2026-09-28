pipeline {

    agent any

    environment {
        DOCKERHUB_USERNAME = 'deekshith7204'

        BACKEND_IMAGE  = 'deekshith7204/jenkins-docker-cicd-demo-backend'
        FRONTEND_IMAGE = 'deekshith7204/jenkins-docker-cicd-demo-frontend'

        BACKEND_LOCAL_IMAGE  = 'cicd-demo-backend:1.0'
        FRONTEND_LOCAL_IMAGE = 'cicd-demo-frontend:1.0'

        BACKEND_CONTAINER  = 'cicd-demo-backend'
        FRONTEND_CONTAINER = 'cicd-demo-frontend'
        MYSQL_CONTAINER    = 'cicd-demo-mysql'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '=========================================='
                echo '              CHECKOUT'
                echo '=========================================='

                checkout scm
            }
        }

        stage('Verify Environment') {
            steps {
                echo '=========================================='
                echo '          VERIFY ENVIRONMENT'
                echo '=========================================='

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
                echo '=========================================='
                echo '             BACKEND TEST'
                echo '=========================================='

                dir('backend') {
                    bat '''
                        echo Installing backend dependencies...
                        npm ci

                        echo.
                        echo Running backend tests...
                        npm test -- --runInBand

                        if errorlevel 1 (
                            echo.
                            echo ==========================================
                            echo Backend tests FAILED
                            echo ==========================================
                            exit /b 1
                        )

                        echo.
                        echo Backend tests PASSED.
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo '=========================================='
                echo '             DOCKER BUILD'
                echo '=========================================='

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
                echo '=========================================='
                echo '            DOCKER HUB LOGIN'
                echo '=========================================='

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
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
                            echo Please verify:
                            echo 1. Docker Hub username
                            echo 2. Docker Hub Personal Access Token
                            echo 3. Jenkins credential ID
                            echo 4. Docker Hub repository permissions
                            echo.
                            exit /b 1
                        )

                        echo.
                        echo Docker Hub login successful.
                    '''
                }
            }
        }

        stage('Docker Tag') {
            steps {
                echo '=========================================='
                echo '              DOCKER TAG'
                echo '=========================================='

                bat '''
                    echo Tagging backend image...

                    docker tag %BACKEND_LOCAL_IMAGE% %BACKEND_IMAGE%:latest

                    if errorlevel 1 (
                        echo Backend image tagging FAILED
                        exit /b 1
                    )

                    echo.
                    echo Tagging frontend image...

                    docker tag %FRONTEND_LOCAL_IMAGE% %FRONTEND_IMAGE%:latest

                    if errorlevel 1 (
                        echo Frontend image tagging FAILED
                        exit /b 1
                    )

                    echo.
                    echo ===== TAGGED IMAGES =====
                    docker images | findstr "jenkins-docker-cicd-demo"

                    echo.
                    echo Docker images tagged successfully.
                '''
            }
        }

        stage('Docker Push') {
            steps {
                echo '=========================================='
                echo '             DOCKER PUSH'
                echo '=========================================='

                bat '''
                    echo Pushing backend image...

                    docker push %BACKEND_IMAGE%:latest

                    if errorlevel 1 (
                        echo Backend Docker push FAILED
                        exit /b 1
                    )

                    echo.
                    echo Backend image pushed successfully.

                    echo.
                    echo Pushing frontend image...

                    docker push %FRONTEND_IMAGE%:latest

                    if errorlevel 1 (
                        echo Frontend Docker push FAILED
                        exit /b 1
                    )

                    echo.
                    echo ==========================================
                    echo Docker images pushed successfully.
                    echo ==========================================
                '''
            }
        }

        stage('Deployment') {
            steps {
                echo '=========================================='
                echo '              DEPLOYMENT'
                echo '=========================================='

                bat '''
                    echo Stopping existing containers...

                    docker compose down

                    echo.
                    echo Starting application containers...

                    docker compose up -d

                    if errorlevel 1 (
                        echo Docker Compose deployment FAILED
                        exit /b 1
                    )

                    echo.
                    echo ===== CONTAINER STATUS =====

                    docker compose ps

                    echo.
                    echo Deployment completed successfully.
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '=========================================='
                echo '              HEALTH CHECK'
                echo '=========================================='

                bat '''
                    echo Waiting for application to start...
                    timeout /t 15 /nobreak

                    echo.
                    echo ===== CONTAINER STATUS =====
                    docker compose ps

                    echo.
                    echo ===== BACKEND HEALTH CHECK =====

                    curl.exe -f http://localhost:5000/

                    if errorlevel 1 (
                        echo.
                        echo Backend health check FAILED

                        echo.
                        echo ===== BACKEND LOGS =====
                        docker logs %BACKEND_CONTAINER%

                        exit /b 1
                    )

                    echo.
                    echo Backend health check PASSED.

                    echo.
                    echo ===== FRONTEND HEALTH CHECK =====

                    curl.exe -f http://localhost:8081/

                    if errorlevel 1 (
                        echo.
                        echo Frontend health check FAILED

                        echo.
                        echo ===== FRONTEND LOGS =====
                        docker logs %FRONTEND_CONTAINER%

                        exit /b 1
                    )

                    echo.
                    echo Frontend health check PASSED.

                    echo.
                    echo ==========================================
                    echo        APPLICATION HEALTHY
                    echo ==========================================
                '''
            }
        }

        stage('Final Status') {
            steps {
                echo '=========================================='
                echo '             FINAL STATUS'
                echo '=========================================='

                bat '''
                    echo.
                    echo ===== RUNNING CONTAINERS =====
                    docker ps

                    echo.
                    echo ===== DOCKER IMAGES =====
                    docker images | findstr "jenkins-docker-cicd-demo"

                    echo.
                    echo ==========================================
                    echo       CI/CD PIPELINE SUCCESSFUL
                    echo ==========================================
                    echo.
                    echo GitHub
                    echo    |
                    echo    v
                    echo Jenkins
                    echo    |
                    echo    v
                    echo Backend Tests
                    echo    |
                    echo    v
                    echo Docker Build
                    echo    |
                    echo    v
                    echo Docker Hub
                    echo    |
                    echo    v
                    echo Deployment
                    echo    |
                    echo    v
                    echo Health Check
                    echo.
                    echo ==========================================
                '''
            }
        }
    }

    post {

        success {
            echo '=========================================='
            echo '       PIPELINE EXECUTION SUCCESSFUL'
            echo '=========================================='

            echo 'CI/CD pipeline completed successfully.'
            echo 'Docker images were built, pushed and deployed.'
        }

        failure {
            echo '=========================================='
            echo '          CI/CD PIPELINE FAILED'
            echo '=========================================='

            echo 'Check the failed stage above for details.'
        }

        always {
            echo '=========================================='
            echo '       PIPELINE EXECUTION COMPLETED'
            echo '=========================================='
        }
    }
}