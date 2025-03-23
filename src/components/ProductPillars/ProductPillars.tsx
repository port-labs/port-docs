import React from 'react';
import styles from './ProductPillars.module.css';
import Head from '@docusaurus/Head';

interface PillarProps {
  title: string;
  description: string;
  demoUrl: string;
  demoLabel?: string;
  icon: string;
}

const Pillar: React.FC<PillarProps> = ({ title, description, demoUrl, demoLabel = 'Live Demo', icon }) => (
  <div className={styles.pillar}>
    <div className={styles.pillarContent}>
      <div className={styles.iconWrapper}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h3 className={styles.pillarTitle}>{title}</h3>
      <p className={styles.pillarDescription}>{description}</p>
      <a href={demoUrl} className={styles.demoLink} target="_blank" rel="noopener noreferrer">
        <span>Live demo example</span>
        <span className="material-symbols-outlined">arrow_forward</span>
      </a>
    </div>
  </div>
);

const ProductPillars: React.FC = () => {
  const pillars = [
    {
      title: 'Software Catalog',
      description: 'Give developers a holistic understanding of your development lifecycle and underlying architecture. Reduce cognitive load resulting from complex architectures, tool proliferation, and tribal knowledge.',
      demoUrl: 'https://demo.getport.io/service_catalog',
      icon: 'lists',
    },
    {
      title: 'Scorecards',
      description: 'Port scorecards let you define and track standards and KPIs for quality, production readiness, productivity, and more. Drive visibility and a culture of software quality.',
      demoUrl: 'https://demo.getport.io/serviceEntity?identifier=authentication&activeTab=1',
      icon: 'military_tech',
    },
    {
      title: 'Self-Service',
      description: 'Drive developer productivity by allowing developers to run free and use self-service actions like scaffolding a service or provisioning a cloud resource.',
      demoUrl: 'https://demo.getport.io/self-serve',
      icon: 'bolt',
    },
    {
      title: 'Workflow Automation',
      description: 'Set up automations to automatically respond to events from your software catalog such as TTL=0, service degradation, and many more. Streamline engineering processes and maintain high performance, security, and compliance.',
      demoUrl: 'https://demo.getport.io/settings/automations',
      icon: 'play_circle',
    },
    {
      title: 'R&D Insights & Reports',
      description: 'Provides data-driven insights and analytical reports on the development process. Make informed decisions based on metrics, trends, and usage patterns to improve development, optimize performance, and reduce cost.',
      demoUrl: 'https://demo.getport.io/engineering_overview',
      icon: 'insights',
    },
    {
      title: 'Dashboards & visualizations',
      description: 'Create custom dashboards and visualizations to track and analyze your software development process. Gain insights into your development activities, performance, and progress.',
      demoUrl: 'https://demo.getport.io/engineering_overview',
      icon: 'dashboard',
    },
    {
      title: 'Role-based access control',
      description: 'Control access to your software catalog, scorecards, and other resources based on user roles and permissions. Ensure that only authorized users have access to the information they need to do their jobs.',
      demoUrl: 'https://demo.getport.io/settings/roles',
      icon: 'shield_person',
    }
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
        <div className={styles.pillarsGrid}>
          {pillars.map((pillar, index) => (
            <Pillar key={index} {...pillar} />
          ))}
        </div>
      </div>
    </>
  );
};

export default ProductPillars; 