import yfinance as yf
from datetime import datetime, timezone as datetime_timezone, timedelta

def test_current_price_logic(ticker):
    ticker_obj = yf.Ticker(ticker)
    
    try:
        info = ticker_obj.fast_info
        curr_price = float(info['lastPrice'])
        prev_close = float(info['previousClose'])
        timezone = info.get('timezone', 'UTC')
        currency = info.get('currency', 'USD')
    except Exception as fe:
        print(f"fast_info failed: {fe}. Falling back to history.")
        hist = ticker_obj.history(period="2d")
        curr_price = float(hist['Close'].iloc[-1])
        prev_close = float(hist['Close'].iloc[-2]) if len(hist) > 1 else curr_price
        timezone = 'UTC'
        currency = 'USD'
        
    change = curr_price - prev_close
    pct_change = (change / prev_close) * 100 if prev_close != 0 else 0

    now_utc = datetime.now(datetime_timezone.utc)
    now_ist = now_utc.astimezone(datetime_timezone(timedelta(hours=5, minutes=30)))
    last_updated_ist = now_ist.strftime("%Y-%m-%d %H:%M:%S")

    print(f"Ticker: {ticker}")
    print(f"Current Price: {curr_price}")
    print(f"Change: {change}")
    print(f"Pct Change: {pct_change}%")
    print(f"Timezone: {timezone}")
    print(f"Currency: {currency}")
    print(f"Last Updated (IST): {last_updated_ist}")

print("Testing TCS.NS:")
test_current_price_logic("TCS.NS")
print("\nTesting AAPL:")
test_current_price_logic("AAPL")
