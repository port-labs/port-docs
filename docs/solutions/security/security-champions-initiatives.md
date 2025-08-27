---
title: Security champions & initiatives
sidebar_position: 4
---

# Security champions & initiatives

The most successful security programs aren't built by security teams alone—they're built by turning every developer into a security champion. But scaling security culture across an organization is hard. Traditional approaches rely on mandatory training sessions, lengthy security checklists, and penalty-based compliance models that create friction between security and engineering teams.

The reality is that developers want to build secure software, but they're often overwhelmed by conflicting requirements, unclear guidance, and tooling that slows them down. The key is making security the easy choice through clear standards, automated guardrails, and recognition for security-positive behaviors.

![Security Champions Dashboard](/img/solutions/security/security_champions_dashboard.png)

## Why security champions programs fail

Most security champions programs start with good intentions but struggle with execution:

- **Lack of clear expectations**: Champions don't know what's expected of them beyond "promote security"
- **No measurable outcomes**: Success is defined by activities (training completed) rather than results (vulnerabilities reduced)
- **Tool friction**: Security tools create more work without providing clear value to developers
- **Recognition gaps**: Security champions get extra responsibilities but no career advancement or peer recognition
- **Sustainability issues**: Programs depend on a few enthusiastic volunteers who eventually burn out

## Scorecards and initiatives to set up success

Port transforms security champions programs from volunteer-driven initiatives into systematic, measurable, and sustainable cultural change programs. Here's how:

### Security scorecards that drive the right behaviors

Instead of abstract security requirements, use scorecards to define clear, measurable security standards:

#### Application security scorecard
Track the security practices that prevent vulnerabilities from reaching production:

- **Dependency management**: Are all dependencies up-to-date and vulnerability-free?
- **Secure coding practices**: Are security linters and SAST tools integrated into CI/CD?
- **Access controls**: Are proper authentication and authorization implemented?
- **Data protection**: Are sensitive data handling practices followed?
- **Security testing**: Are security tests included in the CI/CD pipeline?

#### Infrastructure security scorecard
Ensure the infrastructure supporting applications follows security best practices:

- **Network security**: Are proper network segmentation and firewall rules in place?
- **Identity and access management**: Are least-privilege principles enforced?
- **Encryption standards**: Are data encryption requirements met for data at rest and in transit?
- **Configuration management**: Are hardening standards applied consistently?
- **Monitoring and logging**: Are security events properly logged and monitored?

#### Operational security scorecard
Track the operational practices that prevent and respond to security incidents:

- **Incident response preparedness**: Are runbooks up-to-date and teams trained?
- **Vulnerability management**: Are vulnerabilities triaged and remediated within SLA?
- **Access review processes**: Are user access rights regularly reviewed and updated?
- **Backup and recovery**: Are backup procedures tested and recovery time objectives met?
- **Compliance documentation**: Are audit trails and documentation maintained?

:::tip Start with what teams can control
Design scorecards around practices that development teams can directly influence. Avoid metrics that depend on external factors or other teams' actions.
:::

### Security initiatives that create momentum

Transform scorecards from static compliance tools into dynamic improvement programs:

#### Progressive improvement campaigns
Instead of expecting teams to achieve 100% compliance immediately, create campaigns that focus on specific improvements:

- **"Zero Critical Vulnerabilities" initiative**: Focus all teams on eliminating critical-severity vulnerabilities from production services
- **"Secrets Management Adoption"**: Drive adoption of proper secrets management practices across all services
- **"Branch Protection Compliance"**: Ensure all production code repositories have proper branch protection rules enabled

#### Recognition and gamification
Make security improvements visible and rewarding:

- **Security champion leaderboards**: Track which teams are making the most security improvements
- **Achievement badges**: Recognize specific security milestones (first team to achieve 90% scorecard compliance)
- **Security improvement showcases**: Highlight teams that have made significant security improvements
- **Cross-team learning sessions**: Let high-performing teams share their security practices with others

### Security guardrails that prevent issues

Build security into your development platform so secure practices become the default choice:

#### Automated policy enforcement
Use Port's automation capabilities to enforce security policies without manual intervention:

