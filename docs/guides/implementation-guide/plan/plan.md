import DocCardList from '@theme/DocCardList';

# Plan

*This section will walk users through designing a roadmap for the creation and management of their developer portal.*

### 1. Define Your Audience

Before building your developer portal, define the groups of people who will use it. Common audience categories include:

- Developers: For routine tasks, collaboration, documentation, and sharing resources.
- R&D managers: For monitoring and tracking the performance and metrics of APIs and services.

### 2. Define goals

Define initial goals, MVP user stories, and KPIs for your developer portal.  
Use Port's [live demo](https://demo.getport.io) to get inspired and identify some quick wins.

### 3. Define desired use cases

Determine what your portal will need to enable users to do. Some common use-cases include:

- SDLC management: For tracking the development lifecycle of services.
- Incident management: For tracking and resolving issues with services.
- API catalog: For monitoring the health and availability of an organization's APIs.
- Onboarding and tutorials: Step-by-step guides to help users get started quickly.
- Application security: For managing access control and security policies.

There are **many** other use-cases that you can implement in your developer portal, depending on your organization's needs. The key is to define these use-cases early on so that you can build your portal to support them.

For this step, we recommend to use Port's [roadmap planner](https://www.getport.io/roadmap-planner) to set and prioritize your user-stories.

### 4. Plan for Integration and Customization

1. List the tools and platforms in your tech stack that you want to ingest into your developer portal.  
Port offers a wide range of pre-built integrations for popular tools, but you can also build custom integrations using Port's API.

2. Define the data model for your developer portal. This includes:
   - The blueprints you will need to create, the relations between them, and the fields in each blueprint.
   - The metrics you wish to track for each blueprint.
   - The permissions and roles you want to define for each blueprint.
   - The self-service experiences you want to provide for each blueprint (for example, scaffolding a new service).
 
3. For Port's pre-built integrations, decide how you want to install them (hosted by Port/self-hosted/scheduled via CI).

### 5. Define Roles and Permissions

- Decide which permissions and privileges each member in your organization will have, thus assigning him/her a user role (admin/moderator/member).
- Define teams and their users.
- Define owners for different blueprints.
