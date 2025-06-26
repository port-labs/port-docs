# Balancing the Metrics

A critical concept with DORA metrics is that optimizing one should not mean sacrificing another. They are meant to be achieved in harmony. For example, simply cranking up Deployment Frequency without care can hurt CFR (more rushed changes = more failures). Likewise, obsessing over zero failures could slow you down (if teams become overly cautious or bureaucratic). The goal is to improve both velocity and stability together, which is a mark of true DevOps high performance. It’s better to deploy 100 times with 5 quick-to-recover failures, than to deploy 5 times with 1 failure that takes ages to fix. So watch these metrics as a set. Port’s dashboards allow you to see them side by side, and even overlay trends – for instance, see how a change in lead time correlates with change failure rate.

### Using DORA Metrics Effectively
When implemented well, DORA metrics can provide enhanced visibility and standardization for your engineering org. They give teams a common language (e.g., “We improved our lead time by 20%!” or “Our CFR is above industry benchmark, let’s address that.”). To avoid the pitfalls:

- **Use ranges/benchmarks wisely**: Google’s research provides benchmarks for Elite, High, Medium, Low performers for each metric. These are useful for goal-setting, but consider your context. Use them as inspiration, not strict grades.

- **Contextualize each metric**: Always discuss why a metric is at its level. The numbers should prompt questions and investigation. Port’s advantage is you can click through from a metric to related data (like from a high MTTR to see the actual incidents, their details, and even survey feedback about those incidents).

- **Drive conversations and actions**: Share DORA metrics with teams regularly (e.g., weekly or sprint reviews). When a metric moves in the wrong direction, treat it as a team problem to solve, not an individual blame. Perhaps set up a guild or task force to tackle cross-cutting issues affecting metrics.

- **Celebrate improvements**: When these metrics improve, recognize it! If you bring CFR down or lead time down, it usually means a lot of incremental improvements behind the scenes. Celebrating wins encourages teams to keep investing in DevOps practices.

- **Expand beyond DORA when ready**: DORA is a great starting point, but as Port often advises, once you’ve established a baseline, you may explore additional metrics. For example, pull request cycle time (mentioned earlier) or code review turnaround are not in DORA but extremely useful. We’ll cover custom metrics in the next page.


In summary, DORA metrics are popular for good reason: they are simple, outcome-focused, and empirically linked to high performance. By understanding their nuances and using them as part of a balanced scorecard, you can leverage them to significantly improve your engineering processes. Port’s Engineering360 natively supports DORA metric tracking and, importantly, helps you tie those metrics to actions – ensuring that a dip in a DORA metric triggers the right response, and an improvement is capitalized on to push even further.