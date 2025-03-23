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
      description: 'Make Port your own by defining a data model that fits your organization, then use your software catalog as a single source of truth for your software development assets.',
      demoUrl: 'https://demo.getport.io/service_catalog',
      icon: 'lists',
    },
    {
      title: 'Self-Service',
      description: 'Drive developer productivity and reduce drift by providing developers with pre-configured self-service actions like scaffolding a service or provisioning a cloud resource.',
      demoUrl: 'https://demo.getport.io/self-serve',
      icon: 'bolt',
    },
    {
      title: 'Workflow Automation',
      description: 'Set up automations to automatically respond to events in your software catalog such as TTL=0 or service degradation, and peform actions like sending a notification or reporting an issue.',
      demoUrl: 'https://demo.getport.io/settings/automations',
      icon: 'play_circle',
    },
    {
      title: 'Scorecards',
      description: 'Define and track standards and KPIs for your resources to measure quality, production readiness, productivity, or any other metric you need.',
      demoUrl: 'https://demo.getport.io/serviceEntity?identifier=authentication&activeTab=1',
      icon: 'military_tech',
    },
    {
      title: 'R&D Insights & Reports',
      description: 'Shine a light on all things engineering, from standards compliance to DORA metrics & AppSec. Make informed decisions based on trends and usage patterns to improve development, optimize performance, and reduce cost.',
      demoUrl: 'https://demo.getport.io/dora_metrics',
      icon: 'insights',
    },
    {
      title: 'Dashboards & visualizations',
      description: 'Create custom dashboards and widgets to track and visualize data about your assets. View trends and gain insights into your development activities, performance, and progress.',
      demoUrl: 'https://demo.getport.io/engineering_overview',
      icon: 'dashboard',
    },
    {
      title: 'Role-based access control',
      description: 'Control access to different parts of your portal based on user roles and permissions. Ensure that only authorized users have access to the information they need to do their jobs.',
      demoUrl: 'https://demo.getport.io/settings/users',
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