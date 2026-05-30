-- Data-quality checks expressed as SQL (the Python suite in pipelines/data_quality.py
-- runs the same assertions). Each query should return 0 rows when healthy.

-- 1) Non-positive close prices
SELECT symbol, date, close FROM raw_market_data WHERE close IS NULL OR close <= 0;

-- 2) OHLC consistency
SELECT symbol, date FROM raw_market_data WHERE high < low OR high < close;

-- 3) Duplicate (symbol, date)
SELECT symbol, date, COUNT(*) c FROM raw_market_data
GROUP BY symbol, date HAVING c > 1;

-- 4) Duplicate trade_id
SELECT trade_id, COUNT(*) c FROM stg_transactions
GROUP BY trade_id HAVING c > 1;

-- 5) Trades missing account (quarantine candidates)
SELECT trade_id, ts FROM stg_transactions WHERE account IS NULL;