- **Branch protection requirements**: Automatically enable branch protection on new repositories
- **Dependency vulnerability checking**: Block deployments with critical vulnerability dependencies
- **Secrets detection**: Prevent commits containing hardcoded secrets or API keys
- **Security scan gates**: Require passing security scans before production deployments

#### Self-service security tools
Make security tools accessible and easy to use through Port's self-service actions:

- **Security scan initiation**: Let developers trigger security scans on-demand
- **Vulnerability exception requests**: Provide clear workflows for requesting security exceptions
- **Security consultation requests**: Enable easy access to security team expertise
- **Compliance status checks**: Let teams check their compliance status before releases

## Putting security champions into practice

### Step 1: Identify and empower champions

Security champions should represent each development team and have the influence to drive change:

- **Selection criteria**: Choose developers who are respected by their peers and interested in security
- **Time allocation**: Provide dedicated time for security champion activities (typically 10-20% of their role)
- **Training and development**: Invest in security training and certification for champions
- **Career progression**: Include security champion contributions in performance reviews and promotion criteria

### Step 2: Define clear expectations and success criteria

Champions need to understand exactly what success looks like:

- **Specific responsibilities**: Code reviews for security issues, security training delivery, scorecard improvement facilitation
- **Measurable outcomes**: Team scorecard scores, vulnerability remediation times, security training completion rates
- **Support structure**: Regular champion meetings, access to security team expertise, escalation procedures
- **Recognition programs**: Public acknowledgment, conference speaking opportunities, internal awards

### Step 3: Implement security scorecards

Start with a focused set of security standards that are achievable and measurable:

- [Setup branch protection rules](/guides/all/setup-branch-protection-rules/) to ensure code review requirements
- [Track GitLab project maturity](/guides/all/track-gitlab-project-maturity-with-scorecards/) including security configurations
- Implement service-level security scorecards covering application, infrastructure, and operational security

### Step 4: Create continuous improvement cycles

Security is not a destination but a journey of continuous improvement:

- **Regular scorecard reviews**: Monthly team reviews of security scorecard performance
- **Initiative planning**: Quarterly planning sessions to identify security improvement initiatives
- **Cross-team sharing**: Regular forums for teams to share security practices and learnings
- **Retrospectives**: Post-incident reviews that focus on prevention and process improvement

:::caution Balance automation with human judgment
While automated guardrails are essential, make sure there are clear escalation paths for situations that require human judgment. Over-automation can create process bottlenecks.
:::

## Building sustainable security culture

### Make security everyone's job

The goal is to distribute security responsibility across the organization rather than centralizing it in a security team:

- **Embed security in existing processes**: Add security requirements to existing code review, deployment, and monitoring processes
- **Provide context-specific guidance**: Give developers security guidance relevant to their specific technology stack and use cases
- **Create learning opportunities**: Turn security incidents into learning experiences rather than blame sessions
- **Recognize security-positive behaviors**: Celebrate when teams proactively identify and fix security issues

### Measure culture change

Track metrics that indicate whether your security culture is improving:

- **Proactive security issue reporting**: Are teams finding and reporting security issues before external discovery?
- **Security training engagement**: Are teams actively participating in security training and education?
- **Cross-team collaboration**: Are teams sharing security practices and learnings with each other?
- **Security tool adoption**: Are teams voluntarily adopting security tools and practices beyond minimum requirements?

## Real-world success stories

Organizations using Port's security champions approach see remarkable improvements:

- **Reduction in security vulnerabilities** reaching production through proactive identification and remediation
- **Improvement in security training completion rates** through champion-led peer training programs  
- **Security exceptions are now self-served** through clear workflows and automated approval processes
- **Reduction in security-related deployment delays** through earlier security integration in development processes

## Success metrics for security champions programs

You'll know your security champions program is working when:

- **Champions are recognized as technical leaders** within their teams and across the organization
- **Security improvements happen organically** without constant prodding from the security team
- **Teams compete to achieve higher security scorecard scores** rather than treating compliance as a burden
- **Security incidents become learning opportunities** that strengthen practices rather than create blame cycles
- **New team members are mentored on security practices** by existing team members rather than just the security team

By combining clear expectations, measurable outcomes, and the right tooling, Port helps organizations build security champions programs that create lasting cultural change and measurably improve security posture.
