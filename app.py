from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


app.secret_key = 'jacobstinks'

@app.route('/payment')
def payment():
    # Get the total from the session, default to 0.00 if not found
    total = session.get('cart_total', '0.00')
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

    # Process the order 
    items = data.get('items', [])  
    total = data.get('total', 0)

    # Store the total in the session for the payment page
    session['cart_total'] = f"{float(total):.2f}"
    session['cart_items'] = items

    # Print order details to the console
    print('Order received:')
    print('Items:', items)
    print('Total:', total)
    
    # Return a success response with redirect URL
    return jsonify({
        'message': 'Order processed successfully!',
        'redirect_url': '/payment'
    }), 200

if __name__ == '__main__':
    app.run(debug=True)