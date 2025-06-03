---
title: Getting Started with Port
description: Master the fundamentals of Port and learn how to build your first software catalog
courseId: getting-started-101
level: Beginner
duration: 45 minutes
prerequisites: None
---

# Getting Started with Port

<div className="course-metadata">
  <div className="course-stats">
    <div className="stat-item">
      <div className="stat-icon">⏱️</div>
      <div className="stat-content">
        <span className="stat-label">Duration</span>
        <span className="stat-value">45 minutes</span>
      </div>
    </div>
    <div className="stat-item">
      <div className="stat-icon">📚</div>
      <div className="stat-content">
        <span className="stat-label">Modules</span>
        <span className="stat-value">3</span>
      </div>
    </div>
    <div className="stat-item">
      <div className="stat-icon">🎯</div>
      <div className="stat-content">
        <span className="stat-label">Track</span>
        <span className="stat-value">Developer</span>
      </div>
    </div>
  </div>
</div>

## Prerequisites

:::info Before you begin
This course is designed for developers and technical team members who want to create and manage a software catalog. While no prior experience with Port is required, the following will help you get the most out of this course:
:::

### Required Prerequisites
- Access to a Port account (you can [sign up for free](https://app.getport.io/signup))
- Basic understanding of software development concepts
- Familiarity with web browsers and modern development tools

### Recommended Prerequisites
- Basic knowledge of YAML/JSON (for blueprint definitions)
- Understanding of software architecture concepts
- Experience with developer tools and APIs

### Helpful but Optional
- Experience with software cataloging tools
- Knowledge of microservices architecture
- Familiarity with Git and version control

## Course Overview

Welcome to your journey with Port! This course will guide you through the essential concepts and practical steps to get started with Port's software catalog platform. By the end of this course, you'll have a solid foundation and be ready to build your first software catalog.

:::tip What you'll learn
- Understanding Port's core concepts and terminology
- Setting up your first software catalog
- Creating and managing blueprints
- Adding your first entities
- Basic catalog navigation and search
- Best practices for getting started
:::

## Course Modules

### Module 1: Introduction to Port (10 minutes)

:::info Core Concepts
Port is a developer portal that helps you create a comprehensive software catalog. Think of it as a single source of truth for all your software assets, services, and resources.
:::

#### What is a Software Catalog?

A software catalog is a centralized inventory of all your software assets, including:
- Microservices and applications
- Infrastructure components
- APIs and endpoints
- Documentation and runbooks
- Team ownership and responsibilities

#### Why Use Port?

Port provides several key benefits:
1. **Centralized Knowledge**: All your software assets in one place
2. **Improved Visibility**: Clear understanding of your software landscape
3. **Better Collaboration**: Shared context for all team members
4. **Automated Updates**: Keep your catalog in sync with your actual infrastructure
5. **Developer Experience**: Self-service access to critical information

#### Key Use Cases

Port helps you:
- Onboard new team members faster
- Track service dependencies
- Manage technical documentation
- Monitor service health
- Enforce best practices
- Automate compliance reporting

#### Port's Architecture

Port's architecture consists of three main components:
1. **Blueprints**: Define the structure of your catalog items
2. **Entities**: The actual catalog items (services, applications, etc.)
3. **Relationships**: Define how different entities are connected

### Module 2: Setting Up Your Environment (15 minutes)

:::caution Prerequisites
Before starting this module, ensure you have:
- Access to a Port account
- Required permissions in your organization
- Basic understanding of YAML/JSON
:::

#### Creating Your Port Account

1. Visit [app.getport.io/signup](https://app.getport.io/signup)
2. Choose your authentication method (GitHub, Google, or email)
3. Complete the onboarding process
4. Set up your organization profile

#### Understanding the Port Interface

The Port interface consists of several key areas:
- **Dashboard**: Overview of your catalog
- **Blueprints**: Define and manage your catalog structure
- **Entities**: View and manage your catalog items
- **Settings**: Configure your workspace
- **API**: Access Port programmatically

#### Configuring Your Workspace

1. **Organization Settings**
   - Set your organization name and logo
   - Configure authentication methods
   - Set up team roles and permissions

2. **Workspace Configuration**
   - Choose your default view
   - Set up notifications
   - Configure integrations

3. **Initial Setup**
   - Create your first blueprint
   - Set up basic entity types
   - Configure default views

#### Setting Up Initial Integrations

Port can integrate with various tools:
- **Git Providers**: GitHub, GitLab, Bitbucket
- **CI/CD Tools**: Jenkins, GitHub Actions, GitLab CI
- **Cloud Providers**: AWS, GCP, Azure
- **Monitoring Tools**: Datadog, New Relic, Grafana

### Module 3: Building Your First Catalog (20 minutes)

:::warning Best Practice
Start small and iterate! Begin with a few key blueprints and entities, then expand your catalog as you become more comfortable with Port's features.
:::

#### Creating Your First Blueprint

1. **Define Blueprint Properties**
   ```yaml
   identifier: service
   title: Service
   properties:
     - identifier: name
       type: string
       title: Name
     - identifier: description
       type: string
       title: Description
     - identifier: owner
       type: string
       title: Owner
   ```

2. **Add Required Fields**
   - Choose mandatory properties
   - Set validation rules
   - Define default values

3. **Configure Relationships**
   - Define entity connections
   - Set up dependency tracking
   - Configure ownership links

#### Adding Your First Entities

1. **Create a Service Entity**
   - Fill in basic information
   - Add documentation
   - Set up relationships

2. **Define Entity Properties**
   - Add custom properties
   - Set up calculated fields
   - Configure validation

3. **Link Related Entities**
   - Connect to other services
   - Define dependencies
   - Set up ownership

#### Understanding Relationships

Port supports various relationship types:
- **Ownership**: Who owns the service
- **Dependencies**: What other services this depends on
- **Documentation**: Links to relevant docs
- **Monitoring**: Associated dashboards and alerts

#### Basic Catalog Navigation

1. **Using the Search**
   - Full-text search
   - Property filters
   - Relationship queries

2. **Viewing Entities**
   - List view
   - Card view
   - Table view
   - Custom views

3. **Managing Updates**
   - Manual updates
   - Automated sync
   - Change history

## Hands-on Exercises

Each module includes practical exercises to reinforce your learning:

1. **Create a Service Blueprint**
   - Define a basic service blueprint
   - Add required properties
   - Set up relationships
   - Test the blueprint

2. **Add Catalog Entities**
   - Create a new service
   - Add documentation
   - Set up monitoring links
   - Configure ownership

3. **Set Up Relationships**
   - Connect services
   - Define dependencies
   - Create ownership links
   - Test relationship queries

4. **Practice Navigation**
   - Use different views
   - Try advanced search
   - Filter and sort
   - Export data

## Additional Resources

- [Port Documentation](/)
- [Community Forums](https://community.getport.io)
- [API Reference](/)
- [Example Catalogs](/)

:::tip Next Steps
After completing this course, we recommend:
- Joining our [community forums](https://community.getport.io)
- Checking out our [example catalogs](/examples)
:::

## Course Completion

To complete this course:
1. Work through all modules
2. Complete the hands-on exercises
3. Take the final assessment
4. Receive your course completion certificate

<style>{`
  .course-metadata {
    margin: 2rem 0 3rem;
    padding: 2rem;
    background: var(--ifm-background-color);
    border: 1px solid black;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .course-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;

  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .stat-icon {
    font-size: 1.5rem;
    border: 1px solid black;
    padding: 0.75rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--ifm-color-emphasis-600);
    margin-bottom: 0.25rem;
  }

  .stat-value {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--ifm-color-primary);
  }

  .course-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .info-card {
    background: var(--ifm-background-color);
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid black;
  }

  .info-card h4 {
    color: var(--ifm-color-primary);
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

  .info-card p, .info-card ul {
    margin: 0;
    font-size: 0.95rem;
    color: var(--ifm-color-emphasis-700);
  }

  .info-card ul {
    padding-left: 1.25rem;
  }

  .tool-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tool-tag {
    background: black;
    color: var(--ifm-color-primary);
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .course-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .course-tag {
    background: black;
    color: var(--ifm-color-primary);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .course-stats {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .course-info-grid {
      grid-template-columns: 1fr;
    }
  }

  .course-header {
    margin-bottom: 2rem;
    padding: 1rem;
    background: black;
    border-radius: 8px;
  }

  .course-meta {
    display: flex;
    gap: 1rem;
  }

  .course-level, .course-duration {
    padding: 0.25rem 0.75rem;
    background: var(--ifm-color-primary);
    color: white;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .prerequisites-grid,
  .prerequisite-card,
  .prerequisite-card h4,
  .prerequisite-card ul,
  .prerequisite-card li,
  .prerequisite-card li:last-child,
  .course-cta,
  .course-cta .button {
    display: none;
  }
`}</style>
