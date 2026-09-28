pipeline {

    agent any

    environment {
        DOCKER_BACKEND_IMAGE  = "deekshithar95/jenkins-docker-cicd-demo-backend"
        DOCKER_FRONTEND_IMAGE = "deekshithar95/jenkins-docker-cicd-demo-frontend"
        DOCKER_TAG = "latest"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'

                checkout scm
            }
        }

        stage('Verify Files') {
            steps {
                echo 'Verifying project structure...'

                bat 'dir'
                bat 'docker --version'
                bat 'docker compose version'
            }
        }

        stage('Backend Test') {
            steps {
                echo 'Installing backend dependencies and running tests...'

                dir('backend') {
                    bat 'npm ci'
                    bat 'npm test'
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker images...'

                bat 'docker compose build'
            }
        }

        stage('Docker Push') {
            steps {
                echo 'Logging in to Docker Hub and pushing images...'

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {

                    bat '''
                        echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin

                        docker tag cicd-demo-backend:1.0 %DOCKER_USERNAME%/jenkins-docker-cicd-demo-backend:latest
                        docker tag cicd-demo-frontend:1.0 %DOCKER_USERNAME%/jenkins-docker-cicd-demo-frontend:latest

                        docker push %DOCKER_USERNAME%/jenkins-docker-cicd-demo-backend:latest
                        docker push %DOCKER_USERNAME%/jenkins-docker-cicd-demo-frontend:latest

                        docker logout
                    '''
                }
            }
        }

        stage('Deployment') {
            steps {
                echo 'Deploying application with Docker Compose...'

                bat 'docker compose up -d'
            }
        }

        stage('Health Check') {
            steps {
                echo 'Checking application health...'

                bat 'docker compose ps'

                powershell '''
                    Write-Host "Waiting for backend to become healthy..."
                    Start-Sleep -Seconds 10
                '''

                bat 'curl.exe --fail --silent --show-error http://localhost:5000/'

                echo 'Backend health check passed.'
            }
        }
    }

    post {

        success {
            echo 'Pipeline execution completed.'
            echo 'CI/CD Pipeline completed successfully!'
        }

        failure {
            echo 'CI/CD Pipeline failed!'
            bat 'docker compose logs'
        }

        always {
            echo 'Pipeline finished.'
        }
    }
}
