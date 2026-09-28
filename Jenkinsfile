pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        // ============================================================
        // DOCKER HUB CONFIGURATION
        // ============================================================
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'
        DOCKERHUB_USER           = 'deekshith7204'

        // ============================================================
        // LOCAL DOCKER IMAGES
        // ============================================================
        BACKEND_IMAGE_LOCAL  = 'cicd-demo-backend:1.0'
        FRONTEND_IMAGE_LOCAL = 'cicd-demo-frontend:1.0'

        // ============================================================
        // DOCKER HUB REPOSITORIES
        // ============================================================
        BACKEND_REPO  = 'deekshith7204/jenkins-docker-cicd-demo-backend'
        FRONTEND_REPO = 'deekshith7204/jenkins-docker-cicd-demo-frontend'

        // Jenkins build number used as image version
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {

        // ============================================================
        // 1. CHECKOUT
        // ============================================================
        stage('Checkout') {
            steps {
                echo '=========================================='
                echo '              CHECKOUT'
                echo '=========================================='

                checkout scm
            }
        }


        // ============================================================
        // 2. VERIFY ENVIRONMENT
        // ============================================================
        stage('Verify Environment') {
            steps {
                echo '=========================================='
                echo '          VERIFY ENVIRONMENT'
                echo '=========================================='

                bat '''
                @echo off

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


        // ============================================================
        // 3. BACKEND TEST
        // ============================================================
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
                        echo.
                        echo ==========================================
                        echo Backend dependency installation FAILED
                        echo ==========================================
                        exit /b 1
                    )

                    echo.
                    echo Backend dependencies installed successfully.
                    '''
                }
            }
        }


        // ============================================================
        // 4. DOCKER BUILD
        // ============================================================
        stage('Docker Build') {
            steps {
                echo '=========================================='
                echo '             DOCKER BUILD'
                echo '=========================================='

                bat '''
                @echo off

                echo.
                echo ===== DOCKER COMPOSE CONFIGURATION =====

                docker compose config

                if errorlevel 1 (
                    echo.
                    echo Docker Compose configuration FAILED
                    exit /b 1
                )

                echo.
                echo ===== BUILDING DOCKER IMAGES =====

                docker compose build --no-cache

                if errorlevel 1 (
                    echo.
                    echo Docker image build FAILED
                    exit /b 1
                )

                echo.
                echo ==========================================
                echo Docker images built successfully.
                echo ==========================================

                echo.
                echo ===== LOCAL DOCKER IMAGES =====

                docker images
                '''
            }
        }


        // ============================================================
        // 5. TRIVY SECURITY SCAN
        // ============================================================
        stage('Trivy Security Scan') {
            steps {
                echo '=========================================='
                echo '          TRIVY SECURITY SCAN'
                echo '=========================================='

                bat '''
                @echo off

                echo.
                echo ===== CHECKING TRIVY =====

                docker run --rm aquasec/trivy:latest --version

                if errorlevel 1 (
                    echo.
                    echo Trivy is not available.
                    exit /b 1
                )

                echo.
                echo ===== CREATING REPORT DIRECTORY =====

                if not exist "trivy\\reports" (
                    mkdir "trivy\\reports"
                )

                echo.
                echo ==========================================
                echo       BACKEND IMAGE SECURITY SCAN
                echo ==========================================

                docker run --rm ^
                    -v //var/run/docker.sock:/var/run/docker.sock ^
                    -v trivy-cache:/root/.cache/ ^
                    aquasec/trivy:latest image ^
                    --no-progress ^
                    --scanners vuln ^
                    --format table ^
                    --exit-code 0 ^
                    cicd-demo-backend:1.0 > "trivy\\reports\\backend-trivy-report.txt"

                if errorlevel 1 (
                    echo Backend Trivy scan encountered an error.
                    exit /b 1
                )

                echo.
                echo Backend scan completed.

                echo.
                echo ==========================================
                echo       FRONTEND IMAGE SECURITY SCAN
                echo ==========================================

                docker run --rm ^
                    -v //var/run/docker.sock:/var/run/docker.sock ^
                    -v trivy-cache:/root/.cache/ ^
                    aquasec/trivy:latest image ^
                    --no-progress ^
                    --scanners vuln ^
                    --format table ^
                    --exit-code 0 ^
                    cicd-demo-frontend:1.0 > "trivy\\reports\\frontend-trivy-report.txt"

                if errorlevel 1 (
                    echo Frontend Trivy scan encountered an error.
                    exit /b 1
                )

                echo.
                echo Frontend scan completed.

                echo.
                echo ==========================================
                echo       TRIVY SCAN COMPLETED
                echo ==========================================

                echo.
                echo ===== TRIVY REPORTS =====

                dir trivy\\reports
                '''

                archiveArtifacts artifacts: 'trivy/reports/*.txt',
                                 allowEmptyArchive: false,
                                 fingerprint: true
            }
        }


        // ============================================================
        // 6. DOCKER HUB LOGIN
        // ============================================================
        stage('Docker Login') {
            steps {
                echo '=========================================='
                echo '            DOCKER HUB LOGIN'
                echo '=========================================='

                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKERHUB_CREDENTIALS_ID}",
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {

                    bat '''
                    @echo off

                    echo Logging in to Docker Hub...

                    docker login -u %DOCKER_USERNAME% -p %DOCKER_PASSWORD%

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
                    echo ==========================================
                    echo Docker Hub login successful.
                    echo ==========================================
                    '''
                }
            }
        }


        // ============================================================
        // 7. DOCKER TAG
        // ============================================================
        stage('Docker Tag') {
            steps {
                echo '=========================================='
                echo '              DOCKER TAG'
                echo '=========================================='

                bat '''
                @echo off

                echo Tagging backend image...

                docker tag %BACKEND_IMAGE_LOCAL% %BACKEND_REPO%:latest
                docker tag %BACKEND_IMAGE_LOCAL% %BACKEND_REPO%:%IMAGE_TAG%

                echo.
                echo Tagging frontend image...

                docker tag %FRONTEND_IMAGE_LOCAL% %FRONTEND_REPO%:latest
                docker tag %FRONTEND_IMAGE_LOCAL% %FRONTEND_REPO%:%IMAGE_TAG%

                if errorlevel 1 (
                    echo.
                    echo Docker tag FAILED
                    exit /b 1
                )

                echo.
                echo ==========================================
                echo Images tagged successfully.
                echo ==========================================

                echo.
                echo ===== TAGGED IMAGES =====

                docker images %BACKEND_REPO%
                docker images %FRONTEND_REPO%
                '''
            }
        }


        // ============================================================
        // 8. DOCKER PUSH
        // ============================================================
        stage('Docker Push') {
            steps {
                echo '=========================================='
                echo '              DOCKER PUSH'
                echo '=========================================='

                bat '''
                @echo off

                echo.
                echo ===== PUSHING BACKEND LATEST =====

                docker push %BACKEND_REPO%:latest

                if errorlevel 1 (
                    echo Backend latest push FAILED
                    exit /b 1
                )

                echo.
                echo ===== PUSHING BACKEND BUILD %IMAGE_TAG% =====

                docker push %BACKEND_REPO%:%IMAGE_TAG%

                if errorlevel 1 (
                    echo Backend version push FAILED
                    exit /b 1
                )

                echo.
                echo ===== PUSHING FRONTEND LATEST =====

                docker push %FRONTEND_REPO%:latest

                if errorlevel 1 (
                    echo Frontend latest push FAILED
                    exit /b 1
                )

                echo.
                echo ===== PUSHING FRONTEND BUILD %IMAGE_TAG% =====

                docker push %FRONTEND_REPO%:%IMAGE_TAG%

                if errorlevel 1 (
                    echo Frontend version push FAILED
                    exit /b 1
                )

                echo.
                echo ==========================================
                echo Images pushed successfully.
                echo ==========================================
                '''
            }
        }


        // ============================================================
        // 9. DEPLOYMENT
        // ============================================================
        stage('Deployment') {
            steps {
                echo '=========================================='
                echo '              DEPLOYMENT'
                echo '=========================================='

                bat '''
                @echo off

                echo.
                echo ===== STOPPING OLD CONTAINERS =====

                docker compose down

                echo.
                echo ===== STARTING NEW CONTAINERS =====

                docker compose up -d

                if errorlevel 1 (
                    echo.
                    echo ==========================================
                    echo Deployment FAILED
                    echo ==========================================
                    exit /b 1
                )

                echo.
                echo ===== CONTAINER STATUS =====

                docker compose ps

                echo.
                echo ==========================================
                echo Deployment completed successfully.
                echo ==========================================
                '''
            }
        }


        // ============================================================
        // 10. HEALTH CHECK
        // ============================================================
        stage('Health Check') {
            steps {
                echo '=========================================='
                echo '             HEALTH CHECK'
                echo '=========================================='

                powershell '''
                function Test-Url($name, $url) {

                    for ($i = 1; $i -le 20; $i++) {

                        try {

                            $r = Invoke-WebRequest `
                                -Uri $url `
                                -UseBasicParsing `
                                -TimeoutSec 5

                            if ($r.StatusCode -eq 200) {

                                Write-Host ""
                                Write-Host "=========================================="
                                Write-Host "$name is healthy"
                                Write-Host "URL: $url"
                                Write-Host "=========================================="

                                return
                            }

                        } catch {

                            Write-Host "Attempt $i/20 : $name not ready yet..."
                        }

                        Start-Sleep -Seconds 5
                    }

                    Write-Host ""
                    Write-Host "=========================================="
                    Write-Host "$name health check FAILED"
                    Write-Host "URL: $url"
                    Write-Host "=========================================="

                    exit 1
                }


                Write-Host ""
                Write-Host "===== BACKEND HEALTH CHECK ====="

                Test-Url "Backend" "http://localhost:5000/"


                Write-Host ""
                Write-Host "===== FRONTEND HEALTH CHECK ====="

                Test-Url "Frontend" "http://localhost:8081/"


                Write-Host ""
                Write-Host "=========================================="
                Write-Host "ALL HEALTH CHECKS PASSED"
                Write-Host "=========================================="
                '''
            }
        }


        // ============================================================
        // 11. DOCKER IMAGE CLEANUP  (NEW)
        //
        // Runs only after a successful deployment + health check.
        // Safe by design:
        //   - never uses "prune -a", so your other projects' images
        //     (bookhub, restaurant, etc.) and the Trivy image are kept
        //   - never touches images used by running containers
        //   - keeps ":latest" and the current build's tag, removes
        //     older build-number tags of THIS project only
        //   - always exits 0, so cleanup can never fail the pipeline
        // ============================================================
        stage('Docker Image Cleanup') {
            steps {
                echo '=========================================='
                echo '          DOCKER IMAGE CLEANUP'
                echo '=========================================='

                bat '''
                @echo off

                echo.
                echo ===== DISK USAGE BEFORE CLEANUP =====

                docker system df

                echo.
                echo ===== REMOVING OLD BACKEND BUILD TAGS =====

                for /f "delims=" %%t in ('docker images %BACKEND_REPO% --format "{{.Repository}}:{{.Tag}}"') do (
                    if not "%%t"=="%BACKEND_REPO%:latest" (
                        if not "%%t"=="%BACKEND_REPO%:%IMAGE_TAG%" (
                            echo Removing %%t
                            docker rmi %%t
                        )
                    )
                )

                echo.
                echo ===== REMOVING OLD FRONTEND BUILD TAGS =====

                for /f "delims=" %%t in ('docker images %FRONTEND_REPO% --format "{{.Repository}}:{{.Tag}}"') do (
                    if not "%%t"=="%FRONTEND_REPO%:latest" (
                        if not "%%t"=="%FRONTEND_REPO%:%IMAGE_TAG%" (
                            echo Removing %%t
                            docker rmi %%t
                        )
                    )
                )

                echo.
                echo ===== REMOVING DANGLING IMAGES =====

                docker image prune -f

                echo.
                echo ===== REMOVING UNUSED BUILD CACHE =====

                docker builder prune -f

                echo.
                echo ===== DISK USAGE AFTER CLEANUP =====

                docker system df

                echo.
                echo ==========================================
                echo Docker image cleanup completed.
                echo ==========================================

                exit /b 0
                '''
            }
        }


        // ============================================================
        // 12. FINAL STATUS
        // ============================================================
        stage('Final Status') {
            steps {
                echo '=========================================='
                echo '             FINAL STATUS'
                echo '=========================================='

                bat '''
                @echo off

                echo.
                echo ===== DOCKER COMPOSE STATUS =====

                docker compose ps

                echo.
                echo ===== RUNNING CONTAINERS =====

                docker ps

                echo.
                echo ==========================================
                echo              APPLICATION URLS
                echo ==========================================

                echo Frontend : http://localhost:8081
                echo Backend  : http://localhost:5000

                echo.
                echo ==========================================
                echo          TRIVY REPORTS
                echo ==========================================

                dir trivy\\reports

                echo.
                echo ==========================================
                echo        CI/CD PIPELINE COMPLETED
                echo ==========================================
                '''
            }
        }


        // ============================================================
        // 13. ROLLBACK INFORMATION  (NEW)
        //
        // Informational only: it does NOT change the running
        // deployment. It documents the current version and how to
        // roll back to an earlier Jenkins build tag.
        // ============================================================
        stage('Rollback Information') {
            steps {
                echo '=========================================='
                echo '          ROLLBACK INFORMATION'
                echo '=========================================='

                bat '''
                @echo off

                echo.
                echo Current Jenkins Build:
                echo %BUILD_NUMBER%

                echo.
                echo Current Docker Images:
                docker images %BACKEND_REPO%
                docker images %FRONTEND_REPO%

                echo.
                echo ==========================================
                echo ROLLBACK PROCEDURE
                echo ==========================================
                echo.
                echo To rollback, use a previous Jenkins build tag.
                echo Older tags are kept on Docker Hub even though
                echo the cleanup stage removes them from this machine.
                echo.
                echo Example:
                echo docker pull %BACKEND_REPO%:PREVIOUS_BUILD
                echo docker pull %FRONTEND_REPO%:PREVIOUS_BUILD
                echo.
                echo Then update docker-compose.yml to use
                echo the required previous image tag.
                echo.
                echo Rollback information displayed successfully.

                exit /b 0
                '''
            }
        }
    }


    // ================================================================
    // POST ACTIONS
    // ================================================================
    post {

        always {
            echo '=========================================='
            echo '       PIPELINE EXECUTION COMPLETED'
            echo '=========================================='

            bat '''
            @echo off

            echo.
            echo Logging out from Docker Hub...

            docker logout

            exit /b 0
            '''
        }


        success {
            echo '=========================================='
            echo '       CI/CD PIPELINE SUCCESSFUL'
            echo '=========================================='

            echo 'Git checkout completed.'
            echo 'Backend dependencies installed.'
            echo 'Docker images built.'
            echo 'Trivy security scan completed.'
            echo 'Docker images pushed.'
            echo 'Application deployed.'
            echo 'Health checks passed.'
            echo 'Old Docker images cleaned up.'
        }


        failure {
            echo '=========================================='
            echo '         CI/CD PIPELINE FAILED'
            echo '=========================================='

            echo 'Check the failed stage above for details.'
        }
    }
}