pipeline {

    agent any

    environment {
        APP_VERSION = "1.0"

        MYSQL_ROOT_PASSWORD = "rootpassword"
        MYSQL_DATABASE = "cicd_demo"
        MYSQL_USER = "appuser"
        MYSQL_PASSWORD = "apppassword"
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
                    Start-Sleep -Seconds 20
                '''

                bat 'curl.exe --fail --silent --show-error http://localhost:5000/'

                echo 'Backend health check passed.'
            }
        }
    }

    post {

        success {
            echo 'CI/CD Pipeline completed successfully!'
        }

        failure {
            echo 'CI/CD Pipeline failed!'
            bat 'docker compose ps'
            bat 'docker compose logs --tail=100'
        }

        always {
            echo 'Pipeline execution completed.'
        }

    }
}