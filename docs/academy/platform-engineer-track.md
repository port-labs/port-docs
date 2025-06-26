import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import styles from './developer-track.module.css';

# Platform engineer track

This track is designed for the personas who will be **building** and **scaling** the developer portal.

It is focused on creating experiences for the developers who will be using the portal, using blueprints, actions, automations, scorecards, and all the other features that Port has to offer.

## Available courses

The content is organized into two tiers: beginner and advanced.

The beginner tier focuses on fundamental concepts and basic implementations, while the advanced tier covers complex use-cases and capabilities. We recommend completing the beginner tier before moving to advanced topics.

<Tabs queryString="level">

<TabItem value="beginner" label="Beginner" default>

<div className={styles.courseGrid}>
  <div className={styles.courseCard}>
    <div className={styles.courseIcon}>🚀</div>
    <h3>Getting Started with Port</h3>
    <div className={styles.courseTags}>
      <span className={`${styles.courseTag} ${styles.video}`}>Video</span>
      <span className={`${styles.courseTag} ${styles.guide}`}>Guide</span>
    </div>
    <p>Learn the basics of Port, understand key concepts, and set up your first developer portal.</p>
    <a href="/academy/platform-engineer-track/getting-started" className={styles.courseLink}>
      Start Learning →
    </a>
  </div>

  <div className={styles.courseCard}>
    <div className={styles.courseIcon}>📋</div>
    <h3>Creating Your First Blueprint</h3>
    <div className={styles.courseTags}>
      <span className={`${styles.courseTag} ${styles.guide}`}>Guide</span>
      <span className={`${styles.courseTag} ${styles.documentation}`}>Documentation</span>
    </div>
    <p>Master the fundamentals of blueprints and learn how to model your software catalog.</p>
    <a href="/academy/platform-engineer-track/first-blueprint" className={styles.courseLink}>
      Start Learning →
    </a>
  </div>

  <div className={styles.courseCard}>
    <div className={styles.courseIcon}>⚡</div>
    <h3>Basic Actions & Automations</h3>
    <div className={styles.courseTags}>
      <span className={`${styles.courseTag} ${styles.video}`}>Video</span>
      <span className={`${styles.courseTag} ${styles.guide}`}>Guide</span>
    </div>
    <p>Discover how to create and manage actions and automations in your developer portal.</p>
    <a href="/academy/platform-engineer-track/basic-actions" className={styles.courseLink}>
      Start Learning →
    </a>
  </div>

  <div className={styles.courseCard}>
    <div className={styles.courseIcon}>📊</div>
    <h3>Scorecards Fundamentals</h3>
    <div className={styles.courseTags}>
      <span className={`${styles.courseTag} ${styles.guide}`}>Guide</span>
      <span className={`${styles.courseTag} ${styles.documentation}`}>Documentation</span>
    </div>
    <p>Learn how to create and use scorecards to measure and improve your software development practices.</p>
    <a href="/academy/platform-engineer-track/scorecards-fundamentals" className={styles.courseLink}>
      Start Learning →
    </a>
  </div>

  <div className={styles.courseCard}>
    <div className={styles.courseIcon}>🎨</div>
    <h3>Port UI Customization</h3>
    <div className={styles.courseTags}>
      <span className={`${styles.courseTag} ${styles.video}`}>Video</span>
      <span className={`${styles.courseTag} ${styles.guide}`}>Guide</span>
    </div>
    <p>Customize your developer portal's look and feel to match your organization's branding.</p>
    <a href="/academy/platform-engineer-track/ui-customization" className={styles.courseLink}>
      Start Learning →
    </a>
  </div>

  <div className={styles.courseCard}>
    <div className={styles.courseIcon}>👥</div>
    <h3>User Management</h3>
    <div className={styles.courseTags}>
      <span className={`${styles.courseTag} ${styles.guide}`}>Guide</span>
      <span className={`${styles.courseTag} ${styles.documentation}`}>Documentation</span>
    </div>
    <p>Learn how to manage users, roles, and permissions in your developer portal.</p>
    <a href="/academy/platform-engineer-track/user-management" className={styles.courseLink}>
      Start Learning →
    </a>
  </div>
