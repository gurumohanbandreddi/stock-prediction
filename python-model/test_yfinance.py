import yfinance as yf
import pandas as pd
import traceback
import tensorflow as tf
import joblib

try:
    ticker = "TCS.NS"
    print(f"Downloading {ticker}")
    df = yf.download(ticker, period="5y", interval="1d", auto_adjust=True)
    df = df.reset_index()
    df = df[['Date', 'Close']].dropna()
    df['Date'] = pd.to_datetime(df['Date'])
    print(df.tail())
except Exception as e:
    print("Download error:")
    print(traceback.format_exc())

try:
    print("Loading scaler and model")
    scaler = joblib.load("scaler.pkl")
    model = tf.keras.models.load_model("lstm_model.h5", compile=False)
    
    scaled = scaler.transform(df[['Close']])
    last_60 = scaled[-60:]
    import numpy as np
    
    forecast_vals = []
    input_seq = last_60.copy()
    days = 7
    for _ in range(days):
        pred = model.predict(input_seq.reshape(1, 60, 1), verbose=0)[0, 0]
        forecast_vals.append(pred)
        input_seq = np.append(input_seq[1:], [[pred]], axis=0)

    padded = np.zeros((days, 1))
    padded[:, 0] = np.array(forecast_vals)
    predicted_prices = scaler.inverse_transform(padded)[:, 0]
    
    last_date = df['Date'].max()
    last_price = float(df['Close'].iloc[-1])
    future_dates_dt = pd.bdate_range(start=last_date + pd.Timedelta(days=1), periods=days)
    future_dates = future_dates_dt.strftime("%Y-%m-%d").tolist()

    all_dates = [last_date.strftime("%Y-%m-%d")] + future_dates
    all_prices = [last_price] + predicted_prices.tolist()
    print("Success")
except Exception as e:
    print("Predict error:")
    print(traceback.format_exc())
