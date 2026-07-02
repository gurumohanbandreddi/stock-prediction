import yfinance as yf
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
import numpy as np

# Load model
model = tf.keras.models.load_model("lstm_model.h5", compile=False)

def predict_stock(ticker, use_dynamic=False):
    df = yf.download(ticker, period="5y", interval="1d", auto_adjust=True)
    df = df.reset_index()[['Date', 'Close']].dropna()
    
    if use_dynamic:
        scaler = MinMaxScaler()
        scaled = scaler.fit_transform(df[['Close']])
    else:
        import joblib
        scaler = joblib.load("scaler.pkl")
        scaled = scaler.transform(df[['Close']])
        
    last_60 = scaled[-60:]
    input_seq = last_60.copy()
    
    forecast_vals = []
    for _ in range(7):
        pred = model.predict(input_seq.reshape(1, 60, 1), verbose=0)[0, 0]
        forecast_vals.append(pred)
        input_seq = np.append(input_seq[1:], [[pred]], axis=0)
        
    padded = np.zeros((7, 1))
    padded[:, 0] = np.array(forecast_vals)
    predicted_prices = scaler.inverse_transform(padded)[:, 0]
    return predicted_prices

print("AAPL (Static Scaler):", predict_stock("AAPL", use_dynamic=False))
print("AAPL (Dynamic Scaler):", predict_stock("AAPL", use_dynamic=True))
print("TCS.NS (Static Scaler):", predict_stock("TCS.NS", use_dynamic=False))
print("TCS.NS (Dynamic Scaler):", predict_stock("TCS.NS", use_dynamic=True))