</div>

</TabItem>

<TabItem value="advanced" label="Advanced">

<div className={styles.courseGrid}>
  <div className={styles.courseCard}>
    <div className={styles.courseIcon}>🏗️</div>
    <h3>Advanced Blueprint Patterns</h3>
    <div className={styles.courseTags}>
      <span className={`${styles.courseTag} ${styles.documentation}`}>Documentation</span>
      <span className={`${styles.courseTag} ${styles.guide}`}>Guide</span>
    </div>
    <p>Learn advanced blueprint techniques for complex software catalog modeling and relationships.</p>
    <a href="/academy/platform-engineer-track/advanced-blueprints" className={styles.courseLink}>
      Start Learning →
    </a>
  </div>

  <div className={styles.courseCard}>
    <div className={styles.courseIcon}>🔌</div>
    <h3>Custom Integrations</h3>
    <div className={styles.courseTags}>
      <span className={`${styles.courseTag} ${styles.video}`}>Video</span>
      <span className={`${styles.courseTag} ${styles.documentation}`}>Documentation</span>
    </div>
    <p>Build custom integrations with external tools and services using Port's API and webhooks.</p>
    <a href="/academy/platform-engineer-track/custom-integrations" className={styles.courseLink}>
      Start Learning →
    </a>
  </div>

  <div className={styles.courseCard}>
    <div className={styles.courseIcon}>📈</div>
    <h3>Advanced Scorecards & Metrics</h3>
    <div className={styles.courseTags}>
      <span className={`${styles.courseTag} ${styles.guide}`}>Guide</span>
      <span className={`${styles.courseTag} ${styles.documentation}`}>Documentation</span>
    </div>
    <p>Create sophisticated scorecards and metrics to measure and improve your software development lifecycle.</p>
    <a href="/academy/platform-engineer-track/advanced-scorecards" className={styles.courseLink}>
      Start Learning →
    </a>
  </div>

  <div className={styles.courseCard}>
    <div className={styles.courseIcon}>⚙️</div>
    <h3>Advanced Automation Patterns</h3>
    <div className={styles.courseTags}>
      <span className={`${styles.courseTag} ${styles.video}`}>Video</span>
      <span className={`${styles.courseTag} ${styles.guide}`}>Guide</span>
    </div>
    <p>Implement complex automation workflows and integrate with your existing DevOps toolchain.</p>
    <a href="/academy/platform-engineer-track/advanced-automation" className={styles.courseLink}>
      Start Learning →
    </a>
  </div>

  <div className={styles.courseCard}>
    <div className={styles.courseIcon}>🧩</div>
    <h3>Custom Widgets & Extensions</h3>
    <div className={styles.courseTags}>
      <span className={`${styles.courseTag} ${styles.documentation}`}>Documentation</span>
      <span className={`${styles.courseTag} ${styles.guide}`}>Guide</span>
    </div>
    <p>Extend Port's functionality with custom widgets and extensions for specialized use cases.</p>
    <a href="/academy/platform-engineer-track/custom-widgets" className={styles.courseLink}>
      Start Learning →
    </a>
  </div>

  <div className={styles.courseCard}>
    <div className={styles.courseIcon}>🏢</div>
    <h3>Enterprise Integration Patterns</h3>
    <div className={styles.courseTags}>
      <span className={`${styles.courseTag} ${styles.guide}`}>Guide</span>
      <span className={`${styles.courseTag} ${styles.documentation}`}>Documentation</span>
    </div>
    <p>Learn best practices for integrating Port with enterprise systems and scaling your developer portal.</p>
    <a href="/academy/platform-engineer-track/enterprise-integration" className={styles.courseLink}>
      Start Learning →
    </a>
  </div>
</div>

</TabItem>
</Tabs>
