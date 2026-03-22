pipeline {
  agent any
  parameters {
    string(name: 'IMAGE', defaultValue: 'my-app:latest', description: 'Docker image to deploy (e.g. repo/name:tag)')
  }
  stages {
    stage('Deploy') {
      steps {
        script {
          def img = params.IMAGE
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
