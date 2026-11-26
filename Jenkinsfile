pipeline {
    agent any

    // Run automatically every morning at 7:00 AM local time
    triggers {
        cron('0 7 * * *')
    }

    parameters {
        choice(
            name: 'REGRESSION_SUITE',
            choices: [
                'ALL',
                'signup.feature',
                'signin.feature',
                'accountSetup.feature',
                'petCreation.feature',
                'addingPets.feature',
                'petDetailsEdit.feature',
                'freePlan.feature',
                'companionSubscription.feature',
                'secondPetAfterSubscription.feature',
                'healthRecords.feature',
                'conditionsEpisodes.feature',
                'profileSubscriptionSettings.feature',
                'additionalScenarios.feature'
            ],
            description: 'Select ALL to run the full 180-scenario regression suite at 7:00 AM or choose a specific module'
        )
    }

    environment {
        PATH = "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${env.PATH}"
        CI = 'true'
        HEADLESS = 'true'
        DEV_BASE_URL = 'https://frontend-yrox.onrender.com'
        BASE_URL = 'https://frontend-yrox.onrender.com'
        TEST_EMAIL_DOMAIN = 'gmail.com'
        TEST_EMAIL_PATTERN = 'zosalus+test{seq}@gmail.com'
        TEST_PATIENT_PASSWORD = 'Zosalus@123'
        DEFAULT_TIMEOUT = '120000'
        SLOW_MO = '100'
    }

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '30', artifactNumToKeepStr: '30'))
        timeout(time: 90, unit: 'MINUTES')
    }

    stages {
        stage('Install Dependencies & Browsers') {
            steps {
                sh '''
                    node -v
                    npm -v
                    npm install
                    npx playwright install chromium
                '''
            }
        }

        stage('Sync SQLite Test User Database') {
            steps {
                sh '''
                    npm run db:sync || true
                    npm run db:inspect || true
                '''
            }
        }

        stage('Generate BDD Test Specs') {
            steps {
                sh 'npx bddgen'
            }
        }

        stage('Execute Zosalus Regression Suite') {
            steps {
                script {
                    if (params.REGRESSION_SUITE == 'ALL' || !params.REGRESSION_SUITE) {
                        sh 'npx playwright test .features-gen/features/regression/ --project=chromium'
                    } else {
                        sh "npx playwright test .features-gen/features/regression/${params.REGRESSION_SUITE}.spec.js --project=chromium"
                    }
                }
            }
        }
    }

    post {
        always {
            // Sync SQLite with live server, generate Feature-to-Scenario HTML report, and publish to Jenkins userContent & public GitHub Pages (docs/)
            sh '''
                npm run db:sync || true
                npm run report:generate || true
                if [ -d "playwright-report" ] && [ -n "$JENKINS_HOME" ]; then
                    mkdir -p "$JENKINS_HOME/userContent/zosalus-report"
                    cp -R playwright-report/* "$JENKINS_HOME/userContent/zosalus-report/" || true
                fi
                if [ -f "docs/index.html" ]; then
                    git add docs/index.html docs/report-history.json docs/.nojekyll || true
                    git diff --staged --quiet || (git commit -m "chore(report): update daily 7AM regression HTML report" && git push origin main) || true
                fi
            '''

            archiveArtifacts artifacts: 'playwright-report/**, test-results/**', allowEmptyArchive: true
        }
    }
}
