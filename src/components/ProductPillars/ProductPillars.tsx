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
      title: 'Context Lake',
      description: 'Unify data from your entire engineering ecosystem into a single source of truth. Connect your tools, services, and infrastructure to provide AI agents and developers with the organizational context they need.',
      demoUrl: 'https://showcase.port.io/',
      icon: 'storage',
    },
    {
      title: 'Software catalog',
      description: 'Build a unified SDLC view by modeling data from across your ecosystem. Define a data model that fits your organization to reduce cognitive load and maintain a single, consistent source of truth.',
      demoUrl: 'https://showcase.port.io/service_catalog',
      icon: 'lists',
    },
    {
      title: 'Actions',
      description: 'Drive developer productivity and reduce drift by standardizing operations and eliminating knowledge gaps through pre-configured actions like scaffolding a service or provisioning a cloud resource.',
      demoUrl: 'https://showcase.port.io/self-serve',
      icon: 'bolt',
    },
    {
      title: 'AI agents',
      description: 'Build your own agents to reduce manual engineering work. Define their goals, access and tools to boost performance and stay in control.',
      demoUrl: 'https://showcase.port.io/organization/home',
      icon: 'stars_2',
    },
    {
      title: 'Workflow orchestrator',
      description: 'Build any flow using automation. Automatically respond to events in your software catalog such as TTL=0 or service degradation. Infuse AI into any workflow to accelerate delivery and eliminate manual effort.',
      demoUrl: 'https://showcase.port.io/settings/automations',
      icon: 'play_circle',
    },
    {
      title: 'Scorecards',
      description: 'Define software standards and know they are met. Ensure quality, security, compliance, and velocity for all software catalog components.',
      demoUrl: 'https://showcase.port.io/serviceEntity?identifier=authentication&activeTab=1',
      icon: 'military_tech',
    },
    {
      title: 'Interface designer',
      description: 'Build custom interfaces to track asset data, visualize trends, and analyze development performance. Customize each stakeholder’s experience to match their daily work.',
      demoUrl: 'https://showcase.port.io/engineering_overview',
      icon: 'design_services',
    },
    {
      title: 'Access controls',
      description: 'Define granular access control for everything in Port. Ensure that only authorized users have access to the information they need to do their jobs.',
      demoUrl: 'https://showcase.port.io/settings/users',
      icon: 'manage_accounts',
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