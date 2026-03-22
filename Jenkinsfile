pipeline {
  agent any

  options {
    timestamps()
    // ansiColor('xterm')  <-- УДАЛЕНО: Это вызывает ошибку компиляции
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  parameters {
    booleanParam(name: 'PUSH_IMAGE', defaultValue: false, description: 'Push Docker image to registry')
    booleanParam(name: 'DEPLOY', defaultValue: false, description: 'Deploy with docker compose after successful push')
    string(name: 'DEPLOY_PATH', defaultValue: '/opt/brandradar', description: 'Target path on Jenkins agent for docker compose deploy')
  }

  environment {
    REGISTRY = 'docker.io'
    IMAGE_NAME = 'your-org/prod-final-brandradar'

    NEXT_PUBLIC_API = credentials('next-public-api')
    NEXT_PUBLIC_ML = credentials('next-public-ml')
    NEXT_PUBLIC_PROJECT_ID = credentials('next-public-project-id')

    DOCKER_CREDENTIALS_ID = 'docker-registry-credentials'
    
    // Попытка включить цвета для некоторых инструментов через переменные окружения
    FORCE_COLOR = '1' 
    CLICOLOR_FORCE = '1'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        // Оборачиваем в ansiColor для цветного вывода npm
        ansiColor('xterm') {
          sh 'npm ci'
        }
      }
    }

    stage('Lint') {
      steps {
        ansiColor('xterm') {
          sh 'npm run lint'
        }
      }
    }

    stage('Test') {
      steps {
        ansiColor('xterm') {
          sh 'npm run test:coverage'
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
        }
      }
    }

    stage('Build App') {
      steps {
        ansiColor('xterm') {
          sh 'npm run build'
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          env.IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
        }
        // Вывод docker build тоже лучше раскрашивать
        ansiColor('xterm') {
          sh '''
            docker build \
              --build-arg NEXT_PUBLIC_API=${NEXT_PUBLIC_API} \
              --build-arg NEXT_PUBLIC_ML=${NEXT_PUBLIC_ML} \
              --build-arg NEXT_PUBLIC_PROJECT_ID=${NEXT_PUBLIC_PROJECT_ID} \
              -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
              -t ${REGISTRY}/${IMAGE_NAME}:latest \
              .
          '''
        }
      }
    }

    stage('Push Docker Image') {
      when {
        allOf {
          expression { return params.PUSH_IMAGE }
          anyOf {
            branch 'main'
            branch 'master'
          }
        }
      }
      steps {
        script {
          // Оборачиваем весь скрипт с пушем
          ansiColor('xterm') {
            docker.withRegistry("https://${env.REGISTRY}", env.DOCKER_CREDENTIALS_ID) {
              sh 'docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}'
              sh 'docker push ${REGISTRY}/${IMAGE_NAME}:latest'
            }
          }
        }
      }
    }

    stage('Deploy') {
      when {
        allOf {
          expression { return params.DEPLOY }
          anyOf {
            branch 'main'
            branch 'master'
          }
        }
      }
      steps {
        ansiColor('xterm') {
          sh '''
            mkdir -p ${DEPLOY_PATH}
            cp docker-compose.yml ${DEPLOY_PATH}/docker-compose.yml
            cd ${DEPLOY_PATH}

            export DOCKER_IMAGE=${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
            export NEXT_PUBLIC_API=${NEXT_PUBLIC_API}
            export NEXT_PUBLIC_ML=${NEXT_PUBLIC_ML}
            export NEXT_PUBLIC_PROJECT_ID=${NEXT_PUBLIC_PROJECT_ID}

            docker compose pull || true
            docker compose up -d --remove-orphans
          '''
        }
      }
    }
  }

  post {
    always {
      // Очистка тоже может иметь вывод
      ansiColor('xterm') {
        sh 'docker image prune -f || true'
      }
      deleteDir()
    }
    success {
      echo 'Pipeline completed successfully.'
    }
    failure {
      echo 'Pipeline failed. Check logs by stage.'
    }
  }
}