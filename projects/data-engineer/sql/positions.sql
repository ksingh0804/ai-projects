-- mart_positions: net position per account x symbol x date (USD-normalized gross notional).
-- Equivalent to the dbt model materialized by pipelines/transform_transactions.py.
SELECT
    account,
    symbol,
    trade_date                AS date,
    SUM(signed_qty)           AS net_qty,
    SUM(ABS(notional_usd))    AS gross_notional_usd
FROM stg_transactions
WHERE account IS NOT NULL          -- null-account trades are quarantined upstream
GROUP BY account, symbol, trade_date;
