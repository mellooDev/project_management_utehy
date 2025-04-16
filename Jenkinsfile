stageResultMap = [:]

CI_BRANCH = 'develop'
CI_CREDENTIAL_ID = 'si_tunglethanh'
CI_GIT_URL= 'https://scm.devops.vnpt.vn/it.si.acp/data-exchange-platform/marketplace-portal.git'
CI_BUILD_VERSION = '1.0.'
DEPLOY_HOST = "10.1.125.122"

def jobs         = [:]
def pushNexusJobs         = [:]

pipeline {
    agent { label "SI.THS.Dev122" }
    options {
        skipDefaultCheckout true
        disableConcurrentBuilds()

    }

    parameters {
        booleanParam(name: 'SCAN_CODE', defaultValue: false, description: 'Code quality scan with Sonar')
        booleanParam(name: 'AUTO_TEST', defaultValue: false, description: 'AUTO_TEST')
		booleanParam(name: 'RELEASE_BUILD', defaultValue: false, description: 'Make this build to released')
    }


//    triggers {
//       cron('0 0 * * *')
//    }

    stages {
        stage ('1.Get Current Commit') {
            steps {
                script{
                      try {
                      // sh 'curl -s -X POST "https://api.telegram.org/bot7810394185:AAGDGlFzeJJAM9cflyhFpX-I2hjRSF72KU4/sendMessage" -d chat_id="-4593591565" -d text="Start build FE: ' + '${BUILD_NUMBER}"'
                            GIT_COMMIT = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
                            echo "git commit:" + GIT_COMMIT
                      } catch (Exception e) {
                            GIT_COMMIT = ""
                            sh 'exit 0'
                      }
                }
            }
        }

        stage("2.Checkout Source Code") {
            steps {
                script{
                    env.NEXT_BUILD = "yes"
                }

                echo "========= Step 1 : Checkout source ========="
                git branch: '' + CI_BRANCH,
                credentialsId: '' + CI_CREDENTIAL_ID,
                url: '' + CI_GIT_URL
                echo "========= Checkout source from branch " + CI_BRANCH + " DONE!!! ========="
            }
        }
        stage ('3. New Commit CheckPoint') {
            when {
                expression {
                    GIT_PREVIOUS_SUCCESS_COMMIT = sh(returnStdout: true, script: 'git rev-parse refs/remotes/origin/'+ CI_BRANCH +'^{commit}').trim()
                    echo "git previous: "+ GIT_PREVIOUS_SUCCESS_COMMIT
                    echo "Force Build: " + params.RELEASE_BUILD

                    // return (GIT_COMMIT == GIT_PREVIOUS_SUCCESS_COMMIT && !params.RELEASE_BUILD && !params.FORCE_BUILD)
                    return false
                }
            }
            steps {
                script{
                    echo "No change. No Build"
                    currentBuild.result = 'SUCCESS'
                    env.NEXT_BUILD = "no"
                }
            }
        }

		stage('5. SonarQube analysis') {
            when {
                expression {
                    return params.SCAN_CODE
                }
            }
			steps {
				script{
					echo "============= Begin Stage 5: SonarQube analysis ================"

					// sh 'pwd'

					// sh 'cd builder && mvn sonar:sonar -Dmaven.test.skip=true -Dsonar.projectKey=IT.SI.THS.SML -Dsonar.projectName="IT.SI.THS.SML" -Dsonar.host.url=http://codequality.devops.vnpt.vn -Dsonar.login=7e7b6c6daaeeba8df854341056fd4494e09c0de8'
					// sh 'cd ..'
                    withSonarQubeEnv(installationName: 'VNPTIT.SHARED.SONARQUBE')
                    {
                        sh 'cd builder && mvn sonar:sonar -Dmaven.test.skip=true -Dsonar.projectKey=IT.SI.THS.SML -Dsonar.projectName="IT.SI.THS.SML" -Dsonar.host.url=http://codequality.devops.vnpt.vn -Dsonar.login=7e7b6c6daaeeba8df854341056fd4494e09c0de8 -Dsonar.webhooks.project=http://cbuild.devops.vnpt.vn:8080/sonarqube-webhook/'
                    }
				}
			}
        }


        stage("6. Quality Gate") {
            when {
                expression {
                    return params.SCAN_CODE
                }
            }
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('8. Deploy to Dev/Test') {
            when {
                expression {
                    return env.NEXT_BUILD == "yes"
                }
            }
            steps {
                script{
                    echo "BUILD"
                    sh "export BUILD_VERSION=" + CI_BUILD_VERSION + "${BUILD_NUMBER}" + "&& docker-compose -f docker-compose.yml build"
                    echo "Stop old version"
                    sh "export BUILD_VERSION=" + CI_BUILD_VERSION + "${BUILD_NUMBER}" + " && docker-compose -f docker-compose.yml down"

                    echo "Deploy new version"
                    sh "export BUILD_VERSION=" + CI_BUILD_VERSION + "${BUILD_NUMBER}" + "&& docker-compose -f docker-compose.yml up -d "
                }
            }
        }

        stage('9. Automation Test') {
            when {
                expression {
                    return params.AUTO_TEST
                }
            }
            steps {
                script{
                    echo 'Waiting 5 minutes for deployment to complete prior starting smoke testing'
                    sleep 60
                    echo "Run automation test"
					sh ('''
                        cd /home/tunglt/VNPT_SmartLighting
                        pwd
                        export DISPLAY=:0
                        katalonc -noSplash -runMode=console -projectPath="/home/tunglt/VNPT_SmartLighting/VNPT_SmartLighting.prj" -retry=0 -testSuitePath="Test Suites/TestSuite_Flow1" -browserType="Firefox" -executionProfile="default" -apiKey="77d8ec1a-7454-43c6-846a-58b147d55396" --config -proxy.auth.option=NO_PROXY -proxy.system.option=NO_PROXY -proxy.system.applyToDesiredCapabilities=true -webui.autoUpdateDrivers=true
                        cd ..
                        ''')


                    env.AUTOTEST_RESULT = "ok"
                }
            }
        }
        stage('10. Publish to Nexus') {
            environment {
                NEXUS_REPOSITORY = "crelease.devops.vnpt.vn:10102"
                NXRM_USER_CREDENTIALS = 'auto.si.it'
                NXRM_PASS_CREDENTIALS = 'G#p56k8baA@@'
            }
            when {
                expression {
                    return params.RELEASE_BUILD
                }
            }
            steps {
                sh "docker login -u ${NXRM_USER_CREDENTIALS} -p ${NXRM_PASS_CREDENTIALS} ${NEXUS_REPOSITORY}"

                sh "docker push ${NEXUS_REPOSITORY}/repository/dxp/market-portal:" + CI_BUILD_VERSION+ "${BUILD_NUMBER}"

                script {
                    try {
                            echo "Remove old images"
                            sh "docker rmi -f \$(docker images vltl-* -a -q)"
                    } catch (Exception e) {
                    }

                    try {
                            echo "Remove old images"
                            sh "docker rmi -f \$(docker images vltl-* -a -q)"
                    } catch (Exception e) {
                    }
                }

            }
        }

//        stage('11. Send telegram') {
//            steps {
//                script {
//                    // sh 'curl -s -X POST "https://api.telegram.org/bot7810394185:AAGDGlFzeJJAM9cflyhFpX-I2hjRSF72KU4/sendMessage" -d chat_id="-4593591565" //-d text="Build success FE' + '${BUILD_NUMBER}"'
//                }
 //           }
 //       }

    }
}
