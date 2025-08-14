"""Flask web application for restaurant order processing and validation."""

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from datetime import datetime
import re

app = Flask(__name__)
CORS(app)

app.secret_key = 'jacobstinks'


def validate_cart_item(item):
    """Validate cart item"""
    if not isinstance(item, dict):
        return False, "Item must be a dictionary"

    required_fields = ['name', 'price', 'qty']
    for field in required_fields:
        if field not in item:
            return False, f"Missing required field: {field}"

    if not isinstance(item['name'], str) or not item['name'].strip():
        return False, "Item name must be a non-empty string"

    try:
        qty = int(item['qty'])
        if qty <= 0:
            return False, "Quantity must be greater than 0"
        if qty > 99:
            return False, "Quantity cannot exceed 99"
    except (ValueError, TypeError):
        return False, "Quantity must be a valid integer"

    return True, None


def validate_order_details(details):
    """Validate order details"""
    if not isinstance(details, dict):
        return False, "Order details must be a dictionary"

    required_fields = ['orderName', 'orderAddress', 'orderPhone']
    for field in required_fields:
        if field not in details:
            return False, f"Missing required field: {field}"

        value = details[field]
        if not isinstance(value, str) or not value.strip():
            return False, f"{field} must be a non-empty string"

    name = details['orderName'].strip()
    if len(name) < 2:
        return False, "Name must be at least 2 characters long"
    if len(name) > 50:
        return False, "Name cannot exceed 50 characters"

    phone = details['orderPhone'].strip()
    digits_only = re.sub(r'\D', '', phone)
    if len(digits_only) < 8:
        return (False,
                "Phone number too short - please enter at least 8 digits")
    if len(digits_only) > 15:
        return (False,
                "Phone number too long - maximum 15 digits allowed")

    address = details['orderAddress'].strip()
    if len(address) < 10:
        return False, "Address must be at least 10 characters long"
    if len(address) > 200:
        return False, "Address cannot exceed 200 characters"

    return True, None


def validate_payment_info(payment):
    """Validate payment information"""
    if not isinstance(payment, dict):
        return False, "Payment info must be a dictionary"

    required_fields = ['cardname', 'cardnumber', 'expmonth', 'expyear',
                       'securitycode']
    for field in required_fields:
        if field not in payment:
            return False, f"Missing required field: {field}"

        value = payment[field]
        if not isinstance(value, str) or not value.strip():
            return False, f"{field} must be a non-empty string"

    cardname = payment['cardname'].strip()
    if len(cardname) < 2:
        return False, "Cardholder name must be at least 2 characters"
    if not re.match(r'^[a-zA-Z\s]+$', cardname):
        return (False,
                "Cardholder name can only contain letters and spaces")

    cardnumber = re.sub(r'\D', '', payment['cardnumber'])
    if len(cardnumber) < 13 or len(cardnumber) > 19:
        return False, "Card number must be between 13-19 digits"

    try:
        month = int(payment['expmonth'])
        if month < 1 or month > 12:
            return False, "Expiry month must be between 1-12"
    except ValueError:
        return False, "Expiry month must be a valid number"

    try:
        year = int(payment['expyear'])
        current_year = datetime.now().year
        if year < current_year:
            return False, "Card has expired"
        if year > current_year + 10:
            return False, "Expiry year too far in future"
    except ValueError:
        return False, "Expiry year must be a valid number"

    securitycode = payment['securitycode'].strip()
    if not securitycode.isdigit():
        return False, "Security code must contain only digits"
    if len(securitycode) < 3 or len(securitycode) > 4:
        return False, "Security code must be 3-4 digits"

    return True, None


