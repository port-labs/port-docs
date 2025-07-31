---
sidebar_position: 3
---

### 1. Benchmarking against OWASP Top 10

Benchmarking repositories against the **OWASP Top 10** helps evaluate application code quality and security posture by scanning for patterns, vulnerabilities, and anti-patterns that map to the most critical web application security risks. This involves:

- **Automated Code Scanning** – Using static application security testing (SAST) tools to detect vulnerabilities such as injection flaws, insecure deserialization, and security misconfigurations.
- **Mapping Findings to OWASP Categories** – Aligning detected issues with OWASP Top 10 categories like *Broken Access Control*, *Cryptographic Failures*, and *Security Logging & Monitoring Failures*.
- **Establishing a Security Baseline** – Measuring the number, severity, and recurrence of OWASP-related findings across repositories.
- **Continuous Monitoring & Improvement** – Using scorecards to track improvements or regressions over time and guide remediation priorities through tiers.

For more information, visit the [detailed example page](/promote-scorecards/examples/Benchmarking%20against%20OWASP%20Top%2010)



### 2. Dora Metrics based on number of deployments

**DORA metrics** measure software delivery performance through key indicators such as:

- **Deployment frequency** – How often code is successfully released to production in a given timeframe (e.g., daily, weekly, monthly).
- **Lead time for changes** – How long it takes from code commit to production release.
- **Change failure rate** – The percentage of deployments causing failures in production.
- **Mean time to restore (MTTR)** – How quickly teams recover from production failures.

When calculated based on the **number of deployments**, the emphasis is on **deployment frequency**, providing insight into team velocity, release cadence, and progress toward industry benchmarks.

For more information, visit the [detailed example page](/promote-scorecards/examples/Dora%20metrics%20based%20on%20number%20of%20deployments)


### 3. Ensure relation existence

**Ensuring relation existence** verifies that key relationships between entities in your system are properly established and maintained. This includes checking that:

- **Dependencies** – Services to databases, APIs to endpoints, etc., are correctly linked.
- **References** – Such as user-to-permission mappings, exist and are valid.
- **No orphaned records** – Preventing unused or unlinked resources.
- **No broken dependencies** – Avoiding failures due to missing or misconfigured relationships.

This helps maintain system integrity, avoid configuration drift, and ensure smooth interoperability between components. For more information, visit the [detailed example page](/promote-scorecards/examples/Ensure%20relation%20existence)



### 4. Ownership scorecard

An **ownership scorecard** evaluates how clearly and effectively ownership is defined and maintained for repositories. It measures indicators such as:

- **Active code owners** – Individuals or teams assigned and actively maintaining the repository.
- **Up-to-date documentation** – Clear, accurate, and regularly updated README and contribution guidelines.
- **Responsive maintainers** – Owners who respond promptly to issues, pull requests, and support requests.
- **Clear escalation paths** – Documented process for handling urgent or critical incidents.

A strong ownership scorecard ensures *accountability*, improves *collaboration*, accelerates *incident resolution*, and fosters long-term *repository health*. For more information, visit the [detailed example page](/promote-scorecards/examples/Ownership%20Scorecard)