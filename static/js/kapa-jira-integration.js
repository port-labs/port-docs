/**
 * Kapa to JIRA Integration
 * 
 * Listens for Kapa feedback events and creates JIRA tasks when users downvote answers.
 * Calls an AWS Amplify Lambda function API endpoint.
 */

(function() {
  'use strict';

  // Configuration - API endpoint for creating JIRA tasks
  // AWS Amplify automatically creates API endpoints for Lambda functions
  // The endpoint will be: https://your-app-id.amplifyapp.com/api/create-jira-task
  // You can configure this by setting window.KAPA_JIRA_CONFIG before this script loads
  const API_ENDPOINT = (window.KAPA_JIRA_CONFIG && window.KAPA_JIRA_CONFIG.apiEndpoint) || '/api/create-jira-task';

  /**
   * Creates a JIRA task via the AWS Amplify Lambda function
   * @param {Object} feedbackData - The feedback data from Kapa
   */
  async function createJiraTask(feedbackData) {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reaction: feedbackData.reaction,
          comment: feedbackData.comment,
          threadId: feedbackData.threadId,
          questionAnswerId: feedbackData.questionAnswerId,
          question: feedbackData.question,
          answer: feedbackData.answer,
          conversation: feedbackData.conversation,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create JIRA task: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('JIRA task created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating JIRA task:', error);
      // Don't throw - we don't want to break the user experience
      return null;
    }
  }

  /**
   * Handles Kapa feedback submission events
   * @param {Object} args - Event arguments from Kapa
   */
  function handleKapaFeedback(args) {
    // Check if this is a downvote
    if (args.reaction === 'downvote') {
      console.log('Downvote detected, creating JIRA task...', args);
      createJiraTask(args);
    }
  }

  /**
   * Initialize the Kapa event listener
   */
  function initializeKapaListener() {
    // Wait for Kapa to be available
    if (typeof window.Kapa === 'function') {
      // Register the event listener for feedback submissions
      window.Kapa('onAskAIFeedbackSubmit', handleKapaFeedback);
      console.log('Kapa JIRA integration initialized');
    } else {
      // Retry after a short delay if Kapa isn't loaded yet
      setTimeout(initializeKapaListener, 500);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeKapaListener);
  } else {
    // DOM is already ready
    initializeKapaListener();
  }
})();

