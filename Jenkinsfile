pipeline {
  agent any
  parameters {
    string(name: 'IMAGE', defaultValue: 'my-app:latest', description: 'Docker image to deploy (e.g. repo/name:tag)')
    string(name: 'REGISTRY', defaultValue: '', description: 'Optional registry URL (e.g. registry.hub.docker.com or my-registry.example.com)')
    string(name: 'CREDENTIALS_ID', defaultValue: '', description: 'Optional Jenkins credentials id (username/password) for registry')
  }
  stages {
    stage('Deploy') {
      steps {
        script {
          def img = params.IMAGE
          def registry = params.REGISTRY?.trim()
          def credId = params.CREDENTIALS_ID?.trim()

          def doRun = {
            if (isUnix()) {
              sh "docker pull ${img}"
              sh "docker rm -f app || true"
              sh "docker run -d -p 80:80 --name app --restart unless-stopped ${img}"
            } else {
              bat "docker pull ${img}"
              bat "powershell -Command \"docker rm -f app -ErrorAction SilentlyContinue\""
              bat "docker run -d -p 80:80 --name app --restart unless-stopped ${img}"
            }
          }

          if (credId) {
            withCredentials([usernamePassword(credentialsId: credId, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
              if (isUnix()) {
                if (registry) {
                  sh "echo $DOCKER_PASS | docker login ${registry} -u $DOCKER_USER --password-stdin"
                } else {
                  sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                }
              } else {
                if (registry) {
                  bat "powershell -Command \"$env:DOCKER_PASS | docker login ${registry} -u $env:DOCKER_USER --password-stdin\""
                } else {
                  bat "powershell -Command \"$env:DOCKER_PASS | docker login -u $env:DOCKER_USER --password-stdin\""
                }
              }
              doRun()
            }
          } else {
            doRun()
          }
        }
      }
    }
  }
  post {
    success {
      echo "Deployed ${params.IMAGE} → port 80"
    }
    failure {
      echo 'Deploy failed'
    }
  }
}
