from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")


@app.route('/menu')
def menu():
    return render_template('menu.html')

@app.route('/about')
def about():
    return render_template('about.html')

if __name__ == '__main__':
    app.run(debug=True)


@app.route('/checkout', methods=['POST'])
def checkout():
    data = request.get_json()

    # Process the order (e.g., save to database)
    items = data.get('items', [])
    total = data.get('total', 0)

    # Example: Print order details to the console
    print('Order received:')
    print('Items:', items)
    print('Total:', total)

    # Return a success response
    return jsonify({'message': 'Order processed successfully!'}), 200

if __name__ == '__main__':
    app.run(debug=True)


