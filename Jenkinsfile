pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build image') {
      steps {
        sh 'docker build -t brandradar:latest .'
      }
    }

    stage('Deploy') {
      steps {
        sh 'docker rm -f brandradar || true'
        sh 'docker run -d --name brandradar -p 6767:6767 --restart unless-stopped brandradar:latest'
      }
    }
  }
}
