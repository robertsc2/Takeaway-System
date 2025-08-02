from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

app.secret_key = 'jacobstinks'

def format_order_output(items, total):
    """Format order details for console output"""
    print("\n" + "="*60)
    print("🛒 NEW ORDER RECEIVED")
    print("="*60)
    print(f"📅 Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"💰 Total: ${total}")
    print("\n📦 ITEMS:")
    print("-" * 40)
    
    for i, item in enumerate(items, 1):
        item_total = float(item['price']) * int(item['qty'])
        print(f"{i:2d}. {item['name']:<20} | ${item['price']:>6.2f} x {item['qty']:>2} = ${item_total:>7.2f}")
    
    print("-" * 40)
    print(f"{'TOTAL':<26} = ${float(total):>7.2f}")
    print("="*60 + "\n")

def format_complete_order_output(order_details, cart, payment_info):
    """Format complete order details for console output"""
    print("\n" + "="*80)
    print("🎉 ORDER COMPLETED SUCCESSFULLY!")
    print("="*80)
    print(f"📅 Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Customer Details
    print("\n👤 CUSTOMER DETAILS:")
    print("-" * 50)
    print(f"Name:    {order_details.get('orderName', 'N/A')}")
    print(f"Address: {order_details.get('orderAddress', 'N/A')}")
    print(f"Phone:   {order_details.get('orderPhone', 'N/A')}")
    
    # Order Items
    print("\n📦 ORDER ITEMS:")
    print("-" * 50)
    total_amount = 0
    for i, item in enumerate(cart, 1):
        item_total = float(item['price']) * int(item['qty'])
        total_amount += item_total
        print(f"{i:2d}. {item['name']:<25} | ${item['price']:>6.2f} x {item['qty']:>2} = ${item_total:>7.2f}")
    
    print("-" * 50)
    print(f"{'TOTAL AMOUNT':<31} = ${total_amount:>7.2f}")
    
    # Payment Info (masked for security)
    print("\n💳 PAYMENT DETAILS:")
    print("-" * 50)
    card_number = payment_info.get('cardnumber', '')
    masked_card = f"****-****-****-{card_number[-4:]}" if len(card_number) >= 4 else "****-****-****-****"
    
    print(f"Cardholder: {payment_info.get('cardname', 'N/A')}")
    print(f"Card:       {masked_card}")
    print(f"Expires:    {payment_info.get('expmonth', 'XX')}/{payment_info.get('expyear', 'XXXX')}")
    print(f"Security:   ***")  # Never show security code
    
    print("="*80 + "\n")

@app.route('/payment')
def payment():
    total = session.get('cart_total', 'error')
    return render_template('payment.html', total=total)

@app.route('/')
def index():
    return render_template("index.html")  

@app.route('/menu')
def menu():
    return render_template('menu.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/checkout', methods=['POST'])  
def checkout():
    data = request.get_json()
    items = data.get('items', [])  
    total = data.get('total', 0)

    session['cart_total'] = f"{float(total):.2f}"
    session['cart_items'] = items

    format_order_output(items, total)
    
    return jsonify({
        'message': 'Order processed successfully!',
        'redirect_url': '/payment'
    }), 200

@app.route('/complete-order', methods=['POST'])
def complete_order():
    data = request.get_json()
    order_details = data.get('orderDetails', {})
    cart = data.get('cart', [])
    payment_info = data.get('paymentInfo', {})
    
    format_complete_order_output(order_details, cart, payment_info)
    
    session.pop('cart_total', None)
    session.pop('cart_items', None)
    session.pop('order_timestamp', None)
    
    return jsonify({
        'success': True,
        'message': 'Order completed successfully!',
        'order_id': 1
    }), 200

if __name__ == '__main__':
    app.run(debug=True)