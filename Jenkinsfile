pipeline {
    agent any

    environment {
        EC2_USER = 'ubuntu'
        EC2_IP = '44.208.14.38' 
        REMOTE_PATH = '/home/ubuntu/healthcheck'
    }

    stages {
        stage('Build') {
            steps {
                echo "🔧 Construyendo proyecto para la rama ${env.BRANCH_NAME}"
                sh 'rm -rf node_modules'
                sh 'npm ci'
            }
        }

        stage('Deploy') {
            when {
                anyOf {
                    branch 'dev'
                    branch 'qa'
                    branch 'main'
                }
            }
            steps {
                script {
                    def nodeEnv = ''

                    if (env.BRANCH_NAME == 'dev') {
                        nodeEnv = 'development'
                    } else if (env.BRANCH_NAME == 'qa') {
                        nodeEnv = 'qa'
                    } else if (env.BRANCH_NAME == 'main') {
                        nodeEnv = 'production'
                    }

                    echo "🚀 Desplegando a ${nodeEnv.toUpperCase()} en ${EC2_IP}"

                    withCredentials([sshUserPrivateKey(credentialsId: 'ssh-key-ec2', keyFileVariable: 'SSH_KEY')]) {
                        sh """
                        ssh -i \$SSH_KEY -o StrictHostKeyChecking=no $EC2_USER@$EC2_IP '
                            if [ ! -d "$REMOTE_PATH/.git" ]; then
                                echo "🧱 Clonando repositorio porque no existe..."
                                git clone https://github.com/ItsEugenio/healthcheck.git $REMOTE_PATH
                            fi &&
                            cd $REMOTE_PATH &&
                            git reset --hard &&
                            git fetch origin &&
                            git checkout ${env.BRANCH_NAME} &&
                            git pull --rebase origin ${env.BRANCH_NAME} &&
                            npm ci &&
                            NODE_ENV=${nodeEnv} pm2 start server.js --name health-api -f
                        '
                        """
                    }

                }
            }
        }
    }

    post {
        success {
            echo "✅ Despliegue exitoso para ${env.BRANCH_NAME}"
        }
        failure {
            echo "❌ El despliegue falló para ${env.BRANCH_NAME}"
        }
    }
}
