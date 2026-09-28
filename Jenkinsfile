pipeline {

    agent any

    environment {
        APP_VERSION = "1.0"
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
                echo 'Waiting for services...'

                bat 'timeout /t 20 /nobreak'

                bat 'docker compose ps'

                bat 'curl --fail http://localhost:5000/api/health'
            }
        }
    }

    post {

        success {
            echo 'CI/CD Pipeline completed successfully!'
        }

        failure {
            echo 'CI/CD Pipeline failed!'
            bat 'docker compose logs'
        }

        always {
            echo 'Pipeline execution completed.'
        }
    }
}