pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS LTS'
    }
    
    environment {
        // Configurar variables de entorno para cada rama
        SERVER_DEV = '184.73.163.158'  // IP del servidor 1
        SERVER_QA = '34.230.125.76'   // IP del servidor 2
        SERVER_PROD = '54.144.153.98' // IP del servidor 3
        DEPLOY_USER = 'ubuntu'    // Usuario para SSH
        APP_DIR = '/home/ubuntu/healthcheck'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    def targetServer = ''
                    def targetBranch = env.BRANCH_NAME
                    
                    // Determinar el servidor según la rama
                    if (targetBranch == 'dev') {
                        targetServer = env.SERVER_DEV
                    } else if (targetBranch == 'qa') {
                        targetServer = env.SERVER_QA
                    } else if (targetBranch == 'main') {
                        targetServer = env.SERVER_PROD
                    } else {
                        echo "No se desplegará la rama: ${targetBranch}"
                        return
                    }
                    
                    // Desplegar en el servidor correspondiente
                    withCredentials([sshUserPrivateKey(credentialsId: 'server-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                        // Verificar si el directorio existe, si no, crearlo y clonar
                        sh """
                            ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${DEPLOY_USER}@${targetServer} '
                                # Cargar NVM y Node.js para asegurar que estén disponibles
                                export NVM_DIR="\$HOME/.nvm"
                                [ -s "\$NVM_DIR/nvm.sh" ] && \\. "\$NVM_DIR/nvm.sh"
                                
                                # Instalar PM2 si no está disponible
                                if ! command -v pm2 &> /dev/null; then
                                    npm install -g pm2
                                fi
                                
                                if [ ! -d ${APP_DIR} ]; then
                                    mkdir -p ${APP_DIR}
                                    cd ${APP_DIR}
                                    git clone https://github.com/ItsEugenio/healthcheck.git .
                                    git checkout ${targetBranch}
                                else
                                    cd ${APP_DIR}
                                    git fetch --all
                                    git checkout ${targetBranch}
                                    git pull origin ${targetBranch}
                                fi
                                
                                # Ejecutar comandos npm asegurándose que Node.js está en el PATH
                                npm ci
                                # Revisar si existe script build antes de ejecutarlo
                                if grep -q '"build"' package.json; then
                                    npm run build
                                else
                                    echo "No hay script de build en package.json, omitiendo este paso"
                                fi
                                
                                # Reiniciar con PM2
                                if pm2 list | grep -q "node-healthcheck"; then
                                    pm2 restart node-healthcheck
                                else
                                    pm2 start npm --name "node-healthcheck" -- start
                                fi
                            '
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo "Pipeline ejecutado con éxito!"
        }
        failure {
            echo "El pipeline ha fallado."
        }
    }
}