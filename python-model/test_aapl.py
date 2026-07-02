import yfinance as yf
ticker = "AAPL"
df = yf.download(ticker, period="5y", interval="1d", auto_adjust=True)
print(df.tail(10))