---
sidebar_position: 3
---

# Set up scorecards & dashboards

## Define scorecards

[Scorecards](https://docs.port.io/promote-scorecards/) are configured per blueprint, and enable you to define and track metrics/standards for your entities, based on their properties.  
You can define multiple tiers within a scorecard, with different criteria for each tier.

Here is an example of a "Production readiness" scorecard that defines and measures criteria for a running service to be considered production-ready. As you can see, the service is compliant with one of two defined tiers:

<img src="/img/guides/implementation-guide/scorecard-example.png" width="100%" border="1px" />
<br/><br/>

Some additional examples include:

- **Production readiness**: define and measure criteria for a service to be considered production-ready.
- **API health**: track the availability, performance, and usage of your APIs.
- **Service health**: define what constitutes a healthy service and track its status.
- **Incidents**: Track the number of incidents, their severity, and resolution times.

Define scorecards for the blueprints you created as part of your MVP.  


## Create dashboards

[Dashboards](https://docs.port.io/customize-pages-dashboards-and-plugins/dashboards/) are a great way to visualize and track data from your software catalog.  
A dashboard can contain any number of widgets that display data relevant to your users.

We recommend creating dashboards for different personas in your organization to display data that is important to them.  
Some examples include: 
  - A dashboard for **developers** that displays their open pull requests and issues.  
  - A dashboard for **R&D managers** to track the performance of APIs and services.
  - A dashboard for **security teams** to track access control and security policies.
  - Port's live demo contains many dashboards that you can use as inspiration, for example:
    - The demo's [homepage](https://demo.getport.io/organization/home).
    - A developer's ["Plan my day" dashboard](https://demo.getport.io/plan_my_day).
    - A security ["Code alerts" dashboard](https://demo.getport.io/code_alerts).

Dashboards can be created/modified in 3 locations:
  - Your portal's homepage.
  - In a dashboard page in your software catalog.
  - In a specific entity page.

:::tip Static & dynamic filters
When creating certain widgets, you can define [**static filters**](/customize-pages-dashboards-and-plugins/dashboards/#chart-filters) to exclude specific data.

You can also define [**dynamic filters**](/search-and-query/#dynamic-properties) to display data relevant to the logged-in user.
:::

## Next step - create actions & automations

Once you have set up scorecards and dashboards, proceed to the [next step](/guides/implementation-guide/build/actions-and-automations) to create self-service actions and automations in your portal.