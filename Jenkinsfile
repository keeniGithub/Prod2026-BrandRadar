pipeline {
  agent any

  options {
    timestamps()
    ansiColor('xterm')
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  parameters {
    booleanParam(name: 'PUSH_IMAGE', defaultValue: false, description: 'Push Docker image to registry')
    booleanParam(name: 'DEPLOY', defaultValue: false, description: 'Deploy with docker compose after successful push')
    string(name: 'DEPLOY_PATH', defaultValue: '/opt/brandradar', description: 'Target path on Jenkins agent for docker compose deploy')
  }

  environment {
    // Set these in Jenkins Global/Folder environment variables or with credentials bindings.
    REGISTRY = 'docker.io'
    IMAGE_NAME = 'your-org/prod-final-brandradar'

    NEXT_PUBLIC_API = credentials('next-public-api')
    NEXT_PUBLIC_ML = credentials('next-public-ml')
    NEXT_PUBLIC_PROJECT_ID = credentials('next-public-project-id')

    DOCKER_CREDENTIALS_ID = 'docker-registry-credentials'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('Test') {
      steps {
        sh 'npm run test:coverage'
      }
      post {
        always {
          archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
        }
      }
    }

    stage('Build App') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          env.IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
        }
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
          docker.withRegistry("https://${env.REGISTRY}", env.DOCKER_CREDENTIALS_ID) {
            sh 'docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}'
            sh 'docker push ${REGISTRY}/${IMAGE_NAME}:latest'
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

  post {
    always {
      sh 'docker image prune -f || true'
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
