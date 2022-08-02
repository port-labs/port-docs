---
sidebar_position: 2
---

# Self-Service Actions

Port allows you to define self-service actions, these actions make your Software Catalog **active**, meaning developers can use it to perform actions on their own, without the assistance or the need to wait for the DevOps teams.

Port enables an Active Software Catalog in 2 distinct ways:

- [Self-Service Actions](./setting-self-service-actions-in-port) - configure **Create** and **Delete** actions to provision and control the resource usage in your organization. Then, configure **Day-2 Operations** which allow you to keep your infrastructure up-to-date.
- [Real-time Changelog](./changelog-basic-change-listener-using-aws-lambda) - Every change that occurs in Port generates a new audit log entry, which you can listen to and react to (emergency maintenance, upscale a service, resolve an issue, etc...)
