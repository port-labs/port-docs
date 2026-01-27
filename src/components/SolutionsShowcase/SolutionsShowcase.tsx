import React from 'react';
import styles from './SolutionsShowcase.module.css';
import Head from '@docusaurus/Head';

interface SolutionProps {
  title: string;
  description: string;
  link?: string;
  icon: string;
}

const Solution: React.FC<SolutionProps> = ({ title, description, link, icon }) => (
  <div className={styles.solution}>
    <div className={styles.solutionContent}>
      <div className={styles.iconWrapper}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h3 className={styles.solutionTitle}>{title}</h3>
      <p className={styles.solutionDescription}>{description}</p>
      {link && (
        <a href={link} className={styles.learnMoreLink}>
          <span>Learn more</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </a>
      )}
    </div>
  </div>
);

const SolutionsShowcase: React.FC = () => {
  const solutions = [
    {
      title: 'Autonomous ticket resolution',
      description: 'Automate the entire lifecycle of your tickets. Agents handle triaging work items, PRDs, specs, coding, and safe production releases. Focus your teams on more complex tasks.',
      link: '/solutions/autonomous-ticket-resolution/overview',
      icon: 'confirmation_number',
    },
    {
      title: 'Self-healing incidents',
      description: 'Port performs the entire incident management process autonomously. On-call teams stay in control, approving every step. Issues are resolved dramatically faster.',
      link: '/solutions/incident-management/overview',
      icon: 'healing',
    },
    {
      title: 'Resource management',
      description: 'Equip teams to provision microservices, secrets, cloud resources, permissions, and custom assets with self-service actions. Standardize resource consumption to keep control.',
      link: '/solutions/resource-self-service/overview',
      icon: 'cloud_sync',
    },
    {
      title: 'Engineering intelligence',
      description: 'Measure engineering productivity, track adoption of AI coding assistants, show the impact of autonomous workflows, and ensure software standards are always met.',
      link: '/solutions/engineering-intelligence/overview',
      icon: 'insights',
    },
    {
      title: 'Agentic work management',
      description: 'Every role gets one view of their assigned work, pending agent reviews, approvals, and priorities. Put your teams in a flow state.',
      icon: 'task_alt',
    },
    {
      title: 'Engineer onboarding',
      description: 'Get developers and AI agents up to speed with quick access to your engineering context lake and ready-to-run actions. Reduce time-to-productivity for new team members.',
      icon: 'school',
    },
    {
      title: 'Autonomous security management',
      description: 'Manage your entire security standards and issues in one place. Provide visibility, ownership, and prioritized remediation across vulnerabilities and compliance requirements.',
      link: '/solutions/security/overview',
      icon: 'shield',
    },
  ];

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </Head>
      <div className={styles.container}>
        <div className={styles.solutionsGrid}>
          {solutions.map((solution, index) => (
            <Solution key={index} {...solution} />
          ))}
        </div>
      </div>
    </>
  );
};

export default SolutionsShowcase;
