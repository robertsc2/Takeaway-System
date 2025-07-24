from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/payment')
def payment():
    return render_template('payment.html')


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

    #Print order details to the console
    print('Order received:')
    print('Items:', items)
    print('Total:', total)

    # Return a success response
    return jsonify({'message': 'Order processed successfully!'}), 200

if __name__ == '__main__':
    app.run(debug=True)