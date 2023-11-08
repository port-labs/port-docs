---
sidebar_position: 4
sidebar_label: Visualize services' k8s runtime
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Visualize your services' k8s runtime

This guide takes 7 minutes to complete, and aims to demonstrate the value of Port's integration with Kubernetes.

:::tip Prerequisites

- This guide assumes you have a Port account and a basic knowledge of working with Port. If you haven't done so, go ahead and complete the [quickstart](/quickstart).

- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/).

- [Helm](https://helm.sh/docs/intro/install/) - required to install Port's Kubernetes integration.

:::

### The goal of this guide

In this guide we will model and visualize out services' Kubernetes resources.

After completing it, you will get a sense of how your organization's daily routine could look like:

- Developers will be able to easily view the health and status of their services' K8s runtime.
- Platform engineers will be able to create custom views and visualizations for different stakeholders in the organization.
- R&D managers will be able to track any data about services' K8s resources, using tailor-made views and dashboards.

### Install Port's Kubernetes exporter

1. Go to your [Port application](https://app.getport.io/), hover over the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.

2. Replace `CLIENT-ID` and `CLIENT-SECRET` in the following snippet, then copy it and run it in your terminal:

```bash showLineNumbers
export CUSTOM_BP_PATH="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/blueprints/lean_kubernetes_usecase_bps.json"
export CONFIG_YAML_URL="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/full-configs/lean_kubernetes_usecase.yaml"
export CLUSTER_NAME="my-cluster"
export PORT_CLIENT_ID="CLIENT-ID"
export PORT_CLIENT_SECRET="CLIENT-SECRET"
curl -s https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/install.sh | bash
```

The Kubernetes exporter is now installed 🚀

- In your [Builder](https://app.getport.io/dev-portal/data-model), you will see 3 new blueprints that represent Kubernetes resources.
- In your [Software catalog](https://app.getport.io/services), you will see a new page for each blueprint containing your resources, filled with data from your Kubernetes cluster.

### Connect your services to their workloads

Now that we have our blueprints set up, we will relate the `Service` blueprint to the `Workload` blueprint. In this guide we will create one relation named `Prod_runtime` which will represent the production environment of a service. In a real-world setting, we could have another relation for our staging environment, for example.

1. Go to your [Builder](https://app.getport.io/dev-portal/data-model), expand the `Service` blueprint, and click on `New relation`.

2. Fill out the form like this, then click `Create`:

<img src='/img/guides/k8sCreateRelation.png' width='50%' />

When looking at a `Service`, some of its `Workload` properties may be especially important to us, and we would like to see them directly in the `Service's` context. This can be achieved using [mirror properties](https://docs.getport.io/build-your-software-catalog/define-your-data-model/setup-blueprint/properties/mirror-property/), so let's create some:

3. The first one will be the workload's health. Under the relation we just created, click on `New mirror property`:

<img src='/img/guides/k8sCreateMirrorProp.png' width='50%' />

4. Fill the form out like this, then click `Create`:

<img src='/img/guides/k8sCreateMirrorPropHealth.png' width='50%' />

5. Create another mirror property and fill the form out like this, then click `Create`:

### Map your workloads to their services

Our services now have properties related to their workload, but we need to specify which `workload` belongs to which `service`. This can be done manually, or via the mapping by using a convention of your choice.

_Remember the deployment we created in the previous step? This is its time to shine_

In this guide, our `workloads` will have an identifier in the format of `{workload-name}-{workload-kind}-{namespace}-{cluster-name}`. The convention we will use is: a `service` with the same identifier as `{workload-name}` will have its `Prod-runtime` property automatically filled with the matching `workload`.  
Let's see how to achieve this:

1. Copy the following
   For simplicity's sake, we will only use the `Deployment` kind.

- rollout - `kubectl rollout restart deploy/port-k8s-exporter -n port-k8s-exporter`

### Visualize your Kubernetes runtime

### Possible daily routine integrations

- Send a slack message in the R&D channel to let everyone know that a new service was created.
- Send a weekly/monthly report for managers showing all the new services created in this timeframe and their owners.

### Conclusion

Creating a service is not just a periodic task developers undertake, but a vital step that can occur on a monthly basis. However, it's crucial to recognize that this is only a fragment of the broader experience that we're striving to create for developers.  
Our ultimate goal is to facilitate a seamless transition from ideation to production. In doing so, we aim to eliminate the need for developers to navigate through a plethora of tools, reducing friction and accelerating the time-to-production.  
In essence, we're not just building a tool, but sculpting an ecosystem that empowers developers to bring new features to life with utmost efficiency.

More guides & tutorials will be available soon, in the meantime feel free to reach out with any questions via our [community slack](https://www.getport.io/community) or [Github project](https://github.com/port-labs?view_as=public).
