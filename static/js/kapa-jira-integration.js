/**
 * Kapa to JIRA Integration
 * 
 * Listens for Kapa feedback events and creates JIRA tasks when users downvote answers.
 * Calls a webhook endpoint that handles JIRA task creation.
 * 
 * Configuration:
 * Set window.KAPA_JIRA_CONFIG.webhookUrl before this script loads to configure the webhook URL.
 * Example: window.KAPA_JIRA_CONFIG = { webhookUrl: 'https://your-webhook.com/api/create-jira-task' };
 */

(function() {
  'use strict';

  // Configuration - Webhook URL for creating JIRA tasks
  // Configure this by setting window.KAPA_JIRA_CONFIG before this script loads
  // Example: window.KAPA_JIRA_CONFIG = { webhookUrl: 'https://your-webhook.com/api/create-jira-task' };
  const WEBHOOK_URL = (window.KAPA_JIRA_CONFIG && window.KAPA_JIRA_CONFIG.webhookUrl) || null;

  /**
   * Creates a JIRA task via webhook
   * @param {Object} feedbackData - The feedback data from Kapa
   */
  async function createJiraTask(feedbackData) {
    // Check if webhook URL is configured
    if (!WEBHOOK_URL) {
      console.warn('Kapa JIRA integration: Webhook URL not configured. Set window.KAPA_JIRA_CONFIG.webhookUrl to enable.');
      return null;
    }

    try {
      const response = await fetch(WEBHOOK_URL, {
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

