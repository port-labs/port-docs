import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import styles from './developer-track.module.css';

# Developer track

This track is designed for the personas who will be **using** (as opposed to building) the internal developer portal.

It is focused on describing the different components of your portal (software catalog, actions, scorecards, etc.) and how to use them to accommodate your routines and workflows.

## Available courses

Courses are designed to be self-contained and can be taken in any order:

<div className={styles.courseGrid}>
  <div className={styles.courseCard}>
    <div className={styles.courseIcon}>📚</div>
    <h3>Getting Started with Port</h3>
    <div className={styles.courseTags}>
      <span className={`${styles.courseTag} ${styles.video}`}>Video</span>
      <span className={`${styles.courseTag} ${styles.guide}`}>Guide</span>
    </div>
    <p>Learn the basics of navigating and using your developer portal effectively.</p>
    <a href="/academy/developer-track/getting-started" className={styles.courseLink}>
      Start Learning →
    </a>
  </div>

  <div className={styles.courseCard}>
    <div className={styles.courseIcon}>🔍</div>
    <h3>Software Catalog Mastery</h3>
    <div className={styles.courseTags}>
      <span className={`${styles.courseTag} ${styles.documentation}`}>Documentation</span>
      <span className={`${styles.courseTag} ${styles.guide}`}>Guide</span>
    </div>
    <p>Discover how to effectively use the software catalog to find and manage your services.</p>
    <a href="/academy/developer-track/software-catalog" className={styles.courseLink}>
      Start Learning →
    </a>
  </div>

  <div className={styles.courseCard}>
    <div className={styles.courseIcon}>⚡</div>
    <h3>Working with Actions</h3>
    <div className={styles.courseTags}>
      <span className={`${styles.courseTag} ${styles.video}`}>Video</span>
      <span className={`${styles.courseTag} ${styles.documentation}`}>Documentation</span>
    </div>
    <p>Master the use of self-service actions to streamline your development workflows.</p>
    <a href="/academy/developer-track/actions" className={styles.courseLink}>
      Start Learning →
    </a>
  </div>

  <div className={styles.courseCard}>
    <div className={styles.courseIcon}>📊</div>
    <h3>Understanding Scorecards</h3>
    <div className={styles.courseTags}>
      <span className={`${styles.courseTag} ${styles.guide}`}>Guide</span>
      <span className={`${styles.courseTag} ${styles.documentation}`}>Documentation</span>
    </div>
    <p>Learn how to interpret and use scorecards to track service health and metrics.</p>
    <a href="/academy/developer-track/scorecards" className={styles.courseLink}>
      Start Learning →
    </a>
  </div>

  <div className={styles.courseCard}>
    <div className={styles.courseIcon}>🔔</div>
    <h3>Notifications & Alerts</h3>
    <div className={styles.courseTags}>
      <span className={`${styles.courseTag} ${styles.video}`}>Video</span>
      <span className={`${styles.courseTag} ${styles.guide}`}>Guide</span>
    </div>
    <p>Configure and manage notifications to stay informed about important updates.</p>
    <a href="/academy/developer-track/notifications" className={styles.courseLink}>
      Start Learning →
    </a>
  </div>

  <div className={styles.courseCard}>
    <div className={styles.courseIcon}>🤝</div>
    <h3>Team Collaboration</h3>
    <div className={styles.courseTags}>
      <span className={`${styles.courseTag} ${styles.guide}`}>Guide</span>
      <span className={`${styles.courseTag} ${styles.documentation}`}>Documentation</span>
    </div>
    <p>Learn best practices for collaborating with your team using Port's features.</p>
    <a href="/academy/developer-track/collaboration" className={styles.courseLink}>
      Start Learning →
    </a>
  </div>
</div>
