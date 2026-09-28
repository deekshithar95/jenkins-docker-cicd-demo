
pipeline {

    agent any

    environment {
        APP_VERSION = "1.0"

        // Docker Hub repository names
        BACKEND_IMAGE = "deekshith7204/jenkins-docker-cicd-demo-backend"
        FRONTEND_IMAGE = "deekshith7204/jenkins-docker-cicd-demo-frontend"
    }

    stages {

        // =========================================================
        // 1. CHECKOUT
        // =========================================================

        stage('Checkout') {
            steps {
                echo '=========================================='
                echo '              CHECKOUT'
                echo '=========================================='

                checkout scm
            }
        }


        // =========================================================
        // 2. VERIFY ENVIRONMENT
        // =========================================================

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

                    echo.
                    echo ===== GIT VERSION =====
                    git --version
                '''
            }
        }


        // =========================================================
        // 3. BACKEND TEST
        // =========================================================

        stage('Backend Test') {
            steps {
                echo '=========================================='
                echo '             BACKEND TEST'
                echo '=========================================='

                dir('backend') {

                    bat '''
                        echo Installing backend dependencies...
                        npm ci

                        if errorlevel 1 (
                            echo Backend dependency installation FAILED
                            exit /b 1
                        )
                    '''

                    bat '''
                        echo.
                        echo Running backend tests...
                        npm test -- --runInBand

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


        // =========================================================
        // 4. DOCKER BUILD
        // =========================================================

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


        // =========================================================
        // 5. DOCKER HUB LOGIN
        // =========================================================

        stage('Docker Login') {
            steps {
                echo '=========================================='
                echo '            DOCKER HUB LOGIN'
                echo '=========================================='

                /*
                 * IMPORTANT:
                 * dockerhub-username = Secret Text
                 * dockerhub-password = Secret Text
                 *
                 * dockerhub-password must contain
                 * Docker Hub Personal Access Token (PAT).
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
                        @echo off

                        echo Logging in to Docker Hub...

                        echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin

                        if errorlevel 1 (
                            echo.
                            echo ==========================================
                            echo Docker Hub login FAILED
                            echo ==========================================
                            echo.
                            echo Please verify:
                            echo 1. dockerhub-username credential
                            echo 2. dockerhub-password credential
                            echo 3. Docker Hub Personal Access Token
                            echo 4. Docker Hub username
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


        // =========================================================
        // 6. DOCKER TAG
        // =========================================================

        stage('Docker Tag') {
            steps {
                echo '=========================================='
                echo '              DOCKER TAG'
                echo '=========================================='

                bat '''
                    echo.
                    echo ===== TAGGING BACKEND IMAGE =====

                    docker tag cicd-demo-backend:%APP_VERSION% %BACKEND_IMAGE%:%APP_VERSION%

                    if errorlevel 1 (
                        echo Backend version tag FAILED
                        exit /b 1
                    )

                    docker tag cicd-demo-backend:%APP_VERSION% %BACKEND_IMAGE%:latest

                    if errorlevel 1 (
                        echo Backend latest tag FAILED
                        exit /b 1
                    )


                    echo.
                    echo ===== TAGGING FRONTEND IMAGE =====

                    docker tag cicd-demo-frontend:%APP_VERSION% %FRONTEND_IMAGE%:%APP_VERSION%

                    if errorlevel 1 (
                        echo Frontend version tag FAILED
                        exit /b 1
                    )

                    docker tag cicd-demo-frontend:%APP_VERSION% %FRONTEND_IMAGE%:latest

                    if errorlevel 1 (
                        echo Frontend latest tag FAILED
                        exit /b 1
                    )


                    echo.
                    echo ===== TAGGED IMAGES =====

                    docker images %BACKEND_IMAGE%

                    docker images %FRONTEND_IMAGE%

                    echo.
                    echo Docker tagging completed successfully.
                '''
            }
        }


        // =========================================================
        // 7. DOCKER PUSH
        // =========================================================

        stage('Docker Push') {
            steps {
                echo '=========================================='
                echo '              DOCKER PUSH'
                echo '=========================================='

                bat '''
                    echo.
                    echo ===== PUSHING BACKEND VERSION =====

                    docker push %BACKEND_IMAGE%:%APP_VERSION%

                    if errorlevel 1 (
                        echo Backend version push FAILED
                        exit /b 1
                    )


                    echo.
                    echo ===== PUSHING BACKEND LATEST =====

                    docker push %BACKEND_IMAGE%:latest

                    if errorlevel 1 (
                        echo Backend latest push FAILED
                        exit /b 1
                    )


                    echo.
                    echo ===== PUSHING FRONTEND VERSION =====

                    docker push %FRONTEND_IMAGE%:%APP_VERSION%

                    if errorlevel 1 (
                        echo Frontend version push FAILED
                        exit /b 1
                    )


                    echo.
                    echo ===== PUSHING FRONTEND LATEST =====

                    docker push %FRONTEND_IMAGE%:latest

                    if errorlevel 1 (
                        echo Frontend latest push FAILED
                        exit /b 1
                    )


                    echo.
                    echo ==========================================
                    echo      DOCKER PUSH COMPLETED
                    echo ==========================================
                '''
            }
        }


        // =========================================================
        // 8. DEPLOYMENT
        // =========================================================

        stage('Deployment') {
            steps {
                echo '=========================================='
                echo '              DEPLOYMENT'
                echo '=========================================='

                bat '''
                    echo.
                    echo ===== STOPPING EXISTING CONTAINERS =====

                    docker compose down

                    echo.
                    echo ===== STARTING APPLICATION =====

                    docker compose up -d

                    if errorlevel 1 (
                        echo Docker Compose startup FAILED
                        exit /b 1
                    )

                    echo.
                    echo ===== CONTAINER STATUS =====

                    docker compose ps

                    echo.
                    echo Application deployment started successfully.
                '''
            }
        }


        // =========================================================
        // 9. HEALTH CHECK
        // =========================================================

        stage('Health Check') {
            steps {
                echo '=========================================='
                echo '              HEALTH CHECK'
                echo '=========================================='

                powershell '''
                    $maxAttempts = 12
                    $attempt = 1
                    $backendHealthy = $false

                    while ($attempt -le $maxAttempts) {

                        Write-Host ""
                        Write-Host "Backend health check attempt $attempt of $maxAttempts"

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

                                $backendHealthy = $true
                                break
                            }

                        }
                        catch {

                            Write-Host "Backend is not ready yet..."
                        }

                        Start-Sleep -Seconds 5
                        $attempt++
                    }

                    if (-not $backendHealthy) {

                        Write-Host ""
                        Write-Host "Backend health check FAILED"
                        Write-Host ""
                        Write-Host "Docker containers:"
                        docker compose ps

                        Write-Host ""
                        Write-Host "Backend logs:"
                        docker compose logs backend

                        exit 1
                    }
                '''


                bat '''
                    echo.
                    echo ===== FRONTEND HEALTH CHECK =====

                    curl.exe --fail --silent --show-error http://localhost:8081/

                    if errorlevel 1 (
                        echo.
                        echo Frontend health check FAILED
                        echo.
                        echo Frontend logs:
                        docker compose logs frontend
                        exit /b 1
                    )

                    echo.
                    echo Frontend health check PASSED
                '''
            }
        }


        // =========================================================
        // 10. FINAL STATUS
        // =========================================================

        stage('Final Status') {
            steps {
                echo '=========================================='
                echo '              FINAL STATUS'
                echo '=========================================='

                bat '''
                    echo.
                    echo ===== DOCKER COMPOSE STATUS =====

                    docker compose ps

                    echo.
                    echo ===== CICD DOCKER IMAGES =====

                    docker images | findstr "cicd-demo"

                    echo.
                    echo ===== APPLICATION URLS =====

                    echo Backend:
                    echo http://localhost:5000/

                    echo.
                    echo Frontend:
                    echo http://localhost:8081/

                    echo.
                    echo ===== PIPELINE DEPLOYMENT COMPLETE =====
                '''
            }
        }
    }


    // =============================================================
    // POST ACTIONS
    // =============================================================

    post {

        success {
            echo ''
            echo '=========================================='
            echo '       CI/CD PIPELINE SUCCESSFUL'
            echo '=========================================='
            echo ''
            echo 'Backend tests: PASSED'
            echo 'Docker build: PASSED'
            echo 'Docker Hub login: PASSED'
            echo 'Docker image push: PASSED'
            echo 'Application deployment: PASSED'
            echo 'Health checks: PASSED'
            echo ''
            echo 'Application is running successfully.'
            echo '=========================================='
        }

        failure {
            echo ''
            echo '=========================================='
            echo '          CI/CD PIPELINE FAILED'
            echo '=========================================='
            echo ''
            echo 'Check the failed stage above for details.'
            echo ''
            echo '=========================================='
        }

        always {
            echo ''
            echo '=========================================='
            echo '      PIPELINE EXECUTION COMPLETED'
            echo '=========================================='
        }
    }
}