def format_complete_order_output(order_details, cart, payment_info):
    """Format complete order details for console output."""
    print("\n" + "="*80)
    print("🎉 ORDER COMPLETED SUCCESSFULLY!")
    print("="*80)
    print(f"📅 Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    print("\n👤 CUSTOMER DETAILS:")
    print("-" * 50)
    print(f"Name:    {order_details.get('orderName', 'N/A')}")
    print(f"Address: {order_details.get('orderAddress', 'N/A')}")
    print(f"Phone:   {order_details.get('orderPhone', 'N/A')}")

    print("\n📦 ORDER ITEMS:")
    print("-" * 50)
    total_amount = 0
    for i, item in enumerate(cart, 1):
        item_total = float(item['price']) * int(item['qty'])
        total_amount += item_total
        print(f"{i:2d}. {item['name']:<25} | ${item['price']:>6.2f} "
              f"x {item['qty']:>2} = ${item_total:>7.2f}")

    print("-" * 50)
    print(f"{'TOTAL AMOUNT':<31} = ${total_amount:>7.2f}")

    print("\n💳 PAYMENT DETAILS:")
    print("-" * 50)
    card_number = payment_info.get('cardnumber', '')
    digits_only = re.sub(r'\D', '', card_number)
    if len(digits_only) >= 4:
        masked_card = f"****-****-****-{digits_only[-4:]}"
    else:
        masked_card = "****-****-****-****"

    print(f"Cardholder: {payment_info.get('cardname', 'N/A')}")
    print(f"Card:       {masked_card}")
    print(f"Expires:    {payment_info.get('expmonth', 'XX')}/"
          f"{payment_info.get('expyear', 'XXXX')}")
    print("Security:   ***")

    print("="*80 + "\n")


@app.route('/payment')
def payment():
    """Render payment page."""
    return render_template('payment.html')


@app.route('/')
def index():
    """Render index page."""
    return render_template("index.html")


@app.route('/menu')
def menu():
    """Render menu page."""
    return render_template('menu.html')


@app.route('/about')
def about():
    """Render about page."""
    return render_template('about.html')


@app.route('/checkout', methods=['POST'])
def checkout():
    """Handle checkout validation and processing."""
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        items = data.get('items', [])
        total = data.get('total', 0)

        if not items:
            return jsonify({'error': 'Cart is empty'}), 400

        for i, item in enumerate(items):
            is_valid, error_msg = validate_cart_item(item)
            if not is_valid:
                return jsonify({'error': f'Item {i+1}: {error_msg}'}), 400

        try:
            total_float = float(total)
            if total_float < 0:
                return jsonify({'error': 'Total cannot be negative'}), 400
            if total_float > 1000:
                return (jsonify({'error': 'Total exceeds maximum allowed '
                                          '($1000)'}), 400)
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid total amount'}), 400

        calculated_total = sum(float(item['price']) * int(item['qty'])
                               for item in items)
        if abs(calculated_total - total_float) > 0.01:
            return jsonify({'error': 'Total does not match cart items'}), 400

        return jsonify({
            'message': 'Cart validated successfully!',
            'redirect_url': '/payment'
        }), 200

    except Exception as e:
        print(f"Error in checkout: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/complete-order', methods=['POST'])
def complete_order():
    """Handle complete order validation and processing."""
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        order_details = data.get('orderDetails', {})
        cart = data.get('cart', [])
        payment_info = data.get('paymentInfo', {})

        if not cart:
            return jsonify({'error': 'Cart is empty'}), 400

        is_valid, error_msg = validate_order_details(order_details)
        if not is_valid:
            return jsonify({'error': f'Order details: {error_msg}'}), 400

        for i, item in enumerate(cart):
            is_valid, error_msg = validate_cart_item(item)
            if not is_valid:
                return (jsonify({'error': f'Cart item {i+1}: {error_msg}'}),
                        400)

        is_valid, error_msg = validate_payment_info(payment_info)
        if not is_valid:
            return jsonify({'error': f'Payment: {error_msg}'}), 400

        format_complete_order_output(order_details, cart, payment_info)

        return jsonify({
            'success': True,
            'message': 'Order completed successfully!',
            'order_id': datetime.now().strftime('%Y%m%d%H%M%S')
        }), 200

    except Exception as e:
        print(f"Error in complete_order: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    app.run(debug=True)

