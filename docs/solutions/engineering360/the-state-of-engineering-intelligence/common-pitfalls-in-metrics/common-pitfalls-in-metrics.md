# Common Pitfalls in Engineering Metrics

Collecting engineering metrics is easy; using them correctly is hard. Many organizations fall victim to **misused or “vanity” metrics** that create a false sense of progress. A classic example is measuring **lines of code written** – this number can grow while actual productivity or code quality declines. In fact, more code can signal inefficiency, and focusing on LOC incentivizes developers to write unnecessary code. Similarly, **commit frequency** or **pull request counts** might seem like useful measures of output, but taken alone they tell little about real value delivered. Developers can game these metrics (for instance, by making many trivial commits) without improving the product. As one engineering blog summarized, these kinds of metrics all share a flaw: they measure output and pretend it equals productivity – which simply “doesn't work” in creative endeavors like software.


Another pitfall is often encountered with metrics programs. This warns that “when a measure becomes a target, it ceases to be a good measure.” Teams that fixate on hitting a number may **optimize for the metric at the expense of actual outcomes**. For example, if leadership mandates an increase in deployment frequency without regard to quality, teams might push more releases but introduce more bugs – hitting the frequency target while harming stability. We’ve seen cases where story point velocities are boosted (developers inflate estimates to look productive) or test counts go up (by writing trivial tests) just to satisfy a dashboard. **The wrong focus leads to negative consequences**, as teams chase numbers instead of true business impact.


Over-measuring and over-analysis pose further risks. **Too many metrics** can confuse priorities – teams drown in data but can’t see which issue to tackle first. Metrics are also easily **misinterpreted** without context. A team with a low change failure rate, for instance, might look “good” until you realize they deploy so infrequently that they’re not testing anything. **Aggregated scores** (like single composite metrics) are especially suspect, as they obscure underlying factors and can be misleading.


**Real-world examples of metrics gone wrong abound**. One cited instance is when a company rewarded teams purely on ticket closure rates – only to find issues being split into many trivial tickets to boost counts, while actual customer satisfaction dropped. In another case, a dev team set a goal to reduce mean time to recovery (MTTR) for incidents; they met it by reclassifying severe outages as lower priority incidents (so they weren’t counted in MTTR), thus “improving” the metric on paper while users still suffered downtime.


**How can teams avoid these pitfalls?** Port recommends a few guiding practices:

- **Focus on Actionable Metrics**: Every metric tracked should drive a decision or change. If a number won’t alter any behavior, it’s likely not worth obsessing over. Metrics must drive decisions, not exist for their own sake.

- **Balance Quantitative with Qualitative**: To get the full picture, combine the numbers with developer feedback. This prevents blind spots – for example, pairing deployment stats with a survey on developer morale can reveal if faster releases are burning out the team.

- **Provide Context**: Always interpret metrics in context. Instead of viewing any single number in isolation, look at trends and related metrics (e.g. a dip in deployment frequency alongside an uptick in incidents). This holistic approach guards against the tunnel vision.

- **Avoid Vanity and Composite Scores**: Favor metrics that reflect true outcomes (customer value, reliability) over those that are easy to game. If you use composite indices, regularly revisit their components to ensure they remain relevant.

- **Continuous Review and Adaptation**: Metrics programs aren’t “set and forget.” Periodically re-evaluate what you measure. As your teams and product evolve, ensure your metrics still align with your goals and aren’t incentivizing the wrong behaviors.

By sidestepping these common pitfalls, engineering organizations can ensure their metrics programs genuinely support improvement. The goal is to shine a light on reality – even when it’s uncomfortable – and then take action, rather than to paint a rosy picture with meaningless numbers.