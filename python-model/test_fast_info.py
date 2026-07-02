import yfinance as yf
ticker = yf.Ticker("TCS.NS")
for k, v in ticker.fast_info.items():
    print(f"{k}: {v}")
