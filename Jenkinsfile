#!groovy

def project = "${GCLOUD_PROJECT}"
def tokens = "${env.JOB_NAME}".tokenize('/')
def appName = tokens[0].toLowerCase()
def imageTag = "gcr.io/${project}/${appName}:${env.BRANCH_NAME}.${env.BUILD_NUMBER}"
def jenkinsStage = "${JENKINS_STAGE}"
def branch = "${env.BRANCH_NAME}"

println "Running Jenkins Pipeline"
println "SCENARIO -> Stage: ${jenkinsStage} // Branch: ${branch}"

pipeline {
  agent {
    kubernetes {
      label 'builder-agent'
      yaml """
apiVersion: v1
kind: Pod
metadata:
labels:
  component: ci
spec:
  # Use service account that can deploy to all namespaces
  serviceAccountName: cd-jenkins
  volumes:
  - name: container-builder-key
    secret:
      secretName: container-builder-key
  containers:
  - name: jnlp
    env:
    - name: JENKINS_URL
      value: http://cd-jenkins
  - name: node
    image: node:10.12.0
    command:
    - cat
    tty: true
  - name: gcloud
    image: gcr.io/cloud-builders/gcloud
    volumeMounts:
    - name: container-builder-key
      mountPath: /var/secrets/google
    env:
    - name: GOOGLE_APPLICATION_CREDENTIALS
      value: /var/secrets/google/key.json
    command: ["/bin/sh","-c"]
    args: ["gcloud auth activate-service-account --key-file=/var/secrets/google/key.json && cat"]
    tty: true
  - name: kubectl
    image: gcr.io/cloud-builders/kubectl
    command:
    - cat
    tty: true
"""
}
  }
  stages {
    stage('1 - Test') {
      when {
        anyOf {
        allOf {
          expression { jenkinsStage == 'dev'}
          expression { branch == 'rsi-dev'}
        }
        allOf {
          expression { jenkinsStage == 'test'}
          expression { branch == 'test'}
        }
          allOf {
            expression { jenkinsStage == 'staging'}
            expression { branch == 'develop'}
          }
          allOf {
            expression { jenkinsStage == 'prod'}
            expression { branch == 'master'}
          }
        }
      }
      steps {
        container('node') {
          sh """
            yarn && yarn test
          """
        }
      }
    }
    stage('2 - Build and push image with Container Builder') {
      when {
        anyOf {
        allOf {
          expression { jenkinsStage == 'dev'}
          expression { branch == 'rsi-dev'}
        }
          allOf {
          expression { jenkinsStage == 'test'}
          expression { branch == 'test'}
          }
          allOf {
            expression { jenkinsStage == 'staging'}
            expression { branch == 'develop'}
          }
          allOf {
            expression { jenkinsStage == 'prod'}
            expression { branch == 'master'}
          }
        }
      }
      steps {
        script {
          if (branch == 'rsi-dev') {
            container('gcloud') {
              sh "PYTHONUNBUFFERED=1 gcloud builds submit --config cloudbuild.yaml --substitutions _API_URL=\"https://dev.app.wildlifeinsights.org\",_BACKEND_API_URL=\"https://dev.api.wildlifeinsights.org\",_IS_STAGING=\"false\",_IMAGE_TAG=${imageTag} ."
          }
        }
          if (branch == 'test') {
            container('gcloud') {
              sh "PYTHONUNBUFFERED=1 gcloud builds submit --config cloudbuild.yaml --substitutions _API_URL=\"https://test.app.wildlifeinsights.org\",_BACKEND_API_URL=\"https://test.api.wildlifeinsights.org\",_IS_STAGING=\"false\",_IMAGE_TAG=${imageTag} ."
          }
        }
          if (branch == 'develop') {
            container('gcloud') {
              sh "PYTHONUNBUFFERED=1 gcloud builds submit --config cloudbuild.yaml --substitutions _API_URL=\"https://staging.app.wildlifeinsights.org\",_BACKEND_API_URL=\"https://staging.api.wildlifeinsights.org\",_IS_STAGING=\"true\",_IMAGE_TAG=${imageTag} ."
            }
          }
          if (branch == 'master') {
            container('gcloud') {
              sh "PYTHONUNBUFFERED=1 gcloud builds submit --config cloudbuild.yaml --substitutions _API_URL=\"https://app.wildlifeinsights.org\",_BACKEND_API_URL=\"https://api.wildlifeinsights.org\",_IS_STAGING=\"false\",_IMAGE_TAG=${imageTag} ."
            }
          }
        }
      }
    }
    stage('3 - Deploy') {
      when {
        anyOf {
        allOf {
          expression { jenkinsStage == 'dev'}
          expression { branch == 'rsi-dev'}
        }
          allOf {
            expression { jenkinsStage == 'test'}
            expression { branch == 'test'}
          }
          allOf {
            expression { jenkinsStage == 'staging'}
            expression { branch == 'develop'}
          }
          allOf {
            expression { jenkinsStage == 'prod'}
            expression { branch == 'master'}
          }
        }
      }
      steps{
        script {
          if (branch == 'rsi-dev') {
            stage ('3 - Deploying to RSI Dev') {
              container('kubectl') {
              // Change deployed image in canary to the one we just built
                sh("sed -i.bak 's#gcr.io/PROJECT_ID/IMAGE:1.0.0#${imageTag}#' ./k8s/rsi-dev/*.yaml")
              //  sh("kubectl apply --namespace=default -f k8s/services/")
                sh("kubectl apply --namespace=default -f k8s/rsi-dev/")
              }
            }
          }          
          if (branch == 'test') {
            stage ('3 - Deploying to Test') {
              container('kubectl') {
              // Change deployed image in canary to the one we just built
                sh("sed -i.bak 's#gcr.io/PROJECT_ID/IMAGE:1.0.0#${imageTag}#' ./k8s/test/*.yaml")
              // sh("kubectl apply --namespace=frontend -f k8s/services/")
                sh("kubectl apply --namespace=frontend -f k8s/test/")
              }
            }
          }
          if (branch == 'develop') {
            stage ('3 - Deploying to Staging') {
              container('kubectl') {
              // Change deployed image in canary to the one we just built
                sh("sed -i.bak 's#gcr.io/PROJECT_ID/IMAGE:1.0.0#${imageTag}#' ./k8s/staging/*.yaml")
              //  sh("kubectl apply --namespace=default -f k8s/services/")
                sh("kubectl apply --namespace=default -f k8s/staging/")
              }
            }
          }
          if (branch == 'master') {
            stage ('3 - Deploying to Production') {
              container('kubectl') {
              // Change deployed image in canary to the one we just built
                sh("sed -i.bak 's#gcr.io/PROJECT_ID/IMAGE:1.0.0#${imageTag}#' ./k8s/production/*.yaml")
              //  sh("kubectl apply --namespace=default -f k8s/services/")
                sh("kubectl apply --namespace=default -f k8s/production/")
              }
            }
          }
        }
      }
    }
  }
}