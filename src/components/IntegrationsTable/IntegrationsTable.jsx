import React, { useState, useMemo } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useColorMode } from '@docusaurus/theme-common';
import styles from './styles.module.css';
import { integrations, categories } from './integrations-data';
import LogoImage from '/src/components/guides-section/LogoImage/LogoImage.jsx';

const IntegrationCard = ({ integration }) => {
  const { colorMode } = useColorMode();
  const iconPath = colorMode === 'dark' && integration.darkIcon 
    ? integration.darkIcon 
    : integration.icon;

  return (
    <Link to={integration.docsUrl} className={styles.card}>
      <div className={styles.cardHeader}>
        <LogoImage logo={integration.name} width='32px' />
        {/* <img 
          src={iconPath} 
          alt={integration.name} 
          className={`${styles.icon} not-zoom`}
          onError={(e) => {
            if (iconPath !== integration.icon) {
              e.target.src = integration.icon;
            }
          }}
        /> */}
        <h3>{integration.name}</h3>
      </div>
    </Link>
  );
};

export default function IntegrationsTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredIntegrations = useMemo(() => {
    // First filter by search query
    const searchResults = searchQuery
      ? integrations.filter(integration =>
          integration.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : integrations;

    // Then filter by category if not "all"
    return selectedCategory === 'all'
      ? searchResults
      : searchResults.filter(integration => integration.category === selectedCategory);
  }, [searchQuery, selectedCategory]);

  const getCategoryCount = (categoryValue) => {
    // For category counts, we only filter by search to show how many items match in each category
    const searchResults = searchQuery
      ? integrations.filter(integration =>
          integration.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : integrations;

    if (categoryValue === 'all') return searchResults.length;
    return searchResults.filter(integration => integration.category === categoryValue).length;
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <input
          type="text"
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.categories}>
          {Object.entries(categories).map(([label, value]) => (
            <button
              key={value}
              className={`${styles.categoryButton} ${selectedCategory === value ? styles.active : ''}`}
              onClick={() => setSelectedCategory(value)}
            >
              <span>{label}</span>
              <span className={styles.categoryCount}>{getCategoryCount(value)}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className={styles.mainContent}>
        <div className={styles.grid}>
          {filteredIntegrations.map((integration, index) => (
            <IntegrationCard key={index} integration={integration} />
          ))}
          {filteredIntegrations.length === 0 && (
            <div className={styles.noResults}>
              No integrations found matching your search criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 