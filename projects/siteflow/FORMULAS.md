# SiteFlow formulas

Learn these before you write any agent code. Every number an interviewer can check by hand should come from one of these.

## Economic order quantity (EOQ)

```
EOQ = sqrt(2 * D * S / H)
```

| Symbol | Meaning | Unit |
|--------|---------|------|
| D | Annual demand | units per year |
| S | Cost to place one order (setup / order cost) | dollars per order |
| H | Cost to hold one unit for one year | dollars per unit per year |

Derived values, after EOQ is known:

```
orders_per_year = D / EOQ
days_between_orders = 365 * EOQ / D
annual_ordering_cost = (D / EOQ) * S
annual_holding_cost = (EOQ / 2) * H
total_relevant_cost = annual_ordering_cost + annual_holding_cost
```

At the true EOQ, annual ordering cost and annual holding cost are equal. That is the check.

Rules:

- D, S, and H must all be greater than 0.
- If the user does not give S, do not invent it. Ask for the order cost.
- Round the displayed EOQ to 2 decimal places. Keep the full square root internally when you divide.

Worked example you will be asked:

```
D = 12000 rebar units per year
S = 50 dollars per order
H = 4 dollars per unit per year

EOQ = sqrt(2 * 12000 * 50 / 4)
    = sqrt(1,200,000 / 4)
    = sqrt(300,000)
    = 547.72
orders_per_year = 12000 / 547.72 = 21.91
annual_ordering_cost = 21.91 * 50 = 1095.50
annual_holding_cost = (547.72 / 2) * 4 = 1095.44
```

The two costs match within rounding. That is how you know the formula is right.

## Safety stock (demand varies, lead time is a single number)

This is the formula in Project 2 and the formula SiteFlow v1 implements.

```
safety_stock = z * demand_std * sqrt(lead_time)
```

| Symbol | Meaning |
|--------|---------|
| demand_std | Standard deviation of demand **per period** |
| lead_time | Lead time measured in the **same** period |
| z | Service-level factor from the table below |

`demand_std` and `lead_time` must be greater than or equal to 0. `z` must be greater than 0.

If someone says “std is 20 per week” and “lead time is 9 days”, stop. The periods do not match. Convert both to days or both to weeks before you multiply.

| Cycle service level | z |
|---------------------|---|
| 90% | 1.28 |
| 95% | 1.65 |
| 97.5% | 1.96 |
| 99% | 2.33 |

Default z when the user says “about 95%” and does not give a number: **1.65**.

Worked example:

```
demand_std = 20 units per day
lead_time = 9 days
z = 1.65

safety_stock = 1.65 * 20 * sqrt(9)
             = 33 * 3
             = 99 units
```

## Reorder point

```
reorder_point = average_demand_per_period * lead_time + safety_stock
```

Worked example, same 9-day lead time:

```
average demand = 100 units per day
lead time demand = 100 * 9 = 900
reorder_point = 900 + 99 = 999 units
```

SKU status, same rule as Project 2:

```
status = REORDER    if on_hand < reorder_point
status = OK         otherwise
```

## Safety stock when lead time also varies

Say this in an interview. Do not code it until someone gives you a standard deviation of lead time.

```
safety_stock = z * sqrt(lead_time * demand_std^2 + average_demand^2 * lead_time_std^2)
```

SiteFlow v1 does not use this. The CSV has one `lead_days` value, not a spread of lead times.

## Retrieval settings (not a cost formula, still memorize)

```
chunk_size = 680 characters
chunk_overlap = 100 characters
k = 4 chunks returned to the spec agent and the risk agent
```

680 and 100 are the settings that already worked on Project 2. k = 4 is the SiteFlow spec.

## What “correct citation” means

A citation is correct when:

- the file title is one of the retrieved chunks, and
- the page or section matches that chunk, and
- the snippet actually contains the fact you stated.

Precision: of the citations you showed, how many are correct.

Recall: of the facts in the gold answer, how many appear in your citations.

You score this by hand on 12 questions. You do not need a model to grade a model on the first version.
