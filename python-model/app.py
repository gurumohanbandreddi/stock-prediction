from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import tensorflow as tf
import joblib
import yfinance as yf
from datetime import timedelta
import traceback

app = Flask(__name__)
CORS(app)

WINDOW_SIZE = 60
model = tf.keras.models.load_model("lstm_model.h5", compile=False)
scaler = joblib.load("scaler.pkl")

def fetch_data(ticker):
    df = yf.download(ticker, period="5y", interval="1d", auto_adjust=True)
    df = df.reset_index()
    df = df[['Date', 'Close']].dropna()
    df['Date'] = pd.to_datetime(df['Date'])
    return df

@app.route("/forecast", methods=["POST"])
def forecast():
    try:
        ticker = request.json.get("ticker", "").upper()
        days = int(request.json.get("days", 2))  # Default to 2 days: today + tomorrow

        print(f"[INFO] Forecasting next {days} days for: {ticker}")
        df = fetch_data(ticker)
        if df.empty:
            return jsonify({"error": f"No data found for ticker: {ticker}"}), 404

        scaled = scaler.transform(df[['Close']])
        last_60 = scaled[-WINDOW_SIZE:]

        forecast_vals = []
        input_seq = last_60.copy()

        for _ in range(days):
            pred = model.predict(input_seq.reshape(1, WINDOW_SIZE, 1), verbose=0)[0, 0]
            forecast_vals.append(pred)
            input_seq = np.append(input_seq[1:], [[pred]], axis=0)

        padded = np.zeros((days, 1))
        padded[:, 0] = np.array(forecast_vals)
        predicted_prices = scaler.inverse_transform(padded)[:, 0]

        # Use today's date in IST as the starting date of the forecast
        from datetime import datetime, timezone as datetime_timezone, timedelta
        now_utc = datetime.now(datetime_timezone.utc)
        now_ist = now_utc.astimezone(datetime_timezone(timedelta(hours=5, minutes=30)))
        today_ts = pd.Timestamp(now_ist.date())

        last_price = float(df['Close'].iloc[-1])
        future_dates_dt = pd.bdate_range(start=today_ts + pd.Timedelta(days=1), periods=days)
        future_dates = future_dates_dt.strftime("%Y-%m-%d").tolist()

        all_dates = [today_ts.strftime("%Y-%m-%d")] + future_dates
        all_prices = [last_price] + predicted_prices.tolist()

        return jsonify({
            "dates": all_dates,
            "forecast": all_prices
        })

    except Exception as e:
        print("[ERROR]", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route("/current_price", methods=["POST"])
def current_price():
    try:
        ticker = request.json.get("ticker", "").upper()
        print(f"[INFO] Fetching current price for: {ticker}")
        ticker_obj = yf.Ticker(ticker)
        
        # Try fast_info first
        try:
            info = ticker_obj.fast_info
            curr_price = float(info['lastPrice'])
            prev_close = float(info['previousClose'])
            timezone = info.get('timezone', 'UTC')
            currency = info.get('currency', 'USD')
        except Exception as fe:
            print(f"[WARNING] fast_info failed: {fe}. Falling back to history.")
            hist = ticker_obj.history(period="2d")
            if hist.empty:
                return jsonify({"error": f"No data found for {ticker}"}), 404
            curr_price = float(hist['Close'].iloc[-1])
            prev_close = float(hist['Close'].iloc[-2]) if len(hist) > 1 else curr_price
            timezone = 'UTC'
            currency = 'USD'
            
        change = curr_price - prev_close
        pct_change = (change / prev_close) * 100 if prev_close != 0 else 0

        # Current time in IST (India Standard Time)
        from datetime import datetime, timezone as datetime_timezone, timedelta
        now_utc = datetime.now(datetime_timezone.utc)
        now_ist = now_utc.astimezone(datetime_timezone(timedelta(hours=5, minutes=30)))
        last_updated_ist = now_ist.strftime("%Y-%m-%d %H:%M:%S")

        return jsonify({
            "current_price": curr_price,
            "change": change,
            "pct_change": pct_change,
            "timezone": timezone,
            "currency": currency,
            "last_updated_ist": last_updated_ist
        })
    except Exception as e:
        print("[ERROR]", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)
