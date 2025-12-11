/**
 * Setup Survey Questions in Firestore
 * ===================================
 * 
 * This script populates the Firestore 'survey_questions' collection
 * with all actual survey questions from the application.
 * 
 * Run this once to initialize the collection with default questions.
 * 
 * Usage:
 * 1. Firestore db is available globally as window.db
 * 2. Call: window.initializeDefaultSurveyQuestions()
 */

/**
 * Default survey questions from the application
 */
const defaultSurveyQuestions = [
    // Service Quality (SQD) Questions
    {
        code: 'SQD0',
        text: 'I am satisfied with the service that I availed.',
        type: 'SQD',
        required: true
    },
    {
        code: 'SQD1',
        text: 'I spent a reasonable amount of time for my transaction.',
        type: 'SQD',
        required: true
    },
    {
        code: 'SQD2',
        text: 'The office followed the transaction\'s requirements and steps based on the information provided.',
        type: 'SQD',
        required: true
    },
    {
        code: 'SQD3',
        text: 'The steps (including payment) I needed to do for my transaction were easy and simple.',
        type: 'SQD',
        required: true
    },
    {
        code: 'SQD4',
        text: 'I easily found information about my transaction from the office or its website.',
        type: 'SQD',
        required: true
    },
    {
        code: 'SQD5',
        text: 'I paid a reasonable amount of fees for my transaction. (If service was free, mark the \'N/A\' option)',
        type: 'SQD',
        required: true
    },
    {
        code: 'SQD6',
        text: 'I feel the office was fair to everyone, or \'walang palakasan\', during my transaction.',
        type: 'SQD',
        required: true
    },
    {
        code: 'SQD7',
        text: 'I was treated courteously by the staff, and (if asked for help) the staff was helpful.',
        type: 'SQD',
        required: true
    },
    {
        code: 'SQD8',
        text: 'I got what I needed from the government office, or if denied, the reason was explained to me clearly.',
        type: 'SQD',
        required: true
    },
    
    // Citizen's Charter (CC) Questions
    {
        code: 'CC1',
        text: 'Which of the following best describes your awareness of a CC?',
        type: 'CC',
        required: true
    },
    {
        code: 'CC2',
        text: 'If aware of the CC (answered 1–3 in CC1), would you say that the CC of this office was...?',
        type: 'CC',
        required: true
    },
    {
        code: 'CC3',
        text: 'If aware of the CC (answered 1–3 in CC1), would you say that the CC of this office was...?',
        type: 'CC',
        required: true
    }
];

/**
 * Initialize default survey questions in Firestore
 * This function will check if questions already exist before adding them
 */
function initializeDefaultSurveyQuestions() {
    return new Promise(async (resolve, reject) => {
        try {
            // Wait for window.db to be available
            if (!window.db) {
                throw new Error('Firestore database not initialized. Please ensure Firebase is loaded first.');
            }

            const db = window.db;
            console.log('Starting survey questions initialization...');
            
            const questionsRef = db.collection('survey_questions');
            let addedCount = 0;
            let skippedCount = 0;

            for (const question of defaultSurveyQuestions) {
                const docId = question.code.toLowerCase().replace(/\s+/g, '_');
                const docSnapshot = await questionsRef.doc(docId).get();

                if (!docSnapshot.exists) {
                    // Add question if it doesn't exist
                    await questionsRef.doc(docId).set({
                        ...question,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    console.log(`✓ Added question: ${question.code}`);
                    addedCount++;
                } else {
                    console.log(`⊘ Skipped question (already exists): ${question.code}`);
                    skippedCount++;
                }
            }

            const message = `Survey questions initialization complete!\nAdded: ${addedCount}\nSkipped (already exist): ${skippedCount}`;
            console.log(message);
            alert(message);
            resolve(true);
        } catch (error) {
            console.error('Error initializing survey questions:', error);
            alert(`Error initializing survey questions: ${error.message}`);
            reject(error);
        }
    });
}

/**
 * Delete all survey questions (use with caution!)
 */
function clearAllSurveyQuestions() {
    return new Promise(async (resolve, reject) => {
        if (!confirm('Are you sure you want to delete ALL survey questions? This cannot be undone!')) {
            resolve(false);
            return;
        }

        try {
            if (!window.db) {
                throw new Error('Firestore database not initialized.');
            }

            const db = window.db;
            console.log('Clearing all survey questions...');
            const questionsRef = db.collection('survey_questions');
            const snapshot = await questionsRef.get();
            
            let deletedCount = 0;
            for (const doc of snapshot.docs) {
                await doc.ref.delete();
                deletedCount++;
                console.log(`✓ Deleted: ${doc.id}`);
            }

            alert(`Deleted ${deletedCount} survey questions.`);
            resolve(true);
        } catch (error) {
            console.error('Error clearing survey questions:', error);
            alert(`Error clearing survey questions: ${error.message}`);
            reject(error);
        }
    });
}

// Make functions available globally for browser console access
window.initializeDefaultSurveyQuestions = initializeDefaultSurveyQuestions;
window.clearAllSurveyQuestions = clearAllSurveyQuestions;
