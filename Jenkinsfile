pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'
        DOCKERHUB_USER           = 'deekshith7204'

        BACKEND_IMAGE_LOCAL      = 'cicd-demo-backend:1.0'
        FRONTEND_IMAGE_LOCAL     = 'cicd-demo-frontend:1.0'

        BACKEND_REPO             = 'deekshith7204/jenkins-docker-cicd-demo-backend'
        FRONTEND_REPO            = 'deekshith7204/jenkins-docker-cicd-demo-frontend'

        IMAGE_TAG                = "${env.BUILD_NUMBER}"
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
                @echo off
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
                    @echo off
                    echo Installing backend dependencies...
                    npm ci
                    if errorlevel 1 (
                        echo npm ci FAILED
                        exit /b 1
                    )
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
                @echo off
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
                echo Docker images built successfully.
                '''
            }
        }

        stage('Docker Login') {
            steps {
                echo '=========================================='
                echo '            DOCKER HUB LOGIN'
                echo '=========================================='
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKERHUB_CREDENTIALS_ID}",
                    usernameVariable: 'DOCKER_USERNAME',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    // Passing the token with -p avoids the trailing-whitespace
                    // problem that "echo %PASSWORD% | docker login" causes on Windows.
                    bat '''
                    @echo off
                    echo Logging in to Docker Hub...
                    docker login -u %DOCKER_USERNAME% -p %DOCKER_PASSWORD%
                    if errorlevel 1 (
                        echo.
                        echo ==========================================
                        echo Docker Hub login FAILED
                        echo ==========================================
                        echo Please verify:
                        echo 1. Docker Hub username
                        echo 2. Docker Hub Personal Access Token
                        echo 3. Jenkins credential ID
                        echo 4. Docker Hub repository permissions
                        exit /b 1
                    )
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
                @echo off
                docker tag %BACKEND_IMAGE_LOCAL%  %BACKEND_REPO%:latest
                docker tag %BACKEND_IMAGE_LOCAL%  %BACKEND_REPO%:%IMAGE_TAG%
                docker tag %FRONTEND_IMAGE_LOCAL% %FRONTEND_REPO%:latest
                docker tag %FRONTEND_IMAGE_LOCAL% %FRONTEND_REPO%:%IMAGE_TAG%
                if errorlevel 1 (
                    echo Docker tag FAILED
                    exit /b 1
                )
                echo Images tagged successfully.
                '''
            }
        }

        stage('Docker Push') {
            steps {
                echo '=========================================='
                echo '              DOCKER PUSH'
                echo '=========================================='
                bat '''
                @echo off
                docker push %BACKEND_REPO%:latest
                if errorlevel 1 exit /b 1
                docker push %BACKEND_REPO%:%IMAGE_TAG%
                if errorlevel 1 exit /b 1

                docker push %FRONTEND_REPO%:latest
                if errorlevel 1 exit /b 1
                docker push %FRONTEND_REPO%:%IMAGE_TAG%
                if errorlevel 1 exit /b 1

                echo Images pushed successfully.
                '''
            }
        }

        stage('Deployment') {
            steps {
                echo '=========================================='
                echo '              DEPLOYMENT'
                echo '=========================================='
                bat '''
                @echo off
                echo Stopping old containers...
                docker compose down

                echo Starting new containers...
                docker compose up -d
                if errorlevel 1 (
                    echo Deployment FAILED
                    exit /b 1
                )

                echo.
                docker compose ps
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '=========================================='
                echo '             HEALTH CHECK'
                echo '=========================================='
                powershell '''
                function Test-Url($name, $url) {
                    for ($i = 1; $i -le 20; $i++) {
                        try {
                            $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
                            if ($r.StatusCode -eq 200) {
                                Write-Host "$name is healthy ($url)"
                                return
                            }
                        } catch {
                            Write-Host "Attempt $i/20: $name not ready yet..."
                        }
                        Start-Sleep -Seconds 5
                    }
                    Write-Host "$name health check FAILED ($url)"
                    exit 1
                }

                Test-Url "Backend"  "http://localhost:5000/"
                Test-Url "Frontend" "http://localhost:8081/"
                '''
            }
        }

        stage('Final Status') {
            steps {
                echo '=========================================='
                echo '             FINAL STATUS'
                echo '=========================================='
                bat '''
                @echo off
                docker compose ps
                echo.
                echo Frontend : http://localhost:8081
                echo Backend  : http://localhost:5000
                '''
            }
        }
    }

    post {
        always {
            echo '=========================================='
            echo '       PIPELINE EXECUTION COMPLETED'
            echo '=========================================='
            bat '''
            @echo off
            docker logout
            exit /b 0
            '''
        }
        success {
            echo '=========================================='
            echo '       CI/CD PIPELINE SUCCESSFUL'
            echo '=========================================='
        }
        failure {
            echo '=========================================='
            echo '         CI/CD PIPELINE FAILED'
            echo '=========================================='
            echo 'Check the failed stage above for details.'
        }
        
    }
}