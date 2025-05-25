---
sidebar_position: 12
title: Security & Compliance
sidebar_label: Security & Compliance
sidebar_class_name: custom-sidebar-item sidebar-menu-security
---

# Security & Compliance

Port is an internal developer portal platform and as such we place the utmost importance on data security, privacy and compliance, so that you can trust that your security needs are met.

The goal of this document is to provide you with transparency as to Port's security policies and practices. 

Port uses a variety of industry-standard technologies and services to secure your data from unauthorized access, disclosure, use, and loss. All Port employees are trained on security practices during company onboarding and on an annual basis.

Security is managed by Port’s Chief Technology Officer and maintained by Port’s Security & DevOps team.

This document will outline the different measures, protocols, processes and methods we use to ensure that your data stays secure and highly available.

## Certifications and compliance

Port has obtained the following compliance certifications:

- SOC2 Type II
- ISO 27001:2022
- GDPR

It is always possible to receive a copy of these reports and certificates by contacting either info@getport.io or your Port account manager.

## Infrastructure and network security

### Physical access control

Port is hosted on [Amazon Web Services](https://aws.amazon.com/compliance/data-center/data-centers/) (AWS). AWS data centers feature state-of-the-art security and access controls, including extensive safeguards such as:

- Alarms
- CCTV recorded server rooms
- Perimeter fencing
- Intrusion detection system
- Biometrics and multi-factor authentication

AWS, as one of the largest cloud providers in the world and with multiple data centers spread all around the globe, has vast experience running enterprise-grade data centers that are responsible for a majority of the internet's traffic and infrastructure. As such, AWS is a trusted host for thousands of the world's leading enterprises.

Port employees do not have physical access to AWS data centers, servers, network equipment, or storage.

### Logical access control

Port is the assigned and sole administrator of its infrastructure on AWS. Only designated authorized Port operations team members have access to configure the Port infrastructure on an as-needed basis behind a multi-factor authenticated virtual private network.

Port uses a separate virtual private network for each of its environments, and enforces complete segregation between test, staging and production environments.

### Intrusion detection

Port uses [Amazon GuardDuty](https://aws.amazon.com/guardduty/) as its intrusion detection system (IDS). This system relies on both signature-based security and algorithm-based security to identify traffic patterns that are similar to known attack methods.

### Rate limiting and traffic control

Port uses [AWS WAF](https://aws.amazon.com/waf/) as its Web Application Firewall (WAF) solution. This is an additional security and control layer, added to the built-in Dos/DDoS protections that AWS provides out-of-the-box across its infrastructure.

AWS WAF protects Port's infrastructure both from well-known bot attacks, as well as defines custom rules that enforce [rate limiting](/docs/api-reference/rate-limits.mdx) and unwanted traffic control.

## Data security and privacy

### Data encryption

All data in Port's servers is encrypted at rest using AES-256bit encryption. AWS stores and manages data cryptography keys in its redundant and globally distributed Key Management Service ([AWS KMS](https://aws.amazon.com/kms/)). So, if an intruder were ever able to access any of the physical storage devices, the Port data contained therein would still be impossible to decrypt without the keys.

Encryption at rest also enables continuity measures like backup and infrastructure management without compromising data security and privacy.

Port exclusively sends data over HTTPS transport layer security (TLS) encrypted connections for additional security as data transits to and from the application, Port enforces TLS v1.2+ wherever applicable.

### Data segregation

Every Port account receives its own dedicated database for data storage, access to an account's database is possible only using a token generated from the account's API credentials, the generated token has permissions only to the database of the customer.

Customer data is never transferred or stored on employee machines or devices.

### Data retention

Data ingested into Port by its users is managed by them, and if not deleted by the user, will be retained indefinitely.

Port's audit log which tracks any catalog, data model, action, automation and configuration changes has a data retention of 1 year by default.

Sign-in and account access logs are retained for 30 days.

### Data removal

When a customer terminates their contract or explicitly asks for a deletion of their account and its data, all data related to the account including blueprints, entities, actions, automations, runs, users, teams and more is deleted along with the account itself and becomes inaccessible to the customer. The data is retained for 14 days as part of the backup process utilized by Port, after 14 days the data is also removed from the backups, and can no longer be retrieved.

Data can also be deleted upon request and via Port’s REST API and UI.

### Handling PII

Port is meant to store infrastructure metadata, and as such does not collect or utilize any PII.

The only PII Port requires for its operation is:

- First name
- Last name
- Email address

These pieces of information are required to authenticate users and sign them in to the Port system, and are not used except for user authentication.

## Business continuity and disaster recovery

### High availability

Every part of the Port service uses properly-provisioned, redundant servers (e.g., multiple load balancers, web servers, replica databases) in the case of failure. As part of regular maintenance, servers are taken out of operation without impacting availability.

### Business continuity

Port has a formal business continuity plan for extended service outages caused by unforeseen or unavoidable disasters in an effort to restore services to the widest extent possible in a reasonable time frame. Port has documented a set of disaster recovery policies and procedures to enable the recovery or continuation of vital technology infrastructure and systems following a disaster.

Port keeps hourly encrypted backups of data in multiple regions on AWS. While never expected, in the case of production data loss (i.e., primary data stores lost), we will restore organizational data from these backups.

Port's BCP policy is available upon request.

### Disaster recovery

In the event of a region-wide outage, Port has a documented protocol outlining the steps to deploy a duplicate environment of Port in a different AWS region. The Port operations team undergoes an annual DR simulation to ensure the process is up to date and aligns with the latest innovations in Port.

## Data flow

### Data into the system

Data can be sent to Port through a variety of sources and interfaces - through its API, Ocean integrations, Git provider apps, using webhooks and more.

Data is always sent to Port using push methods, and Port never independently makes outbound requests to your infrastructure or environment to get and query information that will be ingested.

All ways of ingesting data into Port ensure that data is encrypted at rest and in transit, and any request that sends data to Port must be authenticated in order to get accepted and be processed by the system.

### Data out of system

Data ingested into Port can be accessed via Port's user interface and REST APIs.

Port will never make an outbound request to your infrastructure or environment in order to pull information.

To trigger self-service actions and automations, Port supports a variety of backends that determine how the action or automation request is sent to your infrastructure.

For organizations with stringent security standards, there is an option to listen to action triggers by listening to messages coming in from a Kafka topic provided to you by Port, or you can use Port's agent, which is hosted on your premises and listens to the topic on your behalf in order to forward it to the correct destination internally. These two solutions make it possible to receive action triggers without opening any inbound network connectivity to your infrastructure.

Aside from those, Port also supports other backends such as webhooks which make it possible for Port to directly make a request to your environment and trigger your backend, should you choose to do so.

No matter what backend you choose to trigger self-service actions or automations, Port attaches security headers to each trigger request, making it easy to validate Port's identity and ensure that the request originated from Port.

## Applications and integrations

### Applications

Port provides native applications for GitHub and Bitbucket which seamlessly integrate with the Git providers to ingest information and keep an up-to-date catalog available in Port. These integrations use OAuth 2.0 for authentication and permissions to your Git provider.

As part of the installation of Port's Git provider apps, the apps gain a limited set of permissions ([GitHub](/docs/build-your-software-catalog/sync-data-to-catalog/git/github/github.md#permissions), [Bitbucket](/docs/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/bitbucket.md#permissions)). In addition, it is possible to selectively authorize access to a limited set of repositories.

By default the Git integrations will not ingest any source code, and will only search for `README.md` files specifically. It is possible to configure the apps to not ingest any source code files at all, or to ingest additional files that are relevant to your use case.

### Open source integrations

Port provides a variety of open source integrations for different use cases, such as the K8s exporter and Port agent. These integrations are completely open source and you have the option to view the source code on GitHub. In addition, these integrations are fully customizable and are deployed on your premises, so they do not require opening inbound network connectivity to your infrastructure or providing any secrets or credentials to Port.

### Ocean framework integrations

Port develops and maintains the Ocean framework, which is a custom open source framework used to make it easy to develop new integrations for Port.

The Ocean framework and all first party integrations are fully open source. You also have the option to develop new integrations on your own and either use them internally or contribute them back to the Ocean project for the benefit of all Port users.

Ocean integrations are packaged in container images, so they support any containerized runtime to deploy and run them, they can be hosted on your premises or even run as part of your CI/CD process.

Deploying and running an Ocean integration on premises ensures there is no need to open inbound network connectivity to your infrastructure or provide any secrets or credentials to Port.

Ocean integrations act as a proxy between Port and your environment, securely handling outbound connections, encrypting data during transit and deliberately controlling the access Port has to your data. Sensitive credentials stay behind your firewall.

Ocean integrations work by querying the data source (either an internal resource or a third-party service), parsing and modifying the data according to the user configuration, and then sending the resulting entries directly to Port. This means Port only receives the end result, and all data is processed on your premises. Ocean integrations come built in with PII and secret keys scrubbing and masking capabilities. Combined with the on premises data processing, this methodology gives you confidence that no secret or confidential information leaves your premises.

### Port hosted integrations

For some third-party services, a Port hosted integration option is available. In this deployment type, the integration is hosted and managed on Port's infrastructure, removing the need to personally host, manage and maintain the integration on your premises.

While this deployment method does require providing an access token to the relevant third-party service in order for the integration to work, it still provides the same level of security and customizability that all Ocean integrations provide.

When an integration is hosted by Port, it is deployed on Port's infrastructure and makes calls to the third-party service, receives the results, processes the data according to the integration configuration, and then sends the processed results to Port. While this does mean data is processed outside of your premises, there is still complete separation between the integration and Port itself, meaning an additional layer of protection that prevents completely unprocessed data from making its way to your Port account.

## Application security

### Multi-factor authentication

In addition to password login and social login, multi-factor authentication (MFA) provides an added layer of security to Port. We encourage MFA as an important step towards securing data access from intruders. When integrating Port with your SSO provider, you automatically benefit from the policies and MFA protection provided by your SSO.

### Single sign-on (SSO)

Port integrates with all major [SSO providers](/docs/sso-rbac/sso-rbac.md), allowing you to seamlessly import users and teams, and also exposing Port to your organization in a managed manner.

Port supports SSO using the OIDC protocol and the SAML 2.0 protocol, and as such supports all modern Identity Providers.

### REST API authentication

Port's REST API uses a [JWT auth token](/docs/build-your-software-catalog/custom-integration/api/api.md#get-api-token) for authentication. The token is generated by making an authentication request using a unique Client ID and Client Secret.

The authentication tokens are passed using the authorization header and are used to authenticate with the API.

### Vulnerability remediation

Port uses code dependency and container vulnerability scanning tools to scan, detect and remediate any vulnerabilities in the code libraries and packages used to provide the Port product. In addition, Port uses Static Application Security Testing (SAST) to detect and remediate any security vulnerabilities in Port's source code.

When a vulnerability is detected, it is handled based on its classified severity according to the following timeline:

- Critical: up to 2 days
- High: up to 7 days
- Medium: up to 45 days
- Low: up to 90 days

### Secure application development (application development lifecycle)

Port practices continuous delivery, which means all code changes are committed, tested, shipped, and iterated on in a rapid sequence. A continuous delivery methodology, complemented by pull request, continuous integration (CI), and automated error tracking, significantly decreases the likelihood of a security issue and improves the response time and the effective eradication of bugs and vulnerabilities. Release notes and details for Port releases can be found in the [changelog](https://roadmap.getport.io/changelog).

### Secret storage and handling

Port does not require sharing and storing any secrets with it. Port does allow for secret storage in order to improve ease of use and enable specific features and use cases, however those features can always be implemented in alternative ways that do not require sharing secrets with Port.

Any and all secrets shared with Port are encrypted both at rest and in transit. Once they are saved into the system, their value cannot be retrieved directly, it will only be used and referenced as specified by the user. A customer's secrets are completely isolated from another's at both the data storage layer and the access permissions layer.

## Corporate security

### Malware protection

At Port, we believe that good security practices start with our own team, so we go out of our way to protect against internal threats and local vulnerabilities. All company-provided workstations are enrolled in Endpoint Detection and Response (EDR) solutions to enforce security settings including full-disk encryption, and OS updates.

### Security policies

Port security policies are updated on an ongoing basis and reviewed annually for gaps. An overview of specific security policies is available to Port enterprise customers upon request:

- Access Management
- Backup Management
- Change Management
- Data Retention Management
- Information Security
- Incident Response
- Risk Management
- Vulnerability Management
- BCP and DR

### Security training

All new employees receive onboarding and systems training, including environment and permissions setup, formal software development training (if pertinent), security policies review, company policies review, and corporate values and ethics training.

All employees additionally complete security training at least once a year. Policies presented to employees as part of the onboarding process are reviewed once a year to ensure we are keeping up with best practices.

### Disclosure Policy

Port will notify customers of any data breaches as soon as possible via email and the primary contact channel, followed by multiple periodic updates throughout each day addressing progress and impact. Port Enterprise plans include a dedicated customer success manager who holds responsibility for customer communication, as well as regular check-ins and escalations.

Port maintains a live report of operational uptime and issues on our [status page](https://port.statuspage.io). Anyone can subscribe to updates via email from the status page. Any known incidents are reported there.

## Vulnerability disclosure

Anyone can report a vulnerability or security concern with Port by contacting security@getport.io and including a proof of concept, a list of tools used (including versions), and the output of the tools. We take all disclosures very seriously, and once we receive a disclosure we rapidly verify each vulnerability before taking the necessary steps to fix it.

## Penetration testing

Port undergoes annual penetration testing conducted by an independent, third-party agency. As part of the test, Port provides the agency with an isolated environment of Port and a high-level diagram of the application architecture. No customer data is exposed to the agency through penetration testing.

Information about any security vulnerabilities successfully exploited through penetration testing is used to set mitigation and remediation priorities. A summary of penetration test findings is available to customers upon request.

## Privacy policy

You can find Port's privacy policy [here](https://www.getport.io/legal/privacy-policy).

## Data protection addendum

You can find Port's DPA [here](https://www.getport.io/legal/dpa).
